import { ITEMS_BY_ID } from '../items.js'

// Level 35 — "HACCP Fridge Master Audit" (FINAL BOSS).
//
// The player plays a food-service worker doing a pre-service fridge audit.
// A big walk-in fridge (~25 tiles: 12 real hazards + 13 "looks fine" decor
// items) is shown all at once. For every hazard the player finds, they walk
// through the full professional workflow from the project brief:
//   STEP 1 — INSPECT:  click the tile that looks wrong
//   STEP 2 — IDENTIFY:  pick which HACCP category the problem falls under
//   STEP 3 — CORRECT:   pick the right fix from the action list
//   STEP 4 — RECORD:    confirm the auto-filled Corrective Action Log line
//
// `layout: 'audit'` tells App.jsx to render <AuditScene> instead of the
// usual Fridge/Tray. Under the hood this still uses the exact same generic
// scoring engine as every other level: STEP 2's category choice is what
// actually calls `onDropItem(itemId, categoryId)`, which is compared against
// `items[].shelf` at reveal time exactly like a normal sort level — Step 3's
// action and Step 4's log are extra learning/practice on top, not separately
// scored, so nothing about hints/scoring/pass-threshold elsewhere in the app
// needed to change.

// The 5 HACCP categories from STEP 2 (IDENTIFY).
export const HAZARD_CATEGORIES = [
  { id: 'cat-temp',    name: 'Temperature',          icon: '🌡️', hint: 'Fridge/freezer reading out of range', color: '#f4a3a3' },
  { id: 'cat-cross',   name: 'Cross-Contamination',  icon: '🦠', hint: 'Raw touching or dripping onto ready-to-eat food', color: '#f0956b' },
  { id: 'cat-date',    name: 'Date / Label',         icon: '📅', hint: 'Expired food or a missing/unclear label', color: '#f4de3b' },
  { id: 'cat-storage', name: 'Storage',              icon: '📦', hint: 'Uncovered, unsealed, overcrowded or in the wrong fridge', color: '#7fd3b4' },
  { id: 'cat-chain',   name: 'Cold Chain',           icon: '❄️', hint: 'Food left out of proper cold storage too long', color: '#4ea8de' },
]

// The 8 corrective actions from STEP 3 (CORRECT).
export const CORRECTION_ACTIONS = [
  { id: 'move',      name: 'Move',      icon: '➡️' },
  { id: 'cover',     name: 'Cover',     icon: '🥡' },
  { id: 'repack',    name: 'Repack',    icon: '📦' },
  { id: 'adjust',    name: 'Adjust',    icon: '🌡️' },
  { id: 'use-first', name: 'Use First', icon: '⏳' },
  { id: 'hold',      name: 'Hold',      icon: '✋' },
  { id: 'discard',   name: 'Discard',   icon: '🗑️' },
  { id: 'clean',     name: 'Clean',     icon: '🧽' },
]

// The setting is randomized each playthrough (see AuditScene.jsx) so the
// level replays differently.
export const LOCATIONS = [
  { id: 'hospital', name: '🏥 Hospital Nutrition Unit', desc: "You're auditing the fridge before patient meal service begins." },
  { id: 'school',   name: '🏫 School Food Service',     desc: "You're auditing the fridge before the lunch line opens." },
]

// 13 "looks fine" tiles pulled straight from the shared catalog, mixed in
// with the 12 real hazards below so finding them isn't just "click every
// tile in order" — full objects (id/label/img) so AuditScene can render
// them with zero extra lookups.
export const DECOR_ITEMS = [
  ITEMS_BY_ID['milk'],
  ITEMS_BY_ID['eggs'],
  ITEMS_BY_ID['salad'],
  ITEMS_BY_ID['cake'],
  ITEMS_BY_ID['boxed-rice'],
  ITEMS_BY_ID['l3-lettuce'],
  ITEMS_BY_ID['l3-apple'],
  ITEMS_BY_ID['l3-carrot'],
  ITEMS_BY_ID['l5-bread'],
  ITEMS_BY_ID['l6-cheese'],
  ITEMS_BY_ID['l6-juice'],
  ITEMS_BY_ID['l10-tomato'],
  ITEMS_BY_ID['l10-banana'],
]

// Food Safety Tips shown before this level starts.
export const TIPS = [
  {
    title: 'Find It, Name It, Fix It',
    img: ITEMS_BY_ID['l35-rte-hot'].img,
    text: 'A real audit isn\u2019t just spotting a problem — it\u2019s knowing which HACCP category it falls under so it gets fixed the right way.',
    icon: '🔍',
    color: 'teal',
  },
  {
    title: 'Inspect \u2192 Identify \u2192 Correct \u2192 Record',
    img: ITEMS_BY_ID['l35-leaking-chicken'].img,
    text: 'For every hazard you find: say what it is, choose how to fix it, then confirm the Corrective Action Log entry — just like a real food-safety audit.',
    icon: '📝',
    color: 'yellow',
  },
  {
    title: 'This Is the Final Boss',
    img: ITEMS_BY_ID['l35-no-backup'].img,
    text: 'Everything you\u2019ve learned across every level shows up here at once, in one big fridge. Take your time and check each tile carefully.',
    icon: '🏆',
    color: 'pink',
  },
]

export default {
  n: 35,
  layout: 'audit',
  shelves: HAZARD_CATEGORIES,
  locations: LOCATIONS,
  correctionActions: CORRECTION_ACTIONS,
  decor: DECOR_ITEMS,
  tips: TIPS,
  items: [
    { id: 'l35-rte-hot' },
    { id: 'l35-freezer-warm' },
    { id: 'l35-leaking-chicken' },
    { id: 'l35-raw-above-rte' },
    { id: 'l35-expired-yogurt' },
    { id: 'l35-missing-label' },
    { id: 'l35-use-first' },
    { id: 'l35-opened-can' },
    { id: 'l35-clutter' },
    { id: 'l35-wrong-fridge' },
    { id: 'l35-no-backup' },
    { id: 'l35-thawing-counter' },
    { id: 'l35-uncovered-meal' },
  ],
}
