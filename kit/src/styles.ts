/**
 * styles.ts: the six appearance styles.
 *
 * A style maps (role, face orientation) to a colour expression over five base
 * tokens: bg, ink, face, plinth, accent. Orientation: t = top (lightest),
 * l = faces turned toward the viewer's left (lit), r = faces turned right
 * (shaded). The light never moves: it comes from the upper left.
 */
import type { Paint, Role } from './model.js';
import { evalSlot } from './color.js';

export type StyleId = 'stroke' | 'two-tone' | 'duotone' | 'fill' | 'anatomy' | 'yours';
export type Theme = 'light' | 'dark';
export type Orient = 't' | 'l' | 'r';

export interface BaseTokens {
  bg: string;
  ink: string;
  face: string;
  plinth: string;
  accent: string;
}

/** The four swatches a user can edit (bg follows the theme). */
export const SWATCHES = ['ink', 'face', 'plinth', 'accent'] as const;
export type SwatchKey = (typeof SWATCHES)[number];

type Tones = [string, string, string];

export interface StyleDef {
  id: StyleId;
  label: string;
  blurb: string;
  /** When the renderer draws the Anatomy plinth. */
  plinth: 'never' | 'always' | 'scene';
  presets: Record<Theme, BaseTokens>;
  solid: Record<Role, Tones>;
  /** Overrides for decal fills, by paint. */
  decal?: Partial<Record<Paint, Tones>>;
  line: string;
  soft: string;
  /** Colour of strokes drawn on decals (defaults to line / soft). */
  decalLine?: string;
  glassOpacity: number;
  /** Whether the outline is drawn at all on solid faces (Fill keeps it). */
  outline: boolean;
}

const LIGHT: BaseTokens = { bg: '#ffffff', ink: '#1f1f22', face: '#fdfcf9', plinth: '#c7d7c3', accent: '#ef6c4d' };
const DARK: BaseTokens = { bg: '#161616', ink: '#e8e6e0', face: '#2b2b2b', plinth: '#3d4c3e', accent: '#ef6c4d' };

const TWO_TONE_SOLID: Record<Role, Tones> = {
  body: ['face', 'face>0.05', 'face>0.12'],
  face: ['face>0.06', 'face>0.1', 'face>0.17'],
  detail: ['face>0.14', 'face>0.19', 'face>0.26'],
  ink: ['ink~face:0.18', 'ink~face:0.08', 'ink'],
  accent: ['accent<0.2', 'accent', 'accent>0.14'],
  plinth: ['plinth', 'plinth>0.07', 'plinth>0.16'],
  ruler: ['plinth>0.26', 'plinth>0.3', 'plinth>0.36'],
  glass: ['face', 'face>0.04', 'face>0.1'],
};

const bgAll: Tones = ['bg', 'bg', 'bg'];

export const STYLES: Record<StyleId, StyleDef> = {
  stroke: {
    id: 'stroke',
    label: 'Stroke',
    blurb: 'Ink outlines only. Faces take the background colour, so hidden lines stay hidden.',
    plinth: 'never',
    presets: { light: { ...LIGHT, face: '#ffffff' }, dark: { ...DARK, face: '#161616' } },
    solid: { body: bgAll, face: bgAll, detail: bgAll, ink: bgAll, accent: bgAll, plinth: bgAll, ruler: bgAll, glass: bgAll },
    decal: { ink: ['ink', 'ink', 'ink'] },
    line: 'ink',
    soft: 'ink~bg:0.45',
    glassOpacity: 0,
    outline: true,
  },
  'two-tone': {
    id: 'two-tone',
    label: 'Two-tone',
    blurb: 'Ink outline, warm white faces and one accent colour on the part that matters.',
    plinth: 'never',
    presets: { light: LIGHT, dark: DARK },
    solid: TWO_TONE_SOLID,
    line: 'ink',
    soft: 'ink~face:0.55',
    glassOpacity: 0.5,
    outline: true,
  },
  duotone: {
    id: 'duotone',
    label: 'Duotone',
    blurb: 'Two tones of one hue. Outlines are a deep tint of the fill rather than pure ink.',
    plinth: 'never',
    presets: { light: { ...LIGHT, accent: '#5b7cfa' }, dark: { ...DARK, accent: '#6f8cff' } },
    solid: {
      body: ['accent~bg:0.86', 'accent~bg:0.78', 'accent~bg:0.68'],
      face: ['accent~bg:0.72', 'accent~bg:0.64', 'accent~bg:0.54'],
      detail: ['accent~bg:0.56', 'accent~bg:0.48', 'accent~bg:0.38'],
      ink: ['accent~ink:0.42', 'accent~ink:0.5', 'accent~ink:0.58'],
      accent: ['accent<0.14', 'accent', 'accent>0.12'],
      plinth: ['accent~bg:0.9', 'accent~bg:0.84', 'accent~bg:0.76'],
      ruler: ['accent~bg:0.5', 'accent~bg:0.45', 'accent~bg:0.4'],
      glass: ['accent~bg:0.9', 'accent~bg:0.86', 'accent~bg:0.8'],
    },
    line: 'accent~ink:0.58',
    soft: 'accent~bg:0.35',
    glassOpacity: 0.55,
    outline: true,
  },
  fill: {
    id: 'fill',
    label: 'Fill',
    blurb: 'Solid shaded silhouettes in ink tones, with details cut out in the face colour.',
    plinth: 'never',
    presets: { light: LIGHT, dark: DARK },
    solid: {
      body: ['ink~bg:0.3', 'ink~bg:0.15', 'ink'],
      face: ['ink~bg:0.48', 'ink~bg:0.38', 'ink~bg:0.28'],
      detail: ['ink~bg:0.62', 'ink~bg:0.54', 'ink~bg:0.45'],
      ink: ['ink', 'ink', 'ink'],
      accent: ['accent<0.2', 'accent', 'accent>0.14'],
      plinth: ['ink~bg:0.8', 'ink~bg:0.7', 'ink~bg:0.6'],
      ruler: ['ink~bg:0.5', 'ink~bg:0.45', 'ink~bg:0.4'],
      glass: ['ink~bg:0.7', 'ink~bg:0.6', 'ink~bg:0.5'],
    },
    decal: {
      body: ['face', 'face>0.06', 'face>0.12'],
      face: ['face', 'face>0.06', 'face>0.12'],
      detail: ['face>0.08', 'face>0.12', 'face>0.18'],
      soft: ['face', 'face>0.06', 'face>0.12'],
      ink: ['ink', 'ink', 'ink'],
    },
    line: 'ink',
    soft: 'face>0.08',
    decalLine: 'ink',
    glassOpacity: 0.6,
    outline: true,
  },
  anatomy: {
    id: 'anatomy',
    label: 'Anatomy',
    blurb: 'Two-tone parts on a sage plinth with ruler ticks and a label plate.',
    plinth: 'always',
    presets: { light: { ...LIGHT, face: '#fcfbf8' }, dark: DARK },
    solid: TWO_TONE_SOLID,
    line: 'ink',
    soft: 'ink~face:0.55',
    glassOpacity: 0.5,
    outline: true,
  },
  yours: {
    id: 'yours',
    label: 'Yours',
    blurb: 'Your own Ink, Faces, Plinth and Accent, with the Two-tone rules and a plinth under scenes.',
    plinth: 'scene',
    presets: { light: LIGHT, dark: DARK },
    solid: TWO_TONE_SOLID,
    line: 'ink',
    soft: 'ink~face:0.55',
    glassOpacity: 0.5,
    outline: true,
  },
};

export const STYLE_IDS: StyleId[] = ['stroke', 'two-tone', 'duotone', 'fill', 'anatomy', 'yours'];

const OI: Record<Orient, number> = { t: 0, l: 1, r: 2 };

/** A resolved colour: its CSS variable name, its expression and its hex value. */
export interface Slot {
  name: string;
  expr: string;
}

export function solidSlot(st: StyleDef, role: Role, o: Orient): Slot {
  return { name: `${role}-${o}`, expr: st.solid[role][OI[o]] };
}

export function decalSlot(st: StyleDef, paint: Paint, o: Orient): Slot {
  const over = st.decal?.[paint];
  if (over) return { name: `d-${paint}-${o}`, expr: over[OI[o]] };
  if (paint === 'bg') return { name: 'bg', expr: 'bg' };
  if (paint === 'soft') return { name: 'soft', expr: st.soft };
  return solidSlot(st, paint, o);
}

export const lineSlot = (st: StyleDef): Slot => ({ name: 'line', expr: st.line });
export const softSlot = (st: StyleDef): Slot => ({ name: 'soft', expr: st.soft });
export const decalLineSlot = (st: StyleDef, soft: boolean): Slot =>
  st.decalLine ? { name: soft ? 'dline-soft' : 'dline', expr: st.decalLine } : soft ? softSlot(st) : lineSlot(st);

/** Base tokens for a style, theme and user overrides. */
export function baseTokens(style: StyleId, theme: Theme = 'light', over: Partial<BaseTokens> = {}): BaseTokens {
  const p = STYLES[style].presets[theme];
  const out = { ...p };
  for (const k of Object.keys(over) as (keyof BaseTokens)[]) if (over[k]) out[k] = over[k] as string;
  return out;
}

/** Every derived token of a style, as hex. Used by the token table and exports. */
export function deriveAll(style: StyleId, base: BaseTokens): Record<string, string> {
  const st = STYLES[style];
  const b = base as unknown as Record<string, string>;
  const out: Record<string, string> = { bg: evalSlot('bg', b), line: evalSlot(st.line, b), soft: evalSlot(st.soft, b) };
  for (const role of Object.keys(st.solid) as Role[]) {
    (['t', 'l', 'r'] as Orient[]).forEach((o) => (out[`${role}-${o}`] = evalSlot(st.solid[role][OI[o]], b)));
  }
  return out;
}
