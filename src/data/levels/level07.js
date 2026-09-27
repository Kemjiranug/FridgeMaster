import { ITEMS_BY_ID } from '../items.js'
import { CONTAINERS, SAFE_CONTAINER_IDS } from '../containers.js'

// Level 7 — "Raw Goes Low! ของดิบ อย่าให้หยด!"
// -----------------------------------------------------------------------
// Two-phase 'boards' level — same engine as the cutting-board level (36)
// and Level 6, reused here for containers (see components/
// CuttingBoardScene.jsx and data/containers.js):
//   Phase 1: drag each item onto a sealed container (box-lid or
//            airtight-box — open-plate/open-bag are decoys, same as
//            Level 6).
//   Phase 2: carry that container to the shelf it belongs on:
//     Top shelf    — ready-to-eat food, stays safe up high
//     Bottom shelf — raw meat & seafood, always lowest so nothing can drip
//                    onto food below, even once it's sealed
// Each item's `boardShelf` pins down which shelf its container must land
// on for it to count — so a player who seals the chicken correctly but
// still carries it to the top shelf is still marked wrong.

export const TIPS = [
  {
    title: 'Raw Goes Low',
    img: ITEMS_BY_ID['raw-chicken'].img,
    text: 'Raw meat, poultry and seafood always go on the lowest shelf — never above ready-to-eat food.',
    icon: '🍗',
    color: 'pink',
  },
  {
    title: 'Seal It First',
    img: ITEMS_BY_ID['raw-pork'].img,
    text: 'Pack raw meat and seafood into a sealed container before it goes anywhere in the fridge.',
    icon: '📦',
    color: 'yellow',
  },
  {
    title: 'Protect Ready-to-Eat Food',
    img: ITEMS_BY_ID['salad'].img,
    text: 'Keep cooked and ready-to-eat dishes up top, away from anything raw.',
    icon: '🦠',
    color: 'teal',
  },
]

export default {
  n: 7,
  layout: 'boards',
  tips: TIPS,
  // Top + bottom shelves are in play; grey out the middle shelf and every
  // right-hand/lower compartment not used by this level.
  locks: ['leftUpperMid', 'crisper', 'leftFreezer', 'door', 'freezerRight'],
  shelves: [
    { id: 'top',    name: 'Top Shelf',    hint: 'Ready-to-eat', color: '#7FD3B4' },
    { id: 'bottom', name: 'Bottom Shelf', hint: 'Raw meat & seafood — lowest, no drips', color: '#F0956B' },
  ],
  boards: CONTAINERS,
  items: [
    { ...ITEMS_BY_ID['salad'],       board: SAFE_CONTAINER_IDS, boardShelf: 'top' },
    { ...ITEMS_BY_ID['cake'],        board: SAFE_CONTAINER_IDS, boardShelf: 'top' },
    { ...ITEMS_BY_ID['raw-chicken'], board: SAFE_CONTAINER_IDS, boardShelf: 'bottom' },
    { ...ITEMS_BY_ID['raw-pork'],    board: SAFE_CONTAINER_IDS, boardShelf: 'bottom' },
    { ...ITEMS_BY_ID['raw-salmon'],  board: SAFE_CONTAINER_IDS, boardShelf: 'bottom' },
    { ...ITEMS_BY_ID['shrimp'],      board: SAFE_CONTAINER_IDS, boardShelf: 'bottom' },
  ],
}
