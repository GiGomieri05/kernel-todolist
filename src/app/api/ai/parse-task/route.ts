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
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const currentDate = `${year}-${month}-${day}`;
    
    const timeParts = timeFormatter.formatToParts(now);
    const hour = timeParts.find(p => p.type === 'hour')?.value;
    const minute = timeParts.find(p => p.type === 'minute')?.value;
    const currentTime = `${hour}:${minute}`;

    const projects = await getCachedProjects(uid).catch(() => []);
    const labels = await getCachedLabels(uid).catch(() => []);
    const mappings = await getWindowMappings(uid).catch(() => []);

    // Extract arrays from paginated responses
    const projectsArray = Array.isArray(projects) 
      ? projects 
      : (projects as { results?: unknown[] })?.results || [];
    const labelsArray = Array.isArray(labels) 
      ? labels 
      : (labels as { results?: unknown[] })?.results || [];
    const mappingsArray = Array.isArray(mappings) ? mappings : [];

    const prefsDoc = await adminDb.collection('users').doc(uid).collection('preferences').doc('calendars').get();
    const selectedCalendarIds = prefsDoc.data()?.selectedCalendarIds || ['primary'];

    const upcomingWindows = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateParts = formatter.formatToParts(date);
      const dYear = dateParts.find(p => p.type === 'year')?.value;
      const dMonth = dateParts.find(p => p.type === 'month')?.value;
      const dDay = dateParts.find(p => p.type === 'day')?.value;
      const dateStr = `${dYear}-${dMonth}-${dDay}`;
      
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
      projects: (projectsArray as { id: string; name: string }[]).map(p => ({ id: p.id, name: p.name })),
      labels: (labelsArray as { id: string; name: string }[]).map(l => ({ id: l.id, name: l.name })),
      windowMappings: (mappingsArray as { pattern: string; projectId: string }[]).map(m => ({
        pattern: m.pattern,
        projectId: m.projectId,
        projectName: (projectsArray as { id: string; name: string }[]).find(p => p.id === m.projectId)?.name || '',
      })),
      upcomingWindows,
    };

    const result = await groqProvider.parseTaskInput(input, context);

    await adminDb.collection('users').doc(uid).collection('aiLogs').add({
      input,
      context: {
        currentDate,
        currentTime,
        projectsCount: projectsArray.length,
        labelsCount: labelsArray.length,
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
