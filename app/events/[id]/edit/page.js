"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  date: z.string(),
  capacity: z.coerce.number().int().min(1),
});

export default function EditEventPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(schema) });

  React.useEffect(()=>{
    if (data?.event) {
      const d = new Date(data.event.date);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
      reset({ title: data.event.title, description: data.event.description, date: local, capacity: data.event.capacity });
    }
  }, [data, reset]);

  async function onSubmit(values) {
    const res = await fetch(`/api/events/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, capacity: Number(values.capacity) }) });
    if (res.status === 401) {
      toast.error('Please login to edit events');
      router.push('/login');
      return;
    }
    const dataRes = await res.json();
    if (!res.ok) return toast.error(dataRes.error || 'Failed to update');
    toast.success('Event updated');
    router.push(`/events/${id}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-4">Edit Event</h1>
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
        <button disabled={isSubmitting} className="btn" type="submit">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
