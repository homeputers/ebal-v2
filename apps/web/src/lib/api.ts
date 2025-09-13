export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function apiFetch(path: string) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
}
