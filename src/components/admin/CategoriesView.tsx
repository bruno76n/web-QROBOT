/* eslint-disable react-hooks/refs -- dnd-kit's `useSortable` returns ref callbacks that the React Compiler lint flags wrongly */
import { useState, type FormEvent } from 'react';
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
import type { CategoryView } from '@/config/categories';
import { cn } from '@/lib/cn';
import { isProtectedCategory } from '@/lib/categories';
import { limits } from '@/lib/publish';
import { es } from '@/i18n/es';
import { useConfirm } from './ConfirmDialog';
import { api } from './lib/api';
import { errorText } from './lib/error-text';
import { keys, useCategories } from './lib/queries';

const t = es.admin.categories;

/** Tab "Categorías": create, rename, reorder and delete the catalog groups. */
export function CategoriesView() {
  const { data, isPending, error } = useCategories();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: keys.categories });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const value = label.trim();
    if (!value || busy) return;
    setBusy(true);
    const res = await api.createCategory(value);
    setBusy(false);
    if (!res.ok) return void toast.error(errorText(res));
    setLabel('');
    toast.success(t.created);
    void refresh();
  };

  const rename = async (id: string, value: string) => {
    const res = await api.renameCategory(id, value);
    if (!res.ok) return void toast.error(errorText(res));
    setEditing(null);
    toast.success(t.renamed);
    void refresh();
  };

  const remove = async (c: CategoryView) => {
    const yes = await confirm({
      title: t.removeTitle(c.label),
      text: t.removeText,
      yes: t.removeYes,
      no: t.removeNo,
      danger: true,
    });
    if (!yes) return;
    const res = await api.deleteCategory(c.id);
    if (!res.ok) return void toast.error(errorText(res));
    toast.success(t.removed);
    void refresh();
    void qc.invalidateQueries({ queryKey: keys.products });
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!data || !over || active.id === over.id) return;
    const moved = arrayMove(
      data,
      data.findIndex((c) => c.id === active.id),
      data.findIndex((c) => c.id === over.id),
    );
    qc.setQueryData<CategoryView[]>(keys.categories, moved); // optimistic: it moves right away
    const res = await api.reorderCategories(moved.map((c) => c.id));
    if (res.ok) toast.success(t.reordered);
    else {
      toast.error(errorText(res));
      void refresh();
    }
  };

  return (
    <main className="main">
      <div className="ed">
        <div className="ed-h">
          <h1>{t.title}</h1>
        </div>
        <div className="box">
          <p className="hint">{t.lead}</p>
          <form onSubmit={(e) => void add(e)} style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
            <label className="vh" htmlFor="new-cat">
              {t.newLabel}
            </label>
            <input
              className="in"
              id="new-cat"
              maxLength={limits.categoryLabelMax}
              placeholder={t.newPlaceholder}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="b pri" type="submit" disabled={busy || label.trim() === ''}>
              {t.add}
            </button>
          </form>
          {isPending ? (
            <div aria-busy="true" aria-label={t.loading}>
              <div className="sk" />
              <div className="sk" />
            </div>
          ) : error ? (
            <p className="offline">{errorText({ ok: false, code: 'UNAUTHORIZED' })}</p>
          ) : data.length === 0 ? (
            <p className="hint">{t.empty}</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => void onDragEnd(e)}
            >
              <SortableContext items={data.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <ul className="list" style={{ padding: 0, overflow: 'visible' }}>
                  {data.map((c) => (
                    <Row
                      key={c.id}
                      category={c}
                      editing={editing === c.id}
                      onEdit={() => setEditing(c.id)}
                      onCancel={() => setEditing(null)}
                      onSave={(value) => void rename(c.id, value)}
                      onRemove={() => void remove(c)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({
  category: c,
  editing,
  onEdit,
  onCancel,
  onSave,
  onRemove,
}: {
  category: CategoryView;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (label: string) => void;
  onRemove: () => void;
}) {
  const s = useSortable({ id: c.id });
  const [value, setValue] = useState(c.label);
  const locked = isProtectedCategory(c.id);
  return (
    <li
      ref={s.setNodeRef}
      style={{
        transform: CSS.Transform.toString(s.transform),
        transition: s.transition,
        gridTemplateColumns: '18px 1fr auto',
        cursor: 'default',
      }}
      className={cn('it', s.isDragging && 'drag')}
    >
      <button type="button" className="grip" aria-label={t.grip} {...s.attributes} {...s.listeners}>
        ⋮⋮
      </button>
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSave(value.trim());
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            className="in"
            aria-label={t.rename}
            maxLength={limits.categoryLabelMax}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="b pri" type="submit">
            {t.save}
          </button>
          <button className="b ghost" type="button" onClick={onCancel}>
            {t.cancel}
          </button>
        </form>
      ) : (
        <div>
          <b>{c.label}</b>
          <span>{locked ? t.protectedNote : `/catalogo/${c.id}`}</span>
        </div>
      )}
      {editing ? null : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="b ghost" type="button" onClick={onEdit}>
            {t.rename}
          </button>
          {locked ? null : (
            <button className="b dan" type="button" onClick={onRemove}>
              {t.remove}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
