import { OAuth2Client } from 'google-auth-library';
import { adminDb } from '@/lib/firebase/admin';

export async function getAuthorizedClient(uid: string): Promise<OAuth2Client> {
  const doc = await adminDb.collection('users').doc(uid).collection('integrations').doc('google').get();
  
  if (!doc.exists) {
    throw new Error('Google Calendar não conectado');
  }

  const tokens = doc.data() as {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate,
  });

  if (Date.now() >= tokens.expiryDate) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    await adminDb.collection('users').doc(uid).collection('integrations').doc('google').update({
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
    });

    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}
