# Library Management System – CLAUDE.md

## Project Structure

```
Library/
├── database/
│   ├── schema.sql        # Full PostgreSQL DDL – run this first
│   ├── migrate.js        # Excel → PostgreSQL migration script
│   └── package.json
├── backend/
│   ├── config/
│   │   └── pool.js                   # PostgreSQL connection pool
│   ├── middlewares/
│   │   ├── auth.middleware.js         # JWT authentication + role guard
│   │   └── error.middleware.js        # Global error handler
│   ├── routes/
│   │   ├── auth.route.js             # /api/auth
│   │   ├── books.route.js            # /api/books
│   │   ├── authors.route.js          # /api/authors
│   │   ├── translators.route.js      # /api/translators
│   │   ├── copies.route.js           # /api/copies
│   │   ├── members.route.js          # /api/members
│   │   ├── loans.route.js            # /api/loans
│   │   ├── reservations.route.js     # /api/reservations
│   │   ├── lookups.route.js          # /api/lookups/:type
│   │   └── stats.route.js            # /api/stats
│   ├── utils/
│   │   └── jwt.js
│   ├── server.js
│   └── package.json
├── frontend/             # (Phase 5 – not yet built)
├── docker/               # (optional)
├── .env
└── CLAUDE.md
```

---

## Quick Start

### 1 – Database
```bash
createdb library_db
psql library_db < database/schema.sql
```

### 2 – Migration (import Excel data)
```bash
cd database
cp ../دیتابیز_استندرد_کتب.xlsx .   # place Excel file here
npm install
node migrate.js
```

### 3 – Backend
```bash
cd backend
npm install
# copy .env and fill in DATABASE_URL + JWT_SECRET
npm run dev
```

### 4 – Create first admin
```http
POST /api/auth/seed-admin
{ "password": "yourpassword" }
```
> Remove or disable this route after first use.

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/seed-admin | ❌ | Bootstrap first admin (one-time) |
| POST | /api/auth/login | ❌ | Login → returns JWT |
| GET  | /api/auth/me | ✅ | Current user info |
| POST | /api/auth/register | ✅ admin | Register new staff/admin |
| GET  | /api/auth/users | ✅ admin | List all users |
| PATCH | /api/auth/users/:id | ✅ admin | Update role / active status |

### Books
| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/books | List/search books (`?q=&category_id=&subject_id=&author_id=&page=&limit=&sort=&order=`) |
| GET  | /api/books/:id | Single book with authors, translators, publisher |
| GET  | /api/books/:id/copies | All physical copies of a book |
| POST | /api/books | Create book (pass `author_ids[]`, `translator_ids[]`) |
| PUT  | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book (cascades copies) |

### Authors / Translators
| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/authors | List authors (`?q=`) |
| GET  | /api/authors/:id/books | Books by author |
| POST | /api/authors | Create |
| PUT  | /api/authors/:id | Update |
| DELETE | /api/authors/:id | Delete |
*(same pattern for /api/translators)*

### Copies
| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/copies | List copies (`?book_id=&shelf=`) |
| GET  | /api/copies/:id | Single copy + loan status |
| POST | /api/copies | Add physical copy |
| PUT  | /api/copies/:id | Update shelf/condition |
| DELETE | /api/copies/:id | Delete |

### Members
| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/members | List members (`?q=&is_active=`) |
| GET  | /api/members/:id | Single member |
| GET  | /api/members/:id/loans | Loan history |
| POST | /api/members | Register member |
| PUT  | /api/members/:id | Update member |
| DELETE | /api/members/:id | Delete (admin only) |

### Loans
| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/loans | List loans (`?status=&member_id=&overdue=true`) |
| GET  | /api/loans/:id | Single loan |
| POST | /api/loans | Issue book (`copy_id`, `member_id`, `due_date`) |
| PATCH | /api/loans/:id/return | Return a book |
| PATCH | /api/loans/:id | Update due_date / status |
| DELETE | /api/loans/:id | Delete loan record |

### Reservations
| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/reservations | List (`?status=&member_id=&book_id=`) |
| POST | /api/reservations | Create (`book_id`, `member_id`) |
| PATCH | /api/reservations/:id | Update status |
| DELETE | /api/reservations/:id | Delete |

### Lookups (categories / subjects / publishers / languages)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | /api/lookups/:type | ✅ | List all (`?q=`) |
| GET  | /api/lookups/:type/:id | ✅ | Single item |
| POST | /api/lookups/:type | ✅ admin | Create |
| PUT  | /api/lookups/:type/:id | ✅ admin | Update |
| DELETE | /api/lookups/:type/:id | ✅ admin | Delete |

### Stats
| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/stats | Dashboard summary (totals, books by category, recent loans) |

---

## Database Schema Summary

| Table | Purpose |
|-------|---------|
| books | Core book records |
| authors | Unique authors |
| translators | Unique translators |
| book_authors | Many-to-many: books ↔ authors |
| book_translators | Many-to-many: books ↔ translators |
| publishers | Publisher name + city |
| languages | Language lookup |
| categories | Category lookup (طبی / عمومی / سرگرمی …) |
| subjects | Subject + Dewey decimal |
| copies | Physical copies (shelf location, condition) |
| members | Library members |
| users | Staff / admin accounts |
| loans | Book loans (issued / returned / overdue) |
| reservations | Book reservations |