"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import CapacityBar from "@/components/CapacityBar";
import SeatSelector from "@/components/SeatSelector";

export default function EventDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const qc = useQueryClient();
  const router = useRouter();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/session");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Failed to load event");
      return res.json();
    },
  });

  const regMutation = useMutation({
    mutationFn: async (seatData) => {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: id,
          seatType: seatData.type,
        }),
      });
      if (res.status === 401) {
        router.push("/login");
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    onSuccess: () => {
      toast.success("🎉 Booking confirmed!");
      setShowConfirm(true);
      qc.invalidateQueries({ queryKey: ["event", id] });
      qc.invalidateQueries({ queryKey: ["myEvents"] });
    },
    onError: (err) => {
      toast.error(err.message || "Booking failed");
    },
  });

  const handleSeatSelect = (selection) => {
    if (selection.confirm) {
      if (!session?.user) {
        toast.error("Please login to book");
        router.push("/login");
        return;
      }
      regMutation.mutate(selection);
    } else {
      setSelectedSeat(selection.type);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="skeleton h-12 w-2/3" />
        <div className="skeleton h-64" />
        <div className="skeleton h-48" />
      </div>
    );
  }

  const ev = data.event;
  const totalBooked = ev.registrations?.length || 0;
  const spotsLeft = Math.max(ev.capacity - totalBooked, 0);
  const eventDate = new Date(ev.date);
  const isPast = eventDate < new Date();

  const userRegistration = session?.user
    ? ev.registrations?.find((r) => r.userId === session.user.id)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="neo-btn flex items-center gap-2"
      >
        <span>←</span> Back
      </button>
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="neo-badge" style={{ background: "var(--accent-2)" }}>
            {ev.category || "Event"}
          </span>
          {isPast && (
            <span className="neo-badge" style={{ background: "var(--accent)" }}>
              Past Event
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink">{ev.title}</h1>
        <div className="flex items-center gap-4 flex-wrap muted">
          <span>
            📅{" "}
            {eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>
            🕐{" "}
            {eventDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span>📍 {ev.venue || "Online"}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-3xl border-3 h-64 flex items-center justify-center"
            style={{
              borderColor: "var(--border)",
              background:
                "linear-gradient(135deg, var(--paper-2), var(--paper-3))",
            }}
          >
            <span className="text-6xl">🎪</span>
          </div>

          <div className="neo-card">
            <h2 className="text-xl font-black text-ink mb-3">
              About this event
            </h2>
            <p className="muted leading-relaxed whitespace-pre-wrap">
              {ev.description}
            </p>
          </div>

          <div className="neo-card">
            <h2 className="text-xl font-black text-ink mb-3">Availability</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div
                className="rounded-2xl border-3 p-3 text-center"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--paper-2)",
                }}
              >
                <div className="text-2xl font-black text-ink">
                  {ev.capacity}
                </div>
                <div className="muted text-sm">Total Seats</div>
              </div>
              <div
                className="rounded-2xl border-3 p-3 text-center"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--paper-2)",
                }}
              >
                <div className="text-2xl font-black text-ink">
                  {totalBooked}
                </div>
                <div className="muted text-sm">Booked</div>
              </div>
              <div
                className="rounded-2xl border-3 p-3 text-center"
                style={{
                  borderColor: "var(--border)",
                  background:
                    spotsLeft > 0 ? "var(--accent-3)" : "var(--accent)",
                }}
              >
                <div
                  className="text-2xl font-black"
                  style={{ color: "var(--ink)" }}
                >
                  {spotsLeft}
                </div>
                <div className="text-sm" style={{ color: "var(--ink)" }}>
                  Available
                </div>
              </div>
            </div>
            <CapacityBar taken={totalBooked} total={ev.capacity} />
          </div>
        </div>

        <div className="space-y-4">
          {showConfirm ? (
            <div className="neo-card neo-shadow space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-black text-ink">You're In!</h3>
                <p className="muted">Your spot has been reserved</p>
              </div>
              <div
                className="rounded-2xl border-3 p-3"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--paper-2)",
                }}
              >
                <div className="text-sm muted">Event</div>
                <div className="font-bold text-ink">{ev.title}</div>
              </div>
              <div
                className="rounded-2xl border-3 p-3"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--paper-2)",
                }}
              >
                <div className="text-sm muted">Date & Time</div>
                <div className="font-bold text-ink">
                  {eventDate.toLocaleString()}
                </div>
              </div>
              <div
                className="rounded-2xl border-3 p-3"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--paper-2)",
                }}
              >
                <div className="text-sm muted">Venue</div>
                <div className="font-bold text-ink">{ev.venue || "Online"}</div>
              </div>
              <button
                className="neo-btn w-full"
                onClick={() => router.push("/events/mine")}
              >
                View My Events
              </button>
            </div>
          ) : userRegistration ? (
            <div className="neo-card neo-shadow space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-lg font-black text-ink">
                  You're Registered
                </h3>
                <p className="muted text-sm">
                  You already have a spot for this event
                </p>
              </div>
              <div
                className="rounded-2xl border-3 p-3"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--paper-2)",
                }}
              >
                <div className="text-sm muted">Seat Type</div>
                <div className="font-bold text-ink">
                  {userRegistration.seatType || "General"}
                </div>
              </div>
              <div
                className="rounded-2xl border-3 p-3"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--paper-2)",
                }}
              >
                <div className="text-sm muted">Booked On</div>
                <div className="font-bold text-ink">
                  {new Date(userRegistration.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                className="neo-btn w-full"
                onClick={() => router.push("/events/mine")}
              >
                Manage Booking
              </button>
            </div>
          ) : isPast ? (
            <div className="neo-card neo-shadow text-center space-y-3">
              <div className="text-4xl">⏰</div>
              <h3 className="text-lg font-black text-ink">Event Ended</h3>
              <p className="muted text-sm">
                This event has already taken place
              </p>
            </div>
          ) : (
            <div className="neo-card neo-shadow">
              <SeatSelector
                event={ev}
                onSelect={handleSeatSelect}
                selectedType={selectedSeat}
              />
            </div>
          )}

          <div className="neo-card space-y-3">
            <h3 className="font-black text-ink">Event Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span className="muted">{eventDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕐</span>
                <span className="muted">{eventDate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="muted">{ev.venue || "Online"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span className="muted">{ev.capacity} capacity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
