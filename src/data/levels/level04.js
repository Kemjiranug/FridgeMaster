import { DEFAULT_SHELVES } from '../shelves.js'
import { ITEMS_BY_ID } from '../items.js'

// Level 4 — "Stack It Right!" (บน กลาง ล่าง...วางให้เป็น): sort 8 grocery
// items across the top / middle / bottom shelves.
//   Top shelf    — ready-to-eat / cooked food (salad, boxed rice, soup, cake)
//   Middle shelf — milk, eggs (dairy & sealed food)
//   Bottom shelf — raw meat (raw chicken, raw pork)
// Moved here from the old "Soda Stack" level02.js during the level1-5 doc
// alignment pass (was previously mislabeled n:2; content actually matches
// the spec doc's Level 4). This set is also reused as the DEFAULT fallback
// for any level number that doesn't have its own file yet.

// Food Safety Tips shown before this level starts.
export const TIPS = [
  {
    title: 'Ready-to-Eat on Top',
    img: ITEMS_BY_ID['cake'].img,
    text: 'Cooked and ready-to-eat food goes on the top shelf, away from anything raw.',
    icon: '🍱',
    color: 'teal',
  },
  {
    title: 'Dairy & Sealed Food in the Middle',
    img: ITEMS_BY_ID['milk'].img,
    text: 'Milk, eggs, and anything sealed shut belong on the middle shelf.',
    icon: '🥛',
    color: 'yellow',
  },
  {
    title: 'Raw Meat on the Bottom',
    img: ITEMS_BY_ID['raw-chicken'].img,
    text: 'Raw meat always goes on the bottom shelf so it can never drip onto anything below.',
    icon: '🥩',
    color: 'pink',
  },
]

export default {
  n: 4,
  shelves: DEFAULT_SHELVES,
  tips: TIPS,
  // Only the left-hand shelves are in play — grey out the door, crisper/freezer
  // and bottom-right freezer so it's clear where items go.
  locks: ['crisper', 'leftFreezer', 'door', 'freezerRight'],
  items: [
    { id: 'boxed-rice',  shelf: 'top' },
    { id: 'salad',       shelf: 'top' },
    { id: 'cake',        shelf: 'top' },
    { id: 'soup',        shelf: 'top' },
    { id: 'milk',        shelf: 'middle' },
    { id: 'eggs',        shelf: 'middle' },
    { id: 'raw-chicken', shelf: 'bottom' },
    { id: 'raw-pork',    shelf: 'bottom' },
  ],
}
