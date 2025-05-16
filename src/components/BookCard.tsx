import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, File } from 'lucide-react';
import { formatDistanceToNow } from '../utils/date';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, viewMode, onClick }) => {
  const getFormatIcon = () => {
    switch (book.format) {
      case 'epub':
        return <BookOpen size={16} className="text-green-500" />;
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'txt':
        return <File size={16} className="text-blue-500" />;
      default:
        return <File size={16} />;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  if (viewMode === 'grid') {
    return (
      <motion.div
        className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
        variants={cardVariants}
        whileHover="hover"
        onClick={onClick}
      >
        <div className="relative pb-[140%] bg-gray-100">
          {book.coverUrl ? (
            <img 
              src={book.coverUrl} 
              alt={`${book.title} cover`} 
              className="absolute w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center p-4">
                <BookOpen size={48} className="mx-auto mb-2 text-indigo-400" />
                <p className="text-sm font-medium text-gray-800 line-clamp-3">{book.title}</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs">{Math.round(book.progress * 100)}% read</p>
              <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-1 bg-blue-500 rounded-full" 
                  style={{ width: `${book.progress * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2">{book.title}</h3>
          <p className="text-xs text-gray-600 mt-1">{book.author}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center text-xs text-gray-500">
              {getFormatIcon()}
              <span className="ml-1 uppercase">{book.format}</span>
            </span>
            <span className="text-xs text-gray-500">
              {book.lastRead ? formatDistanceToNow(new Date(book.lastRead)) : 'Never opened'}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-center space-x-4 p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
      variants={cardVariants}
      whileHover="hover"
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-16 h-24 bg-gray-100 rounded overflow-hidden">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={`${book.title} cover`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <BookOpen size={24} className="text-indigo-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-gray-900 truncate">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.author}</p>
        <div className="mt-2 flex items-center">
          <div className="w-full max-w-[120px] h-1.5 bg-gray-200 rounded-full">
            <div 
              className="h-1.5 bg-blue-500 rounded-full" 
              style={{ width: `${book.progress * 100}%` }}
            ></div>
          </div>
          <span className="ml-2 text-xs text-gray-500">{Math.round(book.progress * 100)}%</span>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <span className="flex items-center text-xs text-gray-500">
          {getFormatIcon()}
          <span className="ml-1 uppercase">{book.format}</span>
        </span>
        <span className="text-xs text-gray-500">
          {book.lastRead ? formatDistanceToNow(new Date(book.lastRead)) : 'Never opened'}
        </span>
      </div>
    </motion.div>
  );
};

export default BookCard;