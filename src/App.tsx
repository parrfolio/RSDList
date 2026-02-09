import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import SharedListPage from '@/pages/SharedListPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/shared/:shareId',
    element: <AppLayout />,
    children: [{ index: true, element: <SharedListPage /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/rsd', element: <BrowsePage /> },
      { path: '/release/:releaseId', element: <ReleaseDetailPage /> },
      {
        path: '/mylist',
        element: (
          <ProtectedRoute>
            <MyListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account',
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
