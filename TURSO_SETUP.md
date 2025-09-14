# Turso Database Migration Guide

## Prerequisites

1. Install Turso CLI:
   ```bash
   npm install -g turso
   ```

2. Install required packages:
   ```bash
   npm install @libsql/client
   npm uninstall better-sqlite3 @types/better-sqlite3
   ```

## Step 1: Set Up Turso Database

### Option A: Local Turso Instance
```bash
# Start local Turso instance
turso dev --port 3133

# Create database
turso db create tabetala --local
```

### Option B: Remote Turso Database
```bash
# Sign up for Turso
turso auth signup

# Create database
turso db create tabetala

# Get database URL
turso db show tabetala --url

# Create auth token
turso db tokens create tabetala
```

## Step 2: Configure Environment Variables

Update your `.env.local` file:

```env
NEXTAUTH_SECRET=IkivBdUsQzz3gfxmbhV/VUO6QJCp5DNhbrlMZljIBug=
NEXTAUTH_URL=http://localhost:3000

# Turso Database Configuration
# For local Turso:
TURSO_DATABASE_URL="libsql://localhost:3133/tabetala"
TURSO_AUTH_TOKEN=""

# For remote Turso:
# TURSO_DATABASE_URL="libsql://your-database-url.turso.io"
# TURSO_AUTH_TOKEN="your-auth-token"
```

## Step 3: Generate and Push Schema

```bash
# Generate migration files
npm run db:generate

# Push schema to Turso
npm run db:push
```

## Step 4: Migrate Data (Optional)

If you have existing data in SQLite and want to migrate it to Turso:

```bash
# Run migration script
npm run db:migrate-turso
```

## Step 5: Verify Setup

```bash
# Start development server
npm run dev

# Check database connection
npm run db:studio
```

## Troubleshooting

### Common Issues:

1. **Connection Errors**: Ensure Turso is running and URL is correct
2. **Auth Errors**: Verify auth token is set correctly for remote databases
3. **Schema Issues**: Run `npm run db:push` to ensure schema is up to date

### Reset Database:

If you need to start fresh:

```bash
# Drop and recreate tables
turso db execute tabetala --file scripts/reset.sql
```

## Benefits of Turso

- **Edge Database**: Low latency from global edge locations
- **SQLite Compatibility**: Same SQL syntax you're used to
- **Serverless**: Automatic scaling and maintenance
- **Backups**: Built-in backup and point-in-time recovery
- **Analytics**: Built-in query performance monitoring