import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSvg } from '../../scripts/validate-svg.mjs';

const fx = (n) => fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../fixtures', n), 'utf8');
const has = (list, re) => list.some((m) => re.test(m));

test('valid SVG has no errors or warnings', () => {
  const r = validateSvg(fx('valid.svg'));
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});
test('duplicate attributes are errors', () => assert.ok(has(validateSvg(fx('duplicate-attribute.svg')).errors, /repeats attribute "stroke-opacity"/)));
test('broken url(#id) references are errors', () => assert.ok(has(validateSvg(fx('broken-ref.svg')).errors, /missing id "missing"/)));
test('bad path data is reported', () => {
  const e = validateSvg(fx('bad-path.svg')).errors;
  assert.ok(has(e, /NaN|not valid|moveto/));
});
test('unclosed elements are errors', () => assert.ok(validateSvg(fx('unclosed.svg')).errors.length > 0));
test('missing viewBox, name and reduced-motion rule are warnings', () => {
  const w = validateSvg(fx('no-a11y-animated.svg')).warnings;
  assert.ok(has(w, /viewBox/) && has(w, /accessible name/) && has(w, /reduced-motion/));
});
