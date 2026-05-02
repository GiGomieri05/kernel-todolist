const TODOIST_API_URL = 'https://api.todoist.com/api/v1';
const TODOIST_TOKEN = process.env.TODOIST_API_TOKEN;

// Debug: verificar se o token está configurado
if (!TODOIST_TOKEN) {
  console.error('TODOIST_API_TOKEN não está configurado no .env.local');
}

export async function todoistFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!TODOIST_TOKEN) {
    throw new Error('TODOIST_API_TOKEN não configurado');
  }

  const url = `${TODOIST_API_URL}${path}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TODOIST_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Todoist API Error ${res.status}:`, errorBody);
    
    if (res.status === 401) {
      throw new Error('Token do Todoist inválido');
    }
    if (res.status === 410) {
      throw new Error('Endpoint do Todoist descontinuado. Atualize a integração para API v1.');
    }
    if (res.status === 429) {
      throw new Error('Rate limit atingido');
    }
    throw new Error(`Erro Todoist: ${res.status} - ${errorBody}`);
  }

  return res.json();
}
