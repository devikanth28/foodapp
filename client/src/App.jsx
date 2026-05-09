import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Pages — will be created in Days 2-5
// Temporary placeholder components until real pages are built
const Placeholder = ({ name }) => (
  <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
    {name} — coming soon (Day 2+)
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Placeholder name="Login / OTP" />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute><Placeholder name="Home" /></ProtectedRoute>
            } />
            <Route path="/restaurant/:id" element={
              <ProtectedRoute><Placeholder name="Restaurant Detail" /></ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute><Placeholder name="Cart" /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Placeholder name="Order History" /></ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute><Placeholder name="Order Detail / Tracking" /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Placeholder name="My Profile" /></ProtectedRoute>
            } />
            <Route path="/profile/addresses" element={
              <ProtectedRoute><Placeholder name="Saved Addresses" /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Global toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '14px' },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
