import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function migrate() {
  console.log('🔄 Running migrations...')

  try {
    // Read the SQL file from disk
    const sqlFile = path.join(__dirname, 'migrations', '001_create_tables.sql')
    const sql = fs.readFileSync(sqlFile, 'utf-8')

    // Execute the entire SQL file against the database
    await pool.query(sql)

    console.log('✅ Migrations completed successfully')
  } catch (err) {
    console.error('❌ Migration failed:', err)
  } finally {
    // Always close the pool when the script finishes
    // whether it succeeded or failed
    await pool.end()
  }
}

// Run it
migrate()