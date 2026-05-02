'use client';

import { format } from 'date-fns';
import { TodoistTask } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskItemProps {
  task: TodoistTask;
  showTime?: boolean;
  onComplete?: (taskId: string) => void;
}

const priorityConfig = {
  4: { label: 'p1', color: 'bg-red-500 text-white' },
  3: { label: 'p2', color: 'bg-orange-500 text-white' },
  2: { label: 'p3', color: 'bg-blue-500 text-white' },
  1: { label: 'p4', color: 'bg-zinc-600 text-zinc-300' },
};

export function TaskItem({ task, showTime, onComplete }: TaskItemProps) {
  const priority = priorityConfig[task.priority];
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete(task.id);
    }
  };
  
  return (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-zinc-800/50 group">
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={handleComplete}
        className="mt-0.5"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {showTime && task.due?.datetime && (
            <span className="font-mono text-xs text-zinc-500">
              {format(new Date(task.due.datetime), 'HH:mm')}
            </span>
          )}
          
          <span className={`text-sm ${task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
            {task.content}
          </span>
          
          <Badge className={`text-xs ${priority.color}`}>
            {priority.label}
          </Badge>
        </div>
        
        {task.labels.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {task.labels.map((label) => (
              <span key={label} className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
