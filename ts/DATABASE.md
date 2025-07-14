# Database Migration System

This project uses **Drizzle ORM** with a proper migration system instead of raw SQL.

## Commands

### Development Workflow

```bash
# Generate new migrations after schema changes
npm run db:generate

# Run migrations to update database
npm run db:migrate

# Seed database with default data
npm run db:seed

# Complete setup (migrations + seeding)
npm run db:setup

# Reset database (removes all data)
npm run db:reset

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Migration Process

1. **Modify Schema**: Edit `lib/schema.ts` with your changes
2. **Generate Migration**: Run `npm run db:generate`
3. **Review Migration**: Check the generated SQL in `drizzle/` folder
4. **Apply Migration**: Run `npm run db:migrate`

### File Structure

```
├── drizzle/                  # Generated migration files
├── lib/
│   ├── schema.ts            # Database schema definitions
│   └── db.ts                # Database connection and helpers
├── scripts/
│   ├── setup-db.ts          # Complete database setup
│   ├── migrate.ts           # Run migrations only
│   ├── seed.ts              # Seed default data
│   └── reset-db.ts          # Reset database
└── drizzle.config.ts        # Drizzle configuration
```

### Benefits

- ✅ **Type-safe**: Schema changes automatically update TypeScript types
- ✅ **Version controlled**: All migrations are tracked in git
- ✅ **Rollback support**: Drizzle supports migration rollbacks
- ✅ **Team friendly**: Consistent database state across environments
- ✅ **No raw SQL**: Schema defined in TypeScript
- ✅ **Database GUI**: Built-in database browser with Drizzle Studio

### Example: Adding a New Table

1. Add to `lib/schema.ts`:

```typescript
export const newTable = sqliteTable('new_table', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});
```

2. Generate migration:

```bash
npm run db:generate
```

3. Apply migration:

```bash
npm run db:migrate
```

### Production Deployment

For production, run migrations as part of your deployment process:

```bash
npm run db:migrate
```

This ensures the database schema is always up-to-date with your application code.
