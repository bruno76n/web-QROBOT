import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { fixtureFiles, withFile } from '../../tests/fixtures/learn/load';
import { buildImportPlan } from '@/lib/learn/import';
import { getDb, schema } from './db/client';
import { applyImport, renderImportSql } from './learn-import';
import { resetAll } from './admin/test-utils';

const db = () => getDb(env.DB);
const plan = (files = fixtureFiles()) => buildImportPlan(files);
const NOW = 1_800_000_000_000;

beforeEach(resetAll);

describe('applyImport', () => {
  it('first load: every page, its questions, tables, sources and search settings', async () => {
    const r = await applyImport(db(), plan(), { now: NOW });
    expect(r.created).toHaveLength(5);
    expect(r).toMatchObject({ updated: [], unchanged: [], untouched: [], skipped: false, faqs: 2 });
    expect(await db().select().from(schema.learnPages)).toHaveLength(5);
    expect(await db().select().from(schema.learnFaqs)).toHaveLength(2);
    expect((await db().select().from(schema.learnDatasets)).map((d) => d.key).sort()).toEqual([
      'buscador',
      'filamentos',
    ]);
    expect(await db().select().from(schema.learnSources)).toHaveLength(1);
    const [hidden] = await db()
      .select()
      .from(schema.learnPages)
      .where(eq(schema.learnPages.slug, 'filamentos/oculta'));
    expect(hidden?.published).toBe(false);
  });

  it('second load without changes: everything unchanged, nothing rewritten', async () => {
    await applyImport(db(), plan(), { now: NOW });
    const r = await applyImport(db(), plan(), { now: NOW + 1000 });
    expect(r.created).toEqual([]);
    expect(r.updated).toEqual([]);
    expect(r.unchanged).toHaveLength(5);
    const [pla] = await db()
      .select()
      .from(schema.learnPages)
      .where(eq(schema.learnPages.slug, 'filamentos/pla'));
    expect(pla?.updatedAt.getTime()).toBe(NOW);
    expect(await db().select().from(schema.learnFaqs)).toHaveLength(2);
  });

  it('a changed file updates its page and replaces its questions', async () => {
    await applyImport(db(), plan(), { now: NOW });
    const changed = withFile('paginas/filamentos/pla.md', (r) =>
      r
        .replace('Para figuras y decoración.', 'Para figuras.')
        .replace('  - q: ¿PLA o PLA+?\n    a: Cada marca le pone ese nombre a su fórmula.\n', ''),
    );
    const r = await applyImport(db(), plan(changed), { now: NOW + 5000 });
    expect(r.updated).toEqual(['filamentos/pla']);
    const [pla] = await db()
      .select()
      .from(schema.learnPages)
      .where(eq(schema.learnPages.slug, 'filamentos/pla'));
    expect(pla).toMatchObject({ summary: 'Para figuras.' });
    expect(pla?.updatedAt.getTime()).toBe(NOW + 5000);
    expect(await db().select().from(schema.learnFaqs)).toHaveLength(1);
  });

  it('a page edited in the panel is not touched; --overwrite replaces it', async () => {
    await applyImport(db(), plan(), { now: NOW });
    await db()
      .update(schema.learnPages)
      .set({ title: 'PLA (editado)', editedInPanel: true })
      .where(eq(schema.learnPages.slug, 'filamentos/pla'));
    const r = await applyImport(db(), plan(), { now: NOW + 1000 });
    expect(r.untouched).toEqual(['filamentos/pla']);
    let [pla] = await db()
      .select()
      .from(schema.learnPages)
      .where(eq(schema.learnPages.slug, 'filamentos/pla'));
    expect(pla).toMatchObject({ title: 'PLA (editado)', editedInPanel: true });

    const o = await applyImport(db(), plan(), { now: NOW + 2000, overwrite: true });
    expect(o.updated).toEqual(['filamentos/pla']);
    [pla] = await db()
      .select()
      .from(schema.learnPages)
      .where(eq(schema.learnPages.slug, 'filamentos/pla'));
    expect(pla).toMatchObject({ title: 'PLA', editedInPanel: false });
  });

  it('never deletes pages that are not in the files, except with --prune', async () => {
    await db().insert(schema.learnPages).values({
      id: 'mine',
      slug: 'filamentos/mia',
      kind: 'article',
      topic: 'filamentos',
      title: 'Mía',
      editedInPanel: true,
    });
    await applyImport(db(), plan(), { now: NOW });
    expect(await db().select().from(schema.learnPages)).toHaveLength(6);
    const r = await applyImport(db(), plan(), { now: NOW, prune: true });
    expect(r.pruned).toEqual(['filamentos/mia']);
    expect(await db().select().from(schema.learnPages)).toHaveLength(5);
  });

  it('--if-empty does nothing when there are pages', async () => {
    await applyImport(db(), plan(), { now: NOW });
    const r = await applyImport(
      db(),
      plan(withFile('paginas/filamentos/pla.md', (x) => x.replace('PLA', 'PLAX'))),
      {
        now: NOW,
        ifEmpty: true,
      },
    );
    expect(r.skipped).toBe(true);
    const [pla] = await db()
      .select()
      .from(schema.learnPages)
      .where(eq(schema.learnPages.slug, 'filamentos/pla'));
    expect(pla?.title).toBe('PLA');
  });

  it('a page created in the panel with another id keeps it when the file updates it', async () => {
    await db().insert(schema.learnPages).values({
      id: 'other-id',
      slug: 'filamentos/pla',
      kind: 'sheet',
      topic: 'filamentos',
      title: 'Viejo',
    });
    await applyImport(db(), plan(), { now: NOW });
    const [pla] = await db()
      .select()
      .from(schema.learnPages)
      .where(eq(schema.learnPages.slug, 'filamentos/pla'));
    expect(pla?.id).toBe('other-id');
    expect(pla?.title).toBe('PLA');
    const faqs = await db()
      .select()
      .from(schema.learnFaqs)
      .where(eq(schema.learnFaqs.pageId, 'other-id'));
    expect(faqs).toHaveLength(2);
  });
});

describe('renderImportSql (--remote)', () => {
  it('writes new pages, skips the edited ones and escapes quotes', () => {
    const files = withFile('paginas/filamentos/petg.md', (r) =>
      r.replace('Aguanta más golpes.', "Aguanta 'más' golpes."),
    );
    const { sql, summary } = renderImportSql(
      plan(files),
      [{ id: 'learn-filamentos-pla', slug: 'filamentos/pla', editedInPanel: true }],
      { now: NOW },
    );
    expect(summary.untouched).toEqual(['filamentos/pla']);
    expect(summary.created).toHaveLength(4);
    expect(sql).toContain("'Aguanta ''más'' golpes.'");
    expect(sql).not.toContain("WHERE id = 'learn-filamentos-pla'");
    expect(sql).toContain('INSERT INTO learn_pages');
    expect(sql).toContain('DELETE FROM learn_sources;');
    expect(sql).toContain('ON CONFLICT(key) DO UPDATE');
  });
  it('--overwrite updates the edited one and clears its flag', () => {
    const { sql } = renderImportSql(
      plan(),
      [{ id: 'learn-filamentos-pla', slug: 'filamentos/pla', editedInPanel: true }],
      { now: NOW, overwrite: true },
    );
    expect(sql).toContain(
      "edited_in_panel = 0, updated_at = 1800000000000 WHERE id = 'learn-filamentos-pla'",
    );
  });
});
