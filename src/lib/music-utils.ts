export const CHROMATIC_KEYS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

export const ALL_KEYS = [
  ...CHROMATIC_KEYS,
  ...CHROMATIC_KEYS.map((k) => k + "m"),
];

export function transposeKey(key: string, semitones: number): string {
  const isMinor = key.endsWith("m");
  const base = isMinor ? key.slice(0, -1) : key;
  const idx = CHROMATIC_KEYS.indexOf(base);
  if (idx === -1) return key;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return CHROMATIC_KEYS[newIdx] + (isMinor ? "m" : "");
}

export function getTransposeLabel(
  original: string,
  semitones: number
): string {
  if (semitones === 0) return original;
  const transposed = transposeKey(original, semitones);
  const sign = semitones > 0 ? `+${semitones}` : semitones;
  return `${original} (${sign}) → ${transposed}`;
}

export function detectUrlType(
  url: string
): "spotify" | "youtube" | "unknown" {
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return "unknown";
}
