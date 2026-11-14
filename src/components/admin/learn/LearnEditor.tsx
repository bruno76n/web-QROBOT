/** Right-hand side of the «Aprende» tab: loads one page and hands it to the form. */

import { es } from '@/i18n/es';
import { ApiError } from '../lib/call';
import { errorText } from '../lib/error-text';
import { useLearnPage } from './api';
import { LearnForm } from './LearnForm';

/** `id` is the page to edit; `onBack` returns to the list. */
interface Props {
  id: string;
  onBack: () => void;
}

/**
 * Loads the page and mounts the form once the data is there; a skeleton while loading and an error
 * with a back button if it cannot be read. The form is keyed by page, so its state resets when the
 * selection changes.
 */
export function LearnEditor({ id, onBack }: Props) {
  const { data, isPending, error } = useLearnPage(id);
  if (isPending) {
    return (
      <div className="ed" aria-busy="true">
        <div className="sk" style={{ height: 80 }} />
        <div className="sk" style={{ height: 240 }} />
      </div>
    );
  }
  if (error || !data) {
    const failure =
      error instanceof ApiError
        ? error.failure
        : { ok: false as const, code: 'NOT_FOUND' as const };
    return (
      <div className="empty">
        <div>
          <b>{errorText(failure)}</b>
          <button type="button" className="b" onClick={onBack}>
            {es.admin.learn.editor.back}
          </button>
        </div>
      </div>
    );
  }
  return <LearnForm key={data.id} detail={data} onBack={onBack} />;
}
