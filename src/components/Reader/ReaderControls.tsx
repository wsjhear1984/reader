import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Maximize, 
  Minimize, 
  Moon, 
  Sun, 
  Type, 
  RotateCcw, 
  Coffee, 
  Bookmark, 
  Settings, 
  X,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  fontSize: number;
  changeFontSize: (size: number) => void;
  theme: 'light' | 'dark' | 'sepia';
  changeTheme: (theme: 'light' | 'dark' | 'sepia') => void;
  showRotate?: boolean;
  onRotate?: () => void;
}

const ReaderControls: React.FC<ReaderControlsProps> = ({
  currentPage,
  totalPages,
  fontSize,
  changeFontSize,
  theme,
  changeTheme,
  showRotate = false,
  onRotate
}) => {
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
        });
      }
    }
  };

  const increaseFontSize = () => {
    changeFontSize(Math.min(fontSize + 10, 200));
  };

  const decreaseFontSize = () => {
    changeFontSize(Math.max(fontSize - 10, 70));
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-md py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Back to library"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Show settings"
          >
            <Settings size={20} />
          </button>
          
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Font Size</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decreaseFontSize}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Decrease font size"
                  >
                    <MinusCircle size={18} />
                  </button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-center">
                    {Math.round(fontSize)}%
                  </span>
                  
                  <button
                    onClick={increaseFontSize}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Increase font size"
                  >
                    <PlusCircle size={18} />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Theme</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => changeTheme('light')}
                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    aria-label="Light theme"
                  >
                    <Sun size={18} className={theme === 'light' ? 'text-blue-600' : ''} />
                  </button>
                  
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    aria-label="Dark theme"
                  >
                    <Moon size={18} className={theme === 'dark' ? 'text-blue-600' : ''} />
                  </button>
                  
                  <button
                    onClick={() => changeTheme('sepia')}
                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'sepia' ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    aria-label="Sepia theme"
                  >
                    <Coffee size={18} className={theme === 'sepia' ? 'text-blue-600' : ''} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col">
                <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Options</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {}}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Add bookmark"
                  >
                    <Bookmark size={18} />
                  </button>
                  
                  {showRotate && onRotate && (
                    <button
                      onClick={onRotate}
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Rotate page"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReaderControls;