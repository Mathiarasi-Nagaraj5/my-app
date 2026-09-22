// A reasonably broad named-color dictionary (hex -> label).
// Extend this with your actual catalog's shades so common ones resolve exactly.
const COLOR_NAMES: Record<string, string> = {
  "#000000": "Black",
  "#ffffff": "White",
  "#ff0000": "Red",
  "#e0629b": "Rose Pink",
  "#ffc0cb": "Pink",
  "#800020": "Maroon",
  "#a52a2a": "Brown",
  "#ffa500": "Orange",
  "#ffff00": "Yellow",
  "#008000": "Green",
  "#00ff00": "Lime",
  "#0000ff": "Blue",
  "#000080": "Navy",
  "#87ceeb": "Sky Blue",
  "#800080": "Purple",
  "#ee82ee": "Violet",
  "#808080": "Grey",
  "#c0c0c0": "Silver",
  "#ffd700": "Gold",
  "#f5f5dc": "Beige",
  "#d2b48c": "Tan",
  "#000000ff": "Black",
};

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function nearestNamedColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex; // not a hex value at all (e.g. already "red", "skyblue")

  let closest = hex;
  let closestDist = Infinity;

  for (const [candidateHex, name] of Object.entries(COLOR_NAMES)) {
    const candidateRgb = hexToRgb(candidateHex);
    if (!candidateRgb) continue;
    const dist =
      (rgb[0] - candidateRgb[0]) ** 2 +
      (rgb[1] - candidateRgb[1]) ** 2 +
      (rgb[2] - candidateRgb[2]) ** 2;
    if (dist < closestDist) {
      closestDist = dist;
      closest = name;
    }
  }
  return closest;
}

/**
 * Returns a human-readable color name for a hex code or CSS color keyword.
 * Exact dictionary match wins; otherwise falls back to nearest-match by RGB distance.
 */
export function getColorName(value: string): string {
  if (!value) return "";
  const key = value.toLowerCase();

  if (COLOR_NAMES[key]) return COLOR_NAMES[key];

  // already a CSS keyword like "red", "skyblue" — just capitalize it
  if (!key.startsWith("#")) {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  return nearestNamedColor(key);
}