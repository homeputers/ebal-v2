import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

interface Member {
  id: string;
  displayName: string;
}

const allMembers: Member[] = [
  { id: '1', displayName: 'Alice' },
  { id: '2', displayName: 'Bob' },
  { id: '3', displayName: 'Charlie' },
  { id: '4', displayName: 'Dana' },
];

const groupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState({
    id: id ?? crypto.randomUUID(),
    name: '',
    memberIds: [] as string[],
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: group.name },
  });
  const [leftSel, setLeftSel] = useState<string[]>([]);
  const [rightSel, setRightSel] = useState<string[]>([]);

  const available = allMembers.filter((m) => !group.memberIds.includes(m.id));
  const selected = allMembers.filter((m) => group.memberIds.includes(m.id));

  const addMembers = () => {
    setGroup((g) => ({ ...g, memberIds: [...g.memberIds, ...leftSel] }));
    setLeftSel([]);
  };

  const removeMembers = () => {
    setGroup((g) => ({ ...g, memberIds: g.memberIds.filter((id) => !rightSel.includes(id)) }));
    setRightSel([]);
  };

  const onSubmit = (data: GroupFormValues) => {
    setGroup((g) => ({ ...g, name: data.name }));
    alert('Group saved');
    navigate('/groups');
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Edit Group</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">
            Name
          </label>
          <input
            id="name"
            {...register('name')}
            className="border p-2 rounded w-full"
          />
          {errors.name && (
            <p role="alert" className="text-red-600 text-sm">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block mb-1">Available Members</label>
            <select
              multiple
              size={8}
              value={leftSel}
              onChange={(e) =>
                setLeftSel(Array.from(e.target.selectedOptions, (o) => o.value))
              }
              className="border p-2 rounded w-full"
            >
              {available.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            <button
              type="button"
              onClick={addMembers}
              className="px-2 py-1 border rounded"
              aria-label="Add"
            >
              &gt;
            </button>
            <button
              type="button"
              onClick={removeMembers}
              className="px-2 py-1 border rounded"
              aria-label="Remove"
            >
              &lt;
            </button>
          </div>
          <div>
            <label className="block mb-1">Group Members</label>
            <select
              multiple
              size={8}
              value={rightSel}
              onChange={(e) =>
                setRightSel(Array.from(e.target.selectedOptions, (o) => o.value))
              }
              className="border p-2 rounded w-full"
            >
              {selected.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Link to="/groups" className="px-4 py-2 rounded border">
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
    </div>
  );
}
