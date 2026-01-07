import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { registrations: true },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize }, { status: 200 });
}

export async function POST(request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const schema = z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    date: z.string().transform((v) => new Date(v)),
    capacity: z.number().int().min(1),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
  }
  const data = parsed.data;

  const created = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      date: data.date,
      capacity: data.capacity,
      createdById: user.id,
    },
  });
  return NextResponse.json({ event: created }, { status: 201 });
}
