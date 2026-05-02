import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    await adminDb.collection('users').doc(uid).collection('integrations').doc('google').delete();

    const cacheRef = adminDb.collection('users').doc(uid).collection('calendarCache');
    const snapshot = await cacheRef.get();
    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
