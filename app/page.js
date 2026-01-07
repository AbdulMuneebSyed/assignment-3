"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [q, setQ] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events", q],
    queryFn: async () => {
      const res = await fetch(`/api/events?q=${encodeURIComponent(q)}&pageSize=5`);
      if (!res.ok) throw new Error("Failed to load events");
      return res.json();
    },
  });

  if (isError) {
    toast.error("Could not load events");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <Link href="/events" className="btn">View All</Link>
      </div>
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search events" className="flex-1 border-4 border-ink rounded-xl p-2" />
          <Link href="/events/new" className="btn">Create Event</Link>
        </div>
        {isLoading ? (
          <div className="grid gap-3">
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
          </div>
        ) : data?.items?.length ? (
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
        ) : (
          <div className="rounded-2xl border-4 border-dashed border-ink p-8 text-center text-ink/70">No events found</div>
        )}
      </div>
    </div>
  );
}
