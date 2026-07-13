const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function getApiUrl(path: string): string {
  let base = API_BASE.trim();
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  let cleanPath = path.trim();
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  if (base.endsWith('/api/v1') && cleanPath.startsWith('/api/v1/')) {
    cleanPath = cleanPath.substring(7);
    if (!cleanPath.startsWith('/')) {
      cleanPath = `/${cleanPath}`;
    }
  }
  return `${base}${cleanPath}`;
}

export async function fetchCards() {
  const res = await fetch(getApiUrl('/api/v1/cards'), {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch cards');
  return res.json();
}

export async function fetchCard(slug: string) {
  const res = await fetch(getApiUrl(`/api/v1/cards/${slug}`), {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function saveDraw(body: unknown) {
  const res = await fetch(getApiUrl('/api/v1/draws'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to save draw');
  return res.json();
}

export async function fetchDraws() {
  const res = await fetch(getApiUrl('/api/v1/draws'), {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch draws');
  return res.json();
}

export async function deleteDraw(id: string) {
  const res = await fetch(getApiUrl(`/api/v1/draws/${id}`), {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete draw');
  return res.json();
}
