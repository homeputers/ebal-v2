import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface SetItem {
  id: string;
  arrangementId: string;
  transpose: number;
  capo: number;
}

interface Arrangement {
  id: string;
  songTitle: string;
  key: string;
}

const sampleArrangements: Arrangement[] = [
  { id: 'a1', songTitle: 'Amazing Grace', key: 'G' },
  { id: 'a2', songTitle: '10,000 Reasons', key: 'D' },
];

const itemSchema = z.object({
  arrangementId: z.string().min(1, 'Arrangement is required'),
  transpose: z.number().int(),
  capo: z.number().int(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

function transposeKey(key: string, steps: number) {
  const idx = keys.indexOf(key);
  if (idx === -1) return key;
  let newIndex = (idx + steps) % keys.length;
  if (newIndex < 0) newIndex += keys.length;
  return keys[newIndex];
}

export default function SongSetDetail() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<SetItem[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { arrangementId: '', transpose: 0, capo: 0 },
  });

  const onAddItem = (data: ItemFormValues) => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
    reset({ arrangementId: '', transpose: 0, capo: 0 });
  };

  const moveItem = (index: number, delta: number) => {
    setItems((prev) => {
      const arr = [...prev];
      const target = index + delta;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Edit Set {id}</h1>
      <ul className="space-y-2">
        {items.map((item, idx) => {
          const arrangement = sampleArrangements.find((a) => a.id === item.arrangementId);
          const previewKey = arrangement
            ? transposeKey(arrangement.key, item.transpose)
            : '';
          return (
            <li key={item.id} className="border p-2 rounded space-y-1">
              <div className="flex justify-between items-center">
                <div>
                  {arrangement
                    ? `${arrangement.songTitle} (${arrangement.key})`
                    : 'Unknown'}
                  {previewKey && (
                    <span className="ml-2 text-sm text-gray-600">
                      → {previewKey}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, -1)}
                    className="px-2 py-1 border rounded"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 1)}
                    className="px-2 py-1 border rounded"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <div className="flex gap-2 items-center text-sm">
                <span>Transpose: {item.transpose}</span>
                <span>Capo: {item.capo}</span>
              </div>
            </li>
          );
        })}
        {items.length === 0 && <li>No items</li>}
      </ul>

      <form onSubmit={handleSubmit(onAddItem)} className="grid gap-2 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="arrangement" className="block mb-1">
            Arrangement
          </label>
          <select
            id="arrangement"
            {...register('arrangementId')}
            className="border p-2 rounded w-full"
          >
            <option value="">Select arrangement</option>
            {sampleArrangements.map((a) => (
              <option key={a.id} value={a.id}>
                {a.songTitle} ({a.key})
              </option>
            ))}
          </select>
          {errors.arrangementId && (
            <p role="alert" className="text-red-600 text-sm">
              {errors.arrangementId.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="transpose" className="block mb-1">
            Transpose
          </label>
          <input
            id="transpose"
            type="number"
            {...register('transpose', { valueAsNumber: true })}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="capo" className="block mb-1">
            Capo
          </label>
          <input
            id="capo"
            type="number"
            {...register('capo', { valueAsNumber: true })}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="sm:col-span-4 flex justify-end">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Add Item
          </button>
        </div>
      </form>
      <div className="flex justify-end">
        <Link to="/song-sets" className="px-4 py-2 rounded border">
          Back
        </Link>
      </div>
    </div>
  );
}
