import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Grid, List, Search, SortAsc, Grid3X3, ArrowUpDown, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookStore } from '../store/bookStore';
import BookCard from './BookCard';
import EmptyLibrary from './EmptyLibrary';

const BookLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { books } = useBookStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'lastRead'>('lastRead');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'author') {
      comparison = a.author.localeCompare(b.author);
    } else if (sortBy === 'lastRead') {
      comparison = new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-semibold flex items-center">
          <Book className="mr-2" size={28} />
          My Library
        </h1>
        
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search books..."
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              aria-label="Grid view"
            >
              <Grid3X3 size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
            <div className="relative group">
              <button 
                className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="Sort options"
              >
                <ArrowUpDown size={18} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortBy === 'title' ? 'font-medium text-blue-600' : ''}`}
                  onClick={() => setSortBy('title')}
                >
                  Sort by Title
                </button>
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortBy === 'author' ? 'font-medium text-blue-600' : ''}`}
                  onClick={() => setSortBy('author')}
                >
                  Sort by Author
                </button>
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortBy === 'lastRead' ? 'font-medium text-blue-600' : ''}`}
                  onClick={() => setSortBy('lastRead')}
                >
                  Sort by Recently Read
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                  onClick={toggleSortOrder}
                >
                  {sortOrder === 'asc' ? 'Ascending Order' : 'Descending Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {sortedBooks.map(book => (
                <BookCard key={book.id} book={book} viewMode="grid" onClick={() => navigate(`/reader/${book.id}`)} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {sortedBooks.map(book => (
                <BookCard key={book.id} book={book} viewMode="list" onClick={() => navigate(`/reader/${book.id}`)} />
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default BookLibrary;