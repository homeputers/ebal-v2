import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LanguageGuard } from '@/components/LanguageGuard';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RequireRole } from '@/features/auth/components/RequireRole';
import { DEFAULT_LANGUAGE } from '@/i18n';

const Members = lazy(() => import('@/routes/Members'));
const Groups = lazy(() => import('@/routes/Groups'));
const GroupDetail = lazy(() => import('@/routes/GroupDetail'));
const Songs = lazy(() => import('@/routes/Songs'));
const SongDetail = lazy(() => import('@/routes/SongDetail'));
const SongSets = lazy(() => import('@/routes/SongSets'));
const SongSetDetail = lazy(() => import('@/routes/SongSetDetail'));
const Services = lazy(() => import('@/routes/Services'));
const ServiceDetail = lazy(() => import('@/routes/ServiceDetail'));
const ServicePrint = lazy(() => import('@/routes/ServicePrint'));
const ServicePlanView = lazy(() => import('@/routes/ServicePlanView'));
const Login = lazy(() => import('@/routes/Login'));
const ForgotPassword = lazy(() => import('@/routes/ForgotPassword'));
const ResetPassword = lazy(() => import('@/routes/ResetPassword'));
const ChangePassword = lazy(() => import('@/routes/ChangePassword'));
const AdminUsersList = lazy(() => import('@/routes/admin/AdminUsersList'));
const AdminUserDetail = lazy(() => import('@/routes/admin/AdminUserDetail'));
const AdminUserCreate = lazy(() => import('@/routes/admin/AdminUserCreate'));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<LanguageGuard />}> 
            <Route path=":lang"> 
              <Route index element={<Navigate to="members" replace />} /> 
              <Route path="login" element={<Login />} /> 
              <Route path="forgot-password" element={<ForgotPassword />} /> 
              <Route path="reset-password" element={<ResetPassword />} /> 
              <Route element={<ProtectedRoute redirectTo="../login" />}> 
                <Route path="change-password" element={<ChangePassword />} /> 
                <Route path="members" element={<Members />} /> 
                <Route path="groups" element={<Groups />} /> 
                <Route path="groups/:id" element={<GroupDetail />} /> 
                <Route element={<RequireRole roles={['ADMIN', 'PLANNER']} />}> 
                  <Route path="songs" element={<Songs />} /> 
                  <Route path="songs/:id" element={<SongDetail />} /> 
                  <Route path="song-sets" element={<SongSets />} /> 
                  <Route path="song-sets/:id" element={<SongSetDetail />} /> 
                  <Route path="services/:id" element={<ServiceDetail />} /> 
                </Route> 
                <Route path="services" element={<Services />} /> 
                <Route path="services/:id/print" element={<ServicePrint />} /> 
                <Route path="services/:id/plan" element={<ServicePlanView />} />
                <Route element={<RequireRole role="ADMIN" />}>
                  <Route path="admin/users" element={<AdminUsersList />} />
                  <Route path="admin/users/new" element={<AdminUserCreate />} />
                  <Route path="admin/users/:id" element={<AdminUserDetail />} />
                </Route>
                <Route path="*" element={<Navigate to="members" replace />} />
              </Route>
            </Route>
          </Route> 
          <Route 
            path="*" 
            element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} 
          /> 
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
