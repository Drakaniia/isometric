/**
 * isometric kit: a style-based isometric line-art renderer.
 *
 *   import { render, library } from './kit/dist/index.js';
 *   const { svg } = render(library[0], { style: 'two-tone', facing: 'left' });
 */
export * from './math.js';
export * from './color.js';
export * from './model.js';
export * from './geometry.js';
export * from './styles.js';
export * from './render.js';
export * from './export.js';
export * from './build.js';
export { library, byId } from './library/index.js';
