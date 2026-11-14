/** «Aprende» tab of the panel: list of pages next to the page editor. */

import { useCallback } from 'react';
import { cn } from '@/lib/cn';
import { es } from '@/i18n/es';
import { useConfirm } from '../ConfirmDialog';
import { isDirty, setDirty } from '../lib/dirty';
import { useUrlSelection } from '../lib/useUrlSelection';
import { LearnEditor } from './LearnEditor';
import { LearnList } from './LearnList';

const t = es.admin;

/**
 * List on the left, editor on the right; on phones one screen at a time, like Productos
 * (docs/12 §5c, §8). The open page comes from the URL (`?p=<id>`).
 */
export function LearnView() {
  const [selected, setSelected] = useUrlSelection();
  const confirm = useConfirm();

  /** Changing page (or going back to the list) with unsaved changes asks first (docs/12 §1). */
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
      <LearnList selectedId={selected} onSelect={(id) => void select(id)} />
      <section className="main" aria-live="polite">
        {selected ? (
          <LearnEditor key={selected} id={selected} onBack={() => void select(null)} />
        ) : (
          <div className="empty">
            <div>
              <b>{t.learn.editor.empty.title}</b>
              {t.learn.editor.empty.text}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
