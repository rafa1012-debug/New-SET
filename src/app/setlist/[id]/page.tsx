"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  Link,
  Link2Off,
  GripVertical,
  Music2,
  Pencil,
  Import,
  Check,
  Hash,
  Clock,
  FileText,
} from "lucide-react";
import { AddSongModal } from "@/components/AddSongModal";
import { ImportModal } from "@/components/ImportModal";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  key: string | null;
  bpm: number | null;
  pdfPath: string | null;
}

interface SetlistSong {
  id: string;
  songId: string;
  order: number;
  linkedToNext: boolean;
  song: Song;
}

interface Setlist {
  id: string;
  name: string;
  songs: SetlistSong[];
}

function SortableItem({
  item,
  onRemove,
  onToggleLink,
  onEditSong,
}: {
  item: SetlistSong;
  onRemove: (id: string) => void;
  onToggleLink: (id: string) => void;
  onEditSong: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div
        className={`flex items-center gap-3 bg-slate-900 border rounded-xl px-4 py-3 transition-colors ${
          item.linkedToNext ? "border-emerald-500/40" : "border-slate-800 hover:border-slate-700"
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium truncate">{item.song.title}</p>
            {item.song.pdfPath && (
              <FileText className="w-3 h-3 text-violet-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {item.song.artist && (
              <p className="text-slate-500 text-xs truncate">{item.song.artist}</p>
            )}
            {item.song.key && (
              <span className="text-xs text-slate-500 flex items-center gap-0.5">
                <Hash className="w-2.5 h-2.5" />{item.song.key}
              </span>
            )}
            {item.song.bpm && (
              <span className="text-xs text-slate-500 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />{item.song.bpm}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditSong(item.song.id)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-violet-400 transition-colors"
            title="Editar música"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleLink(item.id)}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
              item.linkedToNext ? "text-emerald-400" : "text-slate-500 hover:text-emerald-400"
            }`}
            title={item.linkedToNext ? "Desgrudar próxima" : "Grudar à próxima"}
          >
            {item.linkedToNext ? (
              <Link2Off className="w-3.5 h-3.5" />
            ) : (
              <Link className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
            title="Remover do setlist"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {item.linkedToNext && (
        <div className="flex items-center gap-2 pl-11 py-1">
          <div className="w-px h-4 bg-emerald-500/50" />
          <span className="text-xs text-emerald-500/70">Ligada à próxima</span>
        </div>
      )}
    </div>
  );
}

export default function SetlistPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [items, setItems] = useState<SetlistSong[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [showAddSong, setShowAddSong] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    fetch(`/api/setlists/${params.id}`)
      .then((r) => r.json())
      .then((data: Setlist) => {
        setSetlist(data);
        setName(data.name);
        setItems(data.songs.sort((a, b) => a.order - b.order));
      })
      .catch(() => router.push("/dashboard"));
  }, [params.id, router]);

  const save = useCallback(
    async (updatedItems: SetlistSong[], updatedName?: string) => {
      setSaving(true);
      await fetch(`/api/setlists/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedName ?? name,
          songs: updatedItems.map((item, idx) => ({
            songId: item.songId,
            order: idx,
            linkedToNext: item.linkedToNext,
          })),
        }),
      });
      setSaving(false);
      setUnsaved(false);
    },
    [params.id, name]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      save(next);
      return next;
    });
  }

  function handleRemove(id: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      save(next);
      return next;
    });
  }

  function handleToggleLink(id: string) {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, linkedToNext: !i.linkedToNext } : i
      );
      save(next);
      return next;
    });
  }

  function handleAddSongs(songs: Song[]) {
    setItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.songId));
      const newItems: SetlistSong[] = songs
        .filter((s) => !existingIds.has(s.id))
        .map((s, idx) => ({
          id: `temp-${s.id}`,
          songId: s.id,
          order: prev.length + idx,
          linkedToNext: false,
          song: s,
        }));
      const next = [...prev, ...newItems];
      save(next);
      return next;
    });
  }

  async function handleImport(manualSongs: { title: string; artist: string }[]) {
    const created: Song[] = [];
    for (const s of manualSongs) {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: s.title, artist: s.artist }),
      });
      if (res.ok) {
        const data = await res.json();
        created.push(data);
      }
    }
    handleAddSongs(created);
  }

  async function handleSaveName() {
    setEditingName(false);
    if (!setlist || name === setlist.name) return;
    await save(items, name);
    setSetlist((s) => s ? { ...s, name } : s);
  }

  if (!setlist) {
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
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {editingName ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                autoFocus
                className="flex-1 bg-slate-800 border border-violet-500 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
              />
              <button onClick={handleSaveName} className="p-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex-1 flex items-center gap-2 text-left group min-w-0"
            >
              <h1 className="text-white font-semibold truncate">{name}</h1>
              <Pencil className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
            </button>
          )}

          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-xs text-slate-500">Salvando...</span>
            )}
            <button
              onClick={() => router.push(`/show/${params.id}`)}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Modo Show</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Action buttons */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowAddSong(true)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-white text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-violet-400" />
            Adicionar Música
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-white text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <Import className="w-4 h-4 text-violet-400" />
            Importar Playlist
          </button>
        </div>

        {/* Songs list */}
        {items.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl">
            <Music2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-1">Setlist vazio</p>
            <p className="text-slate-600 text-xs">Adicione músicas para começar</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    onToggleLink={handleToggleLink}
                    onEditSong={(id) => router.push(`/song/${id}`)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {items.length > 0 && (
          <div className="mt-4 text-center text-xs text-slate-600">
            {items.length} música{items.length !== 1 ? "s" : ""} · Arraste para reordenar
          </div>
        )}
      </main>

      <AddSongModal
        open={showAddSong}
        onClose={() => setShowAddSong(false)}
        onAdd={handleAddSongs}
        excludeIds={items.map((i) => i.songId)}
      />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
    </div>
  );
}
