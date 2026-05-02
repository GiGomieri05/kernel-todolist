import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getWindowMappings, saveWindowMappings } from '@/lib/mappings';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    const mappings = await getWindowMappings(uid);

    return NextResponse.json({ mappings });
  } catch (error) {
    console.error('Erro ao buscar mapeamentos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    const { mappings } = await request.json();
    await saveWindowMappings(uid, mappings);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar mapeamentos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
