// Add a new level? 1) create `levelNN.js` next to this file (copy an
// existing one as a template), 2) import it below and add it to LEVEL_FILES.
// That's it — App.jsx never needs to change.
//
// Level 2 ("Chill Check!" — a real drag-along-a-line temperature slider per
// fridge zone, layout 'dial', see components/ChillCheckScene.tsx) and Level 3
// ("Drag It Home!" — a 4-item guided drag tutorial, `guidedTarget: true`,
// see Fridge.jsx's `guided` prop) are both built now — see level02.js /
// level03.js.
//
// level36 / level37 are bonus levels that don't map to anything in the spec
// doc (cutting-board colour sorting, and a second chill-vs-frozen level) —
// they were previously mislabeled n:4 / n:5 and have been moved out of the
// main 1-35 sequence so they don't collide with the real Level 4 / Level 5.

import { ITEMS_BY_ID, itemsInCategory } from '../items.js'
import level01 from './level01.js'
import level02 from './level02.js'
import level03 from './level03.js'
import level04 from './level04.js'
import level05 from './level05.js'
import level06 from './level06.js'
import level07 from './level07.js'
import level08 from './level08.js'
import level09, { DIFFICULTY_POOLS } from './level09.js'
import level10 from './level10.js'
import level11 from './level11.js'
import level12 from './level12.js'
import level13 from './level13.js'
import level15 from './level15.js'
import level18 from './level18.js'
import level19 from './level19.js'
import level20 from './level20.js'
import level22 from './level22.js'
import level24 from './level24.js'
import level27 from './level27.js'
import level31 from './level31.js'
import level33 from './level33.js'
import level34 from './level34.js'
import level35 from './level35.js'
import level36 from './level36.js'
import level37 from './level37.js'
import level38 from './level38.js'
import level39 from './level39.js'

const LEVEL_FILES = [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10, level11, level12, level13, level15, level18, level19, level20, level22, level24, level27, level31, level33, level34, level35, level36, level37, level38, level39]

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Randomly draws `count` items from each {category, count} pool, straight
// from the shared catalog — never a hardcoded list. Called fresh every time
// a randomize-type level starts, so the picks (and therefore which images
// show up) are different each play.
export const pickRandomItems = (pools) =>
  pools.flatMap(({ category, count }) => shuffle(itemsInCategory(category)).slice(0, count))

// Turn a level file's item id + shelf pairs into full item objects
// (label/img) pulled from the shared catalog. Randomize-type levels skip
// this — their items are resolved at play-time by pickRandomItems() instead.
const buildLevelSet = (levelFile) => ({
  n: levelFile.n,
  shelves: levelFile.shelves || [],
  // Compartment keys to grey-out + padlock for this level (see Fridge.jsx).
  locks: levelFile.locks || [],
  // Level 3's guided tutorial: only the item's one true target compartment
  // is active/droppable while it's selected — see Fridge.jsx's `guided` prop.
  guided: levelFile.guidedTarget || false,
  // 'table' (Level 7) shows a table + trash can instead of the default
  // side tray; 'assembly' (Level 1) shows the fridge-parts scene instead of
  // the food-sorting fridge; omitted / anything else falls back to the tray.
  layout: levelFile.layout || 'tray',
  // Hide slot labels inside the fridge drop zones (e.g. Level 1)
  hideSlotLabels: levelFile.hideSlotLabels || false,
  // Coloured cutting boards for 'boards'-layout levels (bonus Level 36); undefined otherwise.
  boards: levelFile.boards || null,
  // Food Safety Tips shown on the Tips screen before this level starts.
  // Levels without their own set (e.g. Level 6's randomize levels, or any
  // level number that falls back to DEFAULT_LEVEL_SET) leave this empty —
  // App.jsx falls back to the generic TIPS list in that case.
  tips: levelFile.tips || [],
  // Optional itemId -> shelfId map of where items start out (instead of the
  // tray). Used by "fix the mistakes" levels like Level 9, where every item
  // begins already placed, deliberately in the wrong zone. Levels without
  // this just default to the normal empty-tray start (see App.jsx).
  startPlacements: levelFile.startPlacements || null,
  // Optional one-time "story" screen shown before Tips when a level opens
  // with a scripted intro (e.g. Level 10's supermarket run). Omitted for
  // every level without one — see App.jsx's storyForLevel().
  story: levelFile.story || null,
  // Optional { frontLabel, backLabel } text override for 'queue'-layout
  // levels whose slots represent something other than a FEFO shelf (e.g.
  // Level 34's emergency action sequence). Omitted levels keep QueueScene's
  // default FEFO wording.
  queueLabels: levelFile.queueLabels || null,
  // Level 35 (layout 'audit'): randomizable location flavor-text options,
  // the STEP 3 corrective-action catalog, and the "looks fine" decor tiles
  // mixed in among the real hazards. Every other level leaves these null —
  // see components/AuditScene.jsx for how they're used.
  locations: levelFile.locations || null,
  correctionActions: levelFile.correctionActions || null,
  decor: levelFile.decor || null,
  ...(levelFile.randomize
    ? { randomize: levelFile.randomize }
    // Spread the whole item def so extra fields (e.g. `board` for bonus Level 36)
    // carry through alongside the catalog's label/img.
    : { items: levelFile.items.map((it) => ({ ...ITEMS_BY_ID[it.id], ...it })) }),
})

// { 2: {n, shelves, items}, 6: {n, shelves, randomize}, 7: {...}, ... }
export const LEVEL_SETS = Object.fromEntries(
  LEVEL_FILES.map((lvl) => [lvl.n, buildLevelSet(lvl)])
)

// Fallback used by any level number that doesn't have its own file yet.
// Was `LEVEL_SETS[2]` ("Soda Stack"), but that content now lives at n:4
// ("Stack It Right!") after the level1-5 doc alignment pass — reuse that.
export const DEFAULT_LEVEL_SET = LEVEL_SETS[4]

export { DIFFICULTY_POOLS }
