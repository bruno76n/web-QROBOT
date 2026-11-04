import { es } from '@/i18n/es';
import { EditorForm } from './EditorForm';
import { ApiError } from './lib/call';
import { errorText } from './lib/error-text';
import { useProduct } from './lib/queries';

interface Props {
  /** null = a new product. */
  id: string | null;
  onSelect: (id: string | null) => void;
  onSaved: (id: string) => void;
}

/** Loads the product (or starts an empty one) and mounts the form once the data is there. */
export function ProductEditor({ id, onSelect, onSaved }: Props) {
  const { data, isPending, error } = useProduct(id);

  if (id === null)
    return <EditorForm key="new" detail={null} onSelect={onSelect} onSaved={onSaved} />;
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
          <button type="button" className="b" onClick={() => onSelect(null)}>
            {es.admin.editor.back}
          </button>
        </div>
      </div>
    );
  }
  return <EditorForm key={data.id} detail={data} onSelect={onSelect} onSaved={onSaved} />;
}
