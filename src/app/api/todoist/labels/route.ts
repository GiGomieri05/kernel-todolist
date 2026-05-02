import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getCachedLabels } from '@/lib/todoist/cache';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    const labels = await getCachedLabels(uid);

    return NextResponse.json({ labels });
  } catch (error) {
    console.error('Erro ao buscar labels:', error);
    
    if ((error as Error).message === 'Token do Todoist inválido') {
      return NextResponse.json({ error: 'Token do Todoist inválido' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
