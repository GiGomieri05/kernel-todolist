import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getEventsForDay } from '@/lib/google/calendar';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    const prefsDoc = await adminDb.collection('users').doc(uid).collection('preferences').doc('calendars').get();
    const selectedCalendarIds = prefsDoc.data()?.selectedCalendarIds || ['primary'];

    const { events, cached, cachedAt } = await getEventsForDay(uid, date, selectedCalendarIds);

    return NextResponse.json({
      events,
      date,
      cached,
      cachedAt: cachedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    
    if ((error as Error).message === 'Google Calendar não conectado') {
      return NextResponse.json({ error: 'Google Calendar não conectado' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
