'use client';

import { format } from 'date-fns';
import { CalendarEvent, WindowMapping, TodoistTask } from '@/types';
import { getTimeRemaining, getTimeUntil } from '@/lib/timeline';

type WindowStatus = 'past' | 'current' | 'future';
import { Badge } from '@/components/ui/badge';
import { TaskItem } from './TaskItem';
import { AlertCircle } from 'lucide-react';

interface WindowCardProps {
  window: CalendarEvent;
  mapping: WindowMapping | null;
  tasksWithTime: TodoistTask[];
  tasksFloating: TodoistTask[];
  status: WindowStatus;
  now: Date;
  onCompleteTask?: (taskId: string) => void;
}

export function WindowCard({
  window,
  mapping,
  tasksWithTime,
  tasksFloating,
  status,
  now,
  onCompleteTask,
}: WindowCardProps) {
  const start = new Date(window.start);
  const end = new Date(window.end);
  
  const statusConfig = {
    past: {
      border: 'border-l-zinc-600',
      bg: 'bg-zinc-900/60',
      badge: 'Concluída',
      badgeColor: 'bg-zinc-700 text-zinc-400',
    },
    current: {
      border: 'border-l-indigo-500',
      bg: 'bg-zinc-900',
      badge: `Em andamento • ${getTimeRemaining(end, now)}`,
      badgeColor: 'bg-indigo-500/20 text-indigo-400',
    },
    future: {
      border: 'border-l-zinc-700',
      bg: 'bg-zinc-900',
      badge: `Próxima • ${getTimeUntil(start, now)}`,
      badgeColor: 'bg-zinc-700/50 text-zinc-400',
    },
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`rounded-lg border border-zinc-800 border-l-4 ${config.border} ${config.bg} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-indigo-400">
                {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
              </span>
              <Badge className={config.badgeColor}>
                {config.badge}
              </Badge>
            </div>
            <h3 className="text-base font-medium text-zinc-100 mt-1">{window.title}</h3>
            {mapping ? (
              <p className="text-sm text-zinc-500 mt-1">
                Projeto: {mapping.projectId}
              </p>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-500">Sem mapeamento</span>
                <button className="text-xs text-indigo-400 hover:underline">
                  Configurar
                </button>
              </div>
            )}
          </div>
        </div>
        
        {(tasksWithTime.length > 0 || tasksFloating.length > 0) && (
          <div className="mt-4 space-y-2">
            {tasksWithTime.map((task) => (
              <TaskItem key={task.id} task={task} showTime onComplete={onCompleteTask} />
            ))}
            {tasksFloating.map((task) => (
              <TaskItem key={task.id} task={task} onComplete={onCompleteTask} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
