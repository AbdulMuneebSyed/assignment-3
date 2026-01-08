import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CapacityBar from "@/components/CapacityBar";
import { Badge } from "@/components/ui/Input";

export default function EventCard({ ev }) {
  const filled = ev.registrations?.length || 0;
  const date = new Date(ev.date).toLocaleString();
  const spotsLeft = Math.max(ev.capacity - filled, 0);
  const imgSrc = `https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=1400&q=80&sig=${ev.id}`;
  return (
    <Card className="neo-shadow relative overflow-hidden min-h-[320px] flex flex-col group">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,194,255,0.16)] via-[rgba(255,90,95,0.12)] to-transparent" />
      <div className="relative space-y-3 h-full flex flex-col">
        <div className="h-36 w-full overflow-hidden border-b-4 border-black">
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${imgSrc})` }}
          />
        </div>
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Badge
                className="uppercase tracking-wide"
                style={{ background: "var(--accent-2)" }}
              >
                {date}
              </Badge>
              <CardTitle className="text-2xl">{ev.title}</CardTitle>
              <div className="text-sm muted">{ev.venue || "Online"}</div>
            </div>
            <div className="text-right">
              <Badge className="bg-paper" style={{ color: "var(--ink)" }}>
                {spotsLeft} seats left
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <p className="text-base leading-relaxed muted line-clamp-3">
            {ev.description}
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div
              className="rounded-2xl border-4 px-3 py-2"
              style={{
                borderColor: "var(--border)",
                background: "var(--paper-2)",
              }}
            >
              <div className="muted">Capacity</div>
              <div className="font-semibold text-ink text-lg">
                {filled} / {ev.capacity}
              </div>
            </div>
            <div
              className="rounded-2xl border-4 px-3 py-2"
              style={{
                borderColor: "var(--border)",
                background: "var(--paper-2)",
              }}
            >
              <div className="muted">Availability</div>
              <div className="font-semibold text-ink text-lg">
                {spotsLeft} open
              </div>
            </div>
          </div>
          <CapacityBar taken={filled} total={ev.capacity} />
          <div className="flex gap-2 mt-auto">
            <Link
              className="neo-btn neo-btn--primary"
              href={`/events/${ev.id}`}
            >
              View details
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
