# Vercel Deployment Guide

This guide will help you deploy the Tabetala System on Vercel.

## Prerequisites

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Create a Vercel account** at [vercel.com](https://vercel.com)

3. **Ensure your code is pushed to a Git repository** (GitHub, GitLab, or Bitbucket)

## Deployment Methods

### Method 1: Using Vercel CLI

#### 1. Login to Vercel
```bash
vercel login
```

#### 2. Deploy to Vercel
```bash
vercel
```

This will:
- Detect your Next.js project
- Ask for project configuration
- Deploy to Vercel with a preview URL

#### 3. Set Environment Variables
After deployment, you need to set environment variables in Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   ```
   NEXTAUTH_SECRET=IkivBdUsQzz3gfxmbhV/VUO6QJCp5DNhbrlMZljIBug=
   NEXTAUTH_URL=https://your-app.vercel.app
   TURSO_DATABASE_URL=libsql://tabetala-aneaire.aws-ap-northeast-1.turso.io
   TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI1NTM0ZmM5Ni02NjFiLTRlZWEtYWJiOC02YTI3OTU4NDliOGMiLCJpYXQiOjE3NTc4NjAwNDAsInJpZCI6IjI1NTRiYWVmLWJmMTYtNGU3NC05OGViLTA5MzIxNmJhMTcyMSJ9.q6Z_46_thBElmFYc9l7kaqK5DDNB_yvAS-jKVLb0IVXx_oDKybIg8URU95-LfoNFHE9PT7shuwJ2Bl_Aisn0AA
   ```

#### 4. Deploy to Production
After setting environment variables, deploy to production:
```bash
vercel --prod
```

### Method 2: GitHub Integration (Recommended)

#### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

#### 2. Connect Vercel to GitHub
1. In Vercel dashboard, click **New Project**
2. Select your GitHub repository
3. Vercel will automatically detect Next.js and deploy

#### 3. Configure Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the required environment variables listed above

#### 4. Automatic Deployment
Vercel will automatically redeploy when you push changes to your main branch.

## Environment Variables

### Required Variables
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js authentication
- `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- `TURSO_DATABASE_URL`: Your Turso database connection URL
- `TURSO_AUTH_TOKEN`: Your Turso database authentication token

### Important Notes
- **NEXTAUTH_URL**: Must be updated to match your Vercel deployment URL
- **Database**: Your Turso database is already configured for remote access
- **Security**: Never commit sensitive credentials to version control

## Build Configuration

Vercel will automatically detect and use the following:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Framework**: Next.js

## Post-Deployment Steps

### 1. Verify Deployment
- Visit your Vercel deployment URL
- Test all features including authentication and database connectivity
- Check the Vercel dashboard for any build errors

### 2. Database Migration
If you need to run database migrations:
```bash
# Run migrations locally and push to Turso
npm run db:push
```

### 3. Monitor Performance
- Use Vercel Analytics to monitor performance
- Check Vercel Logs for any runtime errors
- Monitor your Turso database performance

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are properly installed
npm install
```

#### 2. Environment Variables Not Working
- Double-check variable names and values
- Ensure variables are set in the correct environment (Production/Preview/Development)
- Redeploy after changing environment variables

#### 3. Database Connection Issues
- Verify Turso database URL and auth token
- Ensure Turso database is accessible from Vercel's network
- Check Turso database status

#### 4. Authentication Issues
- Verify NEXTAUTH_SECRET and NEXTAUTH_URL
- Ensure callback URLs are properly configured
- Check NextAuth.js configuration

### Reset Deployment
If you need to start fresh:
```bash
# Remove .vercel directory
rm -rf .vercel

# Redeploy
vercel
```

## Domain Configuration

### Custom Domain
1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### SSL/HTTPS
Vercel automatically provides SSL certificates for all deployments.

## Scaling and Performance

### Automatic Scaling
- Vercel automatically scales based on traffic
- Serverless functions handle concurrent requests
- Edge network ensures global performance

### Database Optimization
- Monitor Turso database performance
- Use connection pooling if needed
- Consider read replicas for high traffic

## Backup and Recovery

### Vercel Backups
- Vercel maintains deployment history
- You can rollback to previous deployments
- Environment variables are preserved

### Database Backups
- Turso provides automatic backups
- Use Turso CLI for manual backups:
```bash
turso db backup tabetala backup.sql
```

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Turso Documentation**: [turso.tech/docs](https://turso.tech/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

## Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Database Optimization**: Monitor and optimize database queries
3. **Performance**: Use Vercel Analytics to identify performance bottlenecks
4. **Security**: Keep dependencies updated and follow security best practices
5. **Monitoring**: Set up alerts for critical issues

---

**Note**: This deployment guide assumes you have already set up your Turso database as described in `TURSO_SETUP.md`.