import React, { useEffect, useState } from 'react';
import { Book } from '../../types';
import { useBookStore } from '../../store/bookStore';
import ReaderControls from './ReaderControls';
import { Loader } from 'lucide-react';
import { getFile } from '../../utils/fileStorage';

interface TxtReaderProps {
  book: Book;
}

const TxtReader: React.FC<TxtReaderProps> = ({ book }: TxtReaderProps) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(100);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  
  const { updateBookProgress } = useBookStore();

  useEffect(() => {
    const fetchTxtContent = async () => {
      try {
        let text = '';
        if (book.fileUrl.startsWith('indexeddb://')) {
          const fileId = book.fileUrl.replace('indexeddb://', '');
          const file = await getFile(fileId);
          if (file) {
            text = await file.text();
          } else {
            text = 'Error loading text file from storage.';
          }
        } else {
          const response = await fetch(book.fileUrl);
          text = await response.text();
        }
        setContent(text);
      } catch (error) {
        console.error('Error fetching text file:', error);
        setContent('Error loading text file. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTxtContent();
  }, [book.fileUrl]);

  useEffect(() => {
    // Set initial scroll position based on saved progress
    if (!loading && content && book.progress > 0) {
      const contentElement = document.getElementById('txt-content');
      if (contentElement) {
        const totalHeight = contentElement.scrollHeight - contentElement.clientHeight;
        contentElement.scrollTop = totalHeight * book.progress;
      }
    }
  }, [loading, content, book.progress]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    // Calculate scroll percentage
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    setScrollPosition(scrollPercentage);
    
    // Update progress in store
    updateBookProgress(book.id, scrollPercentage);
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
  };

  const changeTheme = (newTheme: 'light' | 'dark' | 'sepia') => {
    setTheme(newTheme);
  };

  const getBackgroundColor = () => {
    switch (theme) {
      case 'light': return 'bg-white';
      case 'dark': return 'bg-gray-900';
      case 'sepia': return 'bg-amber-50';
      default: return 'bg-white';
    }
  };

  const getTextColor = () => {
    switch (theme) {
      case 'light': return 'text-gray-900';
      case 'dark': return 'text-gray-100';
      case 'sepia': return 'text-amber-900';
      default: return 'text-gray-900';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <Loader size={48} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <div
          id="txt-content"
          className={`flex-grow overflow-auto p-6 md:p-12 transition-colors ${getBackgroundColor()}`}
          onScroll={handleScroll}
        >
          <div 
            className={`max-w-prose mx-auto ${getTextColor()} transition-colors`}
            style={{ fontSize: `${fontSize}%`, lineHeight: '1.6' }}
          >
            {content.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="mb-4">
                {paragraph || '\u00A0'}
              </p>
            ))}
          </div>
        </div>
      )}
      
      <ReaderControls 
        currentPage={Math.round(scrollPosition * 100)}
        totalPages={100}
        fontSize={fontSize}
        changeFontSize={changeFontSize}
        theme={theme}
        changeTheme={changeTheme}
      />
    </div>
  );
};

export default TxtReader;