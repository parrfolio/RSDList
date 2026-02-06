import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/app/AppLayout';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import BrowsePage from '@/pages/BrowsePage';
import MyListPage from '@/pages/MyListPage';
import AccountPage from '@/pages/AccountPage';
import ReleaseDetailPage from '@/pages/ReleaseDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="rsd-wants-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/release/:releaseId" element={<ReleaseDetailPage />} />
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="/rsd" element={<BrowsePage />} />
                <Route path="/mylist" element={<ProtectedRoute><MyListPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
