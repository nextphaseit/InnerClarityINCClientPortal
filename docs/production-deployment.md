# Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Authentication Configuration
- [ ] Google OAuth configured with production client ID/secret
- [ ] Authorized domains set to production domains only
- [ ] Supabase Auth configured for patient portal
- [ ] All demo credentials removed

### ✅ Environment Variables
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` set to strong production secret
- [ ] All Stripe keys using live/production values
- [ ] Supabase URLs pointing to production database
- [ ] Email configuration using production SMTP

### ✅ Database
- [ ] Production Supabase project created
- [ ] All migration scripts executed
- [ ] RLS policies enabled and tested
- [ ] Demo data removed (run scripts/99-remove-demo-data.sql)

### ✅ Security
- [ ] All demo mode references removed
- [ ] Debug mode disabled
- [ ] Error logging configured
- [ ] CORS policies set correctly

## Vercel Deployment

### 1. Environment Variables in Vercel
Set these in your Vercel project settings:

\`\`\`
NEXTAUTH_URL=https://admin.nextphaseit.org
NEXTAUTH_SECRET=[strong-production-secret]
GOOGLE_CLIENT_ID=[production-google-client-id]
GOOGLE_CLIENT_SECRET=[production-google-client-secret]
NEXT_PUBLIC_SUPABASE_URL=[production-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[production-supabase-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[production-supabase-service-role-key]
STRIPE_SECRET_KEY=sk_live_[production-stripe-key]
STRIPE_WEBHOOK_SECRET=whsec_[production-webhook-secret]
\`\`\`

### 2. Domain Configuration
- Admin Portal: `admin.nextphaseit.org`
- Patient Portal: `patients.nextphaseit.org`

### 3. OAuth Callback URLs
Configure these in your OAuth providers:
- Google: `https://admin.nextphaseit.org/api/auth/callback/google`
- Supabase: `https://patients.nextphaseit.org/auth/callback`

### 4. Stripe Webhook Endpoints
- Production webhook: `https://patients.nextphaseit.org/api/stripe/webhook`

## Post-Deployment Verification

### Admin Portal Testing
1. Visit `https://admin.nextphaseit.org/auth/signin`
2. Test Google OAuth login
3. Verify admin dashboard loads
4. Test key admin functions

### Patient Portal Testing
1. Visit `https://patients.nextphaseit.org/portal/auth/signin`
2. Test Supabase authentication
3. Verify patient dashboard loads
4. Test key patient functions

### Security Testing
1. Verify unauthorized access is blocked
2. Test logout functionality
3. Verify session management
4. Test CORS policies

## Monitoring

### Error Tracking
- Vercel Analytics enabled
- Error logging configured
- Performance monitoring active

### Health Checks
- `/api/health` endpoint monitoring
- Database connectivity checks
- Authentication service status

## Support

For deployment issues:
- Email: support@innerclarityinc.com
- Documentation: See `/docs` folder
- Logs: Check Vercel dashboard
