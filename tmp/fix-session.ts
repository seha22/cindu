import { pool } from "./server/db";

async function fixSessionTable() {
  try {
    console.log("Checking if session table exists...");
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'session'
      );
    `);
    
    if (!checkResult.rows[0].exists) {
      console.log("Session table missing. Creating it manually...");
      await pool.query(`
        CREATE TABLE "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL
        )
        WITH (OIDS=FALSE);
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        CREATE INDEX "IDX_session_expire" ON "session" ("expire");
      `);
      console.log("Session table created successfully.");
    } else {
      console.log("Session table already exists.");
    }
  } catch (error) {
    console.error("Error fixing session table:", error);
  } finally {
    await pool.end();
  }
}

fixSessionTable();
