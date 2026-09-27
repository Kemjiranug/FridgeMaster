import { ITEMS_BY_ID } from '../items.js'
import n0 from '../../assets/level33/uncovered-meal.svg'
import n1 from '../../assets/level33/rte-hot.svg'
import n2 from '../../assets/level33/expired-yogurt.svg'
import n3 from '../../assets/level33/opened-can.svg'
import n4 from '../../assets/level33/clutter.svg'
import n5 from '../../assets/level33/wrong-fridge.svg'
import n6 from '../../assets/level33/raw-above-rte.svg'
import n7 from '../../assets/level33/leaking-chicken.svg'
import n8 from '../../assets/level33/missing-label.svg'
import n9 from '../../assets/level33/freezer-warm.svg'

// Level 33 — "Find the Violations! Fridge Audit"
// -----------------------------------------------------------------------
// Setting: Hospital Food Service — Walk-in Refrigerator.
// `layout: 'violations'` renders components/ViolationScene.jsx — a walk-in
// fridge split into 4 zones (left) and a "Choose The Violation" question
// card (right): click a hazard, pick A/B/C for the reason, then fix it.
// (Level 35 still uses the bigger AuditScene.) Instead of Level 35's 5 HACCP
// categories, the player only has to sort each hazard into one of 3
// plain-language reasons:
//   A. Quality problem
//   B. Cross-contamination risk
//   C. Temperature problem
// The reason (A/B/C) is what's actually scored — same as every other
// generic level, `onDropItem(itemId, reasonId)` is checked against
// `items[].shelf`. The "Fix It" step still runs so the player practices
// the full Find → Explain → Fix workflow; it isn't separately scored.
//
// The 10 hazards below reuse the same walk-in-fridge art assets as Level
// 35 (src/assets/level35/*) — no new art needed — just re-classified under
// the simpler 3-reason scheme via each item's `shelf` override (the spread
// in data/levels/index.js's buildLevelSet lets a level's own item entry
// override the catalog default, so Level 35's own cat-* classification is
// untouched).

export const NO_VIOLATION = { id: 'q-none', name: 'No violation' }

export const REASONS = [
  { id: 'q-quality', name: 'Quality problem',          hint: 'Spoiled, expired, or poorly stored/labeled food' },
  { id: 'q-cross',   name: 'Cross-contamination risk', hint: 'Raw touching, dripping onto, or mixed in with ready-to-eat food' },
  { id: 'q-temp',    name: 'Temperature problem',      hint: 'Fridge or freezer reading outside the safe range' },
]

// Corrective actions offered in the "Fix It" step.
export const CORRECTION_ACTIONS = [
  { id: 'move',      name: 'Move it',    icon: '➡️' },
  { id: 'cover',     name: 'Cover it',   icon: '🥡' },
  { id: 'repack',    name: 'Repack / label it', icon: '📦' },
  { id: 'adjust',    name: 'Adjust the temperature', icon: '🌡️' },
  { id: 'discard',   name: 'Discard it', icon: '🗑️' },
  { id: 'clean',     name: 'Clean it up', icon: '🧽' },
]

// The four zones of the walk-in. `kind` decides the safe temperature range
// (chill: at or below 5°C, freezer: at or below -18°C). `start` is what the
// dial reads when the level opens — Chilled and Freezer start OUT of range
// on purpose (those are the two temperature violations).
export const ZONES = [
  { id: 'rte',     name: 'Chilled / RTE',  full: 'Chilled / Ready-to-Eat Zone', kind: 'chill',   start: 8,   step: 1, min: 0,   max: 12, rows: [1, 2] },
  { id: 'produce', name: 'Fresh Produce',  full: 'Fresh Produce Zone',          kind: 'chill',   start: 4,   step: 1, min: 0,   max: 12, rows: [3, 4] },
  { id: 'raw',     name: 'Raw & Egg',      full: 'Raw & Egg Zone',              kind: 'chill',   start: 4,   step: 1, min: 0,   max: 12, rows: [5] },
  { id: 'freezer', name: 'Freezer',        full: 'Freezer Zone',                kind: 'freezer', start: -10, step: 2, min: -30, max: -4, rows: [6] },
]
export const SAFE_TEMP = { chill: 5, freezer: -18 } // safe = at or below this

export const LOCATIONS = [
  {
    id: 'hospital-walkin',
    name: '🏥 Hospital Food Service — Walk-in Refrigerator',
    desc: "You're auditing the walk-in refrigerator before patient meal service begins.",
  },
]

export const TIPS = [
  {
    title: 'Find → Explain → Fix',
    img: ITEMS_BY_ID['l35-raw-above-rte'].img,
    text: 'Spot the hazard, say why it\u2019s a problem, then fix it — that\u2019s how a real food-safety audit works.',
    icon: '🔍',
    color: 'teal',
  },
  {
    title: 'Quality vs. Cross-Contamination vs. Temperature',
    img: ITEMS_BY_ID['l35-expired-yogurt'].img,
    text: 'Every hazard falls into one of three buckets: something\u2019s gone bad, something raw is touching something ready-to-eat, or a reading is out of range.',
    icon: '🧠',
    color: 'yellow',
  },
  {
    title: 'About 10 Violations Are Hiding Here',
    img: ITEMS_BY_ID['l35-freezer-warm'].img,
    text: 'This walk-in has 10 real hazards mixed in among food that\u2019s stored just fine — check every zone, and keep an eye on the temperature dials.',
    icon: '🏥',
    color: 'pink',
  },
]

// "Looks fine" items — same look as the hazards, nothing is wrong with them.
// `row` = which shelf/drawer of the fridge photo they sit on (1-6).
const decor = (id, zone, row, tileLabel) => ({ ...ITEMS_BY_ID[id], zone, row, tileLabel: tileLabel || ITEMS_BY_ID[id].label })

export default {
  n: 33,
  layout: 'violations',
  shelves: REASONS,
  locations: LOCATIONS,
  correctionActions: CORRECTION_ACTIONS,
  decor: [
    decor('milk', 'rte', 1, 'Milk · sealed'),
    decor('salad', 'rte', 2, 'Salad · lid on'),
    decor('l3-lettuce', 'produce', 3),
    decor('l3-apple', 'produce', 3),
    decor('l3-broccoli', 'produce', 4),
    decor('l3-carrot', 'produce', 4),
    decor('eggs', 'raw', 5),
    decor('l5-ice-cream', 'freezer', 6),
  ],
  tips: TIPS,
  // `tileLabel` = neutral name under the tile (never gives the answer away);
  // `title` = the problem, only shown AFTER the player says it's a violation.
  items: [
    { id: 'l35-uncovered-meal',  shelf: 'q-cross',   zone: 'rte',     row: 1, img: n0, tileLabel: 'Patient Meal · no lid',   title: 'Patient meal has no lid' },
    { id: 'l35-rte-hot',         shelf: 'q-temp',    zone: 'rte',     row: 1, img: n1, tileLabel: 'Fridge Dial',    title: 'Ready-to-eat fridge reads 8°C' },
    { id: 'l35-expired-yogurt',  shelf: 'q-quality', zone: 'rte',     row: 2, img: n2, tileLabel: 'Yogurt · expired 3 days',         title: 'Expired yogurt still in the fridge' },
    { id: 'l35-opened-can',      shelf: 'q-quality', zone: 'rte',     row: 2, img: n3, tileLabel: 'Opened Can',        title: 'Opened can left unsealed' },
    { id: 'l35-clutter',         shelf: 'q-quality', zone: 'produce', row: 3, img: n4, tileLabel: 'Packed Shelf',   title: 'Shelf packed too tight' },
    { id: 'l35-wrong-fridge',    shelf: 'q-cross',   zone: 'produce', row: 4, img: n5, tileLabel: 'Raw Fish',       title: 'Raw fish stored with fresh produce' },
    { id: 'l35-raw-above-rte',   shelf: 'q-cross',   zone: 'raw',     row: 5, img: n6, tileLabel: 'Raw Chicken Tray',   title: 'Raw chicken above RTE food' },
    { id: 'l35-leaking-chicken', shelf: 'q-cross',   zone: 'raw',     row: 5, img: n7, tileLabel: 'Chicken Bag · dripping',    title: 'Raw chicken bag is leaking' },
    { id: 'l35-missing-label',   shelf: 'q-quality', zone: 'freezer', row: 6, img: n8, tileLabel: 'Container · no label',      title: 'Container has no name/date label' },
    { id: 'l35-freezer-warm',    shelf: 'q-temp',    zone: 'freezer', row: 6, img: n9, tileLabel: 'Freezer Dial',   title: 'Freezer is too warm (-10°C)' },
  ],
}
