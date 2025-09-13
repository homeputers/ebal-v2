import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface PlanItem {
  id: string;
  type: 'song' | 'reading' | 'note';
  refId?: string;
  content?: string;
  notes?: string;
}

const itemSchema = z.object({
  type: z.enum(['song', 'reading', 'note']),
  refId: z.string().optional(),
  content: z.string().optional(),
});

const sampleArrangements = [
  { id: 'a1', title: 'Amazing Grace (G)' },
  { id: 'a2', title: '10,000 Reasons (D)' },
];

type ItemFormValues = z.infer<typeof itemSchema>;

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<PlanItem[]>([]);
  const { register, handleSubmit, watch, reset } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { type: 'song', refId: '', content: '' },
  });

  const type = watch('type');

  const onAdd = (data: ItemFormValues) => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: data.type, refId: data.refId, content: data.content, notes: '' },
    ]);
    reset({ type: 'song', refId: '', content: '' });
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

  const updateNotes = (id: string, notes: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, notes } : i)));
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Service Plan {id}</h1>
      <ul className="space-y-2">
        {items.map((item, idx) => {
          let label = '';
          if (item.type === 'song') {
            const arr = sampleArrangements.find((a) => a.id === item.refId);
            label = arr ? arr.title : 'Song';
          } else {
            label = item.content || item.type;
          }
          return (
            <li key={item.id} className="border p-2 rounded space-y-1">
              <div className="flex justify-between items-center">
                <div>{label}</div>
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
              <div>
                <label className="block text-sm mb-1">Notes</label>
                <input
                  value={item.notes || ''}
                  onChange={(e) => updateNotes(item.id, e.target.value)}
                  className="border p-1 rounded w-full"
                />
              </div>
            </li>
          );
        })}
        {items.length === 0 && <li>No items</li>}
      </ul>

      <form onSubmit={handleSubmit(onAdd)} className="grid gap-2 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className="block mb-1">
            Type
          </label>
          <select id="type" {...register('type')} className="border p-2 rounded w-full">
            <option value="song">Song</option>
            <option value="reading">Reading</option>
            <option value="note">Note</option>
          </select>
        </div>
        {type === 'song' && (
          <div>
            <label htmlFor="refId" className="block mb-1">
              Arrangement
            </label>
            <select id="refId" {...register('refId')} className="border p-2 rounded w-full">
              <option value="">Select arrangement</option>
              {sampleArrangements.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {type !== 'song' && (
          <div className="sm:col-span-2">
            <label htmlFor="content" className="block mb-1">
              {type === 'reading' ? 'Reading' : 'Note'}
            </label>
            <input id="content" {...register('content')} className="border p-2 rounded w-full" />
          </div>
        )}
        <div className="sm:col-span-3 flex justify-end">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Add Item
          </button>
        </div>
      </form>
      <div className="flex justify-end">
        <Link to="/services" className="px-4 py-2 rounded border">
          Back
        </Link>
      </div>
    </div>
  );
}
