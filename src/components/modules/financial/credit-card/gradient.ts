/**
 * Deriva um gradiente quente a partir da cor base do cartão.
 * Clareia a cor para o segundo stop, garantindo um resultado bonito
 * mesmo com cores escolhidas livremente (color picker livre).
 */

function clamp(n: number): number {
  return Math.max(0, Math.min(255, n));
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}

/** Clareia uma cor por um fator 0..1 (0 = igual, 1 = branco). */
function lighten(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return toHex(
    Math.round(rgb.r + (255 - rgb.r) * amount),
    Math.round(rgb.g + (255 - rgb.g) * amount),
    Math.round(rgb.b + (255 - rgb.b) * amount),
  );
}

/** CSS linear-gradient quente derivado da cor do cartão. */
export function cardGradient(color: string): string {
  const base = parseHex(color) ? color : '#c2613f'; // fallback terracota
  const lighter = lighten(base, 0.28);
  return `linear-gradient(135deg, ${base}, ${lighter})`;
}

/** Texto legível (branco) — os tons usados são escuros o suficiente. */
export const CARD_TEXT_COLOR = '#ffffff';
