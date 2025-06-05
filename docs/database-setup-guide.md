# Inner Clarity Portal - Database Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Configure Supabase Integration

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Add Environment Variables**
   Add these to your `.env.local` file:
   \`\`\`bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   \`\`\`

### Step 2: Run Database Scripts in Order

Execute these scripts in your Supabase SQL Editor in this exact order:

1. `scripts/01-create-profiles-table.sql` - Core user profiles
2. `scripts/02-create-appointments-table.sql` - Appointment system
3. `scripts/03-create-messages-table.sql` - Messaging system
4. `scripts/04-create-invoices-table.sql` - Billing system
5. `scripts/05-create-documents-table.sql` - Document management
6. `scripts/06-create-form-responses-table.sql` - Form submissions
7. `scripts/07-create-health-logs-table.sql` - Health tracking
8. `scripts/08-create-audit-logs-table.sql` - Audit trail
9. `scripts/09-create-appointment-requests-table.sql` - Appointment requests
10. `scripts/10-update-form-responses-table.sql` - Form updates
11. `scripts/11-update-documents-table.sql` - Document updates
12. `scripts/12-create-avatars-storage.sql` - Avatar storage
13. `scripts/13-update-profiles-add-avatar.sql` - Profile avatars
14. `scripts/14-create-payments-table.sql` - Payment tracking
15. `scripts/15-seed-sample-invoices.sql` - Sample data
16. `scripts/16-update-invoices-table.sql` - Invoice updates
17. `scripts/17-update-payments-table.sql` - Payment updates
18. `scripts/18-create-autopay-settings-table.sql` - Autopay settings
19. `scripts/19-update-payments-table-for-webhook.sql` - Webhook support
20. `scripts/20-fix-profiles-rls-policies.sql` - Security policies
21. `scripts/21-fix-database-schema.sql` - Schema fixes

### Step 3: Verify Setup

After running all scripts, verify your setup:

1. Check that all tables exist in Supabase
2. Verify storage buckets are created
3. Test authentication flow
4. Upload a test profile picture
5. Check billing page loads correctly

## 🔧 Troubleshooting

If you encounter errors:

1. **Missing Columns**: Run the schema fix script (#21)
2. **Storage Issues**: Check bucket permissions in Supabase
3. **Auth Issues**: Verify environment variables
4. **RLS Errors**: Check Row Level Security policies

## 📞 Support

If you need help, check the console logs for detailed error messages.
\`\`\`

Now let me create a consolidated database setup script that includes all the essential fixes:
