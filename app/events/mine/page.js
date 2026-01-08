"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import SkeletonEventCard from "@/components/SkeletonEventCard";

export default function MyEventsPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/session");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["myEvents"],
    queryFn: async () => {
      const res = await fetch("/api/events?mine=true");
      if (res.status === 401) {
        toast.error("Please login to view your events");
        router.push("/login");
        return null;
      }
      if (!res.ok) throw new Error("Failed to load events");
      return res.json();
    },
    enabled: !!session?.user,
  });

  const cancelMutation = useMutation({
    mutationFn: async (eventId) => {
      const res = await fetch("/api/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["myEvents"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCancel = (eventId, eventDate) => {
    const date = new Date(eventDate);
    const now = new Date();
    const hoursUntil = (date - now) / (1000 * 60 * 60);

    if (hoursUntil < 24) {
      toast.error("Cannot cancel within 24 hours of event");
      return;
    }

    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelMutation.mutate(eventId);
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-ink">My Events</h1>
        <div className="neo-card neo-shadow text-center p-8">
          <p className="muted mb-4">
            Please log in to view your registered events
          </p>
          <button
            className="neo-btn neo-btn--primary"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcomingEvents = (data?.items || [])
    .filter((ev) => new Date(ev.date) >= now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const pastEvents = (data?.items || [])
    .filter((ev) => new Date(ev.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const imageForEvent = (ev) =>
    `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80&sig=${ev.id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="muted text-sm">Your bookings</p>
        <h1 className="text-3xl font-black text-ink">My Events</h1>
      </div>

      {/* Upcoming Events */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-ink flex items-center gap-2">
          <span>📅</span> Upcoming Events
          {upcomingEvents.length > 0 && (
            <span
              className="neo-badge"
              style={{ background: "var(--accent-2)" }}
            >
              {upcomingEvents.length}
            </span>
          )}
        </h2>
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonEventCard key={i} />
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <ul className="space-y-4">
            {upcomingEvents.map((ev) => {
              const eventDate = new Date(ev.date);
              const hoursUntil = (eventDate - now) / (1000 * 60 * 60);
              const canCancel = hoursUntil >= 24;
              const userReg = ev.registrations?.find(
                (r) => r.userId === session.user?.id
              );

              const bg = imageForEvent(ev);

              return (
                <li
                  key={ev.id}
                  className="neo-card neo-shadow p-0 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div
                      className="sm:w-56 h-40 sm:h-auto bg-cover bg-center border-r-3"
                      style={{
                        backgroundImage: `url(${bg})`,
                        borderColor: "var(--border)",
                      }}
                    />
                    <div className="flex-1 p-4 sm:p-5 space-y-3 relative">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
                        <span
                          className="neo-badge"
                          style={{ background: "var(--accent-2)" }}
                        >
                          Upcoming
                        </span>
                        {userReg?.seatType && (
                          <span
                            className="neo-badge"
                            style={{
                              background:
                                userReg.seatType === "VIP"
                                  ? "var(--accent)"
                                  : userReg.seatType === "REGULAR"
                                  ? "var(--accent-3)"
                                  : "var(--accent-2)",
                            }}
                          >
                            {userReg.seatType} Seat
                          </span>
                        )}
                        <span className="muted text-[11px]">ID #{ev.id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-2xl">🎟️</div>
                        <div className="min-w-0">
                          <Link
                            href={`/events/${ev.id}`}
                            className="hover:underline"
                          >
                            <h3 className="font-black text-ink text-lg truncate">
                              {ev.title}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap gap-2 text-sm muted mt-1">
                            <span>📅 {eventDate.toLocaleDateString()}</span>
                            <span>
                              🕐{" "}
                              {eventDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span>📍 {ev.venue || "Online"}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between pt-2 border-t-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="flex gap-2 text-sm muted">
                          <span>
                            👥 {ev.registrations?.length || 0} attending
                          </span>
                          <span>•</span>
                          <span>{ev.capacity} capacity</span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Link
                            href={`/events/${ev.id}`}
                            className="neo-btn text-sm"
                          >
                            View
                          </Link>
                          <button
                            className="neo-btn neo-btn--danger text-sm"
                            disabled={!canCancel || cancelMutation.isPending}
                            onClick={() => handleCancel(ev.id, ev.date)}
                            title={
                              canCancel
                                ? "Cancel booking"
                                : "Cannot cancel within 24 hours"
                            }
                          >
                            {canCancel ? "Cancel" : "🔒"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,var(--paper-2)_10px,var(--paper-2)_20px)] border-t-2"
                    style={{ borderColor: "var(--border)" }}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <div
            className="rounded-2xl border-3 border-dashed p-8 text-center muted"
            style={{
              borderColor: "var(--border)",
              background: "var(--paper-2)",
            }}
          >
            <p className="mb-4">You have no upcoming events</p>
            <Link href="/events" className="neo-btn neo-btn--primary">
              Browse Events
            </Link>
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <span>⏰</span> Past Events
            <span
              className="neo-badge"
              style={{ background: "var(--paper-3)" }}
            >
              {pastEvents.length}
            </span>
          </h2>
          <ul className="space-y-3 opacity-75">
            {pastEvents.map((ev) => {
              const eventDate = new Date(ev.date);
              const userReg = ev.registrations?.find(
                (r) => r.userId === session.user?.id
              );
              const bg = imageForEvent(ev);

              return (
                <li
                  key={ev.id}
                  className="neo-card p-0 overflow-hidden"
                  style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div
                      className="sm:w-40 h-32 sm:h-auto bg-cover bg-center border-r-3"
                      style={{
                        backgroundImage: `url(${bg})`,
                        borderColor: "var(--border)",
                        filter: "grayscale(0.3)",
                      }}
                    />
                    <div className="flex-1 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide muted">
                        <span
                          className="neo-badge"
                          style={{ background: "var(--paper-3)" }}
                        >
                          Past
                        </span>
                        {userReg?.seatType && (
                          <span
                            className="neo-badge"
                            style={{ background: "var(--paper-2)" }}
                          >
                            {userReg.seatType}
                          </span>
                        )}
                        <span className="muted text-[11px]">ID #{ev.id}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="text-xl">🧾</div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-ink truncate">
                            {ev.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm muted">
                            <span>📅 {eventDate.toLocaleDateString()}</span>
                            <span>
                              🕐{" "}
                              {eventDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex justify-between items-center pt-2 border-t-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="text-sm muted">
                          Thanks for attending
                        </span>
                        <Link
                          href={`/events/${ev.id}`}
                          className="neo-btn text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-2 bg-[repeating-linear-gradient(90deg,transparent,transparent_12px,var(--paper-2)_12px,var(--paper-2)_24px)] border-t-2"
                    style={{ borderColor: "var(--border)" }}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
