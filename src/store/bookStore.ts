import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { useAuthStore } from './authStore';

interface BookState {
  books: Book[];
  addBook: (book: Book) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  updateBookProgress: (id: string, progress: number) => Promise<void>;
  updateLastRead: (id: string, timestamp: string) => Promise<void>;
  syncBooks: () => Promise<void>;
}

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      books: [],
      
      addBook: async (book) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Add to Supabase
        const { error } = await supabase
          .from('books')
          .insert([{
            id: book.id,
            user_id: user.id,
            title: book.title,
            author: book.author,
            format: book.format,
            file_url: book.fileUrl,
            cover_url: book.coverUrl,
            progress: book.progress,
            last_read: book.lastRead,
            source: book.source
          }]);

        if (error) throw error;

        // Update local state
        set((state) => ({ 
          books: [...state.books, book] 
        }));
      },
      
      removeBook: async (id) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Remove from Supabase
        const { error } = await supabase
          .from('books')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        set((state) => ({ 
          books: state.books.filter((book) => book.id !== id) 
        }));
      },
      
      updateBookProgress: async (id, progress) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Update in Supabase
        const { error } = await supabase
          .from('books')
          .update({ progress })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        set((state) => ({
          books: state.books.map((book) =>
            book.id === id ? { ...book, progress } : book
          ),
        }));
      },
      
      updateLastRead: async (id, timestamp) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Update in Supabase
        const { error } = await supabase
          .from('books')
          .update({ last_read: timestamp })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        set((state) => ({
          books: state.books.map((book) =>
            book.id === id ? { ...book, lastRead: timestamp } : book
          ),
        }));
      },

      syncBooks: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Fetch books from Supabase
        const { data: remoteBooks, error } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        if (remoteBooks) {
          // Transform remote books to local format
          const books: Book[] = remoteBooks.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            format: book.format,
            fileUrl: book.file_url,
            coverUrl: book.cover_url,
            progress: book.progress,
            lastRead: book.last_read,
            source: book.source
          }));

          // Update local state
          set({ books });
        }
      },
    }),
    {
      name: 'book-storage',
    }
  )
);

// Set up real-time sync
supabase
  .channel('books_changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'books' 
  }, (payload) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Only sync if the change is for the current user
    if (payload.new && payload.new.user_id === user.id) {
      useBookStore.getState().syncBooks();
    }
  })
  .subscribe();