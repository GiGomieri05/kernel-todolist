import { CalendarEvent, TodoistTask, WindowMapping } from '@/types';
import { matchWindowToProject } from './mappings';

type WindowStatus = 'past' | 'current' | 'future';

export function getWindowStatus(
  window: CalendarEvent,
  now: Date
): WindowStatus {
  const start = new Date(window.start);
  const end = new Date(window.end);
  
  if (end < now) return 'past';
  if (start <= now && end >= now) return 'current';
  return 'future';
}

export function getTimeUntil(start: Date, now: Date): string {
  const diff = start.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `em ${hours}h ${minutes}min`;
  }
  return `em ${minutes}min`;
}

export function getTimeRemaining(end: Date, now: Date): string {
  const diff = end.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `faltam ${hours}h ${minutes}min`;
  }
  return `faltam ${minutes}min`;
}

export interface TimelineWindow {
  window: CalendarEvent;
  mapping: WindowMapping | null;
  tasksWithTime: TodoistTask[];
  tasksFloating: TodoistTask[];
  status: WindowStatus;
}

export interface TimelineData {
  windows: TimelineWindow[];
  tasksOrphan: TodoistTask[];
}

export function assembleTimelineForDay(
  events: CalendarEvent[],
  mappings: WindowMapping[],
  tasks: TodoistTask[],
  now: Date
): TimelineData {
  const windows: TimelineWindow[] = events.map((event) => {
    const mapping = matchWindowToProject(event.title, mappings);
    
    const windowStart = new Date(event.start);
    const windowEnd = new Date(event.end);
    
    const tasksWithTime = tasks.filter((task) => {
      if (!task.due?.datetime) return false;
      const taskTime = new Date(task.due.datetime);
      return taskTime >= windowStart && taskTime <= windowEnd;
    });
    
    const tasksFloating = tasks.filter((task) => {
      if (task.due?.datetime) return false;
      if (task.projectId !== mapping?.projectId) return false;
      return !task.isCompleted;
    });
    
    return {
      window: event,
      mapping,
      tasksWithTime,
      tasksFloating,
      status: getWindowStatus(event, now),
    };
  });
  
  const mappedProjectIds = new Set(
    mappings.filter(m => m.projectId).map(m => m.projectId)
  );
  
  const tasksOrphan = tasks.filter((task) => {
    if (task.isCompleted) return false;
    if (!task.projectId) return true;
    return !mappedProjectIds.has(task.projectId);
  });
  
  return { windows, tasksOrphan };
}
