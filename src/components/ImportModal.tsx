"use client";

import { useState } from "react";
import { X, Link2, Music2, Plus, Trash2 } from "lucide-react";
import { detectUrlType } from "@/lib/music-utils";

interface ManualSong {
  title: string;
  artist: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (songs: ManualSong[]) => void;
}

export function ImportModal({ open, onClose, onImport }: Props) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [songs, setSongs] = useState<ManualSong[]>([{ title: "", artist: "" }]);
  const [loading, setLoading] = useState(false);

  const urlType = url ? detectUrlType(url) : "unknown";

  async function handleParse() {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setMessage(data.message || "");
    } catch {
      setMessage("Erro ao processar URL.");
    }
    setLoading(false);
  }

  function addRow() {
    setSongs((s) => [...s, { title: "", artist: "" }]);
  }

  function removeRow(i: number) {
    setSongs((s) => s.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: "title" | "artist", val: string) {
    setSongs((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  }

  function confirm() {
    const valid = songs.filter((s) => s.title.trim());
    if (valid.length === 0) return;
    onImport(valid);
    onClose();
  }

  function handleClose() {
    setUrl("");
    setMessage("");
    setSongs([{ title: "", artist: "" }]);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Importar Playlist</h2>
          <button onClick={handleClose} className="p-1 rounded hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              URL da Playlist (Spotify ou YouTube)
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="bg-transparent text-sm text-white outline-none flex-1 placeholder-slate-500"
                />
              </div>
              <button
                onClick={handleParse}
                disabled={!url || loading}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "..." : "Analisar"}
              </button>
            </div>

            {url && urlType !== "unknown" && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    urlType === "spotify"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {urlType === "spotify" ? "Spotify" : "YouTube"}
                </span>
                <span className="text-slate-500">detectado</span>
              </div>
            )}

            {message && (
              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
                {message}
              </div>
            )}
          </div>

          {/* Manual songs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-400">
                <Music2 className="w-3.5 h-3.5 inline mr-1" />
                Músicas para adicionar
              </label>
              <button
                onClick={addRow}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Nova linha
              </button>
            </div>

            <div className="space-y-2">
              {songs.map((song, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={song.title}
                      onChange={(e) => updateRow(i, "title", e.target.value)}
                      placeholder="Título *"
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={song.artist}
                      onChange={(e) => updateRow(i, "artist", e.target.value)}
                      placeholder="Artista"
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <button
                    onClick={() => removeRow(i)}
                    disabled={songs.length === 1}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={confirm}
            disabled={!songs.some((s) => s.title.trim())}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
          >
            Importar Músicas
          </button>
        </div>
      </div>
    </div>
  );
}
