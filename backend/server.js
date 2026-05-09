require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const errorMiddleware = require('./middlewares/error.middleware');

const authRouter         = require('./routes/auth.route');
const booksRouter        = require('./routes/books.route');
const authorsRouter      = require('./routes/authors.route');
const translatorsRouter  = require('./routes/translators.route');
const copiesRouter       = require('./routes/copies.route');
const membersRouter      = require('./routes/members.route');
const loansRouter        = require('./routes/loans.route');
const reservationsRouter = require('./routes/reservations.route');
const lookupsRouter      = require('./routes/lookups.route');
const statsRouter        = require('./routes/stats.route');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRouter);
app.use('/api/books',        booksRouter);
app.use('/api/authors',      authorsRouter);
app.use('/api/translators',  translatorsRouter);
app.use('/api/copies',       copiesRouter);
app.use('/api/members',      membersRouter);
app.use('/api/loans',        loansRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/lookups',      lookupsRouter);
app.use('/api/stats',        statsRouter);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});

module.exports = app;
