import { adminDb } from '@/lib/firebase/admin';
import { getProjects } from './projects';
import { getLabels } from './labels';
import { getTasks } from './tasks';
import { TodoistProject, TodoistLabel, TodoistTask } from '@/types';

const PROJECTS_TTL = 60 * 60 * 1000;
const LABELS_TTL = 60 * 60 * 1000;
const TASKS_TTL = 5 * 60 * 1000;

export async function getCachedProjects(uid: string): Promise<TodoistProject[]> {
  const cacheRef = adminDb.collection('users').doc(uid).collection('todoistCache').doc('projects');
  const cacheDoc = await cacheRef.get();

  if (cacheDoc.exists) {
    const data = cacheDoc.data();
    const cachedAt = data?.cachedAt?.toDate();
    if (cachedAt && Date.now() - cachedAt.getTime() < PROJECTS_TTL) {
      return data?.projects || [];
    }
  }

  const projects = await getProjects();
  await cacheRef.set({ projects, cachedAt: new Date() });
  return projects;
}

export async function getCachedLabels(uid: string): Promise<TodoistLabel[]> {
  const cacheRef = adminDb.collection('users').doc(uid).collection('todoistCache').doc('labels');
  const cacheDoc = await cacheRef.get();

  if (cacheDoc.exists) {
    const data = cacheDoc.data();
    const cachedAt = data?.cachedAt?.toDate();
    if (cachedAt && Date.now() - cachedAt.getTime() < LABELS_TTL) {
      return data?.labels || [];
    }
  }

  const labels = await getLabels();
  await cacheRef.set({ labels, cachedAt: new Date() });
  return labels;
}

export async function getCachedTasksForDate(uid: string, date: string): Promise<{
  withDate: TodoistTask[];
  withoutDate: TodoistTask[];
}> {
  const cacheRef = adminDb.collection('users').doc(uid).collection('todoistCache').doc(`tasks-${date}`);
  const cacheDoc = await cacheRef.get();

  if (cacheDoc.exists) {
    const data = cacheDoc.data();
    const cachedAt = data?.cachedAt?.toDate();
    if (cachedAt && Date.now() - cachedAt.getTime() < TASKS_TTL) {
      return {
        withDate: data?.withDate || [],
        withoutDate: data?.withoutDate || [],
      };
    }
  }

  const allTasks = await getTasks();
  
  const withDate = allTasks.filter(t => t.due?.date === date);
  const withoutDate = allTasks.filter(t => !t.due?.date && !t.isCompleted);

  await cacheRef.set({ withDate, withoutDate, cachedAt: new Date() });
  
  return { withDate, withoutDate };
}

export async function invalidateTodoistCache(uid: string, scope?: 'projects' | 'labels' | 'tasks') {
  const cacheRef = adminDb.collection('users').doc(uid).collection('todoistCache');
  
  if (scope) {
    if (scope === 'tasks') {
      const snapshot = await cacheRef.get();
      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => {
        if (doc.id.startsWith('tasks-')) {
          batch.delete(doc.ref);
        }
      });
      await batch.commit();
    } else {
      await cacheRef.doc(scope).delete();
    }
  } else {
    const snapshot = await cacheRef.get();
    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}
