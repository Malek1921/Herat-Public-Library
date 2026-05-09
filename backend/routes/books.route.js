const router = require('express').Router();
const pool   = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

// ── GET /api/books  (search, filter, paginate)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const {
      q, category_id, subject_id, language_id, author_id,
      page = 1, limit = 20, sort = 'id', order = 'asc'
    } = req.query;

    const allowed_sorts = ['id', 'title', 'publication_year', 'unit_price', 'created_at'];
    const sortCol = allowed_sorts.includes(sort) ? sort : 'id';
    const sortDir = order === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params     = [];
    let   idx        = 1;

    if (q) {
      conditions.push(`(b.title ILIKE $${idx} OR b.isbn ILIKE $${idx})`);
      params.push(`%${q}%`); idx++;
    }
    if (category_id) { conditions.push(`b.category_id = $${idx}`); params.push(category_id); idx++; }
    if (subject_id)  { conditions.push(`b.subject_id  = $${idx}`); params.push(subject_id);  idx++; }
    if (language_id) { conditions.push(`b.language_id = $${idx}`); params.push(language_id); idx++; }
    if (author_id) {
      conditions.push(`EXISTS (SELECT 1 FROM book_authors ba WHERE ba.book_id = b.id AND ba.author_id = $${idx})`);
      params.push(author_id); idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM books b ${where}`, params
    );
    const total = parseInt(countRes.rows[0].count);

    const { rows } = await pool.query(
      `SELECT
         b.*,
         l.name                                    AS language,
         c.name                                    AS category,
         s.name                                    AS subject,
         s.dewey_number,
         p.name                                    AS publisher,
         p.city                                    AS publisher_city,
         ARRAY_AGG(DISTINCT a.full_name)           AS authors,
         ARRAY_AGG(DISTINCT t.full_name)           AS translators,
         COUNT(DISTINCT cp.id)                     AS copy_count
       FROM books b
       LEFT JOIN languages   l  ON l.id  = b.language_id
       LEFT JOIN categories  c  ON c.id  = b.category_id
       LEFT JOIN subjects    s  ON s.id  = b.subject_id
       LEFT JOIN publishers  p  ON p.id  = b.publisher_id
       LEFT JOIN book_authors   ba ON ba.book_id = b.id
       LEFT JOIN authors        a  ON a.id = ba.author_id
       LEFT JOIN book_translators bt ON bt.book_id = b.id
       LEFT JOIN translators      t  ON t.id = bt.translator_id
       LEFT JOIN copies           cp ON cp.book_id = b.id
       ${where}
       GROUP BY b.id, l.name, c.name, s.name, s.dewey_number, p.name, p.city
       ORDER BY b.${sortCol} ${sortDir}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ total, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
});

// ── GET /api/books/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         b.*,
         l.name                          AS language,
         c.name                          AS category,
         s.name                          AS subject,
         s.dewey_number,
         p.name                          AS publisher,
         p.city                          AS publisher_city,
         ARRAY_AGG(DISTINCT a.full_name) AS authors,
         ARRAY_AGG(DISTINCT t.full_name) AS translators
       FROM books b
       LEFT JOIN languages   l  ON l.id  = b.language_id
       LEFT JOIN categories  c  ON c.id  = b.category_id
       LEFT JOIN subjects    s  ON s.id  = b.subject_id
       LEFT JOIN publishers  p  ON p.id  = b.publisher_id
       LEFT JOIN book_authors   ba ON ba.book_id = b.id
       LEFT JOIN authors        a  ON a.id = ba.author_id
       LEFT JOIN book_translators bt ON bt.book_id = b.id
       LEFT JOIN translators      t  ON t.id = bt.translator_id
       WHERE b.id = $1
       GROUP BY b.id, l.name, c.name, s.name, s.dewey_number, p.name, p.city`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Book not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── POST /api/books
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      title, edition, volume_type, page_count, isbn,
      unit_price, total_price, publication_year,
      series_count, volume_count, keywords, notes, details,
      language_id, category_id, subject_id, publisher_id,
      author_ids = [], translator_ids = []
    } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required.' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO books
           (title, edition, volume_type, page_count, isbn,
            unit_price, total_price, publication_year,
            series_count, volume_count, keywords, notes, details,
            language_id, category_id, subject_id, publisher_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING *`,
        [title, edition, volume_type, page_count, isbn,
         unit_price, total_price, publication_year,
         series_count, volume_count, keywords, notes, details,
         language_id, category_id, subject_id, publisher_id]
      );
      const book = rows[0];

      for (const aid of author_ids) {
        await client.query(
          `INSERT INTO book_authors (book_id, author_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [book.id, aid]
        );
      }
      for (const tid of translator_ids) {
        await client.query(
          `INSERT INTO book_translators (book_id, translator_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [book.id, tid]
        );
      }

      await client.query('COMMIT');
      res.status(201).json(book);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
});

// ── PUT /api/books/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const {
      title, edition, volume_type, page_count, isbn,
      unit_price, total_price, publication_year,
      series_count, volume_count, keywords, notes, details,
      language_id, category_id, subject_id, publisher_id,
      author_ids, translator_ids
    } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `UPDATE books SET
           title            = COALESCE($1,  title),
           edition          = COALESCE($2,  edition),
           volume_type      = COALESCE($3,  volume_type),
           page_count       = COALESCE($4,  page_count),
           isbn             = COALESCE($5,  isbn),
           unit_price       = COALESCE($6,  unit_price),
           total_price      = COALESCE($7,  total_price),
           publication_year = COALESCE($8,  publication_year),
           series_count     = COALESCE($9,  series_count),
           volume_count     = COALESCE($10, volume_count),
           keywords         = COALESCE($11, keywords),
           notes            = COALESCE($12, notes),
           details          = COALESCE($13, details),
           language_id      = COALESCE($14, language_id),
           category_id      = COALESCE($15, category_id),
           subject_id       = COALESCE($16, subject_id),
           publisher_id     = COALESCE($17, publisher_id),
           updated_at       = NOW()
         WHERE id = $18
         RETURNING *`,
        [title, edition, volume_type, page_count, isbn,
         unit_price, total_price, publication_year,
         series_count, volume_count, keywords, notes, details,
         language_id, category_id, subject_id, publisher_id,
         req.params.id]
      );
      if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Book not found.' }); }

      if (Array.isArray(author_ids)) {
        await client.query(`DELETE FROM book_authors WHERE book_id = $1`, [req.params.id]);
        for (const aid of author_ids) {
          await client.query(
            `INSERT INTO book_authors (book_id, author_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [req.params.id, aid]
          );
        }
      }
      if (Array.isArray(translator_ids)) {
        await client.query(`DELETE FROM book_translators WHERE book_id = $1`, [req.params.id]);
        for (const tid of translator_ids) {
          await client.query(
            `INSERT INTO book_translators (book_id, translator_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [req.params.id, tid]
          );
        }
      }

      await client.query('COMMIT');
      res.json(rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
});

// ── DELETE /api/books/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM books WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Book not found.' });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ── GET /api/books/:id/copies
router.get('/:id/copies', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*,
              CASE WHEN l.id IS NOT NULL AND l.returned_at IS NULL THEN true ELSE false END AS is_loaned
       FROM copies c
       LEFT JOIN loans l ON l.copy_id = c.id AND l.status = 'active'
       WHERE c.book_id = $1`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
