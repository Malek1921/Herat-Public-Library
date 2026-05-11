const router = require('express').Router();
const pool = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const [
      books, copies, members, loans, overdue, reservations,
      categories, authors, publishers, translators,
      dailyTransactions, avgDuration, hourlyTransactions
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM books`),
      pool.query(`SELECT COUNT(*) FROM copies`),
      pool.query(`SELECT COUNT(*) FROM members WHERE is_active = true`),
      pool.query(`SELECT COUNT(*) FROM loans WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) FROM loans WHERE status = 'active' AND due_date < CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM reservations WHERE status = 'pending'`),
      pool.query(`SELECT c.name, COUNT(b.id) AS book_count
                  FROM categories c
                  LEFT JOIN books b ON b.category_id = c.id
                  GROUP BY c.name ORDER BY book_count DESC`),
      pool.query(`SELECT COUNT(*) FROM authors`),
      pool.query(`SELECT COUNT(*) FROM publishers`),
      pool.query(`SELECT COUNT(*) FROM translators`),
      // Today's transactions (last 10) – still used for the table
      pool.query(`SELECT dt.id, dt.visitor_name, dt.visitor_lastname, b.title AS book_title,
                         dt.taken_at, dt.returned_at, dt.status,
                         EXTRACT(EPOCH FROM (COALESCE(dt.returned_at, NOW()) - dt.taken_at)) / 3600 AS hours_borrowed
                  FROM daily_transactions dt
                  JOIN books b ON b.id = dt.book_id
                  WHERE DATE(dt.taken_at) = CURRENT_DATE
                  ORDER BY dt.taken_at DESC LIMIT 10`),
      // Avg reading duration
      pool.query(`SELECT COALESCE(
                    AVG(EXTRACT(EPOCH FROM (dt.returned_at - dt.taken_at)) / 3600), 0
                  ) AS avg_hours
                  FROM daily_transactions dt
                  WHERE DATE(dt.taken_at) = CURRENT_DATE
                    AND dt.returned_at IS NOT NULL`),
      // Hourly transaction counts for chart
      pool.query(`SELECT EXTRACT(HOUR FROM taken_at)::int AS hour, COUNT(*)::int AS count
                  FROM daily_transactions
                  WHERE DATE(taken_at) = CURRENT_DATE
                  GROUP BY hour
                  ORDER BY hour`)
    ]);

    res.json({
      totals: {
        books: parseInt(books.rows[0].count),
        copies: parseInt(copies.rows[0].count),
        members: parseInt(members.rows[0].count),
        active_loans: parseInt(loans.rows[0].count),
        overdue: parseInt(overdue.rows[0].count),
        reservations: parseInt(reservations.rows[0].count),
        authors: parseInt(authors.rows[0].count),
        publishers: parseInt(publishers.rows[0].count),
        translators: parseInt(translators.rows[0].count),
      },
      books_by_category: categories.rows,
      daily_transactions: dailyTransactions.rows,
      avg_reading_hours_today: parseFloat(avgDuration.rows[0].avg_hours),
      hourly_transactions: hourlyTransactions.rows,
    });
  } catch (err) { next(err); }
});

module.exports = router;