import { todoistFetch } from './client';
import { TodoistTask } from '@/types';

interface PaginatedTasksResponse {
  results: TodoistTask[];
  next_cursor?: string;
}

export async function getTasks(filter?: { projectId?: string; label?: string }): Promise<TodoistTask[]> {
  const baseParams = new URLSearchParams();
  if (filter?.projectId) baseParams.append('project_id', filter.projectId);
  if (filter?.label) baseParams.append('label', filter.label);

  const allTasks: TodoistTask[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams(baseParams);
    if (cursor) {
      params.append('cursor', cursor);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await todoistFetch<PaginatedTasksResponse | TodoistTask[]>(`/tasks${query}`, {
      method: 'GET',
    });

    if (Array.isArray(response)) {
      allTasks.push(...response);
      cursor = undefined;
    } else {
      allTasks.push(...(response.results || []));
      cursor = response.next_cursor;
    }
  } while (cursor);

  return allTasks;
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
