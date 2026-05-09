-- ============================================================
-- Library Management System – Database Schema
-- PostgreSQL – 3rd Normal Form
-- ============================================================

-- ─────────────────────────────────────────
-- LOOKUP / REFERENCE TABLES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS languages (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS subjects (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL UNIQUE,
    dewey_number VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS publishers (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    UNIQUE (name, city)
);

-- ─────────────────────────────────────────
-- PEOPLE TABLES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS authors (
    id        SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS translators (
    id        SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- CORE BOOK TABLE
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS books (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(500) NOT NULL,
    edition          VARCHAR(50),
    volume_type      VARCHAR(50),                        -- جلد / دوره / نسخه
    page_count       INTEGER CHECK (page_count > 0),
    isbn             VARCHAR(50),
    unit_price       NUMERIC(12, 2),
    total_price      NUMERIC(12, 2),
    publication_year INTEGER,
    series_count     INTEGER DEFAULT 1,                  -- تعدادجلد/دوره
    volume_count     INTEGER DEFAULT 1,                  -- تعداد جلد
    keywords         TEXT,
    notes            TEXT,
    details          TEXT,
    language_id      INTEGER REFERENCES languages(id)    ON DELETE SET NULL,
    category_id      INTEGER REFERENCES categories(id)   ON DELETE SET NULL,
    subject_id       INTEGER REFERENCES subjects(id)     ON DELETE SET NULL,
    publisher_id     INTEGER REFERENCES publishers(id)   ON DELETE SET NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_title       ON books (title);
CREATE INDEX IF NOT EXISTS idx_books_isbn        ON books (isbn);
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books (category_id);
CREATE INDEX IF NOT EXISTS idx_books_subject_id  ON books (subject_id);

-- ─────────────────────────────────────────
-- JUNCTION TABLES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS book_authors (
    book_id   INTEGER NOT NULL REFERENCES books(id)   ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE IF NOT EXISTS book_translators (
    book_id       INTEGER NOT NULL REFERENCES books(id)       ON DELETE CASCADE,
    translator_id INTEGER NOT NULL REFERENCES translators(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, translator_id)
);

-- ─────────────────────────────────────────
-- PHYSICAL COPIES TABLE
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS copies (
    id                SERIAL PRIMARY KEY,
    book_id           INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    shelf             VARCHAR(50),                          -- الماری/قفسه
    row_slot          VARCHAR(50),                          -- طاقچه/ردیف
    binding_condition VARCHAR(50),                          -- ساده / گالینگور / جیبی
    hall              VARCHAR(100),                         -- تالار (currently empty)
    hall_manager      VARCHAR(255),                         -- مسوول تالار (currently empty)
    date_received     DATE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copies_book_id ON copies (book_id);

-- ─────────────────────────────────────────
-- MEMBERS TABLE (for loans/reservations)
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS members (
    id           SERIAL PRIMARY KEY,
    full_name    VARCHAR(255) NOT NULL,
    email        VARCHAR(255) UNIQUE,
    phone        VARCHAR(50),
    national_id  VARCHAR(50) UNIQUE,
    address      TEXT,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members (email);

-- ─────────────────────────────────────────
-- USERS TABLE (staff / admin authentication)
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- LOANS TABLE
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS loans (
    id            SERIAL PRIMARY KEY,
    copy_id       INTEGER NOT NULL REFERENCES copies(id)   ON DELETE RESTRICT,
    member_id     INTEGER NOT NULL REFERENCES members(id)  ON DELETE RESTRICT,
    issued_by     INTEGER REFERENCES users(id)             ON DELETE SET NULL,
    issued_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date      DATE        NOT NULL,
    returned_at   TIMESTAMPTZ,
    status        VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'returned', 'overdue')),
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_copy_id   ON loans (copy_id);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans (member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status    ON loans (status);

-- ─────────────────────────────────────────
-- RESERVATIONS TABLE
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reservations (
    id           SERIAL PRIMARY KEY,
    book_id      INTEGER NOT NULL REFERENCES books(id)   ON DELETE CASCADE,
    member_id    INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    reserved_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ,
    status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'fulfilled', 'cancelled', 'expired')),
    notes        TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_book_id   ON reservations (book_id);
CREATE INDEX IF NOT EXISTS idx_reservations_member_id ON reservations (member_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status    ON reservations (status);

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['books','copies','members','users','loans','reservations'] LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
             CREATE TRIGGER trg_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
            t, t
        );
    END LOOP;
END $$;
