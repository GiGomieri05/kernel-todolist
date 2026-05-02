const TODOIST_API_URL = 'https://api.todoist.com/rest/v2';
const TODOIST_TOKEN = process.env.TODOIST_API_TOKEN;

export async function todoistFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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
    if (res.status === 401) {
      throw new Error('Token do Todoist inválido');
    }
    if (res.status === 429) {
      throw new Error('Rate limit atingido');
    }
    throw new Error(`Erro Todoist: ${res.status}`);
  }

  return res.json();
}
