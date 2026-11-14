import { normalizeQuery } from './content';
import type { HighlightPart } from './search-docs';

/**
 * Typo-tolerant word matching and highlighting for the search without Meilisearch (docs/22 §8):
 * the same idea as Meilisearch's typo tolerance (one typo from 4 letters, two from 8), so «petj»
 * finds PETG even when only D1 answers. Pure.
 */

/** Words of a text, normalized (lowercase, no accents), split on anything that is not a letter or digit. */
export function words(text: string): string[] {
  return normalizeQuery(text)
    .split(/[^a-z0-9ñ+]+/)
    .filter(Boolean);
}

/** Edit distance between two words, stopping early once it is above `max`. */
export function distance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      cur.push(v);
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length]!;
}

/**
 * Whether a searched word matches a word of the text: equal, a prefix of it (so «sec» finds
 * «secado» while typing), or within the typos allowed for its length (1 from 4 letters, 2 from 8).
 */
export function wordMatches(query: string, word: string): boolean {
  if (word === query || word.startsWith(query)) return true;
  if (query.length < 4) return false;
  return distance(query, word, query.length >= 8 ? 2 : 1) <= (query.length >= 8 ? 2 : 1);
}

/** Splits a text into parts, marking the words that match any searched word. Text stays text. */
export function highlightWords(text: string, searched: readonly string[]): HighlightPart[] {
  const parts: HighlightPart[] = [];
  const push = (t: string, m: boolean) => {
    const last = parts[parts.length - 1];
    if (last && last.m === m) last.t += t;
    else if (t) parts.push({ t, m });
  };
  for (const piece of text.split(/(\s+)/)) {
    const w = words(piece)[0];
    const hit = w !== undefined && searched.some((q) => wordMatches(q, w));
    push(piece, hit);
  }
  return parts;
}
