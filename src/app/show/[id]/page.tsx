"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music2,
  Link,
  FileText,
  Clock,
} from "lucide-react";
import { PDFViewer } from "@/components/PDFViewer";
import { KeyTransposer } from "@/components/KeyTransposer";
import { transposeKey } from "@/lib/music-utils";

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

const PIXELS_PER_BEAT = 15;

export default function ShowPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [semitones, setSemitones] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    fetch(`/api/setlists/${params.id}`)
      .then((r) => r.json())
      .then((data: Setlist) => {
        setSetlist({ ...data, songs: data.songs.sort((a, b) => a.order - b.order) });
      })
      .catch(() => router.push("/dashboard"));
  }, [params.id, router]);

  const currentItem = setlist?.songs[currentIdx];
  const currentSong = currentItem?.song;
  const bpm = currentSong?.bpm;

  // Auto-scroll by BPM
  useEffect(() => {
    if (!autoScroll || !bpm) return;
    const pps = (bpm / 60) * PIXELS_PER_BEAT;
    const id = setInterval(() => {
      scrollRef.current?.scrollBy({ top: pps / 10, behavior: "auto" });
    }, 100);
    return () => clearInterval(id);
  }, [autoScroll, bpm]);

  // Reset scroll on song change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setSemitones(0);
  }, [currentIdx]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [resetControlsTimer]);

  function goNext() {
    if (!setlist) return;
    if (currentIdx < setlist.songs.length - 1) {
      setCurrentIdx((i) => i + 1);
    }
  }

  function goPrev() {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  }

  function handleNextFromPdf() {
    if (currentItem?.linkedToNext) goNext();
  }

  if (!setlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const songs = setlist.songs;

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col overflow-hidden"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/90 to-transparent">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-lg leading-tight truncate">
              {currentSong?.title || "Sem título"}
            </p>
            <p className="text-slate-400 text-sm truncate">
              {currentSong?.artist || ""}
              {currentSong?.bpm && (
                <span className="ml-2 text-amber-400">
                  <Clock className="w-3 h-3 inline mr-0.5" />{currentSong.bpm} BPM
                </span>
              )}
            </p>
          </div>

          {/* Key Transposer */}
          {currentSong?.key && (
            <KeyTransposer
              originalKey={currentSong.key}
              semitones={semitones}
              onChange={setSemitones}
              size="sm"
            />
          )}

          <button
            onClick={() => router.push(`/setlist/${params.id}`)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`absolute left-0 top-0 bottom-0 z-30 w-72 bg-slate-950/98 border-r border-slate-800 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <p className="text-white font-semibold text-sm truncate">{setlist.name}</p>
            <p className="text-slate-500 text-xs">{songs.length} músicas</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {songs.map((item, idx) => (
            <div key={item.id}>
              <button
                onClick={() => { setCurrentIdx(idx); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-900 ${
                  idx === currentIdx
                    ? "bg-violet-600/20 border-l-2 border-l-violet-500"
                    : "hover:bg-slate-900"
                }`}
              >
                <span
                  className={`text-xs font-mono w-5 shrink-0 ${
                    idx === currentIdx ? "text-violet-400" : "text-slate-600"
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${idx === currentIdx ? "text-white" : "text-slate-300"}`}>
                    {item.song.title}
                  </p>
                  <p className="text-slate-500 text-xs truncate">
                    {item.song.artist}
                    {item.song.key ? ` · ${item.song.key}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {item.song.pdfPath && <FileText className="w-3 h-3 text-slate-600" />}
                  {item.linkedToNext && <Link className="w-3 h-3 text-emerald-500" />}
                </div>
              </button>
              {item.linkedToNext && (
                <div className="pl-9 py-0.5 bg-emerald-500/5">
                  <div className="w-px h-3 bg-emerald-500/40 ml-2" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-16">
        {currentSong?.pdfPath ? (
          <PDFViewer
            pdfPath={currentSong.pdfPath}
            onNextSong={handleNextFromPdf}
            scrollRef={scrollRef}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-8">
            <Music2 className="w-16 h-16 text-slate-800 mb-4" />
            <p className="text-slate-500 text-lg font-medium">{currentSong?.title}</p>
            {currentSong?.key && (
              <div className="mt-6">
                <p className="text-slate-600 text-sm mb-2">Tom</p>
                <p className="text-5xl font-bold text-white">
                  {semitones !== 0
                    ? transposeKey(currentSong.key, semitones)
                    : currentSong.key}
                </p>
              </div>
            )}
            <p className="mt-8 text-slate-700 text-sm">Nenhum PDF para esta música</p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-t from-black/90 to-transparent">
          {/* Nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <div className="text-center px-3">
              <span className="text-slate-400 text-sm">
                {currentIdx + 1} / {songs.length}
              </span>
            </div>
            <button
              onClick={goNext}
              disabled={currentIdx === songs.length - 1}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Auto scroll */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            disabled={!bpm}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              autoScroll
                ? "bg-violet-600 text-white"
                : "bg-slate-800/80 text-slate-400 hover:text-white disabled:opacity-40"
            }`}
          >
            {autoScroll ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Auto-scroll</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {bpm ? `Auto (${bpm} BPM)` : "Sem BPM"}
                </span>
              </>
            )}
          </button>

          {/* Linked indicator */}
          {currentItem?.linkedToNext && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Link className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ligada</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
