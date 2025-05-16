import React, { useState } from 'react';
import { HardDrive, FileText, RefreshCw, Check, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookStore } from '../store/bookStore';
import { useNavigate } from 'react-router-dom';
import { generateId } from '../utils/id';

// Mock data for Google Drive files
const mockDriveFiles = [
  { id: 'file1', name: 'The Great Gatsby.epub', mimeType: 'application/epub+zip', lastModified: '2023-10-15T10:30:00Z' },
  { id: 'file2', name: 'Clean Code.pdf', mimeType: 'application/pdf', lastModified: '2023-09-22T14:15:00Z' },
  { id: 'file3', name: 'The Art of War.txt', mimeType: 'text/plain', lastModified: '2023-11-05T08:45:00Z' },
  { id: 'file4', name: 'Dune.epub', mimeType: 'application/epub+zip', lastModified: '2023-08-30T16:20:00Z' },
  { id: 'file5', name: 'Design Patterns.pdf', mimeType: 'application/pdf', lastModified: '2023-10-01T11:10:00Z' },
];

const GoogleDrivePage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [driveFiles, setDriveFiles] = useState<typeof mockDriveFiles>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  const { addBook } = useBookStore();
  const navigate = useNavigate();

  const connectToGoogleDrive = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate Google Drive API authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConnected(true);
      setDriveFiles(mockDriveFiles);
    } catch (err) {
      setError("Failed to connect to Google Drive. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to import.");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      // Simulate file import
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add selected books to library
      selectedFiles.forEach(fileId => {
        const file = driveFiles.find(f => f.id === fileId);
        if (file) {
          let format: 'epub' | 'pdf' | 'txt' = 'epub';
          
          if (file.mimeType === 'application/pdf') {
            format = 'pdf';
          } else if (file.mimeType === 'text/plain') {
            format = 'txt';
          }
          
          addBook({
            id: generateId(),
            title: file.name.replace(/\.(epub|pdf|txt)$/i, ''),
            author: 'Unknown Author',
            format,
            fileUrl: `https://drive.google.com/uc?id=${file.id}`,
            coverUrl: null,
            progress: 0,
            lastRead: null,
            source: 'google-drive'
          });
        }
      });

      setSuccess(true);
      setSelectedFiles([]);
      
      // Navigate back to library after delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError("Failed to import files. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    switch(mimeType) {
      case 'application/epub+zip':
        return <span className="text-green-500 text-xs font-medium uppercase">EPUB</span>;
      case 'application/pdf':
        return <span className="text-red-500 text-xs font-medium uppercase">PDF</span>;
      case 'text/plain':
        return <span className="text-blue-500 text-xs font-medium uppercase">TXT</span>;
      default:
        return <span className="text-gray-500 text-xs font-medium uppercase">FILE</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Google Drive Integration</h1>
      
      {success ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center"
        >
          <Check size={20} className="text-green-500 mr-3" />
          <p className="text-green-700">Files imported successfully! Redirecting to your library...</p>
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
          
          {!connected ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <HardDrive size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                Connect to Google Drive
              </h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Connect your Google Drive account to import your ebooks directly into your library.
              </p>
              <button
                onClick={connectToGoogleDrive}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 rounded-md font-medium ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <HardDrive size={16} className="mr-2" />
                    Connect to Google Drive
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <Check size={14} className="text-green-600" />
                  </span>
                  <span className="ml-2 text-sm font-medium text-green-700">Connected to Google Drive</span>
                </div>
                <button
                  onClick={() => {
                    setDriveFiles(mockDriveFiles);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">Available eBooks</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all"
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      checked={selectedFiles.length === driveFiles.length && driveFiles.length > 0}
                      onChange={() => {
                        if (selectedFiles.length === driveFiles.length) {
                          setSelectedFiles([]);
                        } else {
                          setSelectedFiles(driveFiles.map(file => file.id));
                        }
                      }}
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm text-gray-600">
                      Select All
                    </label>
                  </div>
                </div>
                
                {driveFiles.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                    <p>No compatible eBook files found in your Google Drive</p>
                  </div>
                ) : (
                  <div>
                    {driveFiles.map(file => (
                      <div 
                        key={file.id}
                        className="flex items-center py-3 px-4 border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          id={`file-${file.id}`}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                        />
                        <label 
                          htmlFor={`file-${file.id}`}
                          className="ml-3 flex-1 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center">
                            {getFileIcon(file.mimeType)}
                            <span className="ml-3 text-sm text-gray-700">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(file.lastModified)}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={importing || selectedFiles.length === 0}
                  className={`flex items-center px-4 py-2 rounded-md font-medium ${
                    importing || selectedFiles.length === 0
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  {importing ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <HardDrive size={16} className="mr-2" />
                      Import Selected Files
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GoogleDrivePage;