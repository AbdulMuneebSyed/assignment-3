"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  date: z.string(),
  capacity: z.coerce.number().int().min(1),
});

export default function NewEventPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, capacity: Number(values.capacity) }),
    });
    if (res.status === 401) {
      toast.error("Please login to create events");
      router.push("/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Failed to create");
    toast.success("Event created");
    router.push(`/events/${data.event.id}`);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="neo-badge" style={{ background: "var(--accent-2)" }}>
          New
        </span>
        <h1 className="text-3xl font-black text-ink">Create Event</h1>
      </div>
      <form
        className="neo-card neo-shadow space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label className="font-semibold">Title</label>
          <input className="neo-input mt-1" {...register("title")} />
          {errors.title && (
            <p className="text-red-600">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="font-semibold">Description</label>
          <textarea
            rows={4}
            className="neo-textarea mt-1"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-600">{errors.description.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Date & Time</label>
            <input
              type="datetime-local"
              className="neo-input mt-1"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-red-600">{errors.date.message}</p>
            )}
          </div>
          <div>
            <label className="font-semibold">Capacity</label>
            <input
              type="number"
              className="neo-input mt-1"
              {...register("capacity", { valueAsNumber: true })}
            />
            {errors.capacity && (
              <p className="text-red-600">{errors.capacity.message}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            disabled={isSubmitting}
            className="neo-btn neo-btn--primary"
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save Event"}
          </button>
          <Link href="/events" className="neo-btn">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
