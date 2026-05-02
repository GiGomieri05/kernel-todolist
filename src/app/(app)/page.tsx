'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCalendarEvents } from '@/hooks/useCalendar';
import { useTodoistTasks } from '@/hooks/useTodoist';
import { useWindowMappings } from '@/hooks/useMappings';
import { DayHeader } from '@/components/timeline/DayHeader';
import { WindowCard } from '@/components/timeline/WindowCard';
import { TaskItem } from '@/components/timeline/TaskItem';
import { TaskComposer } from '@/components/timeline/TaskComposer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { assembleTimelineForDay, TimelineData } from '@/lib/timeline';

function getSaoPauloDateString() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState<string>(getSaoPauloDateString);
  const [now, setNow] = useState<Date>(() => new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const { events, loading: loadingEvents, error: eventsError } = useCalendarEvents(currentDate);
  const { tasksWithDate, loading: loadingTasks, error: tasksError } = useTodoistTasks(currentDate);
  const { mappings, loading: loadingMappings, error: mappingsError } = useWindowMappings();

  // Debug logs
  useEffect(() => {
    if (eventsError) console.error('Calendar Error:', eventsError);
    if (tasksError) console.error('Tasks Error:', tasksError);
    if (mappingsError) console.error('Mappings Error:', mappingsError);
  }, [eventsError, tasksError, mappingsError]);

  const timeline = useMemo<TimelineData | null>(() => {
    if (!events || !tasksWithDate || !mappings) return null;
    return assembleTimelineForDay(events, mappings, tasksWithDate, now);
  }, [events, tasksWithDate, mappings, now]);

  const loading = loadingEvents || loadingTasks || loadingMappings;
  const error = eventsError || tasksError || mappingsError;

  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/todoist/tasks/${taskId}/close`, {
        method: 'POST',
      });
      if (res.ok) {
        // Refetch tasks
        window.location.reload();
      }
    } catch {
      console.error('Erro ao completar tarefa');
    }
  };

  return (
    <div className="space-y-6">
      <TaskComposer />
      <DayHeader date={currentDate} onDateChange={setCurrentDate} />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full bg-zinc-800" />
          <Skeleton className="h-32 w-full bg-zinc-800" />
          <Skeleton className="h-32 w-full bg-zinc-800" />
        </div>
      ) : error ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 space-y-2">
            <p className="text-zinc-400">Erro ao carregar dados:</p>
            <p className="text-red-400 text-sm font-mono">{error}</p>
            <p className="text-zinc-500 text-xs mt-4">
              Verifique o console do navegador (F12) para mais detalhes.<br/>
              Certifique-se de que o token do Todoist está configurado no .env.local
            </p>
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
              onCompleteTask={handleCompleteTask}
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
                    <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} />
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
