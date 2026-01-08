"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { Input } from "@/components/ui/Input";

export default function EventsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["events", q, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/events?q=${encodeURIComponent(q)}&page=${page}&pageSize=20`
      );
      if (!res.ok) throw new Error("Failed to load events");
      return res.json();
    },
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="muted text-sm">All experiences, one place</p>
          <h1 className="text-3xl font-black">Events</h1>
        </div>
        <Link href="/events/new" className="neo-btn neo-btn--primary">
          Create Event
        </Link>
      </div>
      <div className="neo-card neo-shadow">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search events"
          />
          <div className="flex gap-2">
            <button className="neo-btn" onClick={() => setQ("")}>
              Clear
            </button>
            <Link href="/events/new" className="neo-btn">
              New
            </Link>
          </div>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonEventCard key={i} />
            ))}
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {data.items.map((ev) => (
              <li key={ev.id}>
                <EventCard ev={ev} />
              </li>
            ))}
          </ul>
        )}
        {data && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              className="neo-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="font-bold">
              Page {page} / {totalPages}
            </div>
            <button
              className="neo-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
