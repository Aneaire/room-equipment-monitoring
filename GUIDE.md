# Tabetala System - Complete Guide

## Project Overview

Tabetala System is a comprehensive laboratory management system built with Next.js, featuring user authentication, equipment tracking, scheduling, and reporting capabilities. The system supports multiple user roles including administrators, faculty, and custodians.

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: SQLite (local) / Turso (production)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Socket.io

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Initialize database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── custodian/         # Custodian dashboard
│   ├── dashboard/         # Main dashboard
│   ├── faculty/           # Faculty dashboard
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
└── lib/                  # Utility libraries
    ├── auth.ts           # Authentication configuration
    ├── db/               # Database setup and schema
    └── utils.ts          # Utility functions
```

## User Roles & Permissions

### Administrator
- Full system access
- User management
- Equipment management
- Laboratory management
- Schedule management
- Report generation
- System configuration

### Faculty
- Laboratory access management
- Schedule viewing and management
- Attendance tracking
- Equipment usage monitoring
- Report viewing

### Custodian
- Equipment maintenance
- Laboratory status updates
- Basic reporting
- Attendance monitoring

## Key Features

### Authentication System
- NextAuth.js integration
- Role-based access control
- Password reset functionality
- Session management

### Laboratory Management
- Laboratory creation and configuration
- Schedule management
- Equipment assignment
- Usage tracking

### Equipment Tracking
- Equipment registration
- Maintenance scheduling
- Usage monitoring
- Status updates

### Attendance System
- Biometric integration support
- Manual attendance recording
- Real-time attendance tracking
- Attendance reports

### Reporting
- Laboratory usage reports
- Equipment maintenance reports
- Attendance analytics
- System activity logs

## Database Schema

The system uses Drizzle ORM with the following main entities:

- **Users**: User accounts with roles and permissions
- **Laboratories**: Physical laboratory spaces
- **Equipment**: Laboratory equipment and tools
- **Schedules**: Laboratory usage schedules
- **Attendance**: User attendance records
- **Reports**: System-generated reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Dashboard
- `GET /api/dashboard/stats` - System statistics
- `GET /api/dashboard/activity` - Recent activity
- `GET /api/dashboard/alerts` - System alerts
- `GET /api/dashboard/laboratories` - Laboratory overview

### Users
- `GET /api/users` - List users
- `GET /api/users/[id]` - Get user details
- `POST /api/users/[id]/toggle` - Toggle user status

### Laboratories
- `GET /api/laboratories` - List laboratories
- `GET /api/laboratories/[id]` - Get laboratory details
- `POST /api/laboratories` - Create laboratory
- `PUT /api/laboratories/[id]` - Update laboratory

### Equipment
- `GET /api/equipment` - List equipment
- `GET /api/equipment/[id]` - Get equipment details
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/[id]` - Update equipment

### Schedules
- `GET /api/schedules` - List schedules
- `GET /api/schedules/[id]` - Get schedule details
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/[id]` - Update schedule

### Reports
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/equipment` - Equipment reports
- `GET /api/reports/usage` - Usage reports
- `GET /api/reports/alerts` - System alerts

## Development Commands

### Database Operations
```bash
npm run db:generate    # Generate migration files
npm run db:migrate     # Run migrations
npm run db:push        # Push schema changes
npm run db:studio      # Open database studio
npm run db:seed        # Seed database with initial data
```

### Development
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

## Production Deployment

### Database Setup

For production deployment, it's recommended to use Turso database:

1. Follow the [Turso Setup Guide](./TURSO_SETUP.md)
2. Update environment variables for production
3. Run database migrations
4. Seed production database

### Environment Variables

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Database Configuration
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Deployment Steps

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

3. Set up environment variables in production

4. Run database migrations in production

## Testing

Currently, no testing framework is configured. It's recommended to add:

- **Unit Tests**: Jest or Vitest for utility functions
- **Integration Tests**: Testing Library for React components
- **E2E Tests**: Playwright or Cypress for user flows

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database URL and credentials
   - Check if database service is running
   - Run `npm run db:studio` to test connection

2. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL configuration
   - Clear browser cookies and localStorage

3. **Build Errors**
   - Run `npm run lint` to check for code issues
   - Verify all dependencies are installed
   - Check TypeScript errors

### Reset Development Environment

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset database
rm -f tabetala.db*
npm run db:push
npm run db:seed
```

## Contributing

1. Follow the code style guidelines in AGENTS.md
2. Use TypeScript with strict mode
3. Write meaningful commit messages
4. Test changes thoroughly
5. Update documentation as needed

## Support

For issues and questions:
- Check existing documentation
- Review the troubleshooting section
- Create an issue in the project repository