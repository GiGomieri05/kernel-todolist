import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token é obrigatório' }, { status: 400 });
    }

    await adminAuth.verifyIdToken(idToken);
    
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 5 * 24 * 60 * 60 * 1000,
    });

    const response = NextResponse.json({ success: true });
    
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
