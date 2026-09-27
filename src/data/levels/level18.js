import { ITEMS_BY_ID } from '../items.js'

// Level 18 — "Leak Emergency!" (ถุงไก่ดิบรั่ว).
//
// Situation: the player opens the fridge and finds a bag of raw chicken
// leaking on the middle shelf, dripping toward the salad and berries below.
// Mission: stop the drip, then clean up — by actually doing it.
//
// `layout: 'leak'` renders components/LeakScene.jsx (no ordered cards, no
// tray). The player
//   1. DRAGS the leaking raw-chicken bag into the leak-proof box, then
//   2. DRAGS a cloth over the stains and rubs until the shelf is clean.
// Each of those two jobs is one scored "item"; LeakScene marks it done by
// placing it on the matching `done-*` shelf below, so App.jsx's normal
// scoring / stars / coins / result screens all work unchanged.
export const DONE_SLOTS = [
  { id: 'done-contain', name: 'Chicken sealed in a leak-proof box' },
  { id: 'done-clean', name: 'Shelf wiped clean' },
]

export const TIPS = [
  {
    title: 'Stop the Drip First',
    img: ITEMS_BY_ID['l18-remove'].img,
    text: 'Raw chicken juice carries germs. Take the leaking bag out before it drips onto anything else.',
    icon: '💧',
    color: 'teal',
  },
  {
    title: 'Put It in a Leak-proof Box',
    img: ITEMS_BY_ID['l18-contain'].img,
    text: 'Drag the chicken into a leak-proof tray or sealed container so nothing more escapes — only then start cleaning.',
    icon: '🥡',
    color: 'yellow',
  },
  {
    title: 'Wipe the Stains Away',
    img: ITEMS_BY_ID['l18-clean'].img,
    text: 'Rub a cloth over the shelf and anything the juice touched. Ready-to-eat food that got dripped on must be thrown away.',
    icon: '🧽',
    color: 'pink',
  },
]

export default {
  n: 18,
  layout: 'leak',
  shelves: DONE_SLOTS,
  tips: TIPS,
  items: [
    { id: 'l18-contain', label: 'Put the Leaking Chicken in a Leak-proof Box', shelf: 'done-contain' },
    { id: 'l18-clean', label: 'Wipe Up the Spill with a Cloth', shelf: 'done-clean' },
  ],
}
