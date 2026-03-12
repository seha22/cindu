import { pool } from "../server/db";

async function testConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query<{ now: Date }>("select now()");
    console.log(`Database connected. Server time: ${result.rows[0]?.now?.toISOString?.() ?? "unknown"}`);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection().catch((error) => {
  console.error("Database connection failed.");
  console.error(error);
  process.exit(1);
});
