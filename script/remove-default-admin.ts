import { pool } from "../server/db";

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("delete from users where username = 'admin' and role = 'admin'");
    const result = await client.query<{ total_users: number; admin_users: number }>(
      "select count(*)::int as total_users, count(*) filter (where role = 'admin')::int as admin_users from users",
    );
    await client.query("COMMIT");

    console.log(`users_total: ${result.rows[0]?.total_users ?? 0}`);
    console.log(`admin_users: ${result.rows[0]?.admin_users ?? 0}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Failed to remove default admin.");
  console.error(error);
  process.exit(1);
});
