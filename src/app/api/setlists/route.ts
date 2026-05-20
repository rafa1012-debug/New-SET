import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const setlists = await prisma.setlist.findMany({
    where: { userId: session.user.id },
    include: { songs: { include: { song: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(setlists);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const setlist = await prisma.setlist.create({
    data: { name, userId: session.user.id },
  });

  return NextResponse.json(setlist, { status: 201 });
}
