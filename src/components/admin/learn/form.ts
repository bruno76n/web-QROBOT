/** Form values, validation and conversions of the learning page editor. Pure. */

import type { z } from 'zod';
import { es } from '@/i18n/es';
import { learnPageInputSchema, type LearnPageInput } from '@/lib/schemas';

const t = es.admin;

/**
 * What the form validates: the server schema (`learnPageInputSchema`) without the id, which the
 * editor adds, and without `published`, which the quick switch saves on its own (docs/12 §5c).
 */
export const learnFormSchema = learnPageInputSchema.omit({ id: true, published: true });
/** Values the form holds. */
export type LearnFormInput = z.input<typeof learnFormSchema>;
/** Values after validation. */
export type LearnFormValues = z.output<typeof learnFormSchema>;

/** The fields of a page the form fills from. */
type Source = Pick<
  LearnPageInput,
  | 'title'
  | 'subtitle'
  | 'summary'
  | 'bodyMd'
  | 'tags'
  | 'related'
  | 'sources'
  | 'faqs'
  | 'cta'
  | 'ctaText'
>;

/** Form values of a saved page (lists are copied so the form never shares them with the cache). */
export function valuesFromPage(page: Source): LearnFormValues {
  return {
    title: page.title,
    subtitle: page.subtitle,
    summary: page.summary,
    bodyMd: page.bodyMd,
    tags: [...page.tags],
    related: [...page.related],
    sources: [...page.sources],
    faqs: page.faqs.map((f) => ({ q: f.q, a: f.a })),
    cta: page.cta,
    ctaText: page.ctaText,
  };
}

/** The `admin.saveLearnPage` input from validated values, the page id and its current published state. */
export function toLearnInput(values: LearnFormValues, id: string, published: boolean) {
  return { ...values, id, published } satisfies LearnPageInput;
}

/** Minimal shape of a Zod issue the error map reads. */
interface Issue {
  code: string;
  origin?: string;
  minimum?: unknown;
  maximum?: unknown;
}

/**
 * Spanish message for a validation issue of the form, so the schema shared with the server keeps
 * its rules and the panel shows its own words (docs/12 §7): an empty required text, a text too
 * long, a list too long; anything else is the general «Revisa los campos marcados».
 */
export function learnFormError(issue: Issue): string {
  if (issue.code === 'too_small' && issue.origin === 'string') return t.required;
  if (issue.code === 'too_big' && issue.origin === 'string')
    return t.tooLong(Number(issue.maximum));
  if (issue.code === 'too_big' && issue.origin === 'array')
    return t.learn.editor.tooMany(Number(issue.maximum));
  return t.errors.VALIDATION;
}

/**
 * Adds a tag typed by hand: trimmed, and skipped when empty or already in the list (compared
 * without case). Returns the same list when nothing is added.
 */
export function addTag(tags: readonly string[], typed: string): string[] {
  const tag = typed.trim().replace(/,+$/, '').trim();
  if (!tag || tags.some((x) => x.toLowerCase() === tag.toLowerCase())) return [...tags];
  return [...tags, tag];
}

/** The «[[name]]» a paragraph holds when it is only a block mark, or null. */
export function markOf(text: string): string | null {
  return /^\s*\[\[([^\]\n]*)\]\]\s*$/.exec(text)?.[1] ?? null;
}
