#!/usr/bin/env node
/**
 * validate-project.mjs: discover how a project is built and checked, without assuming a framework.
 *
 * Usage: node scripts/validate-project.mjs [dir] [--json] [--run lint,typecheck,test]
 *
 * By default it only REPORTS: framework and library hints, package manager, available
 * check scripts, where SVG/illustration files live, and design-token sources.
 * --run executes the named package.json scripts with the detected package manager.
 * It never installs, deletes or rewrites anything, and refuses to run "build" unless you name it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from './_resolve.mjs';

const { pos, flags } = parseArgs(process.argv.slice(2));
if (flags.help) { console.error('Usage: node scripts/validate-project.mjs [dir] [--json] [--run lint,typecheck,test]'); process.exit(0); }
const dir = path.resolve(pos[0] || '.');
if (!fs.existsSync(dir)) { console.error(`Not found: ${dir}`); process.exit(2); }
const has = (f) => fs.existsSync(path.join(dir, f));
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { return null; } };

const pkg = readJson('package.json');
const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
const HINTS = {
  frameworks: ['next', 'react', 'vue', 'nuxt', '@sveltejs/kit', 'svelte', 'astro', 'solid-js', '@angular/core', 'vite', 'remix', '@remix-run/react', 'gatsby'],
  rendering: ['three', '@react-three/fiber', '@react-three/drei', 'pixi.js', 'babylonjs', 'regl', 'p5', 'd3', 'konva', 'paper'],
  animation: ['gsap', 'framer-motion', 'motion', '@react-spring/web', 'animejs', 'lottie-web', 'react-native-reanimated'],
  styling: ['tailwindcss', 'styled-components', '@emotion/react', 'sass', '@vanilla-extract/css', 'unocss', '@pandacss/dev'],
  svg: ['@svgr/webpack', 'vite-plugin-svgr', 'svgo', 'svg-sprite'],
};
const found = Object.fromEntries(Object.entries(HINTS).map(([k, list]) => [k, list.filter((d) => deps[d])]));

let pm = null;
for (const [f, name] of [['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['bun.lockb', 'bun'], ['bun.lock', 'bun'], ['package-lock.json', 'npm']]) if (has(f)) { pm = name; break; }
if (!pm && pkg) pm = 'npm';

const scripts = pkg?.scripts || {};
const wanted = ['lint', 'typecheck', 'type-check', 'check', 'test', 'build'];
const available = wanted.filter((s) => scripts[s]);
const other = [];
for (const [f, label] of [['pyproject.toml', 'python'], ['Cargo.toml', 'rust'], ['go.mod', 'go'], ['Gemfile', 'ruby'], ['composer.json', 'php'], ['pubspec.yaml', 'dart/flutter']]) if (has(f)) other.push(label);

const walk = (d, depth = 0, acc = []) => {
  if (depth > 4) return acc;
  let ents = [];
  try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return acc; }
  for (const e of ents) {
    if (['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.svelte-kit', 'coverage', '.turbo'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, depth + 1, acc); else acc.push(p);
  }
  return acc;
};
const files = walk(dir);
const rel = (p) => path.relative(dir, p);
const svgs = files.filter((f) => f.endsWith('.svg')).map(rel);
const tokens = files.filter((f) => /(tailwind\.config|theme\.(ts|js|json)|tokens\.(json|css|ts)|variables\.(css|scss)|globals?\.css)$/i.test(f)).map(rel);

const report = {
  directory: dir,
  packageManager: pm,
  language: pkg ? (deps.typescript || has('tsconfig.json') ? 'TypeScript/JavaScript' : 'JavaScript') : other[0] || (has('index.html') ? 'static HTML' : 'unknown'),
  otherEcosystems: other,
  detected: found,
  checkScripts: available,
  svgFiles: { count: svgs.length, sample: svgs.slice(0, 8) },
  designTokenFiles: tokens.slice(0, 10),
  suggestion: available.filter((s) => s !== 'build').length ? `run: ${available.filter((s) => s !== 'build').map((s) => `${pm} run ${s}`).join(' && ')}` : 'no lint/typecheck/test scripts found; validate SVGs with scripts/validate-svg.mjs and check the page in a browser',
};

if (flags.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Project: ${dir}`);
  console.log(`  language / ecosystem : ${report.language}${other.length ? ' + ' + other.join(', ') : ''}`);
  console.log(`  package manager      : ${pm || 'none'}`);
  for (const [k, v] of Object.entries(found)) if (v.length) console.log(`  ${k.padEnd(20)} : ${v.join(', ')}`);
  console.log(`  check scripts        : ${available.join(', ') || 'none'}`);
  console.log(`  SVG files            : ${svgs.length}${svgs.length ? ' (e.g. ' + svgs.slice(0, 3).join(', ') + ')' : ''}`);
  console.log(`  design token files   : ${tokens.slice(0, 5).join(', ') || 'none found'}`);
  console.log(`  ${report.suggestion}`);
}

if (flags.run && flags.run !== true) {
  if (!pkg || !pm) { console.error('--run needs a package.json'); process.exit(2); }
  let failed = false;
  for (const s of String(flags.run).split(',')) {
    if (!scripts[s]) { console.error(`No "${s}" script in package.json. Skipping.`); continue; }
    console.log(`\n$ ${pm} run ${s}`);
    const r = spawnSync(pm, ['run', s], { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' });
    if (r.status !== 0) { failed = true; console.error(`"${s}" failed (exit ${r.status}).`); }
  }
  process.exit(failed ? 1 : 0);
}
