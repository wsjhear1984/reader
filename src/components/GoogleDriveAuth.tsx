import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/google-drive/callback`;

interface GoogleDriveAuthProps {
  onSuccess: (accessToken: string) => void;
  onError: (error: string) => void;
}

const GoogleDriveAuth: React.FC<GoogleDriveAuthProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
      handleAuthCode(code);
    } else if (error) {
      onError(error);
    }
  }, []);

  const handleAuthCode = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange auth code');
      }

      const data = await response.json();
      onSuccess(data.access_token);
      navigate('/google-drive');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const initiateAuth = () => {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.readonly');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline`;
    window.location.href = authUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {isLoading ? (
        <div className="flex flex-col items-center">
          <Loader size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Authenticating with Google Drive...</p>
        </div>
      ) : (
        <button
          onClick={initiateAuth}
          className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
            alt="Google"
            className="w-6 h-6 mr-3"
          />
          <span className="text-gray-700 font-medium">Connect with Google Drive</span>
        </button>
      )}
    </div>
  );
};

export default GoogleDriveAuth;