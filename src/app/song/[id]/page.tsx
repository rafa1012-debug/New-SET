"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  FileText,
  ExternalLink,
  Music2,
  Save,
} from "lucide-react";

interface StudyLink {
  id?: string;
  label: string;
  url: string;
}

interface Song {
  id: string;
  title: string;
  artist: string | null;
  key: string | null;
  bpm: number | null;
  pdfPath: string | null;
  studyLinks: StudyLink[];
}

export default function EditSongPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("");
  const [bpm, setBpm] = useState("");
  const [pdfPath, setPdfPath] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [studyLinks, setStudyLinks] = useState<StudyLink[]>([{ label: "", url: "" }]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    fetch(`/api/songs/${params.id}`)
      .then((r) => r.json())
      .then((data: Song) => {
        setSong(data);
        setTitle(data.title);
        setArtist(data.artist || "");
        setKey(data.key || "");
        setBpm(data.bpm?.toString() || "");
        setPdfPath(data.pdfPath || "");
        if (data.pdfPath) {
          const parts = data.pdfPath.split("/");
          setPdfName(parts[parts.length - 1]);
        }
        setStudyLinks(
          data.studyLinks.length > 0
            ? data.studyLinks
            : [{ label: "", url: "" }]
        );
      })
      .catch(() => router.push("/dashboard"));
  }, [params.id, router]);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("pdf", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setPdfPath(data.path);
      setPdfName(file.name);
    } catch {
      setError("Erro ao fazer upload.");
    }
    setUploading(false);
  }

  function addLink() { setStudyLinks((l) => [...l, { label: "", url: "" }]); }
  function removeLink(i: number) { setStudyLinks((l) => l.filter((_, idx) => idx !== i)); }
  function updateLink(i: number, field: "label" | "url", val: string) {
    setStudyLinks((l) => l.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Título é obrigatório."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/songs/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist: artist || null,
          key: key || null,
          bpm: bpm || null,
          pdfPath: pdfPath || null,
          studyLinks: studyLinks.filter((l) => l.url.trim()),
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); }
      else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch {
      setError("Erro ao salvar.");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`/api/songs/${params.id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Music2 className="w-5 h-5 text-violet-400 shrink-0" />
            <h1 className="text-white font-semibold truncate">{title || "Editar Música"}</h1>
          </div>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {saved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
              Salvo com sucesso!
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Informações</h2>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Artista / Versão</label>
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

          {/* PDF */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Cifra / Partitura</h2>
            {pdfPath ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-emerald-400 text-sm font-medium truncate">{pdfName || "PDF carregado"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={pdfPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => { setPdfPath(""); setPdfName(""); }}
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Substituir PDF
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-500" />
                )}
                <span className="text-slate-400 text-sm">
                  {uploading ? "Enviando..." : "Clique para enviar PDF da cifra"}
                </span>
                <input type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={uploading} className="hidden" />
              </label>
            )}
          </div>

          {/* Study Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Links de Estudo</h2>
              <button type="button" onClick={addLink} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
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
                      placeholder="Rótulo"
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
                  {link.url && (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 hover:text-violet-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button type="button" onClick={() => removeLink(i)} disabled={studyLinks.length === 1} className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </main>
    </div>
  );
}
