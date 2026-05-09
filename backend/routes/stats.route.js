const router = require('express').Router();
const pool   = require('../config/pool');
const { authenticate } = require('../middlewares/auth.middleware');

// GET /api/stats  – dashboard summary
router.get('/', authenticate, async (req, res, next) => {
  try {
    const [books, copies, members, loans, overdue, reservations, categories, recentLoans] =
      await Promise.all([
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
        pool.query(`SELECT l.id, b.title AS book_title, m.full_name AS member_name,
                           l.issued_at, l.due_date, l.status
                    FROM loans l
                    JOIN copies  c ON c.id = l.copy_id
                    JOIN books   b ON b.id = c.book_id
                    JOIN members m ON m.id = l.member_id
                    ORDER BY l.issued_at DESC LIMIT 10`),
      ]);

    res.json({
      totals: {
        books:        parseInt(books.rows[0].count),
        copies:       parseInt(copies.rows[0].count),
        members:      parseInt(members.rows[0].count),
        active_loans: parseInt(loans.rows[0].count),
        overdue:      parseInt(overdue.rows[0].count),
        reservations: parseInt(reservations.rows[0].count),
      },
      books_by_category: categories.rows,
      recent_loans:      recentLoans.rows,
    });
  } catch (err) { next(err); }
});

module.exports = router;
