/**
 * The drawing library. Every drawing is a model; the gallery, the examples
 * and the tests all read this list.
 */
import type { Drawing } from '../model.js';
import login from './login.js';
import kanban from './kanban.js';
import devices from './devices.js';
import settings from './settings.js';
import serverRack from './server-rack.js';
import { printer, mapPin, rocket } from './icons-a.js';
import { mug, trash, homes, trophy, target } from './icons-b.js';
import { database, folder, envelope, shield, cart, barChart, hourglass, terminal } from './icons-c.js';
import { engine, aiWorkflow, roboticArm, building, speaker } from './scenes-b.js';

export const library: Drawing[] = [
  // Scenes
  login, kanban, devices, settings, serverRack, aiWorkflow, engine, roboticArm, building, speaker,
  // Icons
  printer, mapPin, rocket, mug, trash, ...homes, trophy, target, database, folder, envelope, shield, cart, barChart, hourglass, terminal,
];

export const byId = (id: string): Drawing | undefined => library.find((d) => d.id === id);
