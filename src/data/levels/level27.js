// Level 27 — "Which Fridge?" (ของมาแล้ว...เข้าตู้ไหน?)
//
// Setting: a hospital or school kitchen just received its daily delivery.
// Three fridges sit side by side and every item has exactly one correct
// home:
//   Fridge A — Ready-to-Eat: chilled ready-to-eat foods (salad, pudding,
//   pasteurized milk)
//   Fridge B — Raw Ingredients: fresh meat / fish / poultry
//   Fridge C — Freezer: anything already frozen
//
// `layout: 'whichfridge'` renders components/WhichFridgeScene.jsx — the
// same drag-to-sort mechanic as Level 22's SortBinsScene, just drawn as
// three labelled fridges instead of coloured bins.

export const TIPS = [
  {
    title: 'Keep Raw Away From Ready-to-Eat',
    icon: '🥩',
    color: 'pink',
    text: 'Raw meat, fish and poultry must be stored separately from ready-to-eat food to cut the risk of contamination.',
  },
  {
    title: 'Frozen Means the Freezer',
    icon: '🧊',
    color: 'teal',
    text: 'Anything delivered already frozen goes straight into the freezer — never into a chilled fridge where it will start to thaw.',
  },
  {
    title: 'Ministry Rule: Separate Everything',
    icon: '📋',
    color: 'yellow',
    text: "Public health regulations require ready-to-eat food, raw food, and produce to be kept apart — including separate equipment for each type. A raw chicken that lands in the RTE fridge is a Wrong Fridge violation.",
  },
]

export default {
  n: 27,
  layout: 'whichfridge',
  shelves: [
    { id: 'fridge-a', name: 'Fridge A', sub: 'Ready-to-Eat' },
    { id: 'fridge-b', name: 'Fridge B', sub: 'Raw Ingredients' },
    { id: 'fridge-c', name: 'Fridge C', sub: 'Freezer' },
  ],
  tips: TIPS,
  items: [
    { id: 'l27-milk' },
    { id: 'l27-salad' },
    { id: 'l27-pudding' },
    { id: 'l27-raw-fish' },
    { id: 'l27-raw-chicken' },
    { id: 'l27-raw-pork' },
    { id: 'l27-frozen-dumpling' },
    { id: 'l27-frozen-chicken' },
  ],
}
