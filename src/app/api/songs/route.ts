import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const songs = await prisma.song.findMany({
    where: { userId: session.user.id },
    include: { studyLinks: true },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(songs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { title, artist, key, bpm, pdfPath, studyLinks } = body;

  if (!title) return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });

  const song = await prisma.song.create({
    data: {
      title,
      artist: artist || null,
      key: key || null,
      bpm: bpm ? parseInt(bpm) : null,
      pdfPath: pdfPath || null,
      userId: session.user.id,
      studyLinks: {
        create: (studyLinks || []).map((l: { url: string; label?: string }) => ({
          url: l.url,
          label: l.label || null,
        })),
      },
    },
    include: { studyLinks: true },
  });

  return NextResponse.json(song, { status: 201 });
}
