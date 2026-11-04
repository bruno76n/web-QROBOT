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
import { keys, useProducts } from './lib/queries';

const t = es.admin;
type Filter = 'all' | 'pub' | 'hid';

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function ProductList({ selectedId, onSelect }: Props) {
  const { data, isPending, error } = useProducts();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

function Row({
  product: p,
  selected,
  canDrag,
  onSelect,
}: {
  product: ProductRow;
  selected: boolean;
  canDrag: boolean;
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
          <span>{p.priceFromCents === null ? t.list.noPrice : formatMoney(p.priceFromCents)}</span>
        </span>
        <span className={cn('st', p.published && 'on')}>
          {p.published ? t.list.statusPublished : t.list.statusHidden}
        </span>
      </button>
    </li>
  );
}
