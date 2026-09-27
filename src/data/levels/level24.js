// Level 24 — "Fridge Blackout!" (ไฟดับ! อย่าเพิ่งเปิด)
// -----------------------------------------------------------------------
// `layout: 'blackout'` renders components/BlackoutScene.jsx: one power-
// outage round at a time (a digital "Power Out" timer + a Cold Meter bar),
// with three buttons — OPEN FRIDGE / KEEP CLOSED / MOVE TO ICE COOLER.
//
// This runs on the SAME generic engine as every other level (Level 12 /
// Level 22's pattern): each round is an ordinary item whose `shelf` is the
// correct call, scored by isItemCorrect()/Check Answers exactly like a
// shelf-sort level. No new scoring code needed.
//
// Reference (USDA "Keep Food Safe During an Emergency"):
//   An unopened refrigerator will keep food safely cold for about 4 hours
//   during a power outage. Opening the door lets cold air escape and
//   shortens that window every time.
//
// Answer key:
//   Round 1 — 1 hr  → KEEP CLOSED        (well inside the ~4-hour window)
//   Round 2 — 3 hrs → KEEP CLOSED        (still inside the window, but the
//                                          margin is thin — this is the
//                                          moment to line up a cooler)
//   Round 3 — 5 hrs → MOVE TO ICE COOLER (past the ~4-hour window — the
//                                          fridge interior itself is now
//                                          reading too warm to trust)
//
// The "why don't judge by time alone" beat from the brief is delivered as
// extra fridge-temperature info on Round 3 (`tempInfo`), on top of the
// elapsed-time readout every round already shows.

export const TIPS = [
  {
    title: 'The 4-Hour Rule',
    icon: '⏱️',
    color: 'teal',
    text: 'An unopened fridge keeps food safely cold for about 4 hours during a power outage — but every door-open shortens that window.',
  },
  {
    title: 'Open It Only When You Must',
    icon: '🚪',
    color: 'pink',
    text: 'Each time the door opens, cold air escapes and the inside warms faster. Keep it shut unless you\u2019re moving food out for good.',
  },
  {
    title: "Don't Judge By the Clock Alone",
    icon: '🌡️',
    color: 'yellow',
    text: 'Time elapsed is a guide, not the final word — once the fridge itself is reading warm, it\u2019s time to move perishables to ice.',
  },
]

export default {
  n: 24,
  layout: 'blackout',
  tips: TIPS,
  // The three calls a round can be decided as. Named exactly like shelves
  // so the generic scoring / result-recap code needs zero changes.
  shelves: [
    { id: 'open', name: 'Open Fridge', hint: 'Lets cold air escape — avoid unless necessary' },
    { id: 'closed', name: 'Keep Closed', hint: 'Still inside the ~4-hour safe window' },
    { id: 'cooler', name: 'Move to Ice Cooler', hint: 'Past the safe window — get perishables onto ice' },
  ],
  items: [
    {
      id: 'l24-round-1',
      label: 'Hour 1',
      hours: 1,
      timerValue: '1:00',
      timerUnit: 'hr',
      shelf: 'closed',
      why: 'Just 1 hour in — well inside the ~4-hour window an unopened fridge can hold its cold. Leave the door shut.',
    },
    {
      id: 'l24-round-2',
      label: 'Hour 3',
      hours: 3,
      timerValue: '3:00',
      timerUnit: 'hrs',
      shelf: 'closed',
      why: 'Still inside the ~4-hour window, but the margin is thin now. Keep it closed — and start lining up an ice cooler in case the power stays out.',
    },
    {
      id: 'l24-round-3',
      label: 'Hour 5',
      hours: 5,
      timerValue: '5:00',
      timerUnit: 'hrs',
      tempInfo: 'Fridge interior now reads 10°C (50°F) — above the 4°C safe limit.',
      shelf: 'cooler',
      why: "5 hours is past the ~4-hour safe window, and the fridge's own temperature confirms it — don't decide by the clock alone. Move perishables to an ice cooler now.",
    },
  ],
}
