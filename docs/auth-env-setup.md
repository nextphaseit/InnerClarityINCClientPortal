# Authentication Environment Variables

## Admin Portal (Microsoft Authentication)

\`\`\`bash
# Required for NextAuth.js with Azure AD
NEXTAUTH_URL=https://admin.nextphaseit.org
NEXTAUTH_SECRET=your_generated_secret_here
MICROSOFT_CLIENT_ID=your_azure_app_id
MICROSOFT_CLIENT_SECRET=your_azure_secret
MICROSOFT_TENANT_ID=your_tenant_id
\`\`\`

## Azure AD Configuration

1. Set up an Azure AD App Registration
2. Configure the redirect URI: `https://admin.nextphaseit.org/api/auth/callback/azure-ad`
3. Grant permissions: `openid`, `email`, `profile`, `User.Read`, `offline_access`
4. Generate a client secret and copy it to your environment variables

## Patient Portal (Supabase Authentication)

\`\`\`bash
# Required for Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Deployment Notes

- Ensure `NEXTAUTH_URL` matches your admin portal domain
- Set up proper CORS configuration in Supabase for patient portal
- Use secure, randomly generated value for `NEXTAUTH_SECRET`
