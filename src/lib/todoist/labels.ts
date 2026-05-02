import { todoistFetch } from './client';
import { TodoistLabel } from '@/types';

export async function getLabels(): Promise<TodoistLabel[]> {
  return todoistFetch<TodoistLabel[]>('/labels');
}
