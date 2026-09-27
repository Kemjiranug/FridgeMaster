import { ITEMS_BY_ID } from '../items.js'

// Level 3 — "Drag It Home!": a short, guided tutorial that teaches the
// drag-and-drop (or tap-to-place) interaction using just 4 items.
//
// `guidedTarget: true` tells Fridge.jsx to activate ONLY the one
// compartment an item actually belongs in while that item is selected —
// every other compartment stays inert (dimmed, ignores clicks/drops), so a
// first-time player can't get their first placement wrong. See Fridge.jsx's
// `guided` prop and App.jsx's `guidedForLevel()`.

const LEVEL3_SHELVES = [
  { id: 'top', name: 'Top Shelf', hint: 'Ready-to-eat food', color: '#7FD3B4' },
  { id: 'middle', name: 'Middle Shelf', hint: 'Dairy', color: '#F6D24B' },
  { id: 'bottom', name: 'Bottom Shelf', hint: 'Raw meat', color: '#F0956B' },
  // The crisper drawer isn't one of the default top/middle/bottom shelves —
  // give it its own drop-zone rectangle over the real crisper compartment
  // in the fridge photo (same spot Fridge.jsx's LOCK_REGIONS.crisper covers).
  {
    id: 'crisper',
    name: 'Crisper Drawer',
    hint: 'Fruits & vegetables',
    color: '#8BC98A',
    zone: { left: '3.5%', top: '47%', width: '45%', height: '14.5%' },
  },
]

export const TIPS = [
  {
    title: 'Drag It Home!',
    img: ITEMS_BY_ID['salad'].img,
    text: 'Pick up an item, then drop it in the one zone that lights up for it.',
    icon: '✋',
    color: 'teal',
  },
  {
    title: 'Raw Meat Stays Low',
    img: ITEMS_BY_ID['raw-chicken'].img,
    text: 'Raw chicken always goes on the bottom shelf, away from everything else.',
    icon: '🥩',
    color: 'pink',
  },
  {
    title: 'Veggies in the Crisper',
    img: ITEMS_BY_ID['l3-broccoli'].img,
    text: 'Fresh vegetables like broccoli belong in the crisper drawer.',
    icon: '🥦',
    color: 'yellow',
  },
]

export default {
  n: 3,
  shelves: LEVEL3_SHELVES,
  // Only the 4 zones above are in play — grey out the freezer & door.
  locks: ['leftFreezer', 'door', 'freezerRight'],
  guidedTarget: true,
  tips: TIPS,
  items: [
    { id: 'salad', shelf: 'top' },
    { id: 'milk', shelf: 'middle' },
    { id: 'raw-chicken', shelf: 'bottom' },
    { id: 'l3-broccoli', shelf: 'crisper' },
  ],
}
