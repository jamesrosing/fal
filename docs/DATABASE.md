# Database Schema Documentation

This document outlines the database schema structure and the tools available for managing it in the FAL project.

## Overview

The FAL project uses a Supabase PostgreSQL database with a clearly defined schema. The database schema is:

1. Defined in code (`schema.json`)
2. Version-controlled through migrations
3. Automatically validated to ensure consistency
4. Used to generate TypeScript type definitions

## Tools

The following tools are available to manage the database:

### Type Generation

```bash
npm run db:types
```

This command generates TypeScript type definitions for all tables in the database. It:

- Connects to Supabase using service role credentials
- Queries database metadata to understand table structures
- Generates fully typed interfaces for each table (Row, Insert, Update)
- Outputs to `lib/database.types.ts`

### Schema Migration

```bash
npm run db:migrate
```

This command applies pending database migrations. It:

- Identifies migration files in the `migrations/` directory
- Determines which migrations have not yet been applied
- Applies migrations in sequence
- Updates the `schema_migrations` table to track applied versions
- Handles rollbacks for failed migrations if rollback files exist

### Schema Validation

```bash
npm run db:validate
```

This command validates the actual database schema against the expected schema. It:

- Compares the database structure with the definition in `schema.json`
- Identifies missing tables, columns, indexes, and foreign keys
- Detects unexpected tables or columns
- Validates data type consistency
- Outputs a validation report to `schema-validation-report.json`

## Migration File Format

Migration files follow a specific naming convention:

```
NNN_description.sql
```

Where:
- `NNN` is a sequential number (e.g., 001, 002, 003)
- `description` is a brief description of the migration

Example: `001_create_initial_tables.sql`

## Creating Migrations

To create a new migration:

1. Create a new SQL file in the `migrations/` directory following the naming format
2. Write the SQL commands for your schema changes
3. (Optional) Create a rollback file with the same name but `.rollback.sql` extension
4. Run `npm run db:migrate` to apply the migration

## Schema Definition

The `schema.json` file defines the expected schema structure, including:

- Tables with their columns and data types
- Indexes
- Foreign key relationships

When the database structure changes, update this file to match the new structure.

## CI/CD Integration

It's recommended to add `npm run db:validate` to your CI/CD pipeline to ensure schema consistency before deployment.

## Development Workflow

1. Make schema changes by creating a new migration
2. Apply the migration with `npm run db:migrate`
3. Generate updated types with `npm run db:types`
4. (Optional) Validate the schema with `npm run db:validate`

## Troubleshooting

If you encounter issues with migrations:

1. Check Supabase service role credentials
2. Examine SQL syntax in migration files
3. Review the `schema_migrations` table to see which migrations have been applied
4. Check the migration logs for error details

## Schema Overview

The database includes tables for:

- Team members
- Galleries, albums, cases, and images
- Articles and article categories
- Media assets and mappings
- User profiles and bookmarks
- Appointments
- Chat messages and appointment requests

See `schema.json` for the complete schema definition. 