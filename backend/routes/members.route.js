const router = require('express').Router();
const pool   = require('../config/pool');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// GET /api/members
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { q, is_active, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conds  = [];
    let idx = 1;

    if (q) {
      conds.push(`(m.full_name ILIKE $${idx} OR m.email ILIKE $${idx} OR m.phone ILIKE $${idx} OR m.national_id ILIKE $${idx})`);
      params.push(`%${q}%`); idx++;
    }
    if (is_active !== undefined) {
      conds.push(`m.is_active = $${idx}`);
      params.push(is_active === 'true'); idx++;
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM members m ${where}`, params);

    const { rows } = await pool.query(
      `SELECT m.*,
              COUNT(l.id) FILTER (WHERE l.status = 'active')   AS active_loans,
              COUNT(l.id) FILTER (WHERE l.status = 'overdue')  AS overdue_loans
       FROM members m
       LEFT JOIN loans l ON l.member_id = m.id
       ${where}
       GROUP BY m.id
       ORDER BY m.full_name
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ total: parseInt(countRes.rows[0].count), data: rows });
  } catch (err) { next(err); }
});

// GET /api/members/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.*,
              COUNT(l.id) FILTER (WHERE l.status = 'active')  AS active_loans,
              COUNT(l.id) FILTER (WHERE l.status = 'overdue') AS overdue_loans
       FROM members m
       LEFT JOIN loans l ON l.member_id = m.id
       WHERE m.id = $1
       GROUP BY m.id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Member not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/members/:id/loans
router.get('/:id/loans', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, b.title AS book_title, c.shelf, c.row_slot
       FROM loans l
       JOIN copies c ON c.id = l.copy_id
       JOIN books  b ON b.id = c.book_id
       WHERE l.member_id = $1
       ORDER BY l.issued_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/members
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { full_name, email, phone, national_id, address } = req.body;
    if (!full_name) return res.status(400).json({ error: 'full_name is required.' });
    const { rows } = await pool.query(
      `INSERT INTO members (full_name, email, phone, national_id, address)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [full_name, email, phone, national_id, address]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/members/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { full_name, email, phone, national_id, address, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE members SET
         full_name   = COALESCE($1, full_name),
         email       = COALESCE($2, email),
         phone       = COALESCE($3, phone),
         national_id = COALESCE($4, national_id),
         address     = COALESCE($5, address),
         is_active   = COALESCE($6, is_active),
         updated_at  = NOW()
       WHERE id = $7 RETURNING *`,
      [full_name, email, phone, national_id, address, is_active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Member not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/members/:id  (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM members WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Member not found.' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
