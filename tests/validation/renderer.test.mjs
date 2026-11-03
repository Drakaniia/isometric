import test from 'node:test';
import assert from 'node:assert/strict';
import { library, render, STYLE_IDS, toTsx, project, unprojectToPlane } from '../../kit/dist/index.js';
import { validateSvg } from '../../scripts/validate-svg.mjs';

test('projection round trip', () => {
  const p = [3, 2, 5];
  const [x, y] = project(p, 24);
  const q = unprojectToPlane(x, y, 2, 24);
  q.forEach((v, i) => assert.ok(Math.abs(v - p[i]) < 1e-9));
});

test('all drawings across styles, facings, poses and motion frames', () => {
  const failures = [];
  let cases = 0;
  for (const d of library) for (const style of STYLE_IDS) for (const facing of ['right', 'left']) for (const pose of ['as-drawn', 'standing', 'lying']) {
    for (const phase of [undefined, 0.25, 0.5, 0.75]) {
      const opts = { style, facing, pose, phase, id: 'test' };
      const r = render(d, opts);
      const label = `${d.id}/${style}/${facing}/${pose}/${phase}`;
      if (r.audit.cycles) failures.push(`${label}: ${r.audit.cycles} cycles`);
      const v = validateSvg(r.svg);
      if (v.errors.length) failures.push(`${label}: ${v.errors.join('; ')}`);
      assert.ok(r.viewBox.every(Number.isFinite));
      cases++;
    }
  }
  console.log(`${cases} render combinations checked`);
  assert.deepEqual(failures, []);
});

test('render is deterministic with an explicit id; baked exports contain no gradients', () => {
  for (const d of library) {
    const a = render(d, { id: 'stable', style: 'anatomy' }).svg;
    assert.equal(a, render(d, { id: 'stable', style: 'anatomy' }).svg);
    assert.doesNotMatch(a, /linearGradient|radialGradient|<filter/);
    assert.match(a, /<title/);
    assert.match(a, /<desc/);
  }
});

test('self-contained React exports have no kit imports', () => {
  for (const d of library) {
    const s = toTsx(d);
    assert.match(s, /import \* as React from "react"/);
    assert.doesNotMatch(s, /from ['"].*(?:kit|isometric)/);
    assert.match(s, /prefers-reduced-motion/);
  }
});
