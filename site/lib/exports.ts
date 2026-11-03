/** Copy and download actions for an open drawing. Browser only. */
import type { Drawing, RenderOptions } from '@kit';
import { toSvg, toTsx, componentName } from '@kit';

/** Export width in px: icons at the chosen size, scenes larger. */
export const exportWidth = (d: Drawing, size: number) => (d.kind === 'scene' ? Math.round(size * 2.5) : size);

export function svgText(d: Drawing, opts: RenderOptions, size: number): string {
  return toSvg(d, { ...opts, size: exportWidth(d, size) });
}

export function tsxText(d: Drawing, opts: RenderOptions): string {
  return toTsx(d, opts);
}

export async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvg(d: Drawing, opts: RenderOptions, size: number): void {
  download(new Blob([svgText(d, opts, size)], { type: 'image/svg+xml' }), `${d.id}-${opts.style}.svg`);
}

/** PNG at 1x/2x/4x: the SVG is re-rendered at that size with the line weight scaled to match. */
export async function downloadPng(d: Drawing, opts: RenderOptions, size: number, scale: 1 | 2 | 4): Promise<void> {
  const w = exportWidth(d, size) * scale;
  const svg = toSvg(d, { ...opts, size: w, weight: (opts.weight ?? 1) * scale, id: `png-${d.id}` });
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not rasterise the SVG'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = Math.round((w * img.naturalHeight) / img.naturalWidth) || w;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('PNG encoding failed');
    download(blob, `${d.id}-${opts.style}@${scale}x.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const tsxFileName = (d: Drawing) => `${componentName(d.id)}.tsx`;
