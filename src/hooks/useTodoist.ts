'use client';

import useSWR from 'swr';
import { TodoistProject, TodoistLabel, TodoistTask } from '@/types';

interface ProjectsResponse {
  projects: TodoistProject[];
}

interface LabelsResponse {
  labels: TodoistLabel[];
}

interface TasksResponse {
  withDate: TodoistTask[];
  withoutDate: TodoistTask[];
  date: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao buscar dados');
  }
  return res.json();
};

export function useTodoistProjects() {
  const { data, error, isLoading, mutate } = useSWR<ProjectsResponse>(
    '/api/todoist/projects',
    fetcher
  );

  return {
    projects: data?.projects || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

export function useTodoistLabels() {
  const { data, error, isLoading, mutate } = useSWR<LabelsResponse>(
    '/api/todoist/labels',
    fetcher
  );

  return {
    labels: data?.labels || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

export function useTodoistTasks(date: string) {
  const { data, error, isLoading, mutate } = useSWR<TasksResponse>(
    date ? `/api/todoist/tasks?date=${date}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    tasksWithDate: data?.withDate || [],
    tasksWithoutDate: data?.withoutDate || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}
