import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '../types';

interface BookState {
  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBookProgress: (id: string, progress: number) => void;
  updateLastRead: (id: string, timestamp: string) => void;
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      books: [],
      
      addBook: (book) => set((state) => ({ 
        books: [...state.books, book] 
      })),
      
      removeBook: (id) => set((state) => ({ 
        books: state.books.filter((book) => book.id !== id) 
      })),
      
      updateBookProgress: (id, progress) => set((state) => ({
        books: state.books.map((book) =>
          book.id === id ? { ...book, progress } : book
        ),
      })),
      
      updateLastRead: (id, timestamp) => set((state) => ({
        books: state.books.map((book) =>
          book.id === id ? { ...book, lastRead: timestamp } : book
        ),
      })),
    }),
    {
      name: 'book-storage',
    }
  )
);