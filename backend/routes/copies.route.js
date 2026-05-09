const router = require('express').Router();
const pool   = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

// GET /api/copies  (optional ?book_id=)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { book_id, shelf, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conds  = [];
    let idx = 1;

    if (book_id) { conds.push(`c.book_id = $${idx}`); params.push(book_id); idx++; }
    if (shelf)   { conds.push(`c.shelf ILIKE $${idx}`); params.push(`%${shelf}%`); idx++; }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM copies c ${where}`, params);

    const { rows } = await pool.query(
      `SELECT c.*,
              b.title AS book_title,
              CASE WHEN l.id IS NOT NULL THEN true ELSE false END AS is_loaned,
              l.due_date,
              m.full_name AS loaned_to
       FROM copies c
       JOIN books b ON b.id = c.book_id
       LEFT JOIN loans l  ON l.copy_id = c.id AND l.status = 'active'
       LEFT JOIN members m ON m.id = l.member_id
       ${where}
       ORDER BY c.id
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ total: parseInt(countRes.rows[0].count), data: rows });
  } catch (err) { next(err); }
});

// GET /api/copies/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, b.title AS book_title,
              CASE WHEN l.id IS NOT NULL THEN true ELSE false END AS is_loaned
       FROM copies c
       JOIN books b ON b.id = c.book_id
       LEFT JOIN loans l ON l.copy_id = c.id AND l.status = 'active'
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Copy not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/copies
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { book_id, shelf, row_slot, binding_condition, hall, hall_manager, date_received } = req.body;
    if (!book_id) return res.status(400).json({ error: 'book_id is required.' });
    const { rows } = await pool.query(
      `INSERT INTO copies (book_id, shelf, row_slot, binding_condition, hall, hall_manager, date_received)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [book_id, shelf, row_slot, binding_condition, hall, hall_manager, date_received]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/copies/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { shelf, row_slot, binding_condition, hall, hall_manager, date_received } = req.body;
    const { rows } = await pool.query(
      `UPDATE copies SET
         shelf             = COALESCE($1, shelf),
         row_slot          = COALESCE($2, row_slot),
         binding_condition = COALESCE($3, binding_condition),
         hall              = COALESCE($4, hall),
         hall_manager      = COALESCE($5, hall_manager),
         date_received     = COALESCE($6, date_received),
         updated_at        = NOW()
       WHERE id = $7 RETURNING *`,
      [shelf, row_slot, binding_condition, hall, hall_manager, date_received, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Copy not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/copies/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM copies WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Copy not found.' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
