/** TanStack Query hooks and cache keys for the panel's read-only data. */

import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { unwrap } from './call';

/** Cache keys; mutations use them to update or invalidate what a screen shows. */
export const keys = {
  products: ['products'] as const,
  product: (id: string) => ['product', id] as const,
  hero: ['hero'] as const,
  categories: ['categories'] as const,
  clicks: ['clicks'] as const,
};

/** Product rows for the list. */
export const useProducts = () =>
  useQuery({ queryKey: keys.products, queryFn: async () => unwrap(await api.listProducts()) });

/** One product for the editor; disabled while `id` is null (a new product). */
export const useProduct = (id: string | null) =>
  useQuery({
    queryKey: keys.product(id ?? 'none'),
    queryFn: async () => unwrap(await api.getProduct(id as string)),
    enabled: id !== null,
    // The editor owns its copy while open; refetching under it would overwrite typing.
    staleTime: Infinity,
    gcTime: 0,
  });

/** Categories in display order (cached for 30 s). */
export const useCategories = () =>
  useQuery({
    queryKey: keys.categories,
    queryFn: async () => unwrap(await api.listCategories()),
    staleTime: 30_000,
  });

/** The hero for its editor. Like the product editor, the screen keeps its own copy while open, so it is not refetched or kept in cache. */
export const useHero = () =>
  useQuery({
    queryKey: keys.hero,
    queryFn: async () => unwrap(await api.getHero()),
    staleTime: Infinity,
    gcTime: 0,
  });

/** WhatsApp tap totals for the last 30 days (cached for 60 s). */
export const useClickStats = () =>
  useQuery({
    queryKey: keys.clicks,
    queryFn: async () => unwrap(await api.clickStats(30)),
    staleTime: 60_000,
  });
