import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventId = Number(searchParams.get("eventId"));
  if (!eventId)
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  const regs = await prisma.registration.findMany({
    where: { eventId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ registrations: regs }, { status: 200 });
}

export async function POST(request) {
  const user = await requireAuth();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user exists in database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });
  if (!dbUser) {
    return NextResponse.json(
      { error: "User not found in database. Please log in again." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const schema = z.object({
    eventId: z.number().int().min(1),
    seatType: z.enum(["VIP", "REGULAR", "FREE"]).optional().default("FREE"),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { eventId, seatType } = parsed.data;

  // Validate event exists first
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { registrations: true },
  });
  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Check if user is already registered for this event
  const existingReg = event.registrations.find((r) => r.userId === user.id);
  if (existingReg) {
    return NextResponse.json(
      { error: "You are already registered for this event" },
      { status: 409 }
    );
  }

  // Check total capacity
  if (event.registrations.length >= event.capacity) {
    return NextResponse.json({ error: "Event at capacity" }, { status: 409 });
  }

  // Check seat type availability
  const seatCounts = {
    VIP: event.registrations.filter((r) => r.seatType === "VIP").length,
    REGULAR: event.registrations.filter((r) => r.seatType === "REGULAR").length,
    FREE: event.registrations.filter((r) => r.seatType === "FREE").length,
  };

  // If no seat types configured, all seats are FREE
  const hasSeatingConfig =
    event.vipSeats > 0 || event.regularSeats > 0 || event.freeSeats > 0;
  const seatLimits = {
    VIP: event.vipSeats || 0,
    REGULAR: event.regularSeats || 0,
    FREE: hasSeatingConfig ? event.freeSeats : event.capacity,
  };

  if (seatCounts[seatType] >= seatLimits[seatType]) {
    return NextResponse.json(
      { error: `No ${seatType} seats available` },
      { status: 409 }
    );
  }

  try {
    const reg = await prisma.registration.create({
      data: { eventId, userId: user.id, seatType },
    });
    return NextResponse.json({ registration: reg }, { status: 201 });
  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to create registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const user = await requireAuth();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const schema = z.object({ eventId: z.number().int().min(1) });
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { eventId } = parsed.data;

  const existing = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!existing)
    return NextResponse.json({ error: "Not registered" }, { status: 404 });
  await prisma.registration.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
