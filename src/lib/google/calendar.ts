import 'server-only';
import { google } from 'googleapis';
import { getAuthorizedClient } from './client';
import { CalendarEvent, Calendar } from '@/types';
import { adminDb } from '@/lib/firebase/admin';

export async function listCalendars(uid: string): Promise<Calendar[]> {
  const auth = await getAuthorizedClient(uid);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.calendarList.list();

  return (response.data.items || []).map((cal) => ({
    id: cal.id || '',
    summary: cal.summary || '',
    primary: cal.primary || false,
    backgroundColor: cal.backgroundColor || undefined,
  }));
}

export async function listEvents(
  uid: string,
  {
    timeMin,
    timeMax,
    calendarId = 'primary',
  }: {
    timeMin: string;
    timeMax: string;
    calendarId?: string;
  }
): Promise<CalendarEvent[]> {
  const auth = await getAuthorizedClient(uid);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const calList = await listCalendars(uid);
  const calInfo = calList.find((c) => c.id === calendarId);

  return (response.data.items || []).map((event) => {
    const start = event.start?.dateTime || event.start?.date;
    const end = event.end?.dateTime || event.end?.date;
    const isAllDay = !event.start?.dateTime;

    return {
      id: event.id || '',
      calendarId,
      calendarName: calInfo?.summary || calendarId,
      title: event.summary || '(Sem título)',
      start: new Date(start || ''),
      end: new Date(end || ''),
      isAllDay,
      recurringEventId: event.recurringEventId || undefined,
      location: event.location || undefined,
      description: event.description || undefined,
    };
  });
}

const CACHE_TTL = 10 * 60 * 1000;

export async function getEventsForDay(
  uid: string,
  date: string,
  calendarIds: string[]
): Promise<{ events: CalendarEvent[]; cached: boolean; cachedAt?: Date }> {
  const cacheRef = adminDb.collection('users').doc(uid).collection('calendarCache').doc(date);
  const cacheDoc = await cacheRef.get();

  if (cacheDoc.exists) {
    const data = cacheDoc.data();
    const cachedAt = data?.cachedAt?.toDate();
    if (cachedAt && Date.now() - cachedAt.getTime() < CACHE_TTL) {
      return {
        events: data?.events || [],
        cached: true,
        cachedAt,
      };
    }
  }

  const [year, month, day] = date.split('-').map(Number);
  const timeMin = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
  const timeMax = new Date(Date.UTC(year, month - 1, day, 23, 59, 59)).toISOString();

  let allEvents: CalendarEvent[] = [];

  for (const calendarId of calendarIds) {
    try {
      const events = await listEvents(uid, { timeMin, timeMax, calendarId });
      allEvents = allEvents.concat(events);
    } catch (error) {
      console.error(`Erro ao buscar eventos do calendário ${calendarId}:`, error);
    }
  }

  allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

  await cacheRef.set({
    events: allEvents,
    cachedAt: new Date(),
  });

  return { events: allEvents, cached: false };
}

export async function invalidateCache(uid: string, dateRange?: { start: string; end: string }) {
  if (dateRange) {
    const { start, end } = dateRange;
    const startDate = new Date(start);
    const endDate = new Date(end);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      await adminDb.collection('users').doc(uid).collection('calendarCache').doc(dateStr).delete();
    }
  } else {
    const cacheRef = adminDb.collection('users').doc(uid).collection('calendarCache');
    const snapshot = await cacheRef.get();
    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}
