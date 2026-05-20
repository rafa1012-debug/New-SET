import { NextResponse } from "next/server";
import { detectUrlType } from "@/lib/music-utils";

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });

  const type = detectUrlType(url);

  if (type === "spotify") {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return NextResponse.json({
      type: "spotify",
      playlistId: match?.[1] ?? null,
      message:
        "Para importar automaticamente do Spotify, é necessário configurar as credenciais da API do Spotify. Por enquanto, adicione as músicas manualmente abaixo.",
      canAutoImport: false,
    });
  }

  if (type === "youtube") {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return NextResponse.json({
      type: "youtube",
      playlistId: match?.[1] ?? null,
      message:
        "Para importar automaticamente do YouTube, é necessário configurar as credenciais da API do YouTube. Por enquanto, adicione as músicas manualmente abaixo.",
      canAutoImport: false,
    });
  }

  return NextResponse.json({
    type: "unknown",
    message: "URL não reconhecida. Suporte a Spotify e YouTube.",
    canAutoImport: false,
  });
}
