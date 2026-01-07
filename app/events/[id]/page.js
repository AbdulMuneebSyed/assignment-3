"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error('Failed to load event');
      return res.json();
    },
  });

  const regMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/registrations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id })
      });
      if (res.status === 401) {
        router.push('/login');
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      return data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['event', id] });
      const prev = qc.getQueryData(['event', id]);
      if (prev?.event) {
        qc.setQueryData(['event', id], {
          ...prev,
          event: {
            ...prev.event,
            registrations: [...prev.event.registrations, { id: -1, userId: -1, eventId: id }],
          }
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['event', id], ctx.prev);
    },
    onSuccess: () => {
      toast.success('Registered');
      qc.invalidateQueries({ queryKey: ['event', id] });
    }
  });

  const unregMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/registrations', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id })
      });
      if (res.status === 401) {
        router.push('/login');
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      return data;
    },
    onSuccess: () => {
      toast.success('Unregistered');
      qc.invalidateQueries({ queryKey: ['event', id] });
    }
  });

  if (isLoading) return <div className="skeleton h-40" />;

  const ev = data.event;
  const filled = ev.registrations.length >= ev.capacity;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{ev.title}</h1>
        <Link className="btn" href={`/events/${id}/edit`}>Edit</Link>
      </div>
      <div className="card space-y-3">
        <div className="text-ink/80">{new Date(ev.date).toLocaleString()}</div>
        <p>{ev.description}</p>
        <div className="font-semibold">Capacity: {ev.registrations.length} / {ev.capacity}</div>
        <div className="flex gap-3">
          <button className="btn" disabled={filled} onClick={()=>regMutation.mutate()}>Register</button>
          <button className="btn" onClick={()=>unregMutation.mutate()}>Unregister</button>
        </div>
      </div>
      <section className="card">
        <h2 className="text-xl font-black mb-3">Attendees</h2>
        {ev.registrations.length === 0 ? (
          <div className="text-ink/70">No attendees yet.</div>
        ) : (
          <ul className="grid gap-2">
            {ev.registrations.map((r)=> (
              <li key={r.id} className="rounded-xl border-4 border-ink p-3 bg-white">{r.user?.name || 'User'}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
