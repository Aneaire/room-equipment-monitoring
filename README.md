# TabeTalá Laboratory Management System

A comprehensive laboratory management system built with Next.js, featuring role-based access control, biometric authentication, equipment tracking, and real-time monitoring capabilities.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: Three distinct user roles (Admin, Faculty, Custodian) with tailored dashboards
- **Biometric Authentication**: Support for both traditional username/password and biometric login
- **Laboratory Management**: Complete lab configuration, scheduling, and monitoring
- **Equipment Tracking**: Real-time equipment status monitoring with position tracking
- **Attendance System**: Automated attendance logging with multiple verification methods
- **Alert Management**: Real-time alerts for equipment issues, unauthorized access, and system events
- **Comprehensive Reporting**: Detailed analytics and reporting for all system activities

### User Roles

#### Administrator
- Full system access and configuration
- User management and role assignment
- Laboratory setup and maintenance
- System-wide monitoring and analytics
- Security and access control management

#### Faculty
- Laboratory schedule management
- Student attendance tracking
- Course material management
- Equipment request handling
- Laboratory access control

#### Custodian
- Equipment maintenance tracking
- Laboratory status monitoring
- Issue resolution management
- Inventory management
- Facility operations oversight

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.3**: React framework with App Router
- **React 19.1.0**: Modern React with latest features
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern, accessible UI components
- **Radix UI**: Headless UI primitives
- **Lucide React**: Beautiful, consistent icons
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **TanStack Query**: Server state management
- **Recharts**: Data visualization and charts

### Backend & Database
- **NextAuth.js v4**: Authentication and session management
- **Drizzle ORM**: Type-safe database ORM
- **SQLite**: Local development database
- **LibSQL**: Production-ready database client
- **Better SQLite3**: High-performance SQLite driver

### Authentication
- **JWT-based sessions**: Secure token-based authentication
- **Biometric integration**: Fingerprint and biometric ID support
- **Role-based permissions**: Granular access control
- **Password hashing**: Secure bcrypt password storage

### Real-time Features
- **Socket.io**: Real-time communication
- **WebSockets**: Live updates and notifications
- **Real-time alerts**: Instant system notifications

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                   # Administrator dashboard and pages
│   │   ├── equipment/           # Equipment management
│   │   ├── laboratories/        # Lab configuration
│   │   ├── schedules/           # Schedule management
│   │   ├── users/               # User management
│   │   ├── reports/             # Analytics and reports
│   │   └── layout.tsx           # Admin layout
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── dashboard/           # Dashboard data APIs
│   │   ├── equipment/           # Equipment APIs
│   │   ├── laboratories/        # Lab APIs
│   │   ├── reports/             # Report generation
│   │   ├── schedules/           # Schedule APIs
│   │   └── users/               # User management APIs
│   ├── auth/                    # Authentication pages
│   │   ├── signin/              # Login page
│   │   ├── signup/              # Registration page
│   │   ├── forgot-password/     # Password recovery
│   │   └── reset-password/      # Password reset
│   ├── custodian/               # Custodian dashboard
│   ├── dashboard/               # Main dashboard
│   ├── faculty/                 # Faculty dashboard
│   ├── mock-biometrics/         # Biometric testing interface
│   └── unauthorized/            # Unauthorized access page
├── components/                  # Reusable React components
│   └── ui/                      # shadcn/ui components
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication configuration
│   ├── db/                      # Database configuration
│   │   ├── index.ts            # Database connection
│   │   ├── schema.ts           # Database schema
│   │   └── seed.ts             # Database seeding
│   └── utils.ts                 # Utility functions
└── middleware.ts                # Request middleware
```

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

### Core Tables
- **users**: User accounts with roles and biometric data
- **laboratories**: Laboratory information and configuration
- **equipment**: Equipment tracking with position and status
- **attendance_logs**: Attendance records with verification methods
- **occupancy_logs**: Laboratory occupancy monitoring
- **alerts**: System alerts and notifications
- **schedules**: Laboratory and course scheduling
- **system_logs**: Audit trail and activity tracking
- **notifications**: User notifications and messages
- **settings**: System configuration and preferences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Bun package manager (recommended)
- SQLite database (included)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tabetala-system
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your database URL and NextAuth secret:
   ```env
   DATABASE_URL="file:./tabetala.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate database migrations
   bun run db:generate
   
   # Run migrations
   bun run db:migrate
   
   # Seed the database with initial data
   bun run db:seed
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

### Development
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

### Database
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:seed` - Seed database with initial data

### Production
- `bun run db:migrate-turso` - Migrate to Turso (production database)

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="file:./tabetala.db"

# NextAuth
NEXTAUTH_SECRET="your-secure-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Production Database
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"
```

### Database Configuration
The system supports both SQLite for development and Turso for production:

- **Development**: Uses local SQLite file
- **Production**: Uses Turso (LibSQL) for better performance and scalability

## 🎯 Usage Examples

### Administrator Dashboard
- Access: `/admin`
- Features: User management, lab configuration, system monitoring
- Permissions: Full system access

### Faculty Dashboard
- Access: `/faculty`
- Features: Schedule management, attendance tracking, course materials
- Permissions: Laboratory and course management

### Custodian Dashboard
- Access: `/custodian`
- Features: Equipment maintenance, facility monitoring, issue resolution
- Permissions: Equipment and facility management

### API Endpoints
- Authentication: `/api/auth/*`
- Dashboard data: `/api/dashboard/*`
- Laboratory management: `/api/laboratories/*`
- Equipment tracking: `/api/equipment/*`
- User management: `/api/users/*`

## 🔒 Security Features

### Authentication
- JWT-based session management
- Biometric authentication support
- Role-based access control
- Secure password hashing with bcrypt
- Session timeout and refresh

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with Drizzle ORM
- XSS protection with Next.js built-in security
- CSRF protection with NextAuth.js

### Access Control
- Middleware-based route protection
- Role-based UI rendering
- API endpoint authorization
- Audit logging for all actions

## 📊 Monitoring & Analytics

### Real-time Features
- Live equipment status updates
- Real-time occupancy monitoring
- Instant alert notifications
- Live attendance tracking

### Reporting
- Equipment usage analytics
- Laboratory utilization reports
- Attendance statistics
- System activity logs
- Performance metrics

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Set up production database (Turso)
4. Deploy automatically on push

### Manual Deployment
```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Database Migration to Production
```bash
# Migrate to Turso
bun run db:migrate-turso
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use existing UI components from shadcn/ui
- Maintain consistent code style
- Write comprehensive tests
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [troubleshooting guide](docs/troubleshooting.md)

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile application
- [ ] Advanced biometric integration
- [ ] IoT device connectivity
- [ ] Enhanced analytics dashboard
- [ ] Multi-tenant support
- [ ] API rate limiting
- [ ] Advanced reporting features

### Performance Improvements
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Image optimization
- [ ] Bundle size reduction

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.