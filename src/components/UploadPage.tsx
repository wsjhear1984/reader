import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, Check, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookStore } from '../store/bookStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { generateId } from '../utils/id';
import { storeFile } from '../utils/fileStorage';

const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { addBook } = useBookStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (fileList: FileList | null): File[] => {
    if (!fileList) return [];
    
    const validFiles: File[] = [];
    const validTypes = ['.epub', '.pdf', '.txt', 'application/epub+zip', 'application/pdf', 'text/plain'];
    
    Array.from(fileList).forEach(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (validTypes.includes(file.type) || validTypes.includes(fileExtension)) {
        validFiles.push(file);
      }
    });
    
    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const validFiles = validateFiles(e.dataTransfer.files);
    if (validFiles.length > 0) {
      setFiles((prev: File[]) => [...prev, ...validFiles]);
      setError(null);
    } else {
      setError("Please upload only EPUB, PDF, or TXT files.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files);
    if (validFiles.length > 0) {
      setFiles((prev: File[]) => [...prev, ...validFiles]);
      setError(null);
    } else {
      setError("Please upload only EPUB, PDF, or TXT files.");
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const format = file.name.split('.').pop()?.toLowerCase() as 'epub' | 'pdf' | 'txt';
        const id = generateId();
        
        // Store file in IndexedDB
        await storeFile(id, file);
        const fileUrl = `indexeddb://${id}`;
        
        // Add book to Supabase via bookStore
        await addBook({
          id,
          title: file.name.replace(/\.(epub|pdf|txt)$/i, ''),
          author: 'Unknown Author',
          format,
          fileUrl,
          coverUrl: null,
          progress: 0,
          lastRead: null,
          source: 'local'
        });
      }

      setSuccess(true);
      setFiles([]);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError("Failed to upload files. Please try again.");
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev: File[]) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch(extension) {
      case 'epub':
        return <span className="text-green-500 text-xs font-medium uppercase">EPUB</span>;
      case 'pdf':
        return <span className="text-red-500 text-xs font-medium uppercase">PDF</span>;
      case 'txt':
        return <span className="text-blue-500 text-xs font-medium uppercase">TXT</span>;
      default:
        return <span className="text-gray-500 text-xs font-medium uppercase">FILE</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Upload eBooks</h1>
      
      {success ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center"
        >
          <Check size={20} className="text-green-500 mr-3" />
          <p className="text-green-700">Files uploaded successfully! Redirecting to your library...</p>
        </motion.div>
      ) : (
        <>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center"
            >
              <AlertCircle size={20} className="text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                Drag & Drop your eBooks here
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Supports EPUB, PDF, and TXT files
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Browse Files
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".epub,.pdf,.txt,application/epub+zip,application/pdf,text/plain"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Selected Files ({files.length})</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {files.map((file: File, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-3 px-4 border-b last:border-b-0"
                  >
                    <div className="flex items-center">
                      {getFileIcon(file.name)}
                      <span className="ml-3 text-sm text-gray-700">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`flex items-center px-4 py-2 rounded-md font-medium ${
                    uploading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  {uploading ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload Files
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UploadPage;