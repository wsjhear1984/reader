import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Book } from '../../types';
import { useBookStore } from '../../store/bookStore';
import ReaderControls from './ReaderControls';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { getFile } from '../../utils/fileStorage';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfReaderProps {
  book: Book;
}

const PdfReader: React.FC<PdfReaderProps> = ({ book }: PdfReaderProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [fileUrl, setFileUrl] = useState<string>(book.fileUrl);

  const containerRef = useRef<HTMLDivElement>(null);
  const { updateBookProgress } = useBookStore();

  useEffect(() => {
    const loadPdf = async () => {
      if (book.fileUrl.startsWith('indexeddb://')) {
        const fileId = book.fileUrl.replace('indexeddb://', '');
        const file = await getFile(fileId);
        if (file) {
          setFileUrl(URL.createObjectURL(file));
        } else {
          setFileUrl('');
        }
      } else {
        setFileUrl(book.fileUrl);
      }
    };
    loadPdf();
  }, [book.fileUrl]);

  useEffect(() => {
    // Restore progress if available
    if (book.progress > 0 && numPages > 0) {
      const page = Math.max(1, Math.ceil(book.progress * numPages));
      setPageNumber(page);
    }
  }, [book.progress, numPages]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    
    // If we haven't started the book yet, start at page 1
    if (book.progress === 0) {
      setPageNumber(1);
      updateBookProgress(book.id, 1 / numPages);
    }
  };

  const changePage = (offset: number) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
      updateBookProgress(book.id, newPage / numPages);
    }
  };

  const changeScale = (newScale: number) => {
    setScale(newScale);
  };

  const changeRotation = () => {
    setRotation((prevRotation: number) => (prevRotation + 90) % 360);
  };

  const changeTheme = (newTheme: 'light' | 'dark' | 'sepia') => {
    setTheme(newTheme);
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef}
        className={`flex-grow overflow-auto flex justify-center p-4 transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-900' 
            : theme === 'sepia' 
              ? 'bg-amber-50' 
              : 'bg-gray-100'
        }`}
      >
        {loading && (
          <div className="flex items-center justify-center h-full w-full">
            <Loader size={48} className="animate-spin text-blue-600" />
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Loader size={48} className="animate-spin text-blue-600" />}
          className="max-w-full"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            className={`shadow-xl rounded ${
              theme === 'dark' 
                ? 'filter invert bg-white' 
                : theme === 'sepia' 
                  ? 'sepia-[0.4] bg-amber-50' 
                  : 'bg-white'
            }`}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>

        {/* Navigation buttons */}
        <button 
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      <ReaderControls 
        currentPage={pageNumber}
        totalPages={numPages}
        fontSize={scale * 100}
        changeFontSize={(size: number) => changeScale(size / 100)}
        theme={theme}
        changeTheme={changeTheme}
        showRotate={true}
        onRotate={changeRotation}
      />
    </div>
  );
};

export default PdfReader;