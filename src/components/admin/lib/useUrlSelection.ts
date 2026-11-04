import { useCallback, useEffect, useState } from 'react';

const read = () => new URLSearchParams(window.location.search).get('p');

/** The selected product lives in the URL (`/admin?p=<id>`, `?p=new`) so it survives a reload (docs/12 §2). */
export function useUrlSelection(): [string | null, (next: string | null) => void] {
  const [selected, setSelected] = useState<string | null>(read);

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
