import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(_req, { params }) {
  const id = Number(params.id);
  const event = await prisma.event.findUnique({
    where: { id },
    include: { registrations: { include: { user: true } } },
  });
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ event }, { status: 200 });
}

export async function PATCH(request, { params }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const body = await request.json();
  const schema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    date: z.string().transform((v) => new Date(v)).optional(),
    capacity: z.number().int().min(1).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
  }

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Optional ownership check
  // if (existing.createdById !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updated = await prisma.event.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ event: updated }, { status: 200 });
}
