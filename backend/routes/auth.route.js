const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const pool    = require('../config/pool');
const { signToken } = require('../utils/jwt');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

const SALT_ROUNDS = 12;

// ── POST /api/auth/register  (admin only after first user)
router.post('/register', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { username, email, password, role = 'staff' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required.' });
    }
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'role must be admin or staff.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at`,
      [username, email, hash, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// ── POST /api/auth/seed-admin  (one-time bootstrap – remove after first run)
router.post('/seed-admin', async (req, res, next) => {
  try {
    const existing = await pool.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Admin already exists.' });
    }
    const { username = 'admin', email = 'admin@library.local', password } = req.body;
    if (!password) return res.status(400).json({ error: 'password is required.' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin') RETURNING id, username, email, role`,
      [username, email, hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// ── POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const { rows } = await pool.query(
      `SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = $1`,
      [email]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

// ── GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, email, role, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── GET /api/auth/users  (admin)
router.get('/users', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, email, role, is_active, created_at FROM users ORDER BY id`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── PATCH /api/auth/users/:id
router.patch('/users/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { role, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET
         role      = COALESCE($1, role),
         is_active = COALESCE($2, is_active),
         updated_at = NOW()
       WHERE id = $3
       RETURNING id, username, email, role, is_active`,
      [role, is_active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
