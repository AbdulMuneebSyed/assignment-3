import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventId = Number(searchParams.get('eventId'));
  if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  const regs = await prisma.registration.findMany({
    where: { eventId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ registrations: regs }, { status: 200 });
}

export async function POST(request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const schema = z.object({ eventId: z.number().int().min(1) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const { eventId } = parsed.data;

  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { registrations: true } });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  if (event.registrations.length >= event.capacity) {
    return NextResponse.json({ error: 'Event at capacity' }, { status: 409 });
  }
  try {
    const reg = await prisma.registration.create({ data: { eventId, userId: user.id } });
    return NextResponse.json({ registration: reg }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Already registered' }, { status: 409 });
  }
}

export async function DELETE(request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const schema = z.object({ eventId: z.number().int().min(1) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const { eventId } = parsed.data;

  const existing = await prisma.registration.findUnique({ where: { eventId_userId: { eventId, userId: user.id } } });
  if (!existing) return NextResponse.json({ error: 'Not registered' }, { status: 404 });
  await prisma.registration.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
