import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Service {
  id: string;
  startsAt: string;
  location: string;
}

const serviceSchema = z.object({
  startsAt: z.string().min(1, 'Start time is required'),
  location: z.string().min(1, 'Location is required'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { startsAt: '', location: '' },
  });

  useEffect(() => {
    if (editing) {
      reset({ startsAt: editing.startsAt, location: editing.location });
    } else {
      reset({ startsAt: '', location: '' });
    }
  }, [editing, reset]);

  const openDialog = (service: Service | null) => {
    setEditing(service);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const onSubmit = (data: ServiceFormValues) => {
    if (editing) {
      setServices((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s)),
      );
    } else {
      setServices((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
    }
    closeDialog();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => openDialog(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Service
        </button>
      </div>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Start</th>
            <th className="p-2">Location</th>
            <th className="p-2" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-t">
              <td className="p-2">
                <Link
                  to={`/services/${service.id}`}
                  className="text-blue-600 underline"
                >
                  {new Date(service.startsAt).toLocaleString()}
                </Link>
              </td>
              <td className="p-2">{service.location}</td>
              <td className="p-2 text-right">
                <button
                  onClick={() => openDialog(service)}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {services.length === 0 && (
            <tr>
              <td className="p-2" colSpan={3}>
                No services found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <dialog ref={dialogRef} className="p-0 rounded max-w-md w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <h2 className="text-lg font-bold">
            {editing ? 'Edit Service' : 'Add Service'}
          </h2>
          <div>
            <label htmlFor="startsAt" className="block mb-1">
              Start Time
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              {...register('startsAt')}
              className="border p-2 rounded w-full"
            />
            {errors.startsAt && (
              <p role="alert" className="text-red-600 text-sm">
                {errors.startsAt.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="location" className="block mb-1">
              Location
            </label>
            <input
              id="location"
              {...register('location')}
              className="border p-2 rounded w-full"
            />
            {errors.location && (
              <p role="alert" className="text-red-600 text-sm">
                {errors.location.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

