import { ITEMS_BY_ID } from '../items.js'

// Level 13 — "Fix the Fridge! จัดใหม่ให้ถูก"
// -----------------------------------------------------------------------
// Standard sort-to-shelf level (same engine/result screen as every other
// numbered level), but instead of starting from an empty tray, every item
// is ALREADY sitting somewhere in the fridge — some in the right spot,
// two deliberately in the wrong one. The player's job is to spot the
// mistakes and drag just those items to where they really belong before
// pressing Check Answers.
//
//   Top shelf    — ready-to-eat / bakery (Bread, Lettuce, Curry & Rice)
//   Middle shelf — dairy & deli (Milk, Sliced Ham)
//   Bottom shelf — raw meat (Raw Chicken), lowest so it can't drip on
//                  anything below
//
// On purpose wrong at the start:
//   🍗 Raw Chicken is up on the top shelf (should be on the bottom)
//   🍛 Curry & Rice is down on the bottom shelf (should be on top,
//      it's cooked and ready to eat)

export const TIPS = [
  {
    title: 'Raw Meat Always Goes Low',
    img: ITEMS_BY_ID['raw-chicken'].img,
    text: 'Raw chicken belongs on the bottom shelf — never above other food, or its juices can drip down.',
    icon: '🍗',
    color: 'pink',
  },
  {
    title: 'Cooked Food Goes Up Top',
    img: ITEMS_BY_ID['curry-rice'].img,
    text: 'Ready-to-eat dishes like curry and rice belong on the top shelf, away from anything raw.',
    icon: '🍛',
    color: 'teal',
  },
  {
    title: 'Spot the Mistake',
    img: ITEMS_BY_ID['milk'].img,
    text: 'Some items are already in the right place — check every shelf before you decide what to move.',
    icon: '🔍',
    color: 'yellow',
  },
]

export default {
  n: 13,
  tips: TIPS,
  // Only the left-hand shelves are in play.
  locks: ['crisper', 'leftFreezer', 'door', 'freezerRight'],
  shelves: [
    { id: 'top',    name: 'Top Shelf',    hint: 'Ready-to-eat & bakery', color: '#7FD3B4' },
    { id: 'middle', name: 'Middle Shelf', hint: 'Dairy & deli',          color: '#F6D24B' },
    { id: 'bottom', name: 'Bottom Shelf', hint: 'Raw meat — lowest, no drips', color: '#F0956B' },
  ],
  items: [
    { id: 'l5-bread',    shelf: 'top' },
    { id: 'l3-lettuce',  shelf: 'top' },
    { id: 'curry-rice',  shelf: 'top' },
    { id: 'milk',        shelf: 'middle' },
    { id: 'l6-ham',      shelf: 'middle', expiry: null },
    { id: 'raw-chicken', shelf: 'bottom' },
  ],
  // Every item starts already placed in the fridge instead of in the tray.
  // Bread, Lettuce, Milk and Sliced Ham start in their correct spots;
  // Raw Chicken and Curry & Rice start SWAPPED — that's the mistake to fix.
  startPlacements: {
    'l5-bread':    'top',
    'l3-lettuce':  'top',
    'curry-rice':  'bottom', // wrong on purpose — should be 'top'
    'milk':        'middle',
    'l6-ham':      'middle',
    'raw-chicken': 'top',    // wrong on purpose — should be 'bottom'
  },
}
