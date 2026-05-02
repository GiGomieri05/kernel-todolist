import { todoistFetch } from './client';
import { TodoistProject } from '@/types';

export async function getProjects(): Promise<TodoistProject[]> {
  return todoistFetch<TodoistProject[]>('/projects');
}
