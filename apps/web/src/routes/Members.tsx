import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function Members() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: () => apiFetch('/members'),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
