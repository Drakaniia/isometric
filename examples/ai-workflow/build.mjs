/**
 * AI workflow: documents in, a model chip in the middle, answers out. Tokens
 * ride the belts (loop translation) and a settings panel floats above.
 * Model: kit/src/library/scenes-b.ts (aiWorkflow). Build: node examples/ai-workflow/build.mjs
 */
import { main } from '../_emit.mjs';
await main(import.meta.url, 'ai-workflow', { notes: 'Teaches: a concept drawn as objects (documents, belt, chip, answer cards), loop translation, one accent on the die.' });
