/** Left column of the «Aprende» tab: search, topic and status filters, and the list of pages with their publish switch. */

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { learnTopicName, learnTopics } from '@/config/learn';
import { es } from '@/i18n/es';
import { errorText } from '../lib/error-text';
import { useLearnPages, useSetLearnPublished, type LearnRow } from './api';
import LearnSearchPanel from './LearnSearchPanel';

const t = es.admin.learn.editor;
/** Status filter of the list: every page, published, hidden, or edited in the panel. */
type Status = 'all' | 'pub' | 'hid' | 'edited';

/** `selectedId` is the open page (highlighted); `onSelect` receives a page id. */
interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Sidebar with every page (docs/12 §5c). Search (title or address), topic and status filters work
 * on the loaded rows. Each row has the quick publish switch. Below the list sits the search block
 * of the tab (docs/22 §10).
 */
export function LearnList({ selectedId, onSelect }: Props) {
  const { data, isPending, error } = useLearnPages();
  const setPublished = useSetLearnPublished();
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<Status>('all');
  /** Ids whose switch is saving, so it cannot be flipped twice at once. */
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());

  /** Rows that match the search text, the topic and the status filter. */
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (p) =>
        (topic === '' || p.topic === topic) &&
        (status === 'all' ||
          (status === 'pub' && p.published) ||
          (status === 'hid' && !p.published) ||
          (status === 'edited' && p.editedInPanel)) &&
        (term === '' ||
          p.title.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term)),
    );
  }, [data, q, topic, status]);

  /** Flips one row's switch (shared with the editor's switch). */
  const toggle = async (id: string, next: boolean) => {
    setBusy((s) => new Set(s).add(id));
    await setPublished(id, next);
    setBusy((s) => {
      const copy = new Set(s);
      copy.delete(id);
      return copy;
    });
  };

  return (
    <aside className="side" aria-label={t.list.aria}>
      <div className="side-h">
        <div className="row">
          <label className="vh" htmlFor="learn-q">
            {t.list.search}
          </label>
          <input
            className="search"
            id="learn-q"
            type="search"
            placeholder={t.list.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <label className="vh" htmlFor="learn-topic">
          {t.list.topic}
        </label>
        <select
          className="search learn-topic"
          id="learn-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="">{t.list.allTopics}</option>
          {learnTopics.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <div className="seg learn-seg" role="group" aria-label={t.list.filterAria}>
          {(
            [
              ['all', t.list.all],
              ['pub', t.list.published],
              ['hid', t.list.hidden],
              ['edited', t.list.edited],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="learn-scroll">
        {isPending ? (
          <div className="list" aria-busy="true" aria-label={t.list.loading}>
            <div className="sk" />
            <div className="sk" />
            <div className="sk" />
          </div>
        ) : error ? (
          <p className="side-f offline">{errorText({ ok: false, code: 'UNAUTHORIZED' })}</p>
        ) : shown.length === 0 ? (
          <p className="side-f">{(data ?? []).length === 0 ? t.list.emptyAll : t.list.none}</p>
        ) : (
          <ul className="list" aria-label={t.list.listAria}>
            {shown.map((p) => (
              <Row
                key={p.id}
                page={p}
                selected={p.id === selectedId}
                busy={busy.has(p.id)}
                onSelect={() => onSelect(p.id)}
                onToggle={(next) => void toggle(p.id, next)}
              />
            ))}
          </ul>
        )}
        <LearnSearchPanel />
      </div>
      <p className="side-f">{t.list.foot}</p>
    </aside>
  );
}

/** One page line: title, topic · kind (and «Editada aquí»), and the publish switch. */
function Row({
  page: p,
  selected,
  busy,
  onSelect,
  onToggle,
}: {
  page: LearnRow;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onToggle: (next: boolean) => void;
}) {
  return (
    <li className="it learn-it" data-selected={selected ? 'true' : undefined}>
      <button
        type="button"
        className="row-main"
        aria-current={selected ? 'true' : undefined}
        onClick={onSelect}
      >
        <span className="nm">
          <b>{p.title}</b>
          <span>
            {p.topic ? learnTopicName(p.topic) : t.homeTopic} · {t.kinds[p.kind]}
            {p.editedInPanel ? <em className="learn-edited"> · {t.list.editedBadge}</em> : null}
          </span>
        </span>
      </button>
      <span className={cn('tg', busy && 'flip-busy')}>
        <input
          type="checkbox"
          aria-label={t.list.switchLabel(p.title)}
          checked={p.published}
          disabled={busy}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <i />
      </span>
    </li>
  );
}
