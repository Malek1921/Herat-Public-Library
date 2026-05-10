const router = require('express').Router();
const pool = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

// GET /api/daily-transactions - List today's transactions
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = `
      SELECT 
        dt.id,
        dt.visitor_name,
        dt.visitor_lastname,
        dt.father_name,
        dt.job_or_major,
        dt.address,
        dt.phone,
        dt.book_id,
        b.title AS book_title,
        dt.taken_at,
        dt.returned_at,
        dt.status,
        dt.notes,
        EXTRACT(EPOCH FROM (COALESCE(dt.returned_at, NOW()) - dt.taken_at)) / 3600 AS hours_borrowed
      FROM daily_transactions dt
      JOIN books b ON b.id = dt.book_id
      WHERE DATE(dt.taken_at) = CURRENT_DATE
    `;

        const params = [];
        if (status) {
            query += ` AND dt.status = $1`;
            params.push(status);
        }

        query += ` ORDER BY dt.taken_at DESC`;

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) { next(err); }
});

// GET /api/daily-transactions/:id - Get single transaction
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT 
        dt.*,
        b.title AS book_title,
        EXTRACT(EPOCH FROM (COALESCE(dt.returned_at, NOW()) - dt.taken_at)) / 3600 AS hours_borrowed
       FROM daily_transactions dt
       JOIN books b ON b.id = dt.book_id
       WHERE dt.id = $1`,
            [req.params.id]
        );

        if (!rows[0]) return res.status(404).json({ error: 'Transaction not found.' });
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// POST /api/daily-transactions - Create new transaction (issue book)
router.post('/', authenticate, async (req, res, next) => {
    try {
        const {
            visitor_name,
            visitor_lastname,
            father_name,
            job_or_major,
            address,
            phone,
            book_id,
            notes,
        } = req.body;

        if (!visitor_name || !visitor_lastname || !book_id) {
            return res.status(400).json({
                error: 'visitor_name, visitor_lastname, and book_id are required.'
            });
        }

        const { rows } = await pool.query(
            `INSERT INTO daily_transactions
         (visitor_name, visitor_lastname, father_name, job_or_major, address, phone, book_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [visitor_name, visitor_lastname, father_name, job_or_major, address, phone, book_id, notes]
        );

        res.status(201).json(rows[0]);
    } catch (err) { next(err); }
});

// PUT /api/daily-transactions/:id - Update transaction
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const {
            visitor_name,
            visitor_lastname,
            father_name,
            job_or_major,
            address,
            phone,
            book_id,
            notes,
        } = req.body;

        const { rows } = await pool.query(
            `UPDATE daily_transactions
       SET 
         visitor_name = COALESCE($1, visitor_name),
         visitor_lastname = COALESCE($2, visitor_lastname),
         father_name = COALESCE($3, father_name),
         job_or_major = COALESCE($4, job_or_major),
         address = COALESCE($5, address),
         phone = COALESCE($6, phone),
         book_id = COALESCE($7, book_id),
         notes = COALESCE($8, notes),
         updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
            [visitor_name, visitor_lastname, father_name, job_or_major, address, phone, book_id, notes, req.params.id]
        );

        if (!rows[0]) return res.status(404).json({ error: 'Transaction not found.' });
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// PATCH /api/daily-transactions/:id/return - Mark as returned
router.patch('/:id/return', authenticate, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `UPDATE daily_transactions
       SET 
         returned_at = NOW(),
         status = 'returned',
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
            [req.params.id]
        );

        if (!rows[0]) return res.status(404).json({ error: 'Transaction not found.' });
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// DELETE /api/daily-transactions/:id - Delete transaction
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const { rowCount } = await pool.query(
            `DELETE FROM daily_transactions WHERE id = $1`,
            [req.params.id]
        );

        if (!rowCount) return res.status(404).json({ error: 'Transaction not found.' });
        res.status(204).send();
    } catch (err) { next(err); }
});

module.exports = router;