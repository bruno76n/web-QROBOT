/** Small form pieces of the learning editor: field error, character counter, tag input and pick lists. */

import { useState } from 'react';
import { get, useFormContext } from 'react-hook-form';
import { es } from '@/i18n/es';
import { addTag, type LearnFormInput } from './form';

const t = es.admin.learn.editor;

/** Validation message of one field (nested paths too), announced to screen readers; nothing without an error. */
export function FieldError({ name }: { name: string }) {
  const { formState } = useFormContext<LearnFormInput>();
  const error = get(formState.errors, name) as { message?: string } | undefined;
  return error?.message ? (
    <small className="err-t" role="alert">
      {error.message}
    </small>
  ) : null;
}

/** Character counter ("used/max") shown under a text field. */
export const Count = ({ value, max }: { value: string; max: number }) => (
  <span className="count">
    {value.length}/{max}
  </span>
);

/**
 * Tags as removable chips plus a text field: Enter, a comma or leaving the field adds what was
 * typed (`addTag` skips empty and repeated tags).
 */
export function TagInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [typed, setTyped] = useState('');
  /** Adds the typed tag and clears the field. */
  const commit = () => {
    if (!typed.trim()) return;
    onChange(addTag(value, typed));
    setTyped('');
  };
  return (
    <div className="learn-picks">
      {value.length > 0 ? (
        <ul className="learn-tags">
          {value.map((tag) => (
            <li key={tag}>
              {tag}
              <button
                type="button"
                aria-label={t.tagRemove(tag)}
                onClick={() => onChange(value.filter((x) => x !== tag))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        className="in"
        id={id}
        placeholder={t.tagAdd}
        value={typed}
        onChange={(e) => {
          if (e.target.value.endsWith(',')) {
            onChange(addTag(value, e.target.value));
            setTyped('');
          } else setTyped(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}

/** An option of a pick list: the stored value and what the person reads. */
export interface PickOption {
  value: string;
  label: string;
}

/**
 * A chosen list (in order, each with «Quitar») and a select that adds one more. `labelOf` names a
 * chosen value; a value with no option (a page that no longer exists) shows `missing` next to it.
 */
export function PickList({
  id,
  value,
  options,
  addLabel,
  missing,
  onChange,
}: {
  id: string;
  value: string[];
  options: readonly PickOption[];
  addLabel: string;
  missing?: string | undefined;
  onChange: (next: string[]) => void;
}) {
  const byValue = new Map(options.map((o) => [o.value, o.label]));
  const left = options.filter((o) => !value.includes(o.value));
  return (
    <div className="learn-picks">
      {value.length === 0 ? (
        <p className="hint2">{t.noneChosen}</p>
      ) : (
        <ul className="learn-picked">
          {value.map((v) => {
            const label = byValue.get(v);
            return (
              <li key={v} className={label === undefined ? 'bad' : undefined}>
                <span>
                  {label ?? v}
                  {label === undefined && missing ? <small> · {missing}</small> : null}
                </span>
                <button
                  type="button"
                  className="b ghost"
                  aria-label={t.remove(label ?? v)}
                  onClick={() => onChange(value.filter((x) => x !== v))}
                >
                  {es.admin.photo.remove}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <select
        className="in"
        id={id}
        value=""
        onChange={(e) => {
          if (e.target.value) onChange([...value, e.target.value]);
        }}
      >
        <option value="">{addLabel}</option>
        {left.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
