import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { components } from '../../api/types';
import {
  useService,
  useUpdateService,
  usePlanItems,
  useAddPlanItem,
  useUpdatePlanItem,
  useRemovePlanItem,
} from '../../features/services/hooks';
import ServiceForm from '../../features/services/ServiceForm';

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white p-4 rounded shadow max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

type ServiceRequest = components['schemas']['ServiceRequest'];
type PlanItemRequest = components['schemas']['ServicePlanItemRequest'];

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { data: service, isLoading, isError } = useService(id);
  const { data: planItems, isLoading: planLoading } = usePlanItems(id);

  const updateServiceMut = useUpdateService();
  const addItemMut = useAddPlanItem(id!);
  const updateItemMut = useUpdatePlanItem(id!);
  const removeItemMut = useRemovePlanItem(id!);

  const [editingService, setEditingService] = useState(false);
  const [newItem, setNewItem] = useState<PlanItemRequest>({ type: 'note' });

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError || !service) return <div className="p-4">Failed to load</div>;

  const handleServiceUpdate = (vals: ServiceRequest) => {
    updateServiceMut.mutate({ id: id!, body: vals }, { onSuccess: () => setEditingService(false) });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addItemMut.mutate(
      { ...newItem, sortOrder: planItems ? planItems.length : 0 },
      { onSuccess: () => setNewItem({ type: 'note' }) },
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {service.startsAt ? new Date(service.startsAt).toLocaleString() : 'Service'}
          </h1>
          {service.location && <div>{service.location}</div>}
        </div>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 text-sm bg-gray-200 rounded"
            onClick={() => setEditingService(true)}
          >
            Edit
          </button>
          <Link
            to={`/services/${id}/print`}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
          >
            Print
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <h2 className="font-semibold mb-2">Add Item</h2>
          <form onSubmit={handleAddItem} className="space-y-2">
            <select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="song">Song</option>
              <option value="reading">Reading</option>
              <option value="note">Note</option>
            </select>
            {newItem.type === 'song' && (
              <input
                placeholder="Arrangement ID"
                value={newItem.refId || ''}
                onChange={(e) => setNewItem({ ...newItem, refId: e.target.value })}
                className="border p-2 rounded w-full"
              />
            )}
            <textarea
              placeholder="Notes"
              value={newItem.notes || ''}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Add
            </button>
          </form>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold mb-2">Plan</h2>
          {planLoading && <div>Loading…</div>}
          {!planLoading && planItems && planItems.length > 0 ? (
            <ul className="space-y-2">
              {planItems.map((item) => (
                <li key={item.id} className="border p-2 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold capitalize">{item.type}</span>
                    <button
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                      onClick={() => item.id && removeItemMut.mutate(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    defaultValue={item.notes || ''}
                    className="w-full border p-1 rounded"
                    onBlur={(e) =>
                      item.id &&
                      updateItemMut.mutate({ id: item.id, body: { notes: e.target.value } })
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            !planLoading && <div>No plan items</div>
          )}
        </div>
      </div>
      <Modal open={editingService} onClose={() => setEditingService(false)}>
        <h2 className="text-lg font-semibold mb-2">Edit Service</h2>
        <ServiceForm
          defaultValues={{
            startsAt: service.startsAt ? service.startsAt.slice(0, 16) : '',
            location: service.location || '',
          }}
          onSubmit={handleServiceUpdate}
          onCancel={() => setEditingService(false)}
        />
      </Modal>
    </div>
  );
}
