import slugify from '@sindresorhus/slugify';

/** Grouping of the glossary terms by their first letter (docs/21 §4.5). Pure. */

/** The letters shown on top of the glossary, in Spanish order (with Ñ). */
export const glossaryLetters = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'] as const;

export interface GlossaryTerm {
  term: string;
  en: string | null;
  definition: string;
  href?: string | undefined;
}

/** Anchor of a term: the same slug the search index uses (`t_<slug>` → `#<slug>`). */
export function termId(term: string): string {
  return slugify(term, { separator: '-', lowercase: true, decamelize: false });
}

/** Letter a term is filed under: its first letter without accents, but Ñ stays Ñ. */
export function termLetter(term: string): string {
  const first = term.trim().charAt(0).toUpperCase();
  if (first === 'Ñ') return 'Ñ';
  const plain = first.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return (glossaryLetters as readonly string[]).includes(plain) ? plain : '#';
}

/** Terms grouped by letter, letters in glossary order and terms alphabetical in Spanish. */
export function glossaryGroups(
  terms: readonly GlossaryTerm[],
): { letter: string; terms: (GlossaryTerm & { id: string })[] }[] {
  const byLetter = new Map<string, (GlossaryTerm & { id: string })[]>();
  for (const t of terms) {
    const letter = termLetter(t.term);
    const list = byLetter.get(letter) ?? [];
    list.push({ ...t, id: termId(t.term) });
    byLetter.set(letter, list);
  }
  const order = [...glossaryLetters, '#'];
  return [...byLetter.entries()]
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([letter, list]) => ({
      letter,
      terms: list.sort((a, b) => a.term.localeCompare(b.term, 'es')),
    }));
}
