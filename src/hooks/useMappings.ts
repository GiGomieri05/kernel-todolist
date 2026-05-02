'use client';

import useSWR from 'swr';
import { WindowMapping } from '@/types';

interface MappingsResponse {
  mappings: WindowMapping[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao buscar mapeamentos');
  }
  return res.json();
};

export function useWindowMappings() {
  const { data, error, isLoading, mutate } = useSWR<MappingsResponse>(
    '/api/mappings',
    fetcher
  );

  const saveMappings = async (mappings: WindowMapping[]) => {
    const res = await fetch('/api/mappings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mappings }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao salvar mapeamentos');
    }
    
    await mutate();
    return true;
  };

  return {
    mappings: data?.mappings || [],
    loading: isLoading,
    error: error?.message || null,
    saveMappings,
    refetch: mutate,
  };
}
