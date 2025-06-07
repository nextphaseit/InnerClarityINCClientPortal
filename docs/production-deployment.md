# Production Deployment Guide

## Environment Variables

Set these environment variables in your Vercel project:

### Authentication
\`\`\`
NEXTAUTH_URL=https://admin.nextphaseit.org
NEXTAUTH_SECRET=your-strong-production-secret-here
\`\`\`

### Auth0 (Admin Portal)
\`\`\`
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_BASE_URL=https://admin.nextphaseit.org
\`\`\`

### Supabase (Patient Portal)
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
\`\`\`

### Stripe (Payments)
\`\`\`
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

## Domain Configuration

- Admin Portal: `admin.nextphaseit.org`
- Patient Portal: `patients.nextphaseit.org`

## Pre-Deployment Checklist

- [ ] All demo content removed
- [ ] Production environment variables set
- [ ] OAuth providers configured for production domains
- [ ] Database tables created with proper RLS policies
- [ ] Stripe webhook endpoints configured
- [ ] SSL certificates configured
- [ ] DNS records pointing to Vercel

## Post-Deployment

1. Test admin login with authorized Google accounts
2. Test patient portal registration and login
3. Verify database connectivity
4. Test payment processing
5. Monitor error logs and performance
\`\`\`

```plaintext file=".env.production.example"
# Production Environment Variables Template
# Copy to .env.local for local development or set in Vercel dashboard

# NextAuth Configuration
NEXTAUTH_URL=https://admin.nextphaseit.org
NEXTAUTH_SECRET=your-strong-production-secret-here

# Auth0 Configuration (Admin Portal)
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_BASE_URL=https://admin.nextphaseit.org

# Supabase Configuration (Patient Portal)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration (Optional)
EMAIL_FROM=noreply@nextphaseit.org
EMAIL_PASSWORD=your-email-password
OUTLOOK_SMTP_SERVER=smtp-mail.outlook.com

# Feature Flags
NODE_ENV=production
