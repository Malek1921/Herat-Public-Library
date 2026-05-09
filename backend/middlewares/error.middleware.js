function errorMiddleware(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err.message);

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry.', detail: err.detail });
  }
  // Postgres foreign-key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist.', detail: err.detail });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error.' });
}

module.exports = errorMiddleware;
