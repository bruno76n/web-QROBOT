import { defineConfig } from 'drizzle-kit';

// Migrations are plain SQL in ./migrations; wrangler applies them (`pnpm db:migrate`).
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/server/db/schema.ts',
  out: './migrations',
});
