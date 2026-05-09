/**
 * migrate.js
 * Reads the original Excel file and inserts normalised data into PostgreSQL.
 * Usage:  node migrate.js
 * Safe to re-run: truncates all tables first (cascade).
 *
 * FIXES applied vs original:
 *  1. Rows 286-304: نوبت چاپ column contains mixed "publisher city year edition" string
 *     → parse publisher name, city, year, and edition out of it correctly
 *  2. Row 99: موضوع (subject) contains numeric value 144 (data entry error)
 *     → numeric subjects are treated as null
 *  3. Row 24: isbn is an empty string → clean() handles this
 *  4. Rows 107, 122: volume_type typos "جبد" / "چلد" → normalised to "جلد"
 *  5. Translator names have trailing whitespace → clean() trims them
 *  6. pubYear fallback was pointing at wrong column → now correctly reads نوبت چاپ
 */

require('dotenv').config({ path: '../.env' });
const path = require('path');
const XLSX = require('xlsx');
const { Pool } = require('pg');

// Excel file must be placed in the same database/ folder
const EXCEL_PATH = path.resolve(__dirname, 'books.xlsx');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ─────────────────────────────────────────
// helpers
// ─────────────────────────────────────────

function clean(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s === '' || s === 'NaN' || s === 'undefined' ? null : s;
}

function cleanNum(val) {
  if (val === null || val === undefined) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

/**
 * Rows 286-304 have publisher + city + year + edition all in one string
 * inside the نوبت چاپ (edition) column, e.g.:
 *   "نشر عصر کتاب تهران 1381 اول"
 * Returns { publisher, city, year, edition } parsed out.
 */
function parseMixedEditionField(raw) {
  if (!raw || (!raw.includes('نشر') && !raw.includes('انتشارات'))) {
    return { publisher: null, city: null, year: null, edition: raw };
  }

  const yearMatch = raw.match(/\b(1[3-4]\d{2})\b/);
  const cityMatch = raw.match(/(تهران|مشهد|کابل|اصفهان|شیراز|تبریز)/);
  const editionWords = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم', 'نهمم'];
  let edition = null;
  for (const w of editionWords) {
    if (raw.includes(w)) { edition = w; break; }
  }

  const stopAt = cityMatch
    ? raw.indexOf(cityMatch[0])
    : yearMatch ? raw.indexOf(yearMatch[0]) : -1;
  const publisher = stopAt > 0
    ? raw.substring(0, stopAt).trim().replace(/\s+/g, ' ') || null
    : null;

  return {
    publisher: publisher || null,
    city: cityMatch ? cityMatch[0] : null,
    year: yearMatch ? parseInt(yearMatch[1], 10) : null,
    edition: edition,
  };
}

/** Normalise volume_type typos جبد / چلد → جلد */
function normaliseVolumeType(val) {
  const v = clean(val);
  if (!v) return null;
  if (v === 'جبد' || v === 'چلد') return 'جلد';
  return v;
}

/** Upsert a single-column unique lookup table and return its id. */
async function upsertOne(client, table, uniqueCol, value) {
  if (!value) return null;
  const res = await client.query(
    `INSERT INTO ${table} (${uniqueCol}) VALUES ($1)
     ON CONFLICT (${uniqueCol}) DO UPDATE SET ${uniqueCol} = EXCLUDED.${uniqueCol}
     RETURNING id`,
    [value]
  );
  return res.rows[0].id;
}

/** Upsert publisher by composite (name, city). */
async function upsertPublisher(client, name, city) {
  if (!name) return null;
  const res = await client.query(
    `INSERT INTO publishers (name, city) VALUES ($1, $2)
     ON CONFLICT (name, city) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, city || null]
  );
  return res.rows[0].id;
}

/** Upsert subject. Rejects purely numeric values (row 99 data entry error). */
async function upsertSubject(client, name, dewey) {
  if (!name) return null;
  if (!isNaN(Number(name))) return null;   // numeric subject = data error, skip
  const res = await client.query(
    `INSERT INTO subjects (name, dewey_number) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET dewey_number = COALESCE(EXCLUDED.dewey_number, subjects.dewey_number)
     RETURNING id`,
    [name, dewey || null]
  );
  return res.rows[0].id;
}

// ─────────────────────────────────────────
// main
// ─────────────────────────────────────────

async function main() {
  const client = await pool.connect();

  try {
    console.log('📖  Reading Excel file …');
    const wb = XLSX.readFile(EXCEL_PATH);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
    console.log(`    Found ${rows.length} rows.`);

    await client.query('BEGIN');

    // ── Truncate for safe re-run ───────────────────────────
    console.log('🗑   Truncating tables …');
    await client.query(`
      TRUNCATE TABLE
        reservations, loans, copies,
        book_translators, book_authors,
        books,
        translators, authors,
        publishers, subjects, categories, languages
      RESTART IDENTITY CASCADE
    `);

    console.log('⬆️   Inserting data …');
    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const title = clean(row['عنوان کتاب']);
      if (!title) { skipped++; continue; }

      // ── Edition field: may contain mixed pub/city/year/edition data ──
      const rawEdition = clean(row['نوبت چاپ']);
      const parsed = parseMixedEditionField(rawEdition);

      // Publisher: dedicated columns first, then fall back to what was parsed
      const pubName = clean(row['ناشر']) || parsed.publisher;
      const pubCity = clean(row['محل نشر']) || parsed.city;

      // Publication year: dedicated column first, then parsed fallback
      const pubYear = cleanNum(row['تاریخ نشر']) || parsed.year || null;

      // Edition: use the actual edition text (parsed last word, or raw if not mixed)
      const edition = parsed.edition || rawEdition;

      // Subject: must be a string, not a number
      const subjectRaw = clean(row['موضوع']);
      const subjectName = (subjectRaw && isNaN(Number(subjectRaw))) ? subjectRaw : null;
      const deweyRaw = clean(row['شماره دی وی']);

      // People  (note: translator column has a trailing space in Excel header)
      const authorName = clean(row['اسم مولف']);
      const transName = clean(row['مترجم ']);

      // Lookup IDs
      const [languageId, categoryId, subjectId, publisherId] = await Promise.all([
        upsertOne(client, 'languages', 'name', clean(row['زبان'])),
        upsertOne(client, 'categories', 'name', clean(row['کتگوری'])),
        upsertSubject(client, subjectName, deweyRaw),
        upsertPublisher(client, pubName, pubCity),
      ]);

      // Insert book
      const bookRes = await client.query(
        `INSERT INTO books
           (title, edition, volume_type, page_count, isbn,
            unit_price, total_price, publication_year,
            series_count, volume_count,
            keywords, notes, details,
            language_id, category_id, subject_id, publisher_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING id`,
        [
          title,
          edition,
          normaliseVolumeType(row['جلد/ نسخه/ دوره']),
          cleanNum(row['تعداد صفحه']),
          clean(row['شابک/ isbn']),
          cleanNum(row['قیمت فی']),
          cleanNum(row['مجموع قیمت']),
          pubYear,
          cleanNum(row['تعدادجلد/ دوره']),
          cleanNum(row['تعداد جلد']),
          clean(row['کلمات کلیدی']),
          clean(row['یادداشت']),
          clean(row['تفصیلات']),
          languageId,
          categoryId,
          subjectId,
          publisherId,
        ]
      );
      const bookId = bookRes.rows[0].id;

      // Author
      if (authorName) {
        const authorId = await upsertOne(client, 'authors', 'full_name', authorName);
        await client.query(
          `INSERT INTO book_authors (book_id, author_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [bookId, authorId]
        );
      }

      // Translator
      if (transName) {
        const transId = await upsertOne(client, 'translators', 'full_name', transName);
        await client.query(
          `INSERT INTO book_translators (book_id, translator_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [bookId, transId]
        );
      }

      // Physical copy
      await client.query(
        `INSERT INTO copies
           (book_id, shelf, row_slot, binding_condition, hall, hall_manager, date_received)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          bookId,
          clean(row['الماری/قفسه']),
          clean(row['طاقچه/ ردیف']),
          clean(row['حالت کتاب/ صحافی']),
          clean(row['تالار']),
          clean(row['مسوول تالار']),
          clean(row['تاریخ دریافت']),
        ]
      );

      inserted++;
    }

    await client.query('COMMIT');
    console.log(`✅  Done. Inserted: ${inserted}  |  Skipped (no title): ${skipped}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌  Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
