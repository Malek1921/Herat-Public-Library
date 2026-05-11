/**
 * lookups.route.js
 * Handles CRUD for: categories, subjects, publishers, languages
 * All under /api/lookups/:type
 */

const router = require('express').Router();
const pool = require('../config/pool');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

const VALID_TYPES = ['categories', 'subjects', 'publishers', 'languages'];

function guardType(req, res, next) {
  if (!VALID_TYPES.includes(req.params.type)) {
    return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
  }
  next();
}

// GET /api/lookups/categories  (or /subjects, /publishers, /languages)
router.get('/:type', authenticate, guardType, async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    const t = req.params.type;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (q) {
      conditions.push(`name ILIKE $${idx}`);
      params.push(`%${q}%`);
      idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    // If pagination is requested, return an object with total and data
    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, parseInt(limit) || 10); // default 10, max 100
      const offset = (pageNum - 1) * limitNum;

      const countRes = await pool.query(
        `SELECT COUNT(*) FROM ${t} ${where}`,
        params
      );
      const total = parseInt(countRes.rows[0].count);

      const dataRes = await pool.query(
        `SELECT * FROM ${t} ${where} ORDER BY name
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limitNum, offset]
      );

      return res.json({ total, page: pageNum, limit: limitNum, data: dataRes.rows });
    }

    // No pagination – return flat array (backward‑compatible)
    const { rows } = await pool.query(
      `SELECT * FROM ${t} ${where} ORDER BY name`,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/lookups/:type/:id
router.get('/:type/:id', authenticate, guardType, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM ${req.params.type} WHERE id = $1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Record not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/lookups/:type   (admin only)
router.post('/:type', authenticate, requireAdmin, guardType, async (req, res, next) => {
  try {
    const t = req.params.type;
    let result;

    if (t === 'subjects') {
      const { name, dewey_number } = req.body;
      if (!name) return res.status(400).json({ error: 'name is required.' });
      result = await pool.query(
        `INSERT INTO subjects (name, dewey_number) VALUES ($1,$2) RETURNING *`,
        [name, dewey_number]
      );
    } else if (t === 'publishers') {
      const { name, city } = req.body;
      if (!name) return res.status(400).json({ error: 'name is required.' });
      result = await pool.query(
        `INSERT INTO publishers (name, city) VALUES ($1,$2) RETURNING *`,
        [name, city]
      );
    } else {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'name is required.' });
      result = await pool.query(
        `INSERT INTO ${t} (name) VALUES ($1) RETURNING *`, [name]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/lookups/:type/:id   (admin only)
router.put('/:type/:id', authenticate, requireAdmin, guardType, async (req, res, next) => {
  try {
    const t = req.params.type;
    let result;

    if (t === 'subjects') {
      const { name, dewey_number } = req.body;
      result = await pool.query(
        `UPDATE subjects SET
           name         = COALESCE($1, name),
           dewey_number = COALESCE($2, dewey_number)
         WHERE id = $3 RETURNING *`,
        [name, dewey_number, req.params.id]
      );
    } else if (t === 'publishers') {
      const { name, city } = req.body;
      result = await pool.query(
        `UPDATE publishers SET
           name = COALESCE($1, name),
           city = COALESCE($2, city)
         WHERE id = $3 RETURNING *`,
        [name, city, req.params.id]
      );
    } else {
      const { name } = req.body;
      result = await pool.query(
        `UPDATE ${t} SET name = COALESCE($1, name) WHERE id = $2 RETURNING *`,
        [name, req.params.id]
      );
    }

    if (!result.rows[0]) return res.status(404).json({ error: 'Record not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/lookups/:type/:id  (admin only)
router.delete('/:type/:id', authenticate, requireAdmin, guardType, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM ${req.params.type} WHERE id = $1`, [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Record not found.' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;