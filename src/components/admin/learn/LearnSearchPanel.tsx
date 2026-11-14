/**
 * Search block of the «Aprende» tab (docs/22 §10, docs/12 §5c): state of the search index with the
 * «Actualizar buscador» button, and the searches without a result of the last 30 days, most
 * searched first. It expects the panel's query client and toaster around it (`AdminApp`).
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { actions } from 'astro:actions';
import { toast } from 'sonner';
import { site } from '@/config/site';
import { es } from '@/i18n/es';
import { fail } from '@/lib/result';
import { formatSyncedAt } from '@/lib/learn/search-admin';
import { ApiError, callAction, unwrap } from '../lib/call';
import { errorText } from '../lib/error-text';

const t = es.admin.learn.search;

/** Days counted by «Búsquedas sin resultado» (the title says 30 días). */
const DAYS = 30;

/** Cache key of the report; syncing the index invalidates it so the date and count refresh. */
const learnSearchKey = ['learnSearch', DAYS] as const;

/** Searches without a result and the index state (`admin.learnSearchMisses`), cached for 60 s. */
function useLearnSearchReport() {
  return useQuery({
    queryKey: learnSearchKey,
    queryFn: async () =>
      unwrap(await callAction(() => actions.admin.learnSearchMisses({ days: DAYS }))),
    staleTime: 60_000,
  });
}

/** Spanish text for a failed query: its own code when known, the generic one otherwise. */
function loadErrorText(error: unknown): string {
  return errorText(error instanceof ApiError ? error.failure : fail('INTERNAL', { errorId: '—' }));
}

/**
 * The two boxes of the search block. «Actualizar buscador» rebuilds the index from the database
 * (`admin.syncLearnIndex`); without Meilisearch the box explains that the search reads the
 * database and the button only confirms there is nothing to do.
 */
export default function LearnSearchPanel() {
  const { data, isPending, error } = useLearnSearchReport();
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const configured = data?.index.configured ?? false;

  /** Rebuilds the index, tells how it went and reloads the state shown above the button. */
  const sync = async () => {
    if (syncing) return;
    setSyncing(true);
    const res = await callAction(() => actions.admin.syncLearnIndex());
    setSyncing(false);
    if (!res.ok) return void toast.error(errorText(res));
    if (res.data.skipped) toast(t.skipped);
    else toast.success(t.syncedOk(res.data.docs));
    void qc.invalidateQueries({ queryKey: learnSearchKey });
  };

  /** Line under the title: database fallback, never synced, or date and documents of the last sync. */
  const indexLine = () => {
    if (!data) return null;
    const { index } = data;
    if (!index.configured) return t.database;
    const date = index.syncedAt ? formatSyncedAt(index.syncedAt, site.timeZone) : null;
    return date ? t.synced(date, index.docs ?? 0) : t.never;
  };

  return (
    <>
      <section
        className="box"
        aria-labelledby="learn-search-title"
        data-testid="learn-search-index"
      >
        <h2 id="learn-search-title">{t.title}</h2>
        {isPending ? (
          <div className="sk" aria-busy="true" aria-label={t.loading} style={{ margin: '8px 0' }} />
        ) : error ? (
          <p className="hint offline">{loadErrorText(error)}</p>
        ) : (
          <p className="hint">{indexLine()}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className={configured ? 'b pri' : 'b'}
            onClick={() => void sync()}
            disabled={syncing || isPending}
            aria-busy={syncing}
          >
            {syncing ? t.syncing : t.sync}
          </button>
          {configured ? (
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{t.syncHint}</span>
          ) : null}
        </div>
      </section>

      <section
        className="box"
        aria-labelledby="learn-misses-title"
        data-testid="learn-search-misses"
      >
        <h2 id="learn-misses-title">{t.missesTitle}</h2>
        <p className="hint">{t.missesLead}</p>
        {isPending ? (
          <div aria-busy="true" aria-label={t.missesLoading}>
            <div className="sk" />
            <div className="sk" />
          </div>
        ) : error ? (
          <p className="hint offline">{loadErrorText(error)}</p>
        ) : data.misses.length === 0 ? (
          <p className="hint" style={{ margin: 0 }}>
            {t.missesEmpty}
          </p>
        ) : (
          <ol className="list" style={{ padding: 0, overflow: 'visible' }}>
            {data.misses.map((m) => (
              <li
                key={m.query}
                className="it"
                style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', cursor: 'default' }}
              >
                <b title={m.query}>{m.query}</b>
                <span>{t.times(m.count)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
