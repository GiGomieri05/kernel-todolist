import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { listCalendars } from '@/lib/google/calendar';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    const calendars = await listCalendars(uid);

    const prefsDoc = await adminDb.collection('users').doc(uid).collection('preferences').doc('calendars').get();
    const selectedIds = prefsDoc.data()?.selectedCalendarIds || calendars.map(c => c.id);

    return NextResponse.json({
      calendars: calendars.map(cal => ({
        ...cal,
        selected: selectedIds.includes(cal.id),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar calendários:', error);
    
    if ((error as Error).message === 'Google Calendar não conectado') {
      return NextResponse.json({ error: 'Google Calendar não conectado' }, { status: 401 });
    }
    
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

    const { selectedCalendarIds } = await request.json();

    await adminDb.collection('users').doc(uid).collection('preferences').doc('calendars').set({
      selectedCalendarIds,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar preferências:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
