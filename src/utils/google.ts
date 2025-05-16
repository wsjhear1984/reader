import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  import.meta.env.VITE_GOOGLE_CLIENT_ID,
  import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  `${window.location.origin}/google-drive/callback`
);

export const getGoogleAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.readonly']
  });
};

export const getGoogleTokens = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const setGoogleTokens = (tokens: any) => {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
};

export const getDriveFiles = async () => {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const response = await drive.files.list({
    q: "mimeType='application/epub+zip' or mimeType='application/pdf' or mimeType='text/plain'",
    fields: 'files(id, name, mimeType, modifiedTime)',
    orderBy: 'modifiedTime desc'
  });
  return response.data.files;
};