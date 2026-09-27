// Level 20 — "Cool & Store!" (หม้อใหญ่จะเข้าตู้ยังไง?)
//
// Situation: soup/curry just came off the stove in TWO pots (a red one and
// a steel one). Each pot has to be handled the same way, on its own: poured
// into its OWN shallow box, sealed with its OWN lid, then that box goes into
// the fridge. There is no shared container — pouring pot A into box A
// doesn't touch pot B or box B at all.
//
// `layout: 'coolstore'` renders components/CoolStoreScene.jsx inside the
// normal game chrome (HUD / Hint / +15s / Check Answers), same slot LeakScene
// uses for Level 18. Everything is drawn as real objects sitting in the
// scene — no card tiles — the same visual language as Level 18: drag the pot
// onto its box, drag the lid onto the box once it's poured, then drag the
// sealed box into the fridge. Two full pot → box → fridge cycles, one per
// pot, each a separately scored `item` so App.jsx's usual scoring / stars /
// coins / result screens work unchanged.
export const DONE_SLOTS = [
  { id: 'done-store-a', name: 'Red pot poured into its own covered box' },
  { id: 'done-store-b', name: 'Steel pot poured into its own covered box' },
]

export const TIPS = [
  {
    title: "Don't Chill the Whole Pot",
    icon: '🍲',
    color: 'teal',
    text: 'A big pot of hot soup cools far too slowly in the fridge — even with a lid on — and keeps everything around it warm too long.',
  },
  {
    title: 'Give Each Pot Its Own Box',
    icon: '🥡',
    color: 'yellow',
    text: "Pour each pot into its own shallow box and put that box's lid on — don't mix the two pots together. More surface area means both chill fast.",
  },
  {
    title: 'Then — Into the Fridge',
    icon: '❄️',
    color: 'pink',
    text: "Only the sealed boxes go in the fridge, one at a time. The pots themselves aren't fridge-safe storage — leave them on the counter.",
  },
]

export default {
  n: 20,
  layout: 'coolstore',
  shelves: DONE_SLOTS,
  tips: TIPS,
  items: [
    { id: 'l20-store-a', label: 'Red Pot Soup in Its Own Covered Box', shelf: 'done-store-a' },
    { id: 'l20-store-b', label: 'Steel Pot Soup in Its Own Covered Box', shelf: 'done-store-b' },
  ],
}
