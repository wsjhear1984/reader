import React, { useEffect, useRef, useState } from 'react';
import { Book } from '../../types';
import { useBookStore } from '../../store/bookStore';
import ePub from 'epubjs';
import ReaderControls from './ReaderControls';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFile } from '../../utils/fileStorage';

interface EpubReaderProps {
  book: Book;
}

const EpubReader: React.FC<EpubReaderProps> = ({ book }: EpubReaderProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [epubBook, setEpubBook] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [totalLocations, setTotalLocations] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [fontSize, setFontSize] = useState<number>(100);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  
  const { updateBookProgress } = useBookStore();

  useEffect(() => {
    let revokedUrl: string | null = null;
    const loadEpub = async () => {
      let epubUrl = book.fileUrl;
      if (book.fileUrl.startsWith('indexeddb://')) {
        const fileId = book.fileUrl.replace('indexeddb://', '');
        const file = await getFile(fileId);
        if (file) {
          epubUrl = URL.createObjectURL(file);
          revokedUrl = epubUrl;
        }
      }
      // Create new ePub instance
      const epubBookInstance = ePub(epubUrl);
      setEpubBook(epubBookInstance);
      
      // Fetch metadata
      epubBookInstance.loaded.metadata.then((meta: any) => {
        setMetadata(meta);
      });

      // Create rendition
      const renditionInstance = epubBookInstance.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none',
      });
      setRendition(renditionInstance);

      // Display the book
      renditionInstance.display();

      // Get total locations for progress calculation
      epubBookInstance.locations.generate(1024).then(() => {
        setTotalLocations(epubBookInstance.locations.total);
        
        // Restore progress if available
        if (book.progress > 0) {
          const location = Math.floor(book.progress * epubBookInstance.locations.total);
          renditionInstance.display(epubBookInstance.locations.cfiFromLocation(location));
        }
      });

      // Track location changes
      renditionInstance.on('locationChanged', (location: any) => {
        const locIndex = epubBookInstance.locations.locationFromCfi(location.start.cfi);
        setCurrentLocation(location.start.cfi);
        
        // Calculate and update progress
        if (locIndex && totalLocations) {
          const progress = locIndex / totalLocations;
          setCurrentPage(Math.floor(progress * 100));
          updateBookProgress(book.id, progress);
        }
      });
    };
    loadEpub();
    return () => {
      if (rendition) {
        rendition.destroy();
      }
      if (epubBook) {
        epubBook.destroy();
      }
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [book.fileUrl, viewerRef, book.id, book.progress, totalLocations, updateBookProgress]);

  const goToNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const goToPrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
    if (rendition) {
      rendition.themes.fontSize(`${size}%`);
    }
  };

  const changeTheme = (newTheme: 'light' | 'dark' | 'sepia') => {
    setTheme(newTheme);
    if (rendition) {
      rendition.themes.register(newTheme, {
        body: {
          color: newTheme === 'dark' ? '#fff' : newTheme === 'sepia' ? '#5b4636' : '#000',
          background: newTheme === 'dark' ? '#1a1a1a' : newTheme === 'sepia' ? '#f4ecd8' : '#fff'
        }
      });
      rendition.themes.select(newTheme);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow relative overflow-hidden">
        <div ref={viewerRef} className="absolute inset-0"></div>
        
        {/* Navigation buttons */}
        <button 
          onClick={goToPrevPage}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-r-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={goToNextPage}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-l-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      <ReaderControls 
        currentPage={currentPage}
        totalPages={100}
        fontSize={fontSize}
        changeFontSize={changeFontSize}
        theme={theme}
        changeTheme={changeTheme}
      />
    </div>
  );
};

export default EpubReader;