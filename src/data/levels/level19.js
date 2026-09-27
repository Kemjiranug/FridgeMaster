import chickenRiceImg from '../../assets/level19/chicken-rice.svg'
import curryImg from '../../assets/level19/curry.svg'
import saladImg from '../../assets/level19/salad.svg'
import pastaImg from '../../assets/level19/pasta.svg'
import soupImg from '../../assets/level19/soup.svg'
import riceImg from '../../assets/level19/rice.svg'
import labelImg from '../../assets/level19/date-label.png'
// Reuse Level 18's leak-proof-box art for the "lid" tool here, so the two
// levels feel like the same kitchen — same box, same lid, same idea: seal
// it up before it goes anywhere near the fridge.
import lidImg from '../../assets/level18/contain.svg'

// Level 19 — "Meal Prep Tetris!" (กล่องเยอะ...จัดยังไงให้เป็น)
//
// Situation: six just-cooked meals need to go into the fridge, each at a
// different stage of prep already:
//   1. Chicken Rice — lid already sealed on, still needs its date label.
//   2. Curry         — already labeled, still needs its lid.
//   3. Salad          — lid already sealed on, still needs its date label.
//   4. Pasta          — already labeled, still needs its lid.
//   5. Soup           — fully prepped already (lid + label both on).
//   6. Rice           — fully prepped already (lid + label both on).
// `layout: 'mealprep'` renders components/MealPrepScene.jsx as a fully
// self-contained scene (own HUD/timer/result modal — see App.jsx's
// SCENE_LAYOUTS).
//
// Whatever a container is still missing, the same order always applies:
//   1. Label it first — drag the Date Label tool onto the container.
//   2. Only then can it be covered — drag the Lid tool onto it. Trying to
//      apply the lid before the label is a no-op (see applyTool's guard in
//      MealPrepScene.jsx: `if (tool === 'lid' && !labeled[foodId]) return`).
//   3. Only once BOTH are done can the player pick it up and carry it into
//      the fridge — an unlabeled or unlidded container simply can't be
//      dragged (MealPrepScene only makes a card draggable once
//      `covered && labeled` is true).
// `needsLid: false` / `needsLabel: false` below means that step already
// starts done for that container — the player only has to finish whatever
// it's still missing (or, for Soup/Rice, just carry it straight to the
// fridge).
export const MEALPREP_FOODS = [
  { id: 'mp-chicken-rice', name: 'Chicken Rice', img: chickenRiceImg, needsLid: false, needsLabel: true },
  { id: 'mp-curry', name: 'Curry', img: curryImg, needsLid: true, needsLabel: false },
  { id: 'mp-salad', name: 'Salad', img: saladImg, needsLid: false, needsLabel: true },
  { id: 'mp-pasta', name: 'Pasta', img: pastaImg, needsLid: true, needsLabel: false },
  { id: 'mp-soup', name: 'Soup', img: soupImg, needsLid: false, needsLabel: false },
  { id: 'mp-rice', name: 'Rice', img: riceImg, needsLid: false, needsLabel: false },
]

export const LID_ICON = lidImg
export const LABEL_ICON = labelImg

export const TIPS = [
  {
    title: '1. Label It With a Date, First',
    img: labelImg,
    text: 'Write or stick on a date so you know how long a leftover has been in the fridge — first in, first out. Do this before anything else.',
    icon: '🏷️',
    color: 'teal',
  },
  {
    title: '2. Then Cover It',
    img: lidImg,
    text: 'Once it is labeled, close it up. A clean lid keeps out smells and spills from other food.',
    icon: '🥡',
    color: 'yellow',
  },
  {
    title: '3. Only Then — Into the Fridge',
    img: riceImg,
    text: 'A container only gets picked up once it is both labeled and covered. Skip a step and it stays stuck on the counter.',
    icon: '🧊',
    color: 'pink',
  },
]

export default {
  n: 19,
  layout: 'mealprep',
  tips: TIPS,
  // The generic level-set builder (data/levels/index.js) always expects an
  // `items` array to exist for non-randomize levels — MealPrepScene manages
  // its own six containers internally (MEALPREP_FOODS above), so this stays
  // empty and is never used for scoring.
  items: [],
}
