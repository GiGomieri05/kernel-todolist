import 'server-only';
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
