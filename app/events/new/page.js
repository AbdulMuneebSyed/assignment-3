"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  date: z.string(),
  capacity: z.coerce.number().int().min(1),
});

export default function NewEventPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, capacity: Number(values.capacity) }) });
    if (res.status === 401) {
      toast.error('Please login to create events');
      router.push('/login');
      return;
    }
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Failed to create');
    toast.success('Event created');
    router.push(`/events/${data.event.id}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-4">Create Event</h1>
      <form className="card space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="font-semibold">Title</label>
          <input className="mt-1 w-full border-4 border-ink rounded-xl p-2 bg-white" {...register('title')} />
          {errors.title && <p className="text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label className="font-semibold">Description</label>
          <textarea rows={4} className="mt-1 w-full border-4 border-ink rounded-xl p-2 bg-white" {...register('description')} />
          {errors.description && <p className="text-red-600">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Date & Time</label>
            <input type="datetime-local" className="mt-1 w-full border-4 border-ink rounded-xl p-2 bg-white" {...register('date')} />
            {errors.date && <p className="text-red-600">{errors.date.message}</p>}
          </div>
          <div>
            <label className="font-semibold">Capacity</label>
            <input type="number" className="mt-1 w-full border-4 border-ink rounded-xl p-2 bg-white" {...register('capacity', { valueAsNumber: true })} />
            {errors.capacity && <p className="text-red-600">{errors.capacity.message}</p>}
          </div>
        </div>
        <button disabled={isSubmitting} className="btn" type="submit">{isSubmitting ? 'Saving...' : 'Save Event'}</button>
      </form>
    </div>
  );
}
