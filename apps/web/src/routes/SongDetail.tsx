import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Song {
  id: string;
  title: string;
  ccli?: string;
  defaultKey?: string;
  tags: string[];
}

interface Arrangement {
  id: string;
  key: string;
  bpm?: number;
  meter?: string;
  lyricsChordPro?: string;
}

const songSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  ccli: z.string().optional(),
  defaultKey: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const arrangementSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  bpm: z.number().min(30).max(300).optional(),
  meter: z.string().optional(),
  lyricsChordPro: z.string().optional(),
});

type SongFormValues = z.infer<typeof songSchema>;
type ArrangementFormValues = z.infer<typeof arrangementSchema>;

const tagOptions = ['praise', 'worship', 'hymn', 'grace'];

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song>({
    id: id ?? crypto.randomUUID(),
    title: '',
    ccli: '',
    defaultKey: '',
    tags: [],
  });
  const [arrangements, setArrangements] = useState<Arrangement[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: song,
  });

  const {
    register: registerArr,
    handleSubmit: handleArrSubmit,
    reset: resetArr,
    formState: { errors: arrErrors },
  } = useForm<ArrangementFormValues>({
    resolver: zodResolver(arrangementSchema),
    defaultValues: { key: '', bpm: undefined, meter: '', lyricsChordPro: '' },
  });

  const onSubmit = (data: SongFormValues) => {
    setSong((prev) => ({ ...prev, ...data }));
    alert('Song saved');
    navigate('/songs');
  };

  const onAddArrangement = (data: ArrangementFormValues) => {
    setArrangements((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
    resetArr();
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Song Details</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">
            Title
          </label>
          <input
            id="title"
            {...register('title')}
            className="border p-2 rounded w-full"
          />
          {errors.title && (
            <p role="alert" className="text-red-600 text-sm">
              {errors.title.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="ccli" className="block mb-1">
            CCLI
          </label>
          <input
            id="ccli"
            {...register('ccli')}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="defaultKey" className="block mb-1">
            Default Key
          </label>
          <input
            id="defaultKey"
            {...register('defaultKey')}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block mb-1">
            Tags
          </label>
          <select
            id="tags"
            multiple
            {...register('tags')}
            className="border p-2 rounded w-full h-32"
          >
            {tagOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Link to="/songs" className="px-4 py-2 rounded border">
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </form>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Arrangements</h2>
        <ul className="space-y-2">
          {arrangements.map((arr) => (
            <li key={arr.id} className="border p-2 rounded">
              <div>Key: {arr.key}</div>
              {arr.bpm && <div>BPM: {arr.bpm}</div>}
              {arr.meter && <div>Meter: {arr.meter}</div>}
            </li>
          ))}
          {arrangements.length === 0 && <li>No arrangements</li>}
        </ul>
        <form
          onSubmit={handleArrSubmit(onAddArrangement)}
          className="grid gap-2 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label htmlFor="arr-key" className="block mb-1">
              Key
            </label>
            <input
              id="arr-key"
              {...registerArr('key')}
              className="border p-2 rounded w-full"
            />
            {arrErrors.key && (
              <p role="alert" className="text-red-600 text-sm">
                {arrErrors.key.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="arr-bpm" className="block mb-1">
              BPM
            </label>
            <input
              id="arr-bpm"
              type="number"
              {...registerArr('bpm', { valueAsNumber: true })}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="arr-meter" className="block mb-1">
              Meter
            </label>
            <input
              id="arr-meter"
              {...registerArr('meter')}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="arr-lyrics" className="block mb-1">
              Lyrics (ChordPro)
            </label>
            <textarea
              id="arr-lyrics"
              {...registerArr('lyricsChordPro')}
              className="border p-2 rounded w-full h-24"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add Arrangement
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
