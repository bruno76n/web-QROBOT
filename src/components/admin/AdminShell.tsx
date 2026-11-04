import { useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { es } from '@/i18n/es';
import Head from '../../../assets/logo-cabeza.svg?url';
import { api } from './lib/api';
import { errorText } from './lib/error-text';
import { isDirty, setDirty } from './lib/dirty';
import { useConfirm } from './ConfirmDialog';

const t = es.admin;

interface Props {
  view: 'products' | 'hero';
  children: ReactNode;
}

/** Top bar: tabs, catalog link and the ••• menu with the backup (docs/12 §1). */
export function AdminShell({ view, children }: Props) {
  const confirm = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // The panel sweeps stale uploads in the background every time it opens (docs/12 §1).
  useEffect(() => {
    void api.cleanupPending();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === 'Escape'
          : !menuRef.current?.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [menuOpen]);

  const go = async (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isDirty()) return;
    event.preventDefault();
    if (await confirm({ title: t.leave.title, yes: t.leave.yes, no: t.leave.no })) {
      setDirty(false);
      window.location.href = href;
    }
  };

  const downloadBackup = async () => {
    setMenuOpen(false);
    const res = await api.exportBackup();
    if (!res.ok) return void toast.error(errorText(res));
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quick-robot-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="shell" style={{ height: '100%' }}>
      <header className="bar">
        <a className="brand" href="/catalogo" target="_blank" rel="noopener">
          <img src={Head} width={28} height={24} alt="" />
          {t.brand}
        </a>
        <nav className="views" aria-label={t.tabs.label}>
          <a
            className="vbtn"
            href="/admin"
            aria-current={view === 'products' ? 'page' : undefined}
            onClick={(e) => void go(e, '/admin')}
          >
            {t.tabs.products}
          </a>
          <a
            className="vbtn"
            href="/admin/portada"
            aria-current={view === 'hero' ? 'page' : undefined}
            onClick={(e) => void go(e, '/admin/portada')}
          >
            {t.tabs.hero}
          </a>
        </nav>
        <span className="sp" />
        <a className="b ghost" href="/catalogo" target="_blank" rel="noopener">
          {t.viewCatalog}
        </a>
        <div className="menu" ref={menuRef}>
          <button
            type="button"
            className="b ghost"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={t.moreOptions}
            onClick={() => setMenuOpen((v) => !v)}
          >
            •••
          </button>
          {menuOpen ? (
            <ul role="menu">
              <li role="none">
                <button type="button" role="menuitem" onClick={() => void downloadBackup()}>
                  {t.backup.label}
                  <span className="note">{t.backup.note}</span>
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
