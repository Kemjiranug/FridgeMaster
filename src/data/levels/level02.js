import { ITEMS_BY_ID } from '../items.js'

// Level 2 — "Chill Check!": instead of sorting food into shelves, the
// player drags a real linear temperature slider (see
// components/ChillCheckScene.tsx) left/right along a line to set each
// fridge zone to its correct range, with the number shown live above the
// slider. `layout: 'dial'` (kept as-is so App.jsx doesn't need touching)
// tells App.jsx to render <ChillCheckScene> in place of the usual
// Fridge + Tray.
//
// Each zone plays double duty as both a "shelf" (name/hint only — lets the
// generic finish()/feedback pipeline in App.jsx describe it by name, same
// as every other level) and an "item" carrying the acceptable
// `range: [min, max]` in °C the slider must land inside, plus the slider's
// own travel span `dial: [min, max]` (wider than the target range, so the
// player actually has to search for the right spot on the line).
//
// Ranges match the spec doc:
//  - Vegetables & fruit (crisper):        7–10°C
//  - Raw meat (short-term) & eggs:        5–7°C
//  - Ready-to-eat food, milk & dairy:     below 5°C
//  - Freezer (ice cream, frozen food):    below -18°C

// `emoji` / `th` / `chipLabel` feed the illustrated fridge + "Chill Check!"
// reference panel in ChillCheckScene.tsx — purely presentational, don't
// touch scoring (that's still `range`/`dial` below).
export const ZONES = [
  {
    id: 'zone-top',
    name: 'Top Shelf',
    desc: 'Ready-to-eat food, milk & pasteurized dairy',
    hint: 'Ready-to-eat food, milk & pasteurized dairy',
    icon: ITEMS_BY_ID['top-shelf'].img,
    emoji: '🥛',
    chipLabel: '< 5°C',
    range: [0, 5],
    dial: [-5, 15],
  },
  {
    id: 'zone-mid',
    name: 'Middle Shelf',
    desc: 'Raw meat (short-term storage) & eggs',
    hint: 'Raw meat (short-term storage) & eggs',
    icon: ITEMS_BY_ID['mid-shelf'].img,
    emoji: '🥩',
    chipLabel: '5–7°C',
    range: [5, 7],
    dial: [-5, 15],
  },
  {
    id: 'zone-crisper',
    name: 'Crisper Drawer',
    desc: 'Fresh vegetables & fruit',
    hint: 'Fresh vegetables & fruit',
    icon: ITEMS_BY_ID['crisper'].img,
    emoji: '🥦',
    chipLabel: '7–10°C',
    range: [7, 10],
    dial: [-5, 15],
  },
  {
    id: 'zone-freezer',
    name: 'Freezer',
    desc: 'Ice cream & frozen food',
    hint: 'Ice cream & frozen food',
    icon: ITEMS_BY_ID['freezer'].img,
    emoji: '🍦',
    chipLabel: '< -18°C',
    range: [-25, -18],
    dial: [-30, 0],
  },
]

export const TIPS = [
  {
    title: 'Freezer: Below -18°C',
    img: ITEMS_BY_ID['freezer'].img,
    text: 'The freezer must stay below -18°C to keep frozen food and ice cream safe.',
    icon: '❄️',
    color: 'teal',
  },
  {
    title: 'Crisper: 7–10°C',
    img: ITEMS_BY_ID['crisper'].img,
    text: 'Fresh vegetables and fruit keep best a little warmer — 7 to 10°C.',
    icon: '🥦',
    color: 'yellow',
  },
  {
    title: 'Top Shelf: Below 5°C',
    img: ITEMS_BY_ID['top-shelf'].img,
    text: 'Ready-to-eat food and pasteurized milk belong below 5°C — the coldest shelf spot.',
    icon: '🥛',
    color: 'pink',
  },
  {
    title: 'Pasteurized & Cultured Milk: 4–10°C',
    img: ITEMS_BY_ID['top-shelf'].img,
    text: 'Pasteurized milk and cultured/fermented milk drinks should be kept chilled at 4–10°C.',
    icon: '🥤',
    color: 'pink',
  },
]

export default {
  n: 2,
  layout: 'dial',
  shelves: ZONES.map((z) => ({ id: z.id, name: z.name, hint: z.hint })),
  items: ZONES.map((z) => ({
    id: z.id,
    shelf: z.id,
    label: z.name,
    desc: z.desc,
    img: z.icon,
    emoji: z.emoji,
    chipLabel: z.chipLabel,
    hint: z.hint,
    range: z.range,
    dial: z.dial,
  })),
  tips: TIPS,
}
