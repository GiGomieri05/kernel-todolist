import { todoistFetch } from './client';
import { TodoistTask } from '@/types';

export async function getTasks(filter?: { projectId?: string; label?: string }): Promise<TodoistTask[]> {
  const params = new URLSearchParams();
  if (filter?.projectId) params.append('project_id', filter.projectId);
  if (filter?.label) params.append('label', filter.label);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return todoistFetch<TodoistTask[]>(`/tasks${query}`);
}

export async function createTask(payload: {
  content: string;
  description?: string;
  projectId?: string;
  labels?: string[];
  priority?: number;
  dueDate?: string;
  dueDatetime?: string;
}): Promise<TodoistTask> {
  const body: Record<string, unknown> = {
    content: payload.content,
    description: payload.description || '',
    project_id: payload.projectId,
    labels: payload.labels || [],
    priority: payload.priority || 1,
  };

  if (payload.dueDatetime) {
    body.due_datetime = payload.dueDatetime;
    body.due_lang = 'pt';
  } else if (payload.dueDate) {
    body.due_date = payload.dueDate;
    body.due_lang = 'pt';
  }

  return todoistFetch<TodoistTask>('/tasks', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateTask(
  taskId: string,
  payload: {
    content?: string;
    description?: string;
    labels?: string[];
    priority?: number;
    dueDate?: string;
    dueDatetime?: string;
  }
): Promise<TodoistTask> {
  const body: Record<string, unknown> = {};
  
  if (payload.content !== undefined) body.content = payload.content;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.labels !== undefined) body.labels = payload.labels;
  if (payload.priority !== undefined) body.priority = payload.priority;
  
  if (payload.dueDatetime) {
    body.due_datetime = payload.dueDatetime;
    body.due_lang = 'pt';
  } else if (payload.dueDate) {
    body.due_date = payload.dueDate;
    body.due_lang = 'pt';
  }

  return todoistFetch<TodoistTask>(`/tasks/${taskId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function closeTask(taskId: string): Promise<void> {
  await todoistFetch(`/tasks/${taskId}/close`, {
    method: 'POST',
  });
}
