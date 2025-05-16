import React from 'react';
import { motion } from 'framer-motion';
import { BookPlus, Upload, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyLibrary: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
      >
        <div className="w-32 h-32 flex items-center justify-center rounded-full bg-blue-50 mb-6">
          <BookPlus size={56} className="text-blue-500" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-semibold mb-2">Your library is empty</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Start building your collection by adding books from your device or connecting to Google Drive.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/upload')}
        >
          <Upload size={18} />
          Upload Files
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/google-drive')}
        >
          <HardDrive size={18} />
          Connect to Google Drive
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EmptyLibrary;