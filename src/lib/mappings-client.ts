import { WindowMapping } from '@/types';

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
