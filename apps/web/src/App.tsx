import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';

const queryClient = new QueryClient();

const Members = lazy(() => import('@/routes/Members'));
const Groups = lazy(() => import('@/routes/Groups'));
const Songs = lazy(() => import('@/routes/Songs'));
const SongSets = lazy(() => import('@/routes/SongSets'));
const Services = lazy(() => import('@/routes/Services'));

export default function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Navbar />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/members" element={<Members />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/song-sets" element={<SongSets />} />
              <Route path="/services" element={<Services />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
