import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '../../store/bookStore';
import EpubReader from './EpubReader';
import PdfReader from './PdfReader';
import TxtReader from './TxtReader';
import { BookOpen, FileText, File, AlertCircle, Loader } from 'lucide-react';

const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, updateLastRead } = useBookStore();
  
  const book = books.find(b => b.id === id);

  useEffect(() => {
    if (book) {
      // Update last read timestamp
      updateLastRead(book.id, new Date().toISOString());
      
      // Update document title
      document.title = `${book.title} | eReader`;
    }
    
    return () => {
      // Reset title on unmount
      document.title = 'eReader';
    };
  }, [book, updateLastRead, id]); // Added id to dependencies

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-center">Book not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          Sorry, we couldn't find the book you're looking for. It may have been removed or the ID is incorrect.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const renderReader = () => {
    switch (book.format) {
      case 'epub':
        return <EpubReader book={book} />;
      case 'pdf':
        return <PdfReader book={book} />;
      case 'txt':
        return <TxtReader book={book} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h1 className="text-xl font-semibold mb-2">Unsupported format</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Sorry, this file format is not supported by the reader.
            </p>
          </div>
        );
    }
  };

  const getFormatIcon = () => {
    switch (book.format) {
      case 'epub':
        return <BookOpen size={24} className="text-green-500 mr-2" />;
      case 'pdf':
        return <FileText size={24} className="text-red-500 mr-2" />;
      case 'txt':
        return <File size={24} className="text-blue-500 mr-2" />;
      default:
        return <File size={24} className="text-gray-500 mr-2" />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {getFormatIcon()}
          <div>
            <h1 className="font-medium text-lg">{book.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{book.author}</p>
          </div>
        </div>
      </header>
      
      <main className="flex-grow overflow-hidden">
        {renderReader()}
      </main>
    </div>
  );
};

export default ReaderPage;