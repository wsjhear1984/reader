import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { useBookStore } from './store/bookStore';
import Header from './components/Header';
import BookLibrary from './components/BookLibrary';
import UploadPage from './components/UploadPage';
import GoogleDrivePage from './components/GoogleDrivePage';
import ReaderPage from './components/Reader/ReaderPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { syncBooks } = useBookStore();

  useEffect(() => {
    // Apply theme class to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Sync books when user logs in
    if (user) {
      syncBooks();
    }
  }, [user]);

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {user && <Header />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <BookLibrary />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } />
          <Route path="/google-drive" element={
            <ProtectedRoute>
              <GoogleDrivePage />
            </ProtectedRoute>
          } />
          <Route path="/reader/:id" element={
            <ProtectedRoute>
              <ReaderPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;