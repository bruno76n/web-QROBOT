/**
 * Vitest setup for the server tests (Workers pool): gives the local D1 the project migrations.
 */
/// <reference types="@cloudflare/vitest-plugin/types" />
import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';

// Runs before each server test file: the local D1 gets every migration in ./migrations.
await applyD1Migrations(env.DB, (env as unknown as { TEST_MIGRATIONS: never[] }).TEST_MIGRATIONS);
