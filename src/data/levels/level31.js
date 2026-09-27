import { ITEMS_BY_ID } from '../items.js'

// Level 31 — "Patient Meal Safe Zone" ("อาหารผู้ป่วย...ห้ามปน").
// Hospital Nutrition Unit, ready-to-eat (RTE) fridge.
//
// A standard sort like every other non-special level (see level09.js):
// every item starts in the tray and the player places it into one of two
// zones. Six items genuinely belong in the RTE fridge (regular / low-sodium
// / diabetic patient meals, milk, salad, dessert); one raw item (raw
// chicken) was put away in the wrong place and has to be pulled back out.
//
// Correct answer key (see `items[].shelf`, checked against at reveal time
// exactly like every other sort level):
//   l31-regular-meal    (cooked, RTE)      -> keep
//   l31-low-sodium-meal (cooked, RTE)      -> keep
//   l31-diabetic-meal   (cooked, RTE)      -> keep
//   milk                (sealed, RTE)      -> keep
//   salad               (prepped, RTE)     -> keep
//   l6-pudding          (dessert, RTE)     -> keep
//   raw-chicken         (raw, NOT RTE)     -> remove
//
// Ready-to-eat fridges should only ever hold cooked/ready-to-eat food that's
// covered, sealed, kept apart from raw ingredients, and held below 5°C.
export const TIPS = [
  {
    title: 'RTE Means Ready-to-Eat Only',
    img: ITEMS_BY_ID['l31-regular-meal'].img,
    text: 'A patient meal fridge should only ever hold cooked, ready-to-eat food — never raw ingredients.',
    icon: '🍱',
    color: 'teal',
  },
  {
    title: 'Raw Never Belongs Here',
    img: ITEMS_BY_ID['raw-chicken'].img,
    text: 'Raw chicken left in a ready-to-eat fridge can cross-contaminate every patient meal around it. Pull it out immediately.',
    icon: '🦠',
    color: 'yellow',
  },
  {
    title: 'Keep It Cold, Covered & Sealed',
    img: ITEMS_BY_ID['milk'].img,
    text: 'Cooked, ready-to-eat food must be held below 5\u00b0C, covered and sealed to stay safe for patients.',
    icon: '❄️',
    color: 'pink',
  },
]

export default {
  n: 31,
  tips: TIPS,
  // Whole fridge open — no padlocked compartments.
  locks: [],
  shelves: [
    {
      id: 'keep', name: 'Patient Meal Fridge (RTE)',
      hint: 'Cooked & ready-to-eat only', color: '#7FD3B4',
    },
    {
      id: 'remove', name: 'Remove — Not RTE',
      hint: 'Raw or not ready-to-eat', color: '#F0956B',
    },
  ],
  items: [
    { id: 'l31-regular-meal',    shelf: 'keep' },
    { id: 'l31-low-sodium-meal', shelf: 'keep' },
    { id: 'l31-diabetic-meal',   shelf: 'keep' },
    { id: 'milk',                shelf: 'keep' },
    { id: 'salad',               shelf: 'keep' },
    { id: 'l6-pudding',          shelf: 'keep' },
    { id: 'raw-chicken',         shelf: 'remove' },
  ],
}
