// Negative lint test: each fixture in tests/negative MUST break the lint with the expected rule,
// proving the rules really catch what they forbid. Fixtures are linted through stdin, pretending
// to live at `as`, so the folder-based rules (frontiers) apply to them.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// `file`: the bad code; `as`: the path it is linted as; `rule`: the ESLint rule that must fire.
const fixtures = [
  {
    file: 'tests/negative/frontier-db-import.tsx',
    as: 'src/components/site/Bad.tsx',
    rule: 'no-restricted-imports',
  },
  {
    file: 'tests/negative/set-html.astro',
    as: 'src/components/site/Bad.astro',
    rule: 'astro/no-set-html-directive',
  },
  {
    file: 'tests/negative/dangerous-html.tsx',
    as: 'src/components/site/Bad2.tsx',
    rule: 'no-restricted-syntax',
  },
  { file: 'tests/negative/lib-impure.ts', as: 'src/lib/bad.ts', rule: 'no-restricted-imports' },
];

// Counts fixtures that did not trigger their rule; the exit code is non-zero if any.
let failed = 0;
for (const f of fixtures) {
  const r = spawnSync(
    'pnpm',
    [
      'exec',
      'eslint',
      '--no-warn-ignored',
      '--stdin',
      '--stdin-filename',
      f.as,
      '--format',
      'json',
    ],
    { input: readFileSync(f.file), encoding: 'utf8' },
  );
  let messages;
  try {
    messages = JSON.parse(r.stdout)[0]?.messages ?? [];
  } catch {
    console.error(`✗ ${f.file}: eslint produced no JSON\n${r.stderr}`);
    failed++;
    continue;
  }
  const hit = messages.some((m) => m.ruleId === f.rule && m.severity === 2);
  if (hit) {
    console.log(`✓ ${f.file} breaks the lint as expected (${f.rule})`);
  } else {
    console.error(
      `✗ ${f.file} did NOT trigger ${f.rule}. Got: ${messages.map((m) => m.ruleId).join(', ') || 'nothing'}`,
    );
    failed++;
  }
}
process.exit(failed ? 1 : 0);
