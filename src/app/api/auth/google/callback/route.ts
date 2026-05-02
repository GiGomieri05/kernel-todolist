import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Erro OAuth:', error);
      return NextResponse.redirect(new URL('/settings?error=google_auth', request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?error=missing_params', request.url));
    }

    const uid = state;

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    await adminDb.collection('users').doc(uid).collection('integrations').doc('google').set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      scope: tokens.scope,
      updatedAt: new Date(),
    });

    return NextResponse.redirect(new URL('/settings?success=google_connected', request.url));
  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    return NextResponse.redirect(new URL('/settings?error=google_callback', request.url));
  }
}
