import { STYLES, baseTokens, deriveAll } from '@kit';

const ROWS: [string, string][] = [
  ['bg', 'The background. Stroke faces are filled with it, so hidden lines stay hidden.'],
  ['line', 'Every outline and crease. Derived from ink.'],
  ['soft', 'Minor lines, ticks and the text-line bars.'],
  ['body-t', 'Top faces of the main mass.'],
  ['body-l', 'Faces turned toward the light (lower left).'],
  ['body-r', 'Faces turned away from the light (lower right).'],
  ['face-t', 'Secondary panels: screens, bezels, cards.'],
  ['detail-t', 'Small parts: keys, knobs, feet.'],
  ['ink-t', 'Parts that are solid ink: dark glass, tyres, cursors.'],
  ['accent-t', 'The top of the one lit part.'],
  ['accent-l', 'Its lit side.'],
  ['accent-r', 'Its shaded side.'],
  ['plinth-t', 'The Anatomy plinth.'],
  ['ruler-t', 'Ruler ticks on the plinth.'],
];

/** Every --iso-* variable an Anatomy or Two-tone component reads, with its light and dark value. */
export default function TokenTable() {
  const light = deriveAll('anatomy', baseTokens('anatomy', 'light'));
  const dark = deriveAll('anatomy', baseTokens('anatomy', 'dark'));
  const L = STYLES.anatomy.presets.light, D = STYLES.anatomy.presets.dark;
  const base: [string, string, string, string][] = [
    ['ink', L.ink, D.ink, 'Outlines and solid-ink parts. Every line derives from it.'],
    ['face', L.face, D.face, 'The faces of every solid. Shades are mixed toward black from it.'],
    ['plinth', L.plinth, D.plinth, 'The Anatomy plinth and its ruler.'],
    ['accent', L.accent, D.accent, 'The one accent: the part the reader should watch.'],
  ];
  const chip = (c: string) => <span className="tchip" style={{ background: c }} />;
  return (
    <div className="table-wrap">
      <table className="tokens">
        <thead>
          <tr><th>Token</th><th>Light</th><th>Dark</th><th>What it paints</th></tr>
        </thead>
        <tbody>
          <tr className="group"><td colSpan={4}>Base tokens: the <code>tokens</code> prop</td></tr>
          {base.map(([k, l, d, what]) => (
            <tr key={k}><td><code>{k}</code></td><td>{chip(l)}<code>{l}</code></td><td>{chip(d)}<code>{d}</code></td><td>{what}</td></tr>
          ))}
          <tr className="group"><td colSpan={4}>Derived variables, set on the element so they win over outside CSS</td></tr>
          {ROWS.map(([k, what]) => (
            <tr key={k}><td><code>--iso-{k}</code></td><td>{chip(light[k])}<code>{light[k]}</code></td><td>{chip(dark[k])}<code>{dark[k]}</code></td><td>{what}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
