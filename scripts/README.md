# Scripts for Article Management

This directory contains utility scripts for managing the website content.

## Import Static Articles

The `import-static-articles.js` script imports the static articles from `lib/articles.ts` into the Supabase database.

### Usage

1. Make sure your `.env` file contains the Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Run the script:
   ```bash
   node scripts/import-static-articles.js
   ```

3. The script will:
   - Read all articles from `lib/articles.ts`
   - Create any missing categories in the database
   - Import or update articles in the database
   - Convert HTML content to JSON blocks compatible with the editor

## Other Scripts

Additional scripts for content management will be added here as needed. 