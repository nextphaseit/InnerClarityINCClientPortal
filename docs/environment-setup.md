# Environment Configuration Guide

## Admin Portal Environment Variables

For the **Admin Portal** at `https://admin.nextphaseit.org`, set these environment variables:

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

## Patient Portal Environment Variables

For the **Patient Portal** at `https://patients.nextphaseit.org`, set these environment variables:

\`\`\`bash
# Supabase Configuration (Patient Portal)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Auth0 Configuration (Patient Portal - Optional)
NEXT_PUBLIC_AUTH0_DOMAIN=your_auth0_domain
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# Stripe Configuration (Patient Portal)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
\`\`\`

## Azure AD App Registration

### Callback URLs to Configure:

- **Admin Portal**: `https://admin.nextphaseit.org/api/auth/callback/azure-ad`
- **Development**: `http://localhost:3000/api/auth/callback/azure-ad`

### Required Permissions:

- `openid`
- `email`
- `profile`
- `User.Read`
- `offline_access`

## Domain Separation

### Admin Portal (`admin.nextphaseit.org`):
- ✅ Microsoft Azure AD authentication only
- ✅ NextAuth.js for session management
- ✅ Admin-specific features and dashboard
- ❌ No patient authentication methods

### Patient Portal (`patients.nextphaseit.org`):
- ✅ Supabase Auth for email/password
- ✅ Auth0 for social login (optional)
- ✅ Patient-specific features and portal
- ❌ No Microsoft authentication

## Security Features

- **Domain-based authentication**: Different auth methods per domain
- **Automatic redirects**: Wrong domain access redirects to correct portal
- **Role-based access**: Admin vs patient role separation
- **Secure callbacks**: Proper callback URL validation
- **Session isolation**: Separate session management per portal
