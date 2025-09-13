export const API_URL = import.meta.env.VITE_API_URL as string;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json() as Promise<T>;
}
