import { es } from '@/i18n/es';

/** One link of the site menu; `short` is the name shown on small phones (≤ 480 px). */
export interface NavItem {
  label: string;
  href: string;
  short?: string;
}

/**
 * The links of the site menu, used by the header and the footer (docs/25 §6): Catálogo and
 * Aprende, plus «Para talleres» only when the page for workshops is visible. Pure.
 */
export function siteNav(systemVisible: boolean): NavItem[] {
  const items: NavItem[] = es.header.nav.map((i) => ({ label: i.label, href: i.href }));
  if (systemVisible) {
    const s = es.header.system;
    items.push({ label: s.label, short: s.short, href: s.href });
  }
  return items;
}
