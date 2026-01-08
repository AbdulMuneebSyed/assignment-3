"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { Badge, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CapacityBar from "@/components/CapacityBar";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
];

export default function Home() {
  const [q, setQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [slide, setSlide] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data: heroData } = useQuery({
    queryKey: ["hero-events"],
    queryFn: async () => {
      const res = await fetch(`/api/events?page=1&pageSize=10`);
      if (!res.ok) throw new Error("Failed to load featured events");
      return res.json();
    },
  });

  // debounce the search term to reduce refetch thrash/flicker
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events", searchTerm, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/events?q=${encodeURIComponent(
          searchTerm
        )}&page=${page}&pageSize=${pageSize}`
      );
      if (!res.ok) throw new Error("Failed to load events");
      return res.json();
    },
  });

  const totalEvents = data?.total || 0;
  const seatCapacity =
    data?.items?.reduce((sum, ev) => sum + (ev.capacity || 0), 0) || 0;
  const filledSeats =
    data?.items?.reduce(
      (sum, ev) => sum + (ev.registrations?.length || 0),
      0
    ) || 0;
  const avgFill = seatCapacity
    ? Math.round((filledSeats / seatCapacity) * 100)
    : 0;
  const heroSlides = (heroData?.items || []).slice(0, 4);

  const featuredSlides = (
    heroSlides.length
      ? heroSlides
      : HERO_IMAGES.map((src, idx) => ({
          id: null,
          title: "Featured Event",
          description: "Handpicked sessions you should not miss.",
          src,
        }))
  )
    .slice(0, 4)
    .map((ev, idx) => ({
      id: ev.id,
      title: ev.title || "Featured Event",
      description:
        ev.description?.slice(0, 110) ||
        "Handpicked sessions you should not miss.",
      src:
        ev.src ||
        `https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=1400&q=80&sig=${
          ev.id || idx
        }`,
    }));

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const t = setInterval(() => {
      setSlide((s) => (s + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  if (isError) {
    toast.error("Could not load events");
  }

  return (
    <div className="space-y-12">
      <section className="relative bg-[var(--accent-1)] border-[6px] border-black rounded-[24px] p-6 sm:p-10 neo-shadow-hard overflow-hidden">
        {/* CHAOS ACCENTS LAYER */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* big slabs */}
          <div className="absolute -top-20 -left-24 h-52 w-52 bg-yellow-300 border-4 border-black rotate-6" />
          <div className="absolute -bottom-24 -right-28 h-64 w-64 bg-sky-300 border-4 border-black -rotate-6" />

          {/* secondary chaos */}
          <div className="absolute top-24 -right-16 h-32 w-32 bg-pink-300 border-4 border-black rotate-12 opacity-90" />
          <div className="absolute bottom-32 -left-10 h-24 w-24 bg-lime-300 border-4 border-black -rotate-12 opacity-90" />

          {/* thin brutal bars */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/4 h-32 w-32 bg-amber-400 border-4 border-black rotate-12 opacity-90" />
          {/* dotted texture */}
          {/* <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "12px 12px",
            }}
          /> */}
        </div>

        {/* CONTENT */}
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT PANEL */}
          <div className="space-y-8">
            {/* header */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="neo-badge bg-black text-white">EVENT OPS</span>
                <span className="neo-badge bg-lime-300">LIVE</span>
              </div>

              <h1 className="text-[clamp(2.8rem,6vw,4.5rem)] font-black leading-none text-black">
                My Events,
                <br />
                MeraEvent
              </h1>

              <p className="max-w-md text-black/70 font-medium">
                Where the India comes to celebrate events, connect, and create
              </p>
            </div>

            {/* primary actions */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/events/new"
                className="neo-btn neo-btn--primary text-lg rotate-[-2deg]"
              >
                + Create Event
              </Link>
              <Link href="/events" className="neo-btn text-lg rotate-[2deg]">
                View All
              </Link>
            </div>

            {/* brutal stats row */}
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Live" value={totalEvents} />
              <Stat label="Seats" value={seatCapacity} />
              <Stat label="Fill %" value={`${avgFill}%`} />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">
            {/* FEATURED EVENT */}
            <div className="relative h-full border-4 border-black rounded-xl overflow-hidden neo-shadow-hard bg-black">
              {/* IMAGE TRACK */}
              <div
                className="flex h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${slide * 100}%)` }}
              >
                {featuredSlides.map((slideData, idx) => (
                  <div key={idx} className="h-full w-full flex-shrink-0">
                    <img
                      src={slideData.src}
                      alt={slideData.title || `Event image ${idx + 1}`}
                      className="h-full w-full object-cover"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>

              {/* CTA ACCENT STRIP */}
              <div className="absolute -top-6 left-6 rotate-[-3deg] bg-black text-white px-4 py-1 text-xs font-black">
                FEATURED
              </div>

              {/* BLUR CTA OVERLAY */}
              <Link
                href={
                  featuredSlides[slide]?.id
                    ? `/events/${featuredSlides[slide].id}`
                    : "/events"
                }
                className="absolute bottom-4 left-4 right-4"
              >
                <div
                  className="
            flex items-center justify-between
            border-4 border-black rounded-xl p-4
            bg-white/70 backdrop-blur-md
            neo-shadow-hard
            hover:-translate-x-1 hover:-translate-y-1
            transition-transform
          "
                >
                  <div>
                    <div className="font-black text-black text-lg">
                      {featuredSlides[slide]?.title || "Featured event"}
                    </div>
                    <p className="mt-1 text-sm text-black/80 font-medium line-clamp-2">
                      {featuredSlides[slide]?.description ||
                        "Explore our upcoming highlights."}
                    </p>
                  </div>

                  <div className="w-52 h-12 flex items-center justify-center bg-black text-white font-black rounded-3xl">
                    OPEN →
                  </div>
                </div>
              </Link>

              {/* NAV CONTROLS */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() =>
                    setSlide(
                      (s) =>
                        (s - 1 + featuredSlides.length) % featuredSlides.length
                    )
                  }
                  className="h-9 w-9 bg-paper border-3 border-yellow-300 font-black text-yellow-300 neo-shadow-hard"
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setSlide((s) => (s + 1) % featuredSlides.length)
                  }
                  className="h-9 w-9 bg-paper border-3 border-yellow-300 font-black text-yellow-300 neo-shadow-hard"
                >
                  →
                </button>
              </div>

              {/* INDEX BADGE */}
              <div className="absolute top-4 left-4">
                <span className="neo-badge bg-yellow-300">
                  {slide + 1} / {featuredSlides.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="muted text-sm">Curated for you</p>
            <h2 className="text-3xl font-black">Upcoming events</h2>
          </div>
          <div className="flex gap-2">
            <Link href="/events/new" className="neo-btn neo-btn--primary">
              New event
            </Link>
            <Link href="/events" className="neo-btn">
              View all
            </Link>
          </div>
        </div>
        <div className="neo-card neo-shadow">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search events"
            />
            <Link href="/events/new" className="neo-btn">
              Quick create
            </Link>
          </div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonEventCard key={i} />
              ))}
            </div>
          ) : data?.items?.length ? (
            <>
              <ul className="grid gap-4 sm:grid-cols-2">
                {data.items.map((ev) => (
                  <li key={ev.id}>
                    <EventCard ev={ev} />
                  </li>
                ))}
              </ul>
              {data.total > pageSize && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    className="neo-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <div className="font-bold">
                    Page {page} / {Math.ceil(data.total / pageSize)}
                  </div>
                  <button
                    className="neo-btn"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.ceil(data.total / pageSize), p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(data.total / pageSize)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              className="rounded-2xl border-4 border-dashed p-8 text-center muted"
              style={{
                borderColor: "var(--border)",
                background: "var(--paper-2)",
              }}
            >
              No events found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="border-4 border-black bg-paper-2 rounded-lg p-3 neo-shadow-hard">
    <div className="text-xs font-bold uppercase text-black/60">{label}</div>
    <div className="text-3xl font-black text-black">{value}</div>
  </div>
);
