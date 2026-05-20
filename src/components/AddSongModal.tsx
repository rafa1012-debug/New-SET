"use client";

import { useState, useEffect } from "react";
import { Search, X, Plus, Check } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  key: string | null;
  bpm: number | null;
  pdfPath: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (songs: Song[]) => void;
  excludeIds?: string[];
}

export function AddSongModal({ open, onClose, onAdd, excludeIds = [] }: Props) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    fetch("/api/songs")
      .then((r) => r.json())
      .then(setSongs)
      .catch(() => {});
    setSelected(new Set());
    setQuery("");
  }, [open]);

  const filtered = songs.filter(
    (s) =>
      !excludeIds.includes(s.id) &&
      (s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist?.toLowerCase().includes(query.toLowerCase()))
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirm() {
    const toAdd = songs.filter((s) => selected.has(s.id));
    onAdd(toAdd);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Adicionar Músicas</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar músicas..."
              className="bg-transparent text-white text-sm outline-none flex-1 placeholder-slate-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">
              {songs.length === 0 ? "Nenhuma música cadastrada" : "Nenhum resultado"}
            </p>
          ) : (
            filtered.map((song) => {
              const sel = selected.has(song.id);
              return (
                <button
                  key={song.id}
                  onClick={() => toggle(song.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors text-left ${
                    sel
                      ? "bg-violet-600/20 border border-violet-500/40"
                      : "hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      sel ? "bg-violet-600 border-violet-600" : "border-slate-600"
                    }`}
                  >
                    {sel && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{song.title}</p>
                    <p className="text-slate-400 text-xs truncate">
                      {song.artist || "—"} {song.key ? `· ${song.key}` : ""}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={confirm}
            disabled={selected.size === 0}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}
