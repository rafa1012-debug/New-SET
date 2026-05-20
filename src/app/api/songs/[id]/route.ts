import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const song = await prisma.song.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { studyLinks: true },
  });

  if (!song) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(song);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const existing = await prisma.song.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json();
  const { title, artist, key, bpm, pdfPath, studyLinks } = body;

  await prisma.studyLink.deleteMany({ where: { songId: params.id } });

  const song = await prisma.song.update({
    where: { id: params.id },
    data: {
      title: title ?? existing.title,
      artist: artist ?? null,
      key: key ?? null,
      bpm: bpm ? parseInt(bpm) : null,
      pdfPath: pdfPath !== undefined ? pdfPath : existing.pdfPath,
      studyLinks: {
        create: (studyLinks || []).map((l: { url: string; label?: string }) => ({
          url: l.url,
          label: l.label || null,
        })),
      },
    },
    include: { studyLinks: true },
  });

  return NextResponse.json(song);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const song = await prisma.song.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!song) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (song.pdfPath) {
    try {
      await unlink(path.join(process.cwd(), "public", song.pdfPath));
    } catch {
      // File may not exist, ignore
    }
  }

  await prisma.song.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
