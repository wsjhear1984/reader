import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import Header from './components/Header';
import BookLibrary from './components/BookLibrary';
import UploadPage from './components/UploadPage';
import GoogleDrivePage from './components/GoogleDrivePage';
import ReaderPage from './components/Reader/ReaderPage';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme class to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <Routes>
          <Route path="/" element={<BookLibrary />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/google-drive" element={<GoogleDrivePage />} />
          <Route path="/reader/:id" element={<ReaderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;