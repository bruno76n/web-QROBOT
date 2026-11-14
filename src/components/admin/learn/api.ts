/** Typed client and TanStack Query hooks of the «Aprende» tab: list, one page, save and the publish switch. */

import { actions } from 'astro:actions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { es } from '@/i18n/es';
import type { LearnPageInput } from '@/lib/schemas';
import { callAction, unwrap } from '../lib/call';
import { errorText } from '../lib/error-text';

const t = es.admin.learn.editor;

/** The learning admin actions as this tab uses them; every call answers a `Result` (docs/10 §3). */
export const learnApi = {
  list: () => callAction(() => actions.admin.listLearnPages()),
  get: (id: string) => callAction(() => actions.admin.getLearnPage({ id })),
  save: (input: LearnPageInput) => callAction(() => actions.admin.saveLearnPage(input)),
  setPublished: (id: string, published: boolean) =>
    callAction(() => actions.admin.setLearnPublished({ id, published })),
};

/** A row of the page list, as `admin.listLearnPages` answers it. */
export type LearnRow = Extract<
  Awaited<ReturnType<typeof learnApi.list>>,
  { ok: true }
>['data'][number];
/** One page for the editor, as `admin.getLearnPage` answers it. */
export type LearnDetail = Extract<Awaited<ReturnType<typeof learnApi.get>>, { ok: true }>['data'];

/** Cache keys of this tab. */
export const learnKeys = {
  pages: ['learn-pages'] as const,
  page: (id: string) => ['learn-page', id] as const,
};

/** Every page, published or hidden, by slug. */
export const useLearnPages = () =>
  useQuery({ queryKey: learnKeys.pages, queryFn: async () => unwrap(await learnApi.list()) });

/** One page for the editor. Like the product editor, the screen owns its copy while open: no refetch, no cache after it closes. */
export const useLearnPage = (id: string) =>
  useQuery({
    queryKey: learnKeys.page(id),
    queryFn: async () => unwrap(await learnApi.get(id)),
    staleTime: Infinity,
    gcTime: 0,
  });

/** Public address of a page: `/aprende` for the home page, `/aprende/<slug>` for the rest. */
export const learnPageUrl = (slug: string) => (slug ? `/aprende/${slug}` : '/aprende');

/**
 * The quick publish switch shared by the list rows and the editor (docs/12 §5c). It moves at once:
 * the new state goes into the cached list and page (both places show it), then
 * `admin.setLearnPublished` saves it; a failure puts the old state back. A search index that did
 * not follow is reported as a warning.
 */
export function useSetLearnPublished() {
  const qc = useQueryClient();
  /** Writes `published` (and `updatedAt` when given) into the cached row and page of `id`. */
  const write = (id: string, published: boolean, updatedAt?: number) => {
    const patch = <T extends { published: boolean; updatedAt: number }>(x: T): T => ({
      ...x,
      published,
      updatedAt: updatedAt ?? x.updatedAt,
    });
    qc.setQueryData<LearnRow[]>(learnKeys.pages, (rows) =>
      rows?.map((r) => (r.id === id ? patch(r) : r)),
    );
    qc.setQueryData<LearnDetail>(learnKeys.page(id), (d) => (d ? patch(d) : d));
  };
  return async (id: string, published: boolean) => {
    write(id, published);
    const res = await learnApi.setPublished(id, published);
    if (!res.ok) {
      write(id, !published);
      return void toast.error(errorText(res));
    }
    write(id, res.data.published, res.data.updatedAt);
    toast.success(res.data.published ? t.nowPublished : t.nowHidden);
    if (res.data.search === 'failed') toast.warning(es.admin.errors.SEARCH_NOT_UPDATED);
  };
}
