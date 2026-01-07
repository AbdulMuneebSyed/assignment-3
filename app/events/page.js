"use client";
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function EventsPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['events', q, page],
    queryFn: async () => {
      const res = await fetch(`/api/events?q=${encodeURIComponent(q)}&page=${page}&pageSize=20`);
      if (!res.ok) throw new Error('Failed to load events');
      return res.json();
    },
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Events</h1>
        <Link href="/events/new" className="btn">Create Event</Link>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          <input value={q} onChange={(e)=>{setQ(e.target.value); setPage(1);}} placeholder="Search events" className="flex-1 border-4 border-ink rounded-xl p-2" />
        </div>
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 8 }).map((_,i)=> <div key={i} className="skeleton h-20" />)}
          </div>
        ) : (
          <ul className="grid gap-3">
            {data.items.map((ev) => (
              <li key={ev.id} className="rounded-2xl border-4 border-ink p-4 bg-white flex items-center justify-between">
                <div>
                  <Link href={`/events/${ev.id}`} className="font-bold text-xl">{ev.title}</Link>
                  <p className="text-ink/70">{new Date(ev.date).toLocaleString()} • {ev.registrations.length}/{ev.capacity} seats</p>
                </div>
                <Link href={`/events/${ev.id}`} className="btn">Open</Link>
              </li>
            ))}
          </ul>
        )}
        {data && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button className="btn" onClick={()=> setPage((p)=> Math.max(1, p-1))} disabled={page===1}>Prev</button>
            <div className="font-bold">Page {page} / {totalPages}</div>
            <button className="btn" onClick={()=> setPage((p)=> Math.min(totalPages, p+1))} disabled={page===totalPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
