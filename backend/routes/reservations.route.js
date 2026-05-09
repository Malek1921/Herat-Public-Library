const router = require('express').Router();
const pool   = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

// GET /api/reservations
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, member_id, book_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conds  = [];
    let idx = 1;

    if (status)    { conds.push(`r.status = $${idx}`);    params.push(status);    idx++; }
    if (member_id) { conds.push(`r.member_id = $${idx}`); params.push(member_id); idx++; }
    if (book_id)   { conds.push(`r.book_id = $${idx}`);   params.push(book_id);   idx++; }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM reservations r ${where}`, params);

    const { rows } = await pool.query(
      `SELECT r.*, b.title AS book_title, m.full_name AS member_name
       FROM reservations r
       JOIN books   b ON b.id = r.book_id
       JOIN members m ON m.id = r.member_id
       ${where}
       ORDER BY r.reserved_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ total: parseInt(countRes.rows[0].count), data: rows });
  } catch (err) { next(err); }
});

// GET /api/reservations/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, b.title AS book_title, m.full_name AS member_name
       FROM reservations r
       JOIN books   b ON b.id = r.book_id
       JOIN members m ON m.id = r.member_id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Reservation not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/reservations
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { book_id, member_id, expires_at, notes } = req.body;
    if (!book_id || !member_id) {
      return res.status(400).json({ error: 'book_id and member_id are required.' });
    }
    const { rows } = await pool.query(
      `INSERT INTO reservations (book_id, member_id, expires_at, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [book_id, member_id, expires_at, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/reservations/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { status, notes, expires_at } = req.body;
    const allowed = ['pending', 'fulfilled', 'cancelled', 'expired'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }
    const { rows } = await pool.query(
      `UPDATE reservations SET
         status     = COALESCE($1, status),
         notes      = COALESCE($2, notes),
         expires_at = COALESCE($3, expires_at),
         updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, notes, expires_at, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Reservation not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/reservations/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM reservations WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Reservation not found.' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
