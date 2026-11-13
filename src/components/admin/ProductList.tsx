/** Left column of the products screen: search, filter, click totals and the drag-to-reorder product list. */

/* eslint-disable react-hooks/refs -- dnd-kit's `useSortable` returns ref callbacks that the React Compiler lint flags wrongly */
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatMoney } from '@/lib/money';
import type { ProductRow } from '@/lib/admin-types';
import { es } from '@/i18n/es';
import { api } from './lib/api';
import { errorText } from './lib/error-text';
import { keys, useClickStats, useProducts } from './lib/queries';

const t = es.admin;
/** Status filter of the list: everything, only published or only hidden. */
type Filter = 'all' | 'pub' | 'hid';

/** `selectedId` is the open product (highlighted); `onSelect` receives a product id, or 'new' to start one. */
interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Sidebar with every product (published or hidden). Search and filter work on the loaded rows; the
 * click totals come from the last 30 days. Reordering is optimistic and rolls back to the server
 * order if saving fails.
 */
export function ProductList({ selectedId, onSelect }: Props) {
  const { data, isPending, error } = useProducts();
  const stats = useClickStats().data;
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  /** Rows that match the search text (by name) and the status filter. */
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (p) =>
        (filter === 'all' || (filter === 'pub' ? p.published : !p.published)) &&
        (term === '' || p.name.toLowerCase().includes(term)),
    );
  }, [data, q, filter]);
  // Dragging only makes sense on the whole list: with a search or filter it is off (docs/12 §2).
  const canDrag = q.trim() === '' && filter === 'all';

  // Pointer drags start after 5 px so a plain click still selects; the keyboard can reorder too.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Moves the dragged product in the cache at once, then saves the new order; on failure it reloads the list. */
  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!data || !over || active.id === over.id) return;
    const from = data.findIndex((p) => p.id === active.id);
    const to = data.findIndex((p) => p.id === over.id);
    const moved = arrayMove(data, from, to).map((p, i) => ({ ...p, sortOrder: i }));
    qc.setQueryData<ProductRow[]>(keys.products, moved); // optimistic: it moves right away
    const res = await api.reorderProducts(moved.map((p) => p.id));
    if (res.ok) toast.success(t.actions.reordered);
    else {
      toast.error(errorText(res));
      void qc.invalidateQueries({ queryKey: keys.products });
    }
  };

  return (
    <aside className="side" aria-label={t.list.aria}>
      <div className="side-h">
        <div className="row">
          <label className="vh" htmlFor="q">
            {t.list.search}
          </label>
          <input
            className="search"
            id="q"
            type="search"
            placeholder={t.list.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="b pri" type="button" onClick={() => onSelect('new')}>
            {t.list.new}
          </button>
        </div>
        {stats ? (
          <p className="clicks" data-testid="click-stats">
            <b>
              {t.list.clicksTotal
                .replace('{n}', String(stats.total))
                .replace('{taps}', stats.total === 1 ? t.list.clicksOne : t.list.clicksMany)}
            </b>
            <span>
              {(['product', 'order', 'q404', 'customizer'] as const)
                .map((k) => `${t.list.clicksBySource[k]} ${stats.bySource[k]}`)
                .join(' · ')}
            </span>
          </p>
        ) : null}
        <div className="seg" role="group" aria-label={t.list.filterAria}>
          {(
            [
              ['all', t.list.all],
              ['pub', t.list.published],
              ['hid', t.list.hidden],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <div className="list" aria-busy="true" aria-label={t.list.loading}>
          <div className="sk" />
          <div className="sk" />
          <div className="sk" />
        </div>
      ) : error ? (
        <p className="side-f offline">{errorText({ ok: false, code: 'UNAUTHORIZED' })}</p>
      ) : shown.length === 0 ? (
        <p className="side-f">{(data ?? []).length === 0 ? t.list.emptyCatalog : t.list.none}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => void onDragEnd(e)}
        >
          <SortableContext items={shown.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="list" aria-label={t.list.listAria}>
              {shown.map((p) => (
                <Row
                  key={p.id}
                  product={p}
                  selected={p.id === selectedId}
                  canDrag={canDrag}
                  taps={stats?.byProduct[p.id] ?? 0}
                  onSelect={() => onSelect(p.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <p className="side-f">{canDrag ? t.list.dragHint : t.list.dragOff}</p>
    </aside>
  );
}

/** One product line: drag handle, thumbnail, name, price ("desde"), tap count and status; the handle is disabled when dragging is off. */
function Row({
  product: p,
  selected,
  canDrag,
  taps,
  onSelect,
}: {
  product: ProductRow;
  selected: boolean;
  canDrag: boolean;
  taps: number;
  onSelect: () => void;
}) {
  const s = useSortable({ id: p.id, disabled: !canDrag });
  return (
    <li
      ref={s.setNodeRef}
      style={{ transform: CSS.Transform.toString(s.transform), transition: s.transition }}
      className={cn('it', s.isDragging && 'drag')}
      data-selected={selected ? 'true' : undefined}
    >
      <button
        type="button"
        className="grip"
        aria-label={t.list.grip}
        disabled={!canDrag}
        style={canDrag ? undefined : { opacity: 0.35, cursor: 'default' }}
        {...s.attributes}
        {...s.listeners}
      >
        ⋮⋮
      </button>
      <button
        type="button"
        className="row-main"
        aria-current={selected ? 'true' : undefined}
        onClick={onSelect}
      >
        <span className="th">
          {p.thumbUrl ? <img className="photo" src={p.thumbUrl} alt="" /> : null}
        </span>
        <span className="nm">
          <b>{p.name}</b>
          <span>
            {p.priceFromCents === null ? t.list.noPrice : formatMoney(p.priceFromCents)}
            {taps > 0 ? ` · ${t.list.clicksRow.replace('{n}', String(taps))}` : ''}
          </span>
        </span>
        <span className={cn('st', p.published && 'on')}>
          {p.published ? t.list.statusPublished : t.list.statusHidden}
        </span>
      </button>
    </li>
  );
}
