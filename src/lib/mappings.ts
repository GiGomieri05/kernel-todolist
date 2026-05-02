import { adminDb } from '@/lib/firebase/admin';
import { WindowMapping } from '@/types';

export async function getWindowMappings(uid: string): Promise<WindowMapping[]> {
  const doc = await adminDb.collection('users').doc(uid).collection('preferences').doc('windowMappings').get();
  
  if (!doc.exists) {
    return [];
  }

  const data = doc.data();
  return data?.mappings || [];
}

export async function saveWindowMappings(uid: string, mappings: WindowMapping[]): Promise<void> {
  await adminDb.collection('users').doc(uid).collection('preferences').doc('windowMappings').set({
    mappings,
    updatedAt: new Date(),
  });
}

export function matchWindowToProject(
  windowTitle: string,
  mappings: WindowMapping[]
): WindowMapping | null {
  const sortedMappings = [...mappings].sort((a, b) => a.order - b.order);

  for (const mapping of sortedMappings) {
    switch (mapping.matchType) {
      case 'exact':
        if (windowTitle === mapping.pattern) return mapping;
        break;
      case 'startsWith':
        if (windowTitle.startsWith(mapping.pattern)) return mapping;
        break;
      case 'contains':
        if (windowTitle.includes(mapping.pattern)) return mapping;
        break;
      case 'regex':
        try {
          const regex = new RegExp(mapping.pattern, 'i');
          if (regex.test(windowTitle)) return mapping;
        } catch {
          continue;
        }
        break;
    }
  }

  return null;
}
