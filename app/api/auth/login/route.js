import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function POST(request) {
  const body = await request.json();
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  const session = await getSession();
  session.user = { id: user.id, name: user.name, email: user.email };
  await session.save();
  return NextResponse.json({ user: session.user }, { status: 200 });
}
