import { ITEMS_BY_ID } from '../items.js'

// Level 12 — "Keep or Toss? เก็บต่อ หรือพอแค่นี้"
// -----------------------------------------------------------------------
// `layout: 'swipecards'` renders components/SwipeCardScene.jsx: one food
// card at a time (flip through with the ‹ › arrows, dots show where you
// are in the deck). Each dish has already been sitting out at room
// temperature for a stated time — the player reads it and taps KEEP
// (still safe to refrigerate) or TOSS (past the danger-zone limit).
//
// This now runs on the SAME generic engine as every other level — each
// dish is an ordinary item whose "shelf" is the correct call ('keep' or
// 'toss'), scored by the same isItemCorrect()/Check Answers/result-modal
// flow as a shelf-sort level. Previously (components/KeepTossScene.jsx,
// now retired) this was a fully self-contained scene with its own HUD,
// footer and result modal.
//
// Reference (ประกาศกระทรวงสาธารณสุข / spec doc — "2-Hour / 1-Hour Rule"):
//   Perishable food left at room temperature must go back into the fridge
//   within 2 hours. If the ambient temperature is above 32°C, that window
//   shrinks to just 1 hour — bacteria in the 5–60°C "danger zone" double
//   roughly every 20 minutes.
//
// Answer key (this level's ambient temp is a normal kitchen, ~28°C, so the
// standard 2-hour window applies to every card):
//   🍕 Pizza,   30 min  → KEEP  (well inside 2 hr)
//   🍛 Curry,   1 hr    → KEEP  (still inside 2 hr)
//   🍗 Chicken, 5 hr    → TOSS  (way past 2 hr — high-risk protein, too)
//   🥛 Milk,    4 hr    → TOSS  (past 2 hr — dairy spoils fast in the zone)

export const TIPS = [
  {
    title: 'The 2-Hour Rule',
    img: ITEMS_BY_ID['curry-rice'].img,
    text: 'Perishable food left at room temperature must go back in the fridge within 2 hours.',
    icon: '⏱️',
    color: 'teal',
  },
  {
    title: 'Above 32°C? Just 1 Hour',
    img: ITEMS_BY_ID['l10-pizza'].img,
    text: 'On a hot day (above 32°C ambient), that window shrinks to only 1 hour.',
    icon: '🌡️',
    color: 'yellow',
  },
  {
    title: 'When in Doubt, Toss It Out',
    img: ITEMS_BY_ID['fried-chicken'].img,
    text: 'Bacteria double roughly every 20 minutes in the 5–60°C danger zone — past the limit, don\u2019t risk it.',
    icon: '🗑️',
    color: 'pink',
  },
]

export default {
  n: 12,
  layout: 'swipecards',
  tips: TIPS,
  // The two "answers" a card can be swiped/tapped onto. Named exactly like
  // shelves so the generic scoring/result-recap code needs zero changes.
  shelves: [
    { id: 'keep', name: 'Keep', hint: 'Still inside the safe window' },
    { id: 'toss', name: 'Toss', hint: 'Past the safe window — bin it' },
  ],
  items: [
    {
      id: 'kt-pizza',
      label: 'Pizza',
      thaiName: 'พิซซ่า',
      icon: '🍕',
      img: ITEMS_BY_ID['l10-pizza'].img,
      timeLabel: '30 Minutes',
      ambientC: 28,
      shelf: 'keep',
      why: '30 minutes is well inside the 2-hour window — still safe to refrigerate.',
    },
    {
      id: 'kt-curry',
      label: 'Curry',
      thaiName: 'แกง',
      icon: '🍛',
      img: ITEMS_BY_ID['curry-rice'].img,
      timeLabel: '1 Hour',
      ambientC: 28,
      shelf: 'keep',
      why: '1 hour is still under the 2-hour limit — cool it and store it now.',
    },
    {
      id: 'kt-chicken',
      label: 'Chicken',
      thaiName: 'ไก่',
      icon: '🍗',
      img: ITEMS_BY_ID['fried-chicken'].img,
      timeLabel: '5 Hours',
      ambientC: 28,
      shelf: 'toss',
      why: '5 hours at room temperature is far past the 2-hour limit — bacteria have had time to multiply to unsafe levels.',
    },
    {
      id: 'kt-milk',
      label: 'Milk',
      thaiName: 'นม',
      icon: '🥛',
      img: ITEMS_BY_ID['milk'].img,
      timeLabel: '4 Hours',
      ambientC: 28,
      shelf: 'toss',
      why: '4 hours out is double the 2-hour limit — dairy spoils quickly in the danger zone (5–60°C).',
    },
  ],
}
