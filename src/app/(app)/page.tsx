'use client';

import { useEffect, useState } from 'react';
import { useCalendarEvents } from '@/hooks/useCalendar';
import { useTodoistTasks } from '@/hooks/useTodoist';
import { useWindowMappings } from '@/hooks/useMappings';
import { DayHeader } from '@/components/timeline/DayHeader';
import { WindowCard } from '@/components/timeline/WindowCard';
import { TaskItem } from '@/components/timeline/TaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { assembleTimelineForDay, TimelineData } from '@/lib/timeline';

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [now, setNow] = useState<Date>(new Date());
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  
  useEffect(() => {
    const today = new Date();
    const spDate = new Date(today.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    setCurrentDate(spDate.toISOString().split('T')[0]);
    setNow(spDate);
    
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const { events, loading: loadingEvents, error: eventsError } = useCalendarEvents(currentDate);
  const { tasksWithDate, loading: loadingTasks, error: tasksError } = useTodoistTasks(currentDate);
  const { mappings, loading: loadingMappings } = useWindowMappings();

  useEffect(() => {
    if (events && tasksWithDate && mappings) {
      const assembled = assembleTimelineForDay(events, mappings, tasksWithDate, now);
      setTimeline(assembled);
    }
  }, [events, tasksWithDate, mappings, now]);

  const loading = loadingEvents || loadingTasks || loadingMappings;
  const error = eventsError || tasksError;

  return (
    <div className="space-y-6">
      <DayHeader date={currentDate} onDateChange={setCurrentDate} />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full bg-zinc-800" />
          <Skeleton className="h-32 w-full bg-zinc-800" />
          <Skeleton className="h-32 w-full bg-zinc-800" />
        </div>
      ) : error ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <p className="text-zinc-400">Erro ao carregar dados: {error}</p>
          </CardContent>
        </Card>
      ) : timeline ? (
        <div className="space-y-4">
          {timeline.windows.map((window) => (
            <WindowCard
              key={window.window.id}
              window={window.window}
              mapping={window.mapping}
              tasksWithTime={window.tasksWithTime}
              tasksFloating={window.tasksFloating}
              status={window.status}
              now={now}
            />
          ))}
          
          {timeline.tasksOrphan.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800 border-dashed">
              <CardHeader>
                <CardTitle className="text-zinc-100 text-base">Tarefas sem janela</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeline.tasksOrphan.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <p className="text-zinc-400">Nenhuma janela encontrada para hoje.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
