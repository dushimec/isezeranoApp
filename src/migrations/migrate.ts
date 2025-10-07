import pool from '../lib/db';
import fs from 'fs';
import path from 'path';

async function migrate() {
  console.log('Starting database migration...');
  const client = await pool.connect();
  try {
    // Find the absolute path to the db.sql file
    const sqlFilePath = path.join(process.cwd(), 'src', 'lib', 'db.sql');
    
    // Read the SQL file
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL commands
    await client.query(sql);
    
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Error during database migration:', error);
    process.exit(1); // Exit with an error code
  } finally {
    // Release the client back to the pool
    client.release();
    // End the pool so the script terminates
    await pool.end();
    console.log('Database connection closed.');
  }
}

migrate();
