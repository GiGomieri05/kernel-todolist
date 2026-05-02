'use client';

import useSWR from 'swr';
import { CalendarEvent } from '@/types';

interface CalendarEventsResponse {
  events: CalendarEvent[];
  date: string;
  cached: boolean;
  cachedAt?: string;
}

const fetcher = async (url: string): Promise<CalendarEventsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao buscar eventos');
  }
  return res.json();
};

export function useCalendarEvents(date: string) {
  const { data, error, isLoading, mutate } = useSWR<CalendarEventsResponse>(
    date ? `/api/calendar/events?date=${date}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    events: data?.events || [],
    loading: isLoading,
    error: error?.message || null,
    cached: data?.cached || false,
    cachedAt: data?.cachedAt,
    refetch: mutate,
  };
}
