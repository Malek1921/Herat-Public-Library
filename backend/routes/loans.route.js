const router = require('express').Router();
const pool   = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

// GET /api/loans
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, member_id, copy_id, overdue, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conds  = [];
    let idx = 1;

    if (status)    { conds.push(`l.status = $${idx}`);    params.push(status);    idx++; }
    if (member_id) { conds.push(`l.member_id = $${idx}`); params.push(member_id); idx++; }
    if (copy_id)   { conds.push(`l.copy_id = $${idx}`);   params.push(copy_id);   idx++; }
    if (overdue === 'true') {
      conds.push(`l.due_date < CURRENT_DATE AND l.returned_at IS NULL`);
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM loans l ${where}`, params);

    const { rows } = await pool.query(
      `SELECT l.*,
              m.full_name  AS member_name,
              m.phone      AS member_phone,
              b.title      AS book_title,
              c.shelf, c.row_slot,
              u.username   AS issued_by_name
       FROM loans l
       JOIN members m ON m.id = l.member_id
       JOIN copies  c ON c.id = l.copy_id
       JOIN books   b ON b.id = c.book_id
       LEFT JOIN users u ON u.id = l.issued_by
       ${where}
       ORDER BY l.issued_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ total: parseInt(countRes.rows[0].count), data: rows });
  } catch (err) { next(err); }
});

// GET /api/loans/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, m.full_name AS member_name, b.title AS book_title, c.shelf
       FROM loans l
       JOIN members m ON m.id = l.member_id
       JOIN copies  c ON c.id = l.copy_id
       JOIN books   b ON b.id = c.book_id
       WHERE l.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Loan not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/loans  – issue a book
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { copy_id, member_id, due_date, notes } = req.body;
    if (!copy_id || !member_id || !due_date) {
      return res.status(400).json({ error: 'copy_id, member_id and due_date are required.' });
    }

    // Check copy is not already on loan
    const check = await pool.query(
      `SELECT id FROM loans WHERE copy_id = $1 AND status = 'active'`, [copy_id]
    );
    if (check.rows.length) {
      return res.status(409).json({ error: 'This copy is already on loan.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO loans (copy_id, member_id, issued_by, due_date, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [copy_id, member_id, req.user.id, due_date, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/loans/:id/return  – return a book
router.patch('/:id/return', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE loans SET
         returned_at = NOW(),
         status      = 'returned',
         updated_at  = NOW()
       WHERE id = $1 AND status = 'active'
       RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Active loan not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/loans/:id  – update due_date / notes / status
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { due_date, notes, status } = req.body;
    const allowed = ['active', 'returned', 'overdue'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }
    const { rows } = await pool.query(
      `UPDATE loans SET
         due_date   = COALESCE($1, due_date),
         notes      = COALESCE($2, notes),
         status     = COALESCE($3, status),
         updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [due_date, notes, status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Loan not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/loans/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM loans WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Loan not found.' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
