import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    const shopResult = await pool.query(`
      INSERT INTO shops (name, slug, is_open, avg_wait_minutes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug) DO NOTHING
      RETURNING *
    `, ['Blue Bottle Coffee', 'blue-bottle', true, 5])

    if (shopResult.rows.length === 0) {
      console.log('ℹ️  Shop already exists, skipping...')
      return
    }

    const shop = shopResult.rows[0]
    console.log('✅ Created shop:', shop.name, '| ID:', shop.id)

    await pool.query(`
      INSERT INTO users (shop_id, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, [shop.id, 'staff@bluebottle.com', 'placeholder_hash', 'staff'])

    console.log('✅ Created staff user: staff@bluebottle.com')

    await pool.query(`
      INSERT INTO queue_entries (shop_id, customer_name, party_size, position, status)
      VALUES 
        ($1, 'Alice', 2, 1, 'waiting'),
        ($1, 'Bob', 1, 2, 'waiting'),
        ($1, 'Carol', 3, 3, 'waiting')
    `, [shop.id])

    console.log('✅ Created 3 test queue entries')
    console.log('🌱 Seeding complete!')

  } catch (err) {
    console.error('❌ Seeding failed:', err)
  } finally {
    await pool.end()
  }
}

seed()