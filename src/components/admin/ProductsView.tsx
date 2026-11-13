/** "Productos" tab of the panel: product list next to the editor. */

import { useCallback } from 'react';
import { cn } from '@/lib/cn';
import { es } from '@/i18n/es';
import { ProductEditor } from './ProductEditor';
import { ProductList } from './ProductList';
import { useConfirm } from './ConfirmDialog';
import { isDirty, setDirty } from './lib/dirty';
import { useUrlSelection } from './lib/useUrlSelection';

const t = es.admin;

/**
 * List on the left, editor on the right; on phones one screen at a time (docs/12 §2, §8).
 * The selected product comes from the URL (`?p=`); `new` opens an empty editor.
 */
export function ProductsView() {
  const [selected, setSelected] = useUrlSelection();
  const confirm = useConfirm();

  /** Changing product with unsaved changes asks first (docs/12 §1). */
  const select = useCallback(
    async (next: string | null) => {
      if (next === selected) return;
      if (isDirty()) {
        const leave = await confirm({ title: t.leave.title, yes: t.leave.yes, no: t.leave.no });
        if (!leave) return;
        setDirty(false);
      }
      setSelected(next);
    },
    [confirm, selected, setSelected],
  );

  return (
    <div className={cn('app', selected && 'editing')}>
      <ProductList selectedId={selected} onSelect={(id) => void select(id)} />
      <section className="main" aria-live="polite">
        {selected ? (
          <ProductEditor
            key={selected}
            id={selected === 'new' ? null : selected}
            onSelect={(id) => void select(id)}
            onSaved={(id) => {
              setDirty(false);
              setSelected(id);
            }}
          />
        ) : (
          <div className="empty">
            <div>
              <b>{t.empty.title}</b>
              {t.empty.text}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
