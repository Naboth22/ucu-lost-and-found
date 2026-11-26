import pool, { testDatabaseConnection } from '../config/db.js';
import { env } from '../config/env.js';

async function run() {
  console.log(`Checking MySQL connection to ${env.db.database} at ${env.db.host}:${env.db.port}...`);
  await testDatabaseConnection();
  const [rows] = await pool.query('SELECT DATABASE() AS current_db, NOW() AS server_time');
  console.log('Database connection verified:', rows[0]);
  await pool.end();
}

run().catch((err) => {
  console.error('Database verification failed:', err.message);
  process.exit(1);
});
