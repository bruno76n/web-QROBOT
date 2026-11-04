import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AdminShell } from './AdminShell';
import { ConfirmProvider } from './ConfirmDialog';
import { ProductsView } from './ProductsView';
import { HeroEditor } from './HeroEditor';

interface Props {
  view: 'products' | 'hero';
}

/** Root of the panel: one island per page (`client:only`, docs/07 §3). */
export default function AdminApp({ view }: Props) {
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
          {view === 'products' ? <ProductsView /> : <HeroEditor />}
        </AdminShell>
        <Toaster position="top-center" closeButton={false} />
      </ConfirmProvider>
    </QueryClientProvider>
  );
}
