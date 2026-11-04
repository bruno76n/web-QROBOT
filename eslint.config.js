import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

/** Security rules shared by every file (docs/13 §6, §10). */
const restrictedSyntax = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'dangerouslySetInnerHTML is forbidden (docs/13 §6).',
  },
  {
    selector: 'AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]',
    message: 'innerHTML / outerHTML assignment is forbidden (docs/13 §6).',
  },
  {
    selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    message: 'insertAdjacentHTML is forbidden (docs/13 §6).',
  },
  {
    selector: "CallExpression[callee.name='eval']",
    message: 'eval is forbidden (docs/13 §6).',
  },
  {
    selector: "NewExpression[callee.name='Function']",
    message: 'new Function is forbidden (docs/13 §6).',
  },
];

/** Packages that only src/server/ (and tooling) may import (docs/07 §6, rule 1). */
const dataPackages = [
  { name: 'drizzle-orm', message: 'Only src/server/ may touch the database (docs/07 §6).' },
  { name: 'cloudflare:workers', message: 'Only src/server/ may touch D1 and R2 (docs/07 §6).' },
];
const dataPatterns = [
  {
    group: ['drizzle-orm/*', 'drizzle-kit', 'drizzle-kit/*'],
    message: 'Only src/server/ may touch the database (docs/07 §6).',
  },
  {
    group: ['@/server/db/*', '**/server/db/*', '@/server/storage', '**/server/storage'],
    message: 'Use src/server/queries/ or src/actions/ (docs/07 §6).',
  },
];

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      '.wrangler/',
      'node_modules/',
      'reference/',
      'assets/',
      'public/',
      'tests/negative/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      'migrations/',
      '.lighthouseci/',
      'worker-configuration.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-strict'],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-restricted-syntax': ['error', ...restrictedSyntax],
      'no-restricted-imports': ['error', { paths: dataPackages, patterns: dataPatterns }],
      'astro/no-set-html-directive': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  // Frontier 1: server code, tooling and tests may use the data packages.
  {
    files: [
      'src/server/**',
      'scripts/**',
      'drizzle.config.ts',
      '**/*.test.ts',
      'tests/**',
      'e2e/**',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
  // Frontier 3: src/lib is pure (docs/07 §6, rule 3).
  {
    files: ['src/lib/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['astro', 'astro:*', 'astro/*', '@astrojs/*'],
              message: 'src/lib must stay pure: no Astro.',
            },
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: 'src/lib must stay pure: no React.',
            },
            {
              group: ['cloudflare:*', '@cloudflare/*', 'drizzle-orm', 'drizzle-orm/*'],
              message: 'src/lib must stay pure: no Cloudflare or database.',
            },
            {
              group: ['@/server/*', '**/server/*', '@/components/*', '**/components/*'],
              message: 'src/lib must stay pure.',
            },
          ],
        },
      ],
    },
  },
  // Config files at the root may use Node freely.
  { files: ['*.config.{js,mjs,ts}'], rules: { 'no-restricted-imports': 'off' } },
);
