"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { transposeKey } from "@/lib/music-utils";

interface Props {
  originalKey: string;
  semitones: number;
  onChange: (semitones: number) => void;
  size?: "sm" | "lg";
}

export function KeyTransposer({ originalKey, semitones, onChange, size = "sm" }: Props) {
  const transposed = transposeKey(originalKey, semitones);
  const isLarge = size === "lg";

  return (
    <div className={`flex items-center gap-2 ${isLarge ? "gap-3" : ""}`}>
      <button
        onClick={() => onChange(semitones - 1)}
        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
      >
        <ChevronDown className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
      </button>

      <div className="text-center min-w-[80px]">
        <div className={`font-bold text-white ${isLarge ? "text-3xl" : "text-lg"}`}>
          {transposed}
        </div>
        {semitones !== 0 && (
          <div className={`text-slate-400 ${isLarge ? "text-sm" : "text-xs"}`}>
            orig: {originalKey} ({semitones > 0 ? `+${semitones}` : semitones})
          </div>
        )}
      </div>

      <button
        onClick={() => onChange(semitones + 1)}
        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
      >
        <ChevronUp className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
      </button>

      {semitones !== 0 && (
        <button
          onClick={() => onChange(0)}
          className={`ml-1 text-slate-500 hover:text-violet-400 transition-colors ${isLarge ? "text-sm" : "text-xs"}`}
        >
          reset
        </button>
      )}
    </div>
  );
}
