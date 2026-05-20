"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  FileText,
  Music2,
} from "lucide-react";
import { ALL_KEYS } from "@/lib/music-utils";

export default function NewSongPage() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("");
  const [bpm, setBpm] = useState("");
  const [pdfPath, setPdfPath] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [studyLinks, setStudyLinks] = useState([{ label: "", url: "" }]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("pdf", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setPdfPath(data.path);
      setPdfName(file.name);
    } catch {
      setError("Erro ao fazer upload do PDF.");
    }
    setUploading(false);
  }

  function addLink() {
    setStudyLinks((l) => [...l, { label: "", url: "" }]);
  }

  function removeLink(i: number) {
    setStudyLinks((l) => l.filter((_, idx) => idx !== i));
  }

  function updateLink(i: number, field: "label" | "url", val: string) {
    setStudyLinks((l) => l.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Título é obrigatório."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist,
          key: key || null,
          bpm: bpm || null,
          pdfPath: pdfPath || null,
          studyLinks: studyLinks.filter((l) => l.url.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setSaving(false); return; }
      router.push(`/song/${data.id}`);
    } catch {
      setError("Erro ao salvar.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-violet-400" />
            <h1 className="text-white font-semibold">Nova Música</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Informações
            </h2>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                Título <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Nome da música"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                Artista / Versão
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nome do artista"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Tom</label>
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">— Selecionar —</option>
                  <optgroup label="Maior">
                    {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map(
                      (k) => <option key={k} value={k}>{k}</option>
                    )}
                  </optgroup>
                  <optgroup label="Menor">
                    {["Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"].map(
                      (k) => <option key={k} value={k}>{k}</option>
                    )}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">BPM</label>
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  placeholder="120"
                  min={40}
                  max={300}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Cifra / Partitura
            </h2>
            {pdfPath ? (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-400 text-sm font-medium truncate">{pdfName}</p>
                  <p className="text-emerald-600 text-xs">PDF carregado com sucesso</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPdfPath(""); setPdfName(""); }}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-500" />
                )}
                <span className="text-slate-400 text-sm text-center">
                  {uploading ? "Enviando PDF..." : "Clique para enviar PDF da cifra"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Study Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Links de Estudo
              </h2>
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {studyLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(i, "label", e.target.value)}
                      placeholder="Rótulo (ex: YouTube)"
                      className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      placeholder="https://..."
                      className="col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    disabled={studyLinks.length === 1}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {saving ? "Salvando..." : "Salvar Música"}
          </button>
        </form>
      </main>
    </div>
  );
}
