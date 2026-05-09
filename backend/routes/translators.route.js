const router = require('express').Router();
const pool   = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

// GET /api/translators
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = '';
    if (q) { where = `WHERE full_name ILIKE $1`; params.push(`%${q}%`); }

    const countRes = await pool.query(`SELECT COUNT(*) FROM translators ${where}`, params);
    const { rows } = await pool.query(
      `SELECT t.*, COUNT(bt.book_id) AS book_count
       FROM translators t
       LEFT JOIN book_translators bt ON bt.translator_id = t.id
       ${where}
       GROUP BY t.id
       ORDER BY t.full_name
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ total: parseInt(countRes.rows[0].count), data: rows });
  } catch (err) { next(err); }
});

// GET /api/translators/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, COUNT(bt.book_id) AS book_count
       FROM translators t
       LEFT JOIN book_translators bt ON bt.translator_id = t.id
       WHERE t.id = $1
       GROUP BY t.id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Translator not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/translators/:id/books
router.get('/:id/books', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.title, b.edition, b.isbn
       FROM books b
       JOIN book_translators bt ON bt.book_id = b.id
       WHERE bt.translator_id = $1
       ORDER BY b.title`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/translators
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { full_name } = req.body;
    if (!full_name) return res.status(400).json({ error: 'full_name is required.' });
    const { rows } = await pool.query(
      `INSERT INTO translators (full_name) VALUES ($1) RETURNING *`, [full_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/translators/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { full_name } = req.body;
    const { rows } = await pool.query(
      `UPDATE translators SET full_name = COALESCE($1, full_name) WHERE id = $2 RETURNING *`,
      [full_name, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Translator not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/translators/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM translators WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Translator not found.' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
