import fs from "fs/promises";
import path from "path";
import { pool } from "../server/db";

type CsvRow = Record<string, string | null>;

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.some((cell) => cell.length > 0));
}

function normalizeValue(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

async function readCsv(fileName: string): Promise<CsvRow[]> {
  const filePath = path.resolve(process.cwd(), "daftar_tabel", fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  const [headers, ...rows] = parseCsv(raw);

  return rows.map((cells) => {
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = normalizeValue(cells[index]);
    });
    return row;
  });
}

function asNumber(value: string | null) {
  return value === null ? null : Number(value);
}

async function upsertRows(table: string, columns: string[], rows: Array<Record<string, unknown>>) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const row of rows) {
      const values = columns.map((column) => row[column] ?? null);
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
      const updates = columns
        .filter((column) => column !== "id")
        .map((column) => `${column} = EXCLUDED.${column}`)
        .join(", ");

      await client.query(
        `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updates}`,
        values,
      );
    }

    await client.query(
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`,
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const users = (await readCsv("users.csv")).filter((row) => row.role !== "admin" && row.username !== "admin");
  const programs = await readCsv("programs.csv");
  const donations = await readCsv("donations.csv");
  const articles = await readCsv("articles.csv");
  const cmsPages = await readCsv("cms_pages.csv");

  await upsertRows(
    "users",
    ["id", "username", "email", "password", "role", "full_name", "phone", "address", "created_at"],
    users.map((row) => ({
      id: asNumber(row.id),
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role,
      full_name: row.full_name,
      phone: row.phone,
      address: row.address,
      created_at: row.created_at,
    })),
  );

  await upsertRows(
    "programs",
    ["id", "title", "description", "target_amount", "current_amount", "image_url", "content", "donor_count"],
    programs.map((row) => ({
      id: asNumber(row.id),
      title: row.title,
      description: row.description,
      target_amount: asNumber(row.target_amount),
      current_amount: asNumber(row.current_amount),
      image_url: row.image_url,
      content: row.content,
      donor_count: asNumber(row.donor_count),
    })),
  );

  await upsertRows(
    "articles",
    ["id", "title", "excerpt", "content", "image_url", "author", "category", "created_at"],
    articles.map((row) => ({
      id: asNumber(row.id),
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      image_url: row.image_url,
      author: row.author,
      category: row.category,
      created_at: row.created_at,
    })),
  );

  await upsertRows(
    "cms_pages",
    ["id", "slug", "title", "content", "updated_at"],
    cmsPages.map((row) => ({
      id: asNumber(row.id),
      slug: row.slug,
      title: row.title,
      content: row.content,
      updated_at: row.updated_at,
    })),
  );

  await upsertRows(
    "donations",
    [
      "id",
      "program_id",
      "user_id",
      "donor_name",
      "donor_email",
      "amount",
      "message",
      "payment_status",
      "midtrans_order_id",
      "midtrans_transaction_id",
      "created_at",
    ],
    donations.map((row) => ({
      id: asNumber(row.id),
      program_id: asNumber(row.program_id),
      user_id: asNumber(row.user_id),
      donor_name: row.donor_name,
      donor_email: row.donor_email,
      amount: asNumber(row.amount),
      message: row.message,
      payment_status: row.payment_status,
      midtrans_order_id: row.midtrans_order_id,
      midtrans_transaction_id: row.midtrans_transaction_id,
      created_at: row.created_at,
    })),
  );

  console.log(`Imported ${users.length} non-admin users`);
  console.log(`Imported ${programs.length} programs`);
  console.log(`Imported ${articles.length} articles`);
  console.log(`Imported ${cmsPages.length} cms pages`);
  console.log(`Imported ${donations.length} donations`);
  console.log("Admin rows from CSV are intentionally skipped.");
  console.log("Session table is intentionally skipped.");

  await pool.end();
}

main().catch(async (error) => {
  console.error("CSV import failed.");
  console.error(error);
  await pool.end();
  process.exit(1);
});
