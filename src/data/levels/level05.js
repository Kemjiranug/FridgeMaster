import { ITEMS_BY_ID } from '../items.js'

// Level 5 — "Find Their Home!" (ที่หนูอยู่ไหน): produce, condiments & dairy
// go to their proper homes — sauces & drinks in the door, milk & butter on
// the middle shelf, and fruit & veg in the crisper. Each shelf carries a
// custom `zone` (position on the fridge photo, in %) so drop targets can sit
// on the door and crisper, not just the default three left-hand shelves.
// Moved here from the old "Dairy Drawer" level03.js during the level1-5 doc
// alignment pass (was previously mislabeled n:3; content actually matches
// the spec doc's Level 5 — a `milk` item was also added to the middle shelf
// to match the doc's answer key, which this level was missing).

// Food Safety Tips shown before this level starts.
export const TIPS = [
  {
    title: 'Fruit & Veg in the Crisper',
    img: ITEMS_BY_ID['l3-carrot'].img,
    text: 'The crisper drawer controls humidity, keeping fresh produce crisp for longer.',
    icon: '🥕',
    color: 'teal',
  },
  {
    title: 'Condiments in the Door',
    img: ITEMS_BY_ID['l3-ketchup'].img,
    text: 'Sauces and dressings are shelf-stable enough for the door, the warmest part of the fridge.',
    icon: '🧂',
    color: 'yellow',
  },
  {
    title: 'Milk & Butter on the Middle Shelf',
    img: ITEMS_BY_ID['l3-butter'].img,
    text: 'Dairy like milk and butter belong on a proper shelf, not loose in the door.',
    icon: '🧈',
    color: 'pink',
  },
]

export default {
  n: 5,
  tips: TIPS,
  // In play: the middle shelf (dairy), crisper, and the right door. Lock the
  // empty left shelves (top + the one between the middle shelf & crisper)
  // and the freezer.
  locks: ['leftTop', 'leftMid', 'leftFreezer'],
  shelves: [
    { id: 'door-top', name: 'Door — Top', hint: 'Condiments', color: '#F0956B',
      zone: { left: '53%', top: '6%', width: '43%', height: '15%' } },
    { id: 'door-low', name: 'Door — Low', hint: 'Drinks', color: '#7FD3B4',
      zone: { left: '53%', top: '22%', width: '43%', height: '15%' } },
    { id: 'butter',   name: 'Middle Shelf', hint: 'Milk & spreads', color: '#F6D24B',
      zone: { left: '5%',  top: '17%', width: '34%', height: '15%' } },
    { id: 'crisper',  name: 'Crisper',    hint: 'Fruit & veg', color: '#7FD3B4',
      zone: { left: '3%',  top: '48%', width: '46%', height: '15%' } },
  ],
  items: [
    { id: 'l3-ketchup',  shelf: 'door-top' },
    { id: 'l3-chili',    shelf: 'door-top' },
    { id: 'l3-juice',    shelf: 'door-low' },
    { id: 'l3-butter',   shelf: 'butter' },
    { id: 'milk',        shelf: 'butter' },
    { id: 'l3-lettuce',  shelf: 'crisper' },
    { id: 'l3-broccoli', shelf: 'crisper' },
    { id: 'l3-apple',    shelf: 'crisper' },
    { id: 'l3-carrot',   shelf: 'crisper' },
  ],
}
