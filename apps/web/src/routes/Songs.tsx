import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Song {
  id: string;
  title: string;
  tags: string[];
}

const sampleSongs: Song[] = [
  { id: '1', title: 'Amazing Grace', tags: ['hymn', 'grace'] },
  { id: '2', title: 'Blessed Be Your Name', tags: ['praise'] },
  { id: '3', title: '10,000 Reasons', tags: ['worship', 'praise'] },
];

export default function Songs() {
  const [songs] = useState<Song[]>(sampleSongs);
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const uniqueTags = Array.from(new Set(songs.flatMap((s) => s.tags)));

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filtered = songs.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchesTags = activeTags.every((t) => s.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search songs"
          aria-label="Search songs by title"
          className="border p-2 rounded"
        />
        <Link
          to="/songs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Song
        </Link>
      </div>
      <div className="flex gap-2 flex-wrap">
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-2 py-1 border rounded-full text-sm ${
              activeTags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-white'
            }`}
            aria-pressed={activeTags.includes(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Title</th>
            <th className="p-2">Tags</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((song) => (
            <tr key={song.id} className="border-t">
              <td className="p-2">
                <Link
                  to={`/songs/${song.id}`}
                  className="text-blue-600 underline"
                >
                  {song.title}
                </Link>
              </td>
              <td className="p-2">{song.tags.join(', ')}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td className="p-2" colSpan={2}>
                No songs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

