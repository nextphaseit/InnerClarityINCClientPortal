# Authentication Setup Guide

## Domain-Specific Authentication

### Admin Portal (`admin.nextphaseit.org`)
- **Authentication Method**: Microsoft Azure AD only
- **Framework**: NextAuth.js
- **Callback URL**: `/api/auth/callback/azure-ad`
- **Authorized Domains**: `@innerclarity.org`, `@innerclarityinc.com`, `@nextphaseit.org`

### Patient Portal (`patients.nextphaseit.org`)
- **Authentication Method**: Supabase Auth
- **Framework**: Supabase Client
- **Sign-in Methods**: Email/Password, Demo Account
- **No Microsoft Authentication**: Microsoft login is completely disabled

## Required Environment Variables

### Admin Portal Environment Variables

\`\`\`bash
# NextAuth Configuration (Admin Portal)
NEXTAUTH_URL=https://admin.nextphaseit.org
NEXTAUTH_SECRET=your_generated_secret_here

# Microsoft Azure AD Configuration (Admin Only)
MICROSOFT_CLIENT_ID=your_azure_app_id
MICROSOFT_CLIENT_SECRET=your_azure_secret
MICROSOFT_TENANT_ID=your_tenant_id

# Supabase Configuration (Shared)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### Patient Portal Environment Variables

\`\`\`bash
# Supabase Configuration (Patient Portal)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration (Patient Portal)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
\`\`\`

## Azure AD App Registration

### Required Configuration:

1. **Application Type**: Web Application
2. **Redirect URIs**:
   - Production: `https://admin.nextphaseit.org/api/auth/callback/azure-ad`
   - Development: `http://localhost:3000/api/auth/callback/azure-ad`

3. **API Permissions**:
   - `openid` (Sign users in)
   - `email` (View users' email address)
   - `profile` (View users' basic profile)
   - `User.Read` (Sign in and read user profile)
   - `offline_access` (Maintain access to data)

4. **Authentication**:
   - Enable ID tokens
   - Enable access tokens
   - Set token lifetime appropriately

### Client Secret:
- Generate a new client secret in Azure AD
- Copy the secret value (not the ID) to `MICROSOFT_CLIENT_SECRET`

## Domain Detection Logic

### Admin Domain Detection:
- Checks for `admin.nextphaseit.org` in hostname
- Falls back to localhost admin routes for development
- Redirects non-admin domains to patient portal

### Patient Domain Detection:
- Checks for `patients.nextphaseit.org` in hostname
- Falls back to localhost portal routes for development
- Redirects admin domains to admin portal

## Security Features

### Admin Portal Security:
- **Email Domain Validation**: Only authorized email domains can access
- **Microsoft-Only Authentication**: No other auth methods allowed
- **Session Management**: 8-hour admin sessions with automatic refresh
- **Role-Based Access**: Admin role required for all admin routes

### Patient Portal Security:
- **Supabase RLS**: Row Level Security for data protection
- **Email Verification**: Required for new accounts
- **Password Requirements**: Enforced strong passwords
- **Session Persistence**: Secure session management

## Testing

### Admin Portal Testing:
1. Navigate to `https://admin.nextphaseit.org/admin/login`
2. Click "Sign in with Microsoft"
3. Use authorized email domain account
4. Verify redirect to `/admin/dashboard`

### Patient Portal Testing:
1. Navigate to `https://patients.nextphaseit.org/portal/auth/signin`
2. Use email/password or demo account
3. Verify redirect to `/portal`
4. Confirm no Microsoft login option is visible

## Troubleshooting

### Common Issues:

1. **"Access Denied" Error**: Check email domain authorization
2. **"Configuration Error"**: Verify environment variables
3. **Redirect Loops**: Check callback URL configuration
4. **Domain Mismatch**: Ensure correct domain in NEXTAUTH_URL

### Debug Mode:
Set `NODE_ENV=development` for detailed authentication logs
