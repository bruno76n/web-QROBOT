/** Root React island of the panel: sets up data fetching, the confirm modal and toasts around one view. */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AdminShell } from './AdminShell';
import { ConfirmProvider } from './ConfirmDialog';
import { ProductsView } from './ProductsView';
import { HeroEditor } from './HeroEditor';
import { CategoriesView } from './CategoriesView';

/** The panel page being shown; each Astro admin page mounts this island with its own view. */
interface Props {
  view: 'products' | 'categories' | 'hero';
}

/**
 * Root of the panel: one island per page (`client:only`, docs/07 §3). Wraps the chosen view with the
 * query client (no retries, no refetch on focus), the confirm dialog, the top bar and the toaster.
 */
export default function AdminApp({ view }: Props) {
  // One client per mounted island; created once so cached data survives re-renders.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <ConfirmProvider>
        <AdminShell view={view}>
          {view === 'products' ? (
            <ProductsView />
          ) : view === 'categories' ? (
            <CategoriesView />
          ) : (
            <HeroEditor />
          )}
        </AdminShell>
        <Toaster position="top-center" closeButton={false} />
      </ConfirmProvider>
    </QueryClientProvider>
  );
}
