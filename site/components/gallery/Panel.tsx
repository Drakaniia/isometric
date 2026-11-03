'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Drawing, StyleId } from '@kit';
import { STYLES, STYLE_IDS, CATEGORIES } from '@kit';
import type { Settings, Swatch, Weight } from '@/lib/settings';
import { DEFAULTS, renderOpts, shownSwatches, SIZE_MIN, SIZE_MAX, SIZE_STEP, COL_MIN, COL_MAX } from '@/lib/settings';
import { copy, downloadSvg, downloadPng, svgText, tsxText } from '@/lib/exports';
import { house, tablet } from '@/lib/minis';
import DrawingView from '../DrawingView';
import { Reset, Close, Copy, Download, Code, Quote, Pointer, Sun, Moon } from '../icons';

interface Props {
  drawing: Drawing | null;
  settings: Settings;
  set: (p: Partial<Settings>) => void;
  onClose: () => void;
}

const SWATCH_LABEL: Record<Swatch, string> = { ink: 'Ink', face: 'Faces', plinth: 'Plinth', accent: 'Accent' };

export default function Panel({ drawing, settings, set, onClose }: Props) {
  const opts = useMemo(() => renderOpts(settings), [settings]);
  const [toast, setToast] = useState('');
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const flash = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(''), 1800);
  };
  const swatches = shownSwatches(settings);

  const editSwatch = (k: Swatch, v: string) => set({ style: 'yours', custom: { ...swatches, [k]: v } });
  const resetSwatches = () => {
    const p = STYLES.yours.presets[settings.theme];
    set({ custom: { ink: p.ink, face: p.face, plinth: p.plinth, accent: p.accent } });
  };
  const resetAppearance = () =>
    set({ style: DEFAULTS.style, size: DEFAULTS.size, weight: DEFAULTS.weight, facing: DEFAULTS.facing, pose: DEFAULTS.pose, custom: DEFAULTS.custom });

  return (
    <section className="panel" aria-label="Drawing and appearance">
      <div className={drawing ? 'preview has' : 'preview'} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
        {drawing ? (
          <>
            <div className="preview-head">
              <div>
                <h2>{drawing.name}</h2>
                <p className="muted">{CATEGORIES.find((c) => c.id === drawing.category)?.label} · {drawing.kind === 'scene' ? 'Scene' : 'Icon'}</p>
              </div>
              <button type="button" className="icon-btn sm" onClick={onClose} aria-label="Close drawing">
                <Close />
              </button>
            </div>
            <DrawingView drawing={drawing} opts={opts} uid={`p-${drawing.id}`} playing={hover || settings.autoplay} className="preview-art" />
            {drawing.motion?.label && <p className="hint">Point at it: {drawing.motion.label}.</p>}
          </>
        ) : (
          <div className="preview-empty">
            <Pointer />
            <strong>No drawing open</strong>
            <span>Click one in the grid to see it large, copy its code or download it.</span>
          </div>
        )}
      </div>

      {drawing && (
        <div className="actions">
          <div className="act-row">
            <button type="button" onClick={async () => flash((await copy(svgText(drawing, opts, settings.size))) ? 'SVG copied' : 'Copy failed')}>
              <Copy /> Copy SVG
            </button>
            <button type="button" onClick={async () => flash((await copy(tsxText(drawing, opts))) ? 'React component copied' : 'Copy failed')}>
              <Code /> Copy React
            </button>
          </div>
          <div className="act-row">
            <button type="button" onClick={() => downloadSvg(drawing, opts, settings.size)}>
              <Download /> SVG
            </button>
            {([1, 2, 4] as const).map((k) => (
              <button key={k} type="button" onClick={() => downloadPng(drawing, opts, settings.size, k).catch(() => flash('PNG export failed'))} aria-label={`Download PNG at ${k}x`}>
                <Download /> PNG {k}x
              </button>
            ))}
          </div>
          <div className="prompt">
            <code>{drawing.prompt}</code>
            <button type="button" className="icon-btn sm" onClick={async () => flash((await copy(drawing.prompt)) ? 'Prompt copied' : 'Copy failed')} aria-label="Copy the prompt">
              <Quote />
            </button>
          </div>
          <p className="toast" role="status" aria-live="polite">{toast}</p>
        </div>
      )}

      <div className="controls">
        <div className="ctl-head">
          <span className="label">Appearance</span>
          <button type="button" className="icon-btn sm" onClick={resetAppearance} aria-label="Reset appearance">
            <Reset />
          </button>
        </div>
        <div className="styles" role="radiogroup" aria-label="Style">
          {STYLE_IDS.map((id) => (
            <StyleButton key={id} id={id} active={settings.style === id} settings={settings} onPick={() => set({ style: id })} />
          ))}
        </div>
        <div className="swatches">
          {(['ink', 'face', 'plinth', 'accent'] as Swatch[]).map((k) => (
            <label key={k} className="swatch" title={`${SWATCH_LABEL[k]}: ${swatches[k]}`}>
              <input type="color" value={swatches[k]} onChange={(e) => editSwatch(k, e.target.value)} aria-label={`${SWATCH_LABEL[k]} colour`} />
              <span className="chip" style={{ background: swatches[k] }} />
              <span>{SWATCH_LABEL[k]}</span>
            </label>
          ))}
          <button type="button" className="icon-btn sm" onClick={resetSwatches} aria-label="Reset your colours" title="Reset your colours">
            <Reset />
          </button>
        </div>

        <Row label="Theme">
          <Seg
            value={settings.theme}
            options={[['light', <><Sun /> Light</>], ['dark', <><Moon /> Dark</>]]}
            onChange={(theme) => set({ theme })}
            name="Theme"
          />
        </Row>
        <Row label="Size">
          <div className="range">
            <input
              type="range"
              min={SIZE_MIN}
              max={SIZE_MAX}
              step={SIZE_STEP}
              value={settings.size}
              onChange={(e) => set({ size: +e.target.value })}
              aria-label="Size"
              aria-valuetext={`${settings.size} pixels`}
            />
            <span className="val">{settings.size} px</span>
          </div>
        </Row>
        <Row label="Weight">
          <Seg
            value={String(settings.weight)}
            options={[['0.5', '0.5'], ['1', '1'], ['1.5', '1.5']]}
            onChange={(w) => set({ weight: +w as Weight })}
            name="Weight"
          />
        </Row>
        <Row label="Facing">
          <Seg
            value={settings.facing}
            options={[
              ['right', <MiniIcon key="r" d={house} s={settings} facing="right" label="Right" />],
              ['left', <MiniIcon key="l" d={house} s={settings} facing="left" label="Left" />],
            ]}
            onChange={(facing) => set({ facing })}
            name="Facing"
            tall
          />
        </Row>
        <Row label="Pose">
          <Seg
            value={settings.pose}
            options={[
              ['as-drawn', <MiniIcon key="a" d={tablet} s={settings} pose="as-drawn" label="As drawn" />],
              ['standing', <MiniIcon key="s" d={tablet} s={settings} pose="standing" label="Standing" />],
              ['lying', <MiniIcon key="y" d={tablet} s={settings} pose="lying" label="Lying" />],
            ]}
            onChange={(pose) => set({ pose })}
            name="Pose"
            tall
          />
        </Row>

        <div className="ctl-head grid-head">
          <span className="label">Grid</span>
        </div>
        <Row label="Columns">
          <div className="range">
            <input type="range" min={COL_MIN} max={COL_MAX} step={1} value={settings.columns} onChange={(e) => set({ columns: +e.target.value })} aria-label="Columns" />
            <span className="val">{settings.columns}</span>
          </div>
        </Row>
        <Row label="Names">
          <Toggle on={settings.names} onChange={(names) => set({ names })} label="Show names" />
        </Row>
        <Row label="Autoplay">
          <Toggle on={settings.autoplay && !reduced} disabled={reduced} onChange={(autoplay) => set({ autoplay })} label={reduced ? 'Autoplay motion disabled by reduced motion preference' : 'Autoplay motion'} />
        </Row>
      </div>
    </section>
  );
}

function StyleButton({ id, active, settings, onPick }: { id: StyleId; active: boolean; settings: Settings; onPick: () => void }) {
  const opts = useMemo(
    () => ({ style: id, theme: settings.theme, tokens: id === 'yours' ? settings.custom : {}, weight: 1, plinth: false as const }),
    [id, settings.theme, settings.custom],
  );
  return (
    <button type="button" role="radio" aria-checked={active} className={active ? 'style-btn on' : 'style-btn'} onClick={onPick} title={STYLES[id].blurb}>
      <DrawingView drawing={house} opts={opts} uid={`sb-${id}`} decorative className="style-art" />
      <span>{STYLES[id].label}</span>
    </button>
  );
}

function MiniIcon({ d, s, facing, pose, label }: { d: Drawing; s: Settings; facing?: 'left' | 'right'; pose?: 'as-drawn' | 'standing' | 'lying'; label: string }) {
  const opts = useMemo(
    () => ({ style: 'two-tone' as StyleId, theme: s.theme, facing: facing || 'right', pose: pose || ('as-drawn' as const), weight: 1 }),
    [s.theme, facing, pose],
  );
  return (
    <span className="mini">
      <DrawingView drawing={d} opts={opts} uid={`mi-${d.id}-${facing || ''}${pose || ''}`} decorative className="mini-art" />
      <span>{label}</span>
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      <div className="row-ctl">{children}</div>
    </div>
  );
}

function Seg<T extends string>({ value, options, onChange, name, tall }: { value: T; options: [T, React.ReactNode][]; onChange: (v: T) => void; name: string; tall?: boolean }) {
  return (
    <div className={tall ? 'seg full tall' : 'seg full'} role="radiogroup" aria-label={name}>
      {options.map(([v, node]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {node}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange, label, disabled = false }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" disabled={disabled} aria-checked={on} aria-label={label} className={on ? 'switch on' : 'switch'} onClick={() => onChange(!on)}>
      <span />
    </button>
  );
}
