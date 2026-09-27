import { ITEMS_BY_ID } from '../items.js'

// Level 22 — "Leftover Countdown!"
// -----------------------------------------------------------------------
// `layout: 'sortbins'` renders components/SortBinsScene.jsx: a tray of
// leftover-dish cards, each labelled with how many days it's been in the
// fridge, that the player sorts into three big bins — Keep / Eat First /
// Discard — instead of the usual fridge compartments.
//
// Mission: manage the leftovers already in the fridge before adding any
// new food to it.
//
// Reference (USDA "Date it. See it. Use it." leftovers guidance): cooked
// leftovers are safe in the fridge for 3–4 days.
//   Day 1–2  → Keep       (well within the safe window)
//   Day 3–4  → Eat First  (still safe, but use it now — don't push it further)
//   Day 5+   → Discard    (past the safe window)
//
// Art note: the catalog doesn't have dedicated "pasta" or "fried rice"
// icons, so this level reuses the closest existing dish art (noodle bag /
// boxed rice) with the label overridden to match — see the `label:`
// overrides below (buildLevelSet in data/levels/index.js spreads each
// level's own item entry over the catalog default, so this is a clean,
// no-new-art way to relabel them).

export const TIPS = [
  {
    title: 'Leftovers: 3–4 Days',
    img: ITEMS_BY_ID['curry-rice'].img,
    text: 'Cooked leftovers are generally safe in the fridge for 3 to 4 days.',
    icon: '📅',
    color: 'teal',
  },
  {
    title: 'Date It. See It. Use It.',
    img: ITEMS_BY_ID['soup'].img,
    text: 'Label leftovers with the date you cooked them, store them where you\u2019ll actually see them, and use the oldest ones first.',
    icon: '🏷️',
    color: 'yellow',
  },
  {
    title: 'Clear Out Before You Restock',
    img: ITEMS_BY_ID['fried-chicken'].img,
    text: 'Sort what\u2019s already in the fridge — keep, eat first, or toss — before you make room for new groceries.',
    icon: '🧹',
    color: 'pink',
  },
]

export default {
  n: 22,
  layout: 'sortbins',
  tips: TIPS,
  shelves: [
    { id: 'keep',      name: 'Keep',      color: '#4ade80' },
    { id: 'eat-first', name: 'Eat First', color: '#fbbf24' },
    { id: 'discard',   name: 'Discard',   color: '#f87171' },
  ],
  items: [
    {
      id: 'curry-rice',
      label: 'Curry',
      thaiName: 'แกง',
      expiry: 'Day 1',
      shelf: 'keep',
      why: 'Day 1 is well inside the 3–4 day window — safe to keep.',
    },
    {
      id: 'noodle-bag',
      label: 'Pasta',
      thaiName: 'พาสต้า',
      expiry: 'Day 2',
      shelf: 'keep',
      why: 'Day 2 is still well inside the 3–4 day window — safe to keep.',
    },
    {
      id: 'fried-chicken',
      label: 'Chicken',
      thaiName: 'ไก่ทอด',
      expiry: 'Day 3',
      shelf: 'eat-first',
      why: 'Day 3 is inside the window, but getting close — eat this one first.',
    },
    {
      id: 'soup',
      label: 'Soup',
      thaiName: 'ซุป',
      expiry: 'Day 4',
      shelf: 'eat-first',
      why: 'Day 4 is the last safe day for most leftovers — use it now.',
    },
    {
      id: 'boxed-rice',
      label: 'Fried Rice',
      thaiName: 'ข้าวผัด',
      expiry: 'Day 5',
      shelf: 'discard',
      why: 'Day 5 is past the 3–4 day window — this one should be thrown out.',
    },
  ],
}
