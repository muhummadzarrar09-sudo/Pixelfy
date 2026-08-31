/**
 * Pixelfy Web — theme registry.
 * Each theme = CSS variable overrides (styles.css [data-theme]) + GL colours
 * for the parts drawn on the GPU (canvas backdrop, split divider).
 * Palette cards live in assets/branding/palettes/.
 */

export type RGB = [number, number, number];

export interface Theme {
  id: string;
  name: string;
  blurb: string;
  swatch: [string, string, string]; // [bg, panel, accent] for the picker dots
  glBg: RGB;      // canvas backdrop
  glAccent: RGB;  // split divider
}

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const THEMES: Theme[] = [
  {
    id: 'amber-darkroom', name: 'Amber Darkroom', blurb: 'Analog film lab · safelight glow',
    swatch: ['#141210', '#1C1917', '#FFB020'], glBg: hex('#141210'), glAccent: hex('#FFB020'),
  },
  {
    id: 'graphite-teal', name: 'Graphite Teal', blurb: 'Neutral pro-editor gray + teal',
    swatch: ['#17191C', '#1F2226', '#2DD4BF'], glBg: hex('#17191C'), glAccent: hex('#2DD4BF'),
  },
  {
    id: 'midnight-electric', name: 'Midnight Electric', blurb: 'Deep navy + electric cyan',
    swatch: ['#0B1220', '#111A2E', '#22D3EE'], glBg: hex('#0B1220'), glAccent: hex('#22D3EE'),
  },
  {
    id: 'phosphor', name: 'Phosphor', blurb: 'Terminal green on tinted black',
    swatch: ['#0A0F0D', '#111916', '#4ADE80'], glBg: hex('#0A0F0D'), glAccent: hex('#4ADE80'),
  },
  {
    id: 'light-studio', name: 'Light Studio', blurb: 'Clean paper + cobalt',
    swatch: ['#F4F3F0', '#FFFFFF', '#2563EB'], glBg: hex('#E9E7E1'), glAccent: hex('#2563EB'),
  },
  {
    id: 'nebula', name: 'Nebula (legacy)', blurb: 'The original purple — kept for nostalgia',
    swatch: ['#0F0B1A', '#16102A', '#8B5CF6'], glBg: hex('#0F0B1A'), glAccent: hex('#8B5CF6'),
  },
];

export const DEFAULT_THEME = 'amber-darkroom';

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
