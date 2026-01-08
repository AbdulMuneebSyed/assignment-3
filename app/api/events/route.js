import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const mine = searchParams.get("mine") === "true";

  if (mine) {
    const user = await requireAuth();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const registrations = await prisma.registration.findMany({
      where: { userId: user.id },
      include: {
        event: {
          include: { registrations: true },
        },
      },
      orderBy: { event: { date: "desc" } },
    });

    // De-duplicate events in case of accidental double registrations
    const seen = new Set();
    const items = [];
    for (const r of registrations) {
      if (seen.has(r.event.id)) continue;
      seen.add(r.event.id);
      items.push(r.event);
    }

    return NextResponse.json(
      { items, total: items.length, page: 1, pageSize: items.length },
      { status: 200 }
    );
  }

  const where = q
    ? {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { venue: { contains: q } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
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
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const schema = z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    date: z.string().transform((v) => new Date(v)),
    capacity: z.number().int().min(1),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event payload" },
      { status: 400 }
    );
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
