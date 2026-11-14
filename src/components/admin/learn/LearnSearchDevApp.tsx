/**
 * Development-only frame for `LearnSearchPanel` (`/dev/admin-learn-search`): gives it the query
 * client and the toaster that `AdminApp` gives it inside the panel, in the panel's editor column.
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import LearnSearchPanel from './LearnSearchPanel';

/** Mounts the search block alone, with the same query defaults as the panel (no retries, no refetch on focus). */
export default function LearnSearchDevApp() {
  // One client per mounted island, created once.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <main className="main">
        <div className="ed">
          <LearnSearchPanel />
        </div>
      </main>
      <Toaster position="top-center" closeButton={false} />
    </QueryClientProvider>
  );
}
