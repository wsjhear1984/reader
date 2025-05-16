import React, { useState, useEffect } from 'react';
import { HardDrive, FileText, RefreshCw, Check, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookStore } from '../store/bookStore';
import { useNavigate } from 'react-router-dom';
import { generateId } from '../utils/id';
import { storeFile } from '../utils/fileStorage';
import GoogleDriveAuth from './GoogleDriveAuth';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

const GoogleDrivePage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('google_access_token')
  );
  
  const { addBook } = useBookStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      fetchDriveFiles();
    }
  }, [accessToken]);

  const handleAuthSuccess = (token: string) => {
    localStorage.setItem('google_access_token', token);
    setAccessToken(token);
    setConnected(true);
    setError(null);
  };

  const handleAuthError = (error: string) => {
    setError(`Authentication failed: ${error}`);
    setConnected(false);
    localStorage.removeItem('google_access_token');
  };

  const fetchDriveFiles = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const query = "mimeType='application/epub+zip' or mimeType='application/pdf' or mimeType='text/plain'";
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch files from Google Drive');
      }

      const data = await response.json();
      setDriveFiles(data.files);
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
      if (err instanceof Error && err.message.includes('401')) {
        setConnected(false);
        localStorage.removeItem('google_access_token');
        setAccessToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string): Promise<Blob> => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return await response.blob();
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
      for (const fileId of selectedFiles) {
        const file = driveFiles.find(f => f.id === fileId);
        if (!file) continue;

        const blob = await downloadFile(fileId);
        const format = getFileFormat(file.mimeType);
        if (!format) continue;

        const id = generateId();
        await storeFile(id, new File([blob], file.name));
        
        addBook({
          id,
          title: file.name.replace(/\.(epub|pdf|txt)$/i, ''),
          author: 'Unknown Author',
          format,
          fileUrl: `indexeddb://${id}`,
          coverUrl: null,
          progress: 0,
          lastRead: null,
          source: 'google-drive'
        });
      }

      setSuccess(true);
      setSelectedFiles([]);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError("Failed to import files. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const getFileFormat = (mimeType: string): 'epub' | 'pdf' | 'txt' | null => {
    switch (mimeType) {
      case 'application/epub+zip':
        return 'epub';
      case 'application/pdf':
        return 'pdf';
      case 'text/plain':
        return 'txt';
      default:
        return null;
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

  if (!connected || !accessToken) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Google Drive Integration</h1>
        <GoogleDriveAuth onSuccess={handleAuthSuccess} onError={handleAuthError} />
      </div>
    );
  }

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
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Check size={14} className="text-green-600" />
              </span>
              <span className="ml-2 text-sm font-medium text-green-700">Connected to Google Drive</span>
            </div>
            <button
              onClick={fetchDriveFiles}
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
            
            {loading ? (
              <div className="p-6 text-center">
                <Loader size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-500">Loading files from Google Drive...</p>
              </div>
            ) : driveFiles.length === 0 ? (
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
                      <span className="text-xs text-gray-500">{formatDate(file.modifiedTime)}</span>
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
    </div>
  );
};

export default GoogleDrivePage;