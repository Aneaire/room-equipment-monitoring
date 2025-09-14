import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  dialect: 'turso',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || 'libsql://localhost:3133/tabetala',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
})