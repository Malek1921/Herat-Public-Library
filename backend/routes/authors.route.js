const router = require('express').Router();
const pool   = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

// GET /api/authors
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = '';
    if (q) { where = `WHERE full_name ILIKE $1`; params.push(`%${q}%`); }

    const countRes = await pool.query(`SELECT COUNT(*) FROM authors ${where}`, params);
    const { rows } = await pool.query(
      `SELECT a.*, COUNT(ba.book_id) AS book_count
       FROM authors a
       LEFT JOIN book_authors ba ON ba.author_id = a.id
       ${where}
       GROUP BY a.id
       ORDER BY a.full_name
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ total: parseInt(countRes.rows[0].count), data: rows });
  } catch (err) { next(err); }
});

// GET /api/authors/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, COUNT(ba.book_id) AS book_count
       FROM authors a
       LEFT JOIN book_authors ba ON ba.author_id = a.id
       WHERE a.id = $1
       GROUP BY a.id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Author not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/authors/:id/books
router.get('/:id/books', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.title, b.edition, b.isbn, b.publication_year
       FROM books b
       JOIN book_authors ba ON ba.book_id = b.id
       WHERE ba.author_id = $1
       ORDER BY b.title`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/authors
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { full_name } = req.body;
    if (!full_name) return res.status(400).json({ error: 'full_name is required.' });
    const { rows } = await pool.query(
      `INSERT INTO authors (full_name) VALUES ($1) RETURNING *`,
      [full_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/authors/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { full_name } = req.body;
    const { rows } = await pool.query(
      `UPDATE authors SET full_name = COALESCE($1, full_name) WHERE id = $2 RETURNING *`,
      [full_name, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Author not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/authors/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM authors WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Author not found.' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
