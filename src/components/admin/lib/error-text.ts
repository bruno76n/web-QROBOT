/** Spanish user-facing text for every failure the panel can show. */

import { es } from '@/i18n/es';
import type { Failure } from '@/lib/result';
import type { Missing } from '@/lib/publish';

/** Panel texts. */
const t = es.admin;

/** Joins the missing publishing requirements as "a, b y c". */
export function missingList(missing: readonly Missing[]): string {
  const words = missing.map((m) => t.editor.missing[m]);
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} y ${words[words.length - 1]}`;
}

/** Spanish text for a failure; never the technical message (docs/10 §5, docs/12 §7). */
export function errorText(failure: Failure | { code: 'OFFLINE' }): string {
  const code = failure.code as string;
  const details = 'details' in failure ? failure.details : undefined;
  switch (code) {
    case 'CANNOT_PUBLISH':
      return t.errors.CANNOT_PUBLISH(
        missingList((details?.missing as Missing[] | undefined) ?? []),
      );
    case 'CATEGORY_IN_USE':
      return t.errors.CATEGORY_IN_USE(
        ((details?.products as string[] | undefined) ?? []).join(', '),
      );
    case 'INTERNAL':
      return t.errors.INTERNAL(String(details?.errorId ?? '—'));
    case 'OFFLINE':
      return t.errors.OFFLINE;
    case 'UNAUTHORIZED':
    case 'VALIDATION':
    case 'NOT_FOUND':
    case 'SLUG_TAKEN':
    case 'UNKNOWN_CATEGORY':
    case 'CATEGORY_PROTECTED':
    case 'TOO_MANY_CATEGORIES':
    case 'TOO_MANY_PHOTOS':
    case 'TOO_MANY_SLIDES':
    case 'PHOTO_NOT_FOUND':
    case 'FILE_TYPE':
    case 'FILE_TOO_LARGE':
      return t.errors[code];
    default:
      return t.errors.INTERNAL('—');
  }
}
