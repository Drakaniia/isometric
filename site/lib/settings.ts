/**
 * settings.ts: the appearance panel's state, its defaults, and how it is
 * written to the URL (shareable) and to localStorage (remembered).
 * When both exist, the URL wins.
 */
import type { StyleId, Theme, Facing, Pose, BaseTokens, RenderOptions } from '@kit';
import { STYLE_IDS, STYLES, baseTokens, isHex, normHex } from '@kit';

export type Weight = 0.5 | 1 | 1.5;
export type Swatch = 'ink' | 'face' | 'plinth' | 'accent';

export interface Settings {
  style: StyleId;
  theme: Theme;
  /** The user's own colours (used by the Yours style). */
  custom: Record<Swatch, string>;
  size: number;
  weight: Weight;
  facing: Facing;
  pose: Pose;
  columns: number;
  names: boolean;
  autoplay: boolean;
}

export interface Filters {
  q: string;
  cat: string;
  kind: 'all' | 'icon' | 'scene';
  sort: 'newest' | 'name';
  page: number;
}

const yoursLight = STYLES.yours.presets.light;

export const DEFAULTS: Settings = {
  style: 'two-tone',
  theme: 'light',
  custom: { ink: yoursLight.ink, face: yoursLight.face, plinth: yoursLight.plinth, accent: yoursLight.accent },
  size: 96,
  weight: 1,
  facing: 'right',
  pose: 'as-drawn',
  columns: 6,
  names: true,
  autoplay: false,
};

export const FILTER_DEFAULTS: Filters = { q: '', cat: 'all', kind: 'all', sort: 'newest', page: 1 };

export const SIZE_MIN = 48, SIZE_MAX = 160, SIZE_STEP = 8;
export const COL_MIN = 3, COL_MAX = 8;

/** The colours the swatch row shows for the current settings. */
export function shownSwatches(s: Settings): Record<Swatch, string> {
  if (s.style === 'yours') return s.custom;
  const p = STYLES[s.style].presets[s.theme];
  return { ink: p.ink, face: p.face, plinth: p.plinth, accent: p.accent };
}

/** Render options for a drawing under these settings. */
export function renderOpts(s: Settings): RenderOptions {
  const tokens: Partial<BaseTokens> = s.style === 'yours' ? { ...s.custom } : {};
  return { style: s.style, theme: s.theme, tokens, facing: s.facing, pose: s.pose, weight: s.weight };
}

export function tokensFor(s: Settings): BaseTokens {
  return baseTokens(s.style, s.theme, s.style === 'yours' ? s.custom : {});
}

const clampInt = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));

/** Merge an untrusted partial (from the URL or storage) into settings. */
export function sanitize(input: Record<string, unknown>, base: Settings = DEFAULTS): Settings {
  const s: Settings = { ...base, custom: { ...base.custom } };
  const v = input;
  if (typeof v.style === 'string' && (STYLE_IDS as string[]).includes(v.style)) s.style = v.style as StyleId;
  if (v.theme === 'light' || v.theme === 'dark') s.theme = v.theme;
  if (v.facing === 'left' || v.facing === 'right') s.facing = v.facing;
  if (v.pose === 'as-drawn' || v.pose === 'standing' || v.pose === 'lying') s.pose = v.pose;
  const size = Number(v.size);
  if (Number.isFinite(size) && v.size !== undefined && v.size !== '') s.size = clampInt(size, SIZE_MIN, SIZE_MAX);
  const w = Number(v.weight);
  if (w === 0.5 || w === 1 || w === 1.5) s.weight = w;
  const cols = Number(v.columns ?? v.cols);
  if (Number.isFinite(cols) && (v.columns !== undefined || v.cols !== undefined)) s.columns = clampInt(cols, COL_MIN, COL_MAX);
  if (typeof v.names === 'boolean') s.names = v.names;
  else if (v.names === '0' || v.names === '1') s.names = v.names === '1';
  if (typeof v.autoplay === 'boolean') s.autoplay = v.autoplay;
  else if (v.autoplay === '0' || v.autoplay === '1') s.autoplay = v.autoplay === '1';
  const custom = (v.custom && typeof v.custom === 'object' ? v.custom : v) as Record<string, unknown>;
  for (const k of ['ink', 'face', 'plinth', 'accent'] as Swatch[]) {
    const c = custom[k];
    if (typeof c === 'string' && isHex(c.startsWith('#') ? c : `#${c}`)) s.custom[k] = normHex(c.startsWith('#') ? c : `#${c}`);
  }
  return s;
}

/** Settings and filters to query parameters (only what differs from the defaults). */
export function toQuery(s: Settings, f: Filters): string {
  const q = new URLSearchParams();
  q.set('style', s.style);
  q.set('theme', s.theme);
  if (s.style === 'yours') for (const k of ['ink', 'face', 'plinth', 'accent'] as Swatch[]) q.set(k, s.custom[k].replace('#', ''));
  q.set('size', String(s.size));
  q.set('weight', String(s.weight));
  q.set('facing', s.facing);
  q.set('pose', s.pose);
  q.set('cols', String(s.columns));
  q.set('names', s.names ? '1' : '0');
  q.set('autoplay', s.autoplay ? '1' : '0');
  if (f.q) q.set('q', f.q);
  if (f.cat !== 'all') q.set('cat', f.cat);
  if (f.kind !== 'all') q.set('kind', f.kind);
  if (f.sort !== 'newest') q.set('sort', f.sort);
  if (f.page > 1) q.set('page', String(f.page));
  const str = q.toString();
  return str ? `?${str}` : '';
}

export function filtersFrom(params: URLSearchParams): Filters {
  const f: Filters = { ...FILTER_DEFAULTS };
  f.q = (params.get('q') || '').slice(0, 80);
  f.cat = params.get('cat') || 'all';
  const kind = params.get('kind');
  if (kind === 'icon' || kind === 'scene') f.kind = kind;
  if (params.get('sort') === 'name') f.sort = 'name';
  const page = Number(params.get('page'));
  if (Number.isFinite(page) && page >= 1) f.page = Math.floor(page);
  return f;
}

/** Which settings keys the URL actually set (so they win over storage). */
export function settingsFromParams(params: URLSearchParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of ['style', 'theme', 'size', 'weight', 'facing', 'pose', 'cols', 'names', 'autoplay', 'ink', 'face', 'plinth', 'accent']) {
    const v = params.get(k);
    if (v !== null) out[k] = v;
  }
  return out;
}

export const STORAGE_KEY = 'isometric.settings.v1';
export const THEME_KEY = 'isometric.theme';

export function loadStored(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function store(s: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    localStorage.setItem(THEME_KEY, s.theme);
  } catch {
    /* private mode */
  }
}
