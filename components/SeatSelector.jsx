"use client";
import { useState } from "react";

const SEAT_TYPES = {
  VIP: { label: "VIP", color: "var(--accent)", icon: "⭐" },
  REGULAR: { label: "Regular", color: "var(--accent-2)", icon: "🎫" },
  FREE: { label: "Free", color: "var(--accent-3)", icon: "🆓" },
};

export default function SeatSelector({ event, onSelect, selectedType }) {
  const [quantity, setQuantity] = useState(1);

  const getAvailable = (type) => {
    const booked =
      event.registrations?.filter((r) => r.seatType === type).length || 0;
    switch (type) {
      case "VIP":
        return Math.max(0, (event.vipSeats || 0) - booked);
      case "REGULAR":
        return Math.max(0, (event.regularSeats || 0) - booked);
      case "FREE":
        return Math.max(0, (event.freeSeats || 0) - booked);
      default:
        return 0;
    }
  };

  const getPrice = (type) => {
    switch (type) {
      case "VIP":
        return event.vipPrice || 0;
      case "REGULAR":
        return event.regularPrice || 0;
      case "FREE":
      default:
        return 0;
    }
  };

  const tiers = [
    { type: "VIP", available: getAvailable("VIP"), price: getPrice("VIP") },
    {
      type: "REGULAR",
      available: getAvailable("REGULAR"),
      price: getPrice("REGULAR"),
    },
    { type: "FREE", available: getAvailable("FREE"), price: getPrice("FREE") },
  ].filter((t) => {
    // Show tier only if event has seats for it
    if (t.type === "VIP") return event.vipSeats > 0;
    if (t.type === "REGULAR") return event.regularSeats > 0;
    if (t.type === "FREE") return event.freeSeats > 0;
    return false;
  });

  // If no tiers configured, show generic booking
  const hasNoTiers = tiers.length === 0;

  const handleSelect = (type) => {
    onSelect({ type, quantity, price: getPrice(type) });
  };

  if (hasNoTiers) {
    const totalCapacity = event.capacity || 0;
    const booked = event.registrations?.length || 0;
    const available = Math.max(0, totalCapacity - booked);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-ink">Book Your Spot</h3>
          <span className="neo-badge" style={{ background: "var(--accent-3)" }}>
            {available} available
          </span>
        </div>
        <div
          className={`rounded-2xl border-3 p-4 cursor-pointer transition ${
            selectedType === "FREE" ? "ring-2 ring-offset-2" : ""
          }`}
          style={{
            borderColor: "var(--border)",
            background:
              selectedType === "FREE" ? "var(--paper-2)" : "var(--paper)",
          }}
          onClick={() => handleSelect("FREE")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎫</span>
              <div>
                <div className="font-bold text-ink">General Admission</div>
                <div className="muted text-sm">Free entry</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-ink">Free</div>
              <div className="muted text-sm">{available} left</div>
            </div>
          </div>
        </div>
        {selectedType === "FREE" && available > 0 && (
          <button
            className="neo-btn neo-btn--primary w-full"
            onClick={() =>
              onSelect({ type: "FREE", quantity: 1, price: 0, confirm: true })
            }
          >
            Confirm Booking
          </button>
        )}
        {available === 0 && (
          <div
            className="rounded-2xl border-3 border-dashed p-4 text-center muted"
            style={{ borderColor: "var(--border)" }}
          >
            This event is fully booked
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-ink">Select Your Seat</h3>
        <span className="neo-badge" style={{ background: "var(--accent-3)" }}>
          {tiers.reduce((s, t) => s + t.available, 0)} total available
        </span>
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => {
          const cfg = SEAT_TYPES[tier.type];
          const isSelected = selectedType === tier.type;
          const isSoldOut = tier.available === 0;

          return (
            <div
              key={tier.type}
              className={`rounded-2xl border-3 p-4 transition ${
                isSoldOut
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:shadow-md"
              } ${isSelected ? "ring-2 ring-offset-2" : ""}`}
              style={{
                borderColor: "var(--border)",
                background: isSelected ? "var(--paper-2)" : "var(--paper)",
                ringColor: cfg.color,
              }}
              onClick={() => !isSoldOut && handleSelect(tier.type)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cfg.icon}</span>
                  <div>
                    <div className="font-bold text-ink">{cfg.label}</div>
                    <div className="muted text-sm">
                      {isSoldOut ? "Sold out" : `${tier.available} seats left`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-ink">
                    {tier.price > 0 ? `₹${tier.price}` : "Free"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedType &&
        tiers.find((t) => t.type === selectedType)?.available > 0 && (
          <div
            className="neo-card space-y-3"
            style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Selected:</span>
              <span
                className="neo-badge"
                style={{ background: SEAT_TYPES[selectedType]?.color }}
              >
                {SEAT_TYPES[selectedType]?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Price:</span>
              <span className="font-black text-ink">
                {getPrice(selectedType) > 0
                  ? `₹${getPrice(selectedType)}`
                  : "Free"}
              </span>
            </div>
            <button
              className="neo-btn neo-btn--primary w-full"
              onClick={() =>
                onSelect({
                  type: selectedType,
                  quantity: 1,
                  price: getPrice(selectedType),
                  confirm: true,
                })
              }
            >
              Confirm Booking
            </button>
          </div>
        )}
    </div>
  );
}
