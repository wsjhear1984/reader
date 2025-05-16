export interface Book {
  id: string;
  title: string;
  author: string;
  format: 'epub' | 'pdf' | 'txt';
  fileUrl: string;
  coverUrl: string | null;
  progress: number;
  lastRead: string | null;
  source: 'local' | 'google-drive';
}