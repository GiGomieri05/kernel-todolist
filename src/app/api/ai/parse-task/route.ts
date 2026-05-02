import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { groqProvider } from '@/lib/ai/groq';
import { getCachedProjects, getCachedLabels } from '@/lib/todoist/cache';
import { getWindowMappings } from '@/lib/mappings-server';
import { getEventsForDay } from '@/lib/google/calendar';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input é obrigatório' }, { status: 400 });
    }

    const now = new Date();
    const spNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const currentDate = spNow.toISOString().split('T')[0];
    const currentTime = spNow.toTimeString().slice(0, 5);

    const projects = await getCachedProjects(uid);
    const labels = await getCachedLabels(uid);
    const mappings = await getWindowMappings(uid);

    const prefsDoc = await adminDb.collection('users').doc(uid).collection('preferences').doc('calendars').get();
    const selectedCalendarIds = prefsDoc.data()?.selectedCalendarIds || ['primary'];

    const upcomingWindows = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(spNow);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      try {
        const { events } = await getEventsForDay(uid, dateStr, selectedCalendarIds);
        upcomingWindows.push({
          date: dateStr,
          windows: events.map(e => ({
            start: e.start.toISOString(),
            end: e.end.toISOString(),
            title: e.title,
          })),
        });
      } catch {
        continue;
      }
    }

    const context = {
      currentDate,
      currentTime,
      projects: projects.map(p => ({ id: p.id, name: p.name })),
      labels: labels.map(l => ({ id: l.id, name: l.name })),
      windowMappings: mappings.map(m => ({
        pattern: m.pattern,
        projectId: m.projectId,
        projectName: projects.find(p => p.id === m.projectId)?.name || '',
      })),
      upcomingWindows,
    };

    const result = await groqProvider.parseTaskInput(input, context);

    await adminDb.collection('users').doc(uid).collection('aiLogs').add({
      input,
      context: {
        currentDate,
        currentTime,
        projectsCount: projects.length,
        labelsCount: labels.length,
      },
      output: result,
      createdAt: new Date(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao parsear tarefa:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
