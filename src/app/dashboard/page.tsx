"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Music2,
  ListMusic,
  Plus,
  LogOut,
  ChevronRight,
  Pencil,
  Trash2,
  Clock,
  Hash,
} from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  key: string | null;
  bpm: number | null;
}

interface Setlist {
  id: string;
  name: string;
  createdAt: string;
  songs: { song: Song }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [newSetlistName, setNewSetlistName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showSetlistForm, setShowSetlistForm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/setlists").then((r) => r.json()).then(setSetlists).catch(() => {});
    fetch("/api/songs").then((r) => r.json()).then(setSongs).catch(() => {});
  }, [status]);

  async function createSetlist(e: React.FormEvent) {
    e.preventDefault();
    if (!newSetlistName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/setlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSetlistName }),
    });
    const data = await res.json();
    setSetlists((s) => [{ ...data, songs: [] }, ...s]);
    setNewSetlistName("");
    setShowSetlistForm(false);
    setCreating(false);
    router.push(`/setlist/${data.id}`);
  }

  async function deleteSetlist(id: string) {
    if (!confirm("Excluir este setlist?")) return;
    await fetch(`/api/setlists/${id}`, { method: "DELETE" });
    setSetlists((s) => s.filter((sl) => sl.id !== id));
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm">SetList Pro</span>
              <span className="text-slate-500 text-xs ml-2 hidden sm:inline">
                {session?.user?.name}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Setlists Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Meus Setlists</h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {setlists.length}
              </span>
            </div>
            <button
              onClick={() => setShowSetlistForm(!showSetlistForm)}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>

          {showSetlistForm && (
            <form onSubmit={createSetlist} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSetlistName}
                onChange={(e) => setNewSetlistName(e.target.value)}
                placeholder="Nome do setlist..."
                autoFocus
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={creating || !newSetlistName.trim()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setShowSetlistForm(false)}
                className="px-3 py-2 border border-slate-700 rounded-lg text-slate-400 hover:text-white text-sm transition-colors"
              >
                ✕
              </button>
            </form>
          )}

          {setlists.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
              <ListMusic className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Nenhum setlist ainda</p>
              <button
                onClick={() => setShowSetlistForm(true)}
                className="mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors"
              >
                Criar primeiro setlist
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {setlists.map((sl) => (
                <div
                  key={sl.id}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors group"
                >
                  <button
                    onClick={() => router.push(`/setlist/${sl.id}`)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center shrink-0">
                      <ListMusic className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{sl.name}</p>
                      <p className="text-slate-500 text-xs">
                        {sl.songs.length} música{sl.songs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto shrink-0 transition-colors" />
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push(`/setlist/${sl.id}`)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-violet-400 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSetlist(sl.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Songs Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Music2 className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Minhas Músicas</h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {songs.length}
              </span>
            </div>
            <button
              onClick={() => router.push("/song/new")}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Música
            </button>
          </div>

          {songs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
              <Music2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Nenhuma música cadastrada</p>
              <button
                onClick={() => router.push("/song/new")}
                className="mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors"
              >
                Adicionar primeira música
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {songs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => router.push(`/song/${song.id}`)}
                  className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 text-slate-400 text-xs font-bold">
                    {song.key || "♪"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{song.title}</p>
                    <p className="text-slate-500 text-xs truncate">{song.artist || "Artista não definido"}</p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-xs shrink-0">
                    {song.bpm && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {song.bpm}
                      </span>
                    )}
                    {song.key && (
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {song.key}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
