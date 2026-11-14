/** Hook that keeps the selected item id (a product, a page of Aprende) in the URL query (`?p=`). */

import { useCallback, useEffect, useState } from 'react';

/** The `p` query parameter of the current URL, or null. */
const read = () => new URLSearchParams(window.location.search).get('p');

/**
 * The selected item lives in the URL (`/admin?p=<id>`, `?p=new`, `/admin/aprende?p=<id>`) so it
 * survives a reload (docs/12 §2).
 * Returns the current value and a setter that pushes a history entry (null clears it).
 */
export function useUrlSelection(): [string | null, (next: string | null) => void] {
  const [selected, setSelected] = useState<string | null>(read);

  // Back/forward buttons change the URL without going through `select`.
  useEffect(() => {
    const onPop = () => setSelected(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const select = useCallback((next: string | null) => {
    const url = new URL(window.location.href);
    if (next) url.searchParams.set('p', next);
    else url.searchParams.delete('p');
    window.history.pushState({}, '', url);
    setSelected(next);
  }, []);

  return [selected, select];
}
