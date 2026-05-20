import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSetlist(id: string, userId: string) {
  return prisma.setlist.findFirst({ where: { id, userId } });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const setlist = await prisma.setlist.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      songs: {
        include: { song: { include: { studyLinks: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!setlist) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(setlist);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const setlist = await getSetlist(params.id, session.user.id);
  if (!setlist) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json();

  if (body.songs) {
    await prisma.$transaction([
      prisma.setlistSong.deleteMany({ where: { setlistId: params.id } }),
      ...body.songs.map(
        (s: { songId: string; order: number; linkedToNext: boolean }) =>
          prisma.setlistSong.create({
            data: {
              setlistId: params.id,
              songId: s.songId,
              order: s.order,
              linkedToNext: s.linkedToNext ?? false,
            },
          })
      ),
    ]);
  }

  const updated = await prisma.setlist.update({
    where: { id: params.id },
    data: { name: body.name ?? setlist.name },
    include: {
      songs: {
        include: { song: { include: { studyLinks: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const setlist = await getSetlist(params.id, session.user.id);
  if (!setlist) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.setlist.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
