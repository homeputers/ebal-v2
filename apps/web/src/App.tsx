import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from 'sonner';

const Members = lazy(() => import('@/routes/Members'));
const Groups = lazy(() => import('@/routes/Groups'));
const GroupDetail = lazy(() => import('@/routes/GroupDetail'));
const Songs = lazy(() => import('@/routes/Songs'));
const SongDetail = lazy(() => import('@/routes/SongDetail'));
const SongSets = lazy(() => import('@/routes/SongSets'));
const Services = lazy(() => import('@/routes/Services'));
const ServiceDetail = lazy(() => import('@/routes/ServiceDetail'));
const ServicePrint = lazy(() => import('@/routes/ServicePrint'));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <ErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/members" replace />} />
                <Route path="/members" element={<Members />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/:id" element={<GroupDetail />} />
                <Route path="/songs" element={<Songs />} />
                <Route path="/songs/:id" element={<SongDetail />} />
                <Route path="/song-sets" element={<SongSets />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/services/:id/print" element={<ServicePrint />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
