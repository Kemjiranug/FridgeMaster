import { ITEMS_BY_ID } from '../items.js'

// Level 11 — "Temperature Detective"
// -----------------------------------------------------------------------
// `layout: 'temp'` renders components/TempDetectiveScene.jsx: four active
// fridge zones, each already switched ON at some temperature, each showing
// the food stored inside it as a visual cue. Two of the four readings are
// wrong; the player is the detective who has to spot them and dial every
// zone back into the range the reference table calls for.
//
// It reuses the generic engine rather than being a self-contained scene:
// each zone doubles as a "shelf" (so the feedback/result screens can name
// it) and as an "item" whose placement is a NUMBER — the temperature the
// player dialled. App.jsx's isItemCorrect() already scores a numeric
// placement against `range: [min, max]`, so Check Answers / stars / coins
// all work exactly like any other level.
//
// Reference (ประกาศกระทรวงสาธารณสุข / spec doc):
//   🥬 ผักสด-ผลไม้                                  7–10°C
//   🥩 เนื้อสัตว์ (เก็บระยะสั้น) & ไข่                  5–7°C
//   🥗 อาหารปรุงสำเร็จ / นมพาสเจอร์ไรส์               ต่ำกว่า 5°C
//   ❄️ ช่องแช่แข็ง — ไอศกรีม ของแช่แข็ง                 ต่ำกว่า -18°C

export const ZONES = [
  {
    id: 'tz-produce',
    name: 'Fresh Produce Zone',
    thaiName: 'ช่องผักและผลไม้',
    emoji: '🥬',
    category: 'Fresh vegetables & fruit',
    chipLabel: '7–10°C',
    // What the player sees stored in this zone
    foods: [
      { label: 'Lettuce', emoji: '🥬', img: ITEMS_BY_ID['l3-lettuce'].img },
      { label: 'Broccoli', emoji: '🥦', img: ITEMS_BY_ID['l3-broccoli'].img },
      { label: 'Apple', emoji: '🍎', img: ITEMS_BY_ID['l3-apple'].img },
    ],
    // Reading the fridge shows when the level opens
    startTemp: 8,
    // Correct answer band
    range: [7, 10],
    // How far the dial can travel
    dial: [0, 15],
    why: 'Produce chills below 7°C gets cold damage; above 10°C it wilts and spoils.',
  },
  {
    id: 'tz-raw',
    name: 'Raw & Egg Zone',
    thaiName: 'ช่องเนื้อสัตว์ดิบและไข่',
    emoji: '🥩',
    category: 'Raw meat (short-term) & eggs',
    chipLabel: '5–7°C',
    foods: [
      { label: 'Raw Pork', emoji: '🥩', img: ITEMS_BY_ID['raw-pork'].img },
      { label: 'Raw Chicken', emoji: '🍗', img: ITEMS_BY_ID['raw-chicken'].img },
      { label: 'Eggs', emoji: '🥚', img: ITEMS_BY_ID['eggs'].img },
    ],
    startTemp: 6,
    range: [5, 7],
    dial: [0, 15],
    why: 'Raw meat kept short-term and eggs hold safely at 5–7°C.',
  },
  {
    id: 'tz-chilled',
    name: 'Chilled / Ready-to-Eat Zone',
    thaiName: 'ช่องอาหารปรุงสำเร็จและนม',
    emoji: '🥗',
    category: 'Ready-to-eat food & pasteurized milk',
    chipLabel: 'below 5°C',
    foods: [
      { label: 'Salad', emoji: '🥗', img: ITEMS_BY_ID['salad'].img },
      { label: 'Sandwich', emoji: '🥪' },
      { label: 'Pasteurized Milk', emoji: '🥛', img: ITEMS_BY_ID['milk'].img },
    ],
    // ❌ Wrong on purpose — 7°C is too warm for ready-to-eat food
    startTemp: 7,
    // "below 5°C" — the dial bottoms out at 0°C, so anything 0–4 counts.
    range: [0, 4],
    dial: [0, 15],
    why: 'Ready-to-eat food and pasteurized milk need to stay under 5°C — bacteria multiply fast above it.',
  },
  {
    id: 'tz-freezer',
    name: 'Freezer Zone',
    thaiName: 'ช่องแช่แข็ง',
    emoji: '❄️',
    category: 'Ice cream & frozen food',
    chipLabel: 'below -18°C',
    foods: [
      { label: 'Ice Cream', emoji: '🍦', img: ITEMS_BY_ID['l5-ice-cream'].img },
      { label: 'Frozen Dumplings', emoji: '🥟', img: ITEMS_BY_ID['l5-dumplings'].img },
      { label: 'Frozen Meat', emoji: '🧊', img: ITEMS_BY_ID['raw-meat'].img },
    ],
    // ❌ Wrong on purpose — -12°C is far too warm for a freezer
    startTemp: -12,
    range: [-25, -18],
    dial: [-30, -5],
    why: 'Frozen food only stays frozen solid below -18°C. Warmer than that and ice crystals melt and refreeze.',
  },
]

// The reference card shown beside the fridge — the whole point of the level
// is reading this table and matching it to what's in each zone.
export const REFERENCE = ZONES.map((z) => ({
  id: z.id,
  emoji: z.emoji,
  label: z.category,
  range: z.chipLabel,
}))

export const TIPS = [
  {
    title: 'Produce: 7–10°C',
    img: ITEMS_BY_ID['l3-lettuce'].img,
    text: 'Fresh vegetables and fruit keep best a little warmer — 7 to 10°C.',
    icon: '🥬',
    color: 'teal',
  },
  {
    title: 'Raw Meat & Eggs: 5–7°C',
    img: ITEMS_BY_ID['raw-chicken'].img,
    text: 'Raw meat stored short-term, and eggs, belong at 5–7°C.',
    icon: '🥩',
    color: 'pink',
  },
  {
    title: 'Ready-to-Eat: Below 5°C',
    img: ITEMS_BY_ID['salad'].img,
    text: 'Cooked dishes, salads and pasteurized milk must stay below 5°C.',
    icon: '🥗',
    color: 'yellow',
  },
  {
    title: 'Freezer: Below -18°C',
    img: ITEMS_BY_ID['l5-ice-cream'].img,
    text: 'A freezer holding ice cream and frozen food has to read below -18°C.',
    icon: '❄️',
    color: 'teal',
  },
]

export default {
  n: 11,
  layout: 'temp',
  tips: TIPS,
  // Zones as "shelves" — lets the feedback/result screens name them.
  shelves: ZONES.map((z) => ({ id: z.id, name: z.name, hint: z.chipLabel })),
  // Zones as "items" — the thing being scored is the temperature dialled in.
  items: ZONES.map((z) => ({
    id: z.id,
    shelf: z.id,
    label: z.name,
    thaiName: z.thaiName,
    emoji: z.emoji,
    category: z.category,
    chipLabel: z.chipLabel,
    hint: z.chipLabel,
    foods: z.foods,
    why: z.why,
    startTemp: z.startTemp,
    range: z.range,
    dial: z.dial,
  })),
  // Every zone opens already switched on at the reading in the spec table —
  // 🥗 7°C and ❄️ -12°C are the two the detective has to catch.
  startPlacements: Object.fromEntries(ZONES.map((z) => [z.id, z.startTemp])),
}
