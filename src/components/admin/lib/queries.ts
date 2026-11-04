import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { unwrap } from './call';

export const keys = {
  products: ['products'] as const,
  product: (id: string) => ['product', id] as const,
  hero: ['hero'] as const,
  clicks: ['clicks'] as const,
};

export const useProducts = () =>
  useQuery({ queryKey: keys.products, queryFn: async () => unwrap(await api.listProducts()) });

export const useProduct = (id: string | null) =>
  useQuery({
    queryKey: keys.product(id ?? 'none'),
    queryFn: async () => unwrap(await api.getProduct(id as string)),
    enabled: id !== null,
    // The editor owns its copy while open; refetching under it would overwrite typing.
    staleTime: Infinity,
    gcTime: 0,
  });

export const useHero = () =>
  useQuery({
    queryKey: keys.hero,
    queryFn: async () => unwrap(await api.getHero()),
    staleTime: Infinity,
    gcTime: 0,
  });

export const useClickStats = () =>
  useQuery({
    queryKey: keys.clicks,
    queryFn: async () => unwrap(await api.clickStats(30)),
    staleTime: 60_000,
  });
