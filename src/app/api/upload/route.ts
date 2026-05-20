import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("pdf") as File | null;

  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Apenas PDFs são aceitos" }, { status: 400 });
  }

  const userId = session.user.id;
  const dir = path.join(process.cwd(), "public", "uploads", userId);
  await mkdir(dir, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${timestamp}-${safeName}`;
  const filepath = path.join(dir, filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  const publicPath = `/uploads/${userId}/${filename}`;
  return NextResponse.json({ path: publicPath });
}
