import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../src/lib/db/schema'
import Database from 'better-sqlite3'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// SQLite connection (source)
const sqlite = new Database('./tabetala.db')
const sqliteDb = drizzleSqlite(sqlite, { schema })

// Turso connection (target)
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://localhost:3133/tabetala',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const tursoDb = drizzle(tursoClient, { schema })

async function migrate() {
  console.log('Starting migration from SQLite to Turso...')

  try {
    // Get all data from SQLite
    console.log('Fetching data from SQLite...')
    
    const users = await sqliteDb.select().from(schema.users).all()
    const laboratories = await sqliteDb.select().from(schema.laboratories).all()
    const equipment = await sqliteDb.select().from(schema.equipment).all()
    const attendanceLogs = await sqliteDb.select().from(schema.attendanceLogs).all()
    const occupancyLogs = await sqliteDb.select().from(schema.occupancyLogs).all()
    const alerts = await sqliteDb.select().from(schema.alerts).all()
    const schedules = await sqliteDb.select().from(schema.schedules).all()
    const systemLogs = await sqliteDb.select().from(schema.systemLogs).all()
    const notifications = await sqliteDb.select().from(schema.notifications).all()
    const settings = await sqliteDb.select().from(schema.settings).all()

    console.log(`Found ${users.length} users, ${laboratories.length} laboratories, ${schedules.length} schedules`)

    // Insert data into Turso
    console.log('Inserting data into Turso...')

    if (users.length > 0) {
      await tursoDb.insert(schema.users).values(users).run()
      console.log(`✅ Migrated ${users.length} users`)
    }

    if (laboratories.length > 0) {
      await tursoDb.insert(schema.laboratories).values(laboratories).run()
      console.log(`✅ Migrated ${laboratories.length} laboratories`)
    }

    if (equipment.length > 0) {
      await tursoDb.insert(schema.equipment).values(equipment).run()
      console.log(`✅ Migrated ${equipment.length} equipment`)
    }

    if (attendanceLogs.length > 0) {
      await tursoDb.insert(schema.attendanceLogs).values(attendanceLogs).run()
      console.log(`✅ Migrated ${attendanceLogs.length} attendance logs`)
    }

    if (occupancyLogs.length > 0) {
      await tursoDb.insert(schema.occupancyLogs).values(occupancyLogs).run()
      console.log(`✅ Migrated ${occupancyLogs.length} occupancy logs`)
    }

    if (alerts.length > 0) {
      await tursoDb.insert(schema.alerts).values(alerts).run()
      console.log(`✅ Migrated ${alerts.length} alerts`)
    }

    if (schedules.length > 0) {
      await tursoDb.insert(schema.schedules).values(schedules).run()
      console.log(`✅ Migrated ${schedules.length} schedules`)
    }

    if (systemLogs.length > 0) {
      await tursoDb.insert(schema.systemLogs).values(systemLogs).run()
      console.log(`✅ Migrated ${systemLogs.length} system logs`)
    }

    if (notifications.length > 0) {
      await tursoDb.insert(schema.notifications).values(notifications).run()
      console.log(`✅ Migrated ${notifications.length} notifications`)
    }

    if (settings.length > 0) {
      await tursoDb.insert(schema.settings).values(settings).run()
      console.log(`✅ Migrated ${settings.length} settings`)
    }

    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()