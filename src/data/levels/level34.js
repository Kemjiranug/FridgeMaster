import checkIcon from '../../assets/level34/check.svg'
import moveIcon from '../../assets/level34/move.svg'
import recordIcon from '../../assets/level34/record.svg'

// Level 34 — "Cold Storage Emergency": Hospital Nutrition Unit, 10:30am.
// One fridge has broken down mid-service. `layout: 'coldemergency'` renders
// components/ColdEmergencyScene.jsx: five linked stages (Check → Move →
// Protect → Report → Record), each its own mini decision with its own set
// of options — richer and longer than Level 24's fixed 3-button rounds,
// but scored on the exact same generic engine (placements[item.id] vs.
// item.shelf, via isItemCorrect()/Check Answers). No new scoring code.
//
// Design intent from the brief: don't let the player jump straight to
// "throw everything out" just because they see one 8°C reading — Round 1
// (Check) shows the rising temperature log *and* what's inside side by
// side, and the correct move is to check + log the facts first. The later
// rounds (move / protect / report / record) are the "professional
// simulation" layer added on top of the USDA-style reference behaviour,
// to practice systemic decision-making rather than a single reflex.
//
// Food items referenced throughout (used for the Move-stage visuals):
//   salad / milk / pudding  — ready-to-eat, going straight to a patient
//   meat                    — cooked meat, still needs reheating/plating
//   raw                     — raw ingredients, not yet cooked
const FOODS = [
  { key: 'salad', icon: '🥗', label: 'Patient Salad' },
  { key: 'milk', icon: '🥛', label: 'Milk' },
  { key: 'pudding', icon: '🍮', label: 'Pudding' },
  { key: 'meat', icon: '🍖', label: 'Cooked Meat' },
  { key: 'raw', icon: '🥩', label: 'Raw Ingredients' },
]

// Correct-option ids per stage, with display names for the results recap
// (App.jsx looks these up as `shelves` to build the "should have been"
// text for anything left wrong).
export const STAGE_ANSWERS = [
  { id: 'l34-check-log', name: 'Check & Log First' },
  { id: 'l34-move-rte-first', name: 'RTE Foods to Backup First' },
  { id: 'l34-protect-seal', name: 'Seal & Tag Out of Service' },
  { id: 'l34-report-immediate', name: 'Report to Maintenance Immediately' },
  { id: 'l34-record-full', name: 'Record Full Incident Details' },
]

export const TIPS = [
  {
    title: "Don't Judge by One Reading",
    img: checkIcon,
    text: 'Check the temperature, the time elapsed, and what food is actually inside before deciding anything — one 8°C reading is not a reason to discard everything.',
    icon: '🌡️',
    color: 'teal',
  },
  {
    title: 'Protect the Food First',
    img: moveIcon,
    text: 'Ready-to-eat food headed straight to a patient (salad, milk, pudding) is the highest priority for the backup fridge. Food that still needs cooking can wait in an insulated cold box.',
    icon: '🧊',
    color: 'yellow',
  },
  {
    title: 'Then Fix and Document the System',
    img: recordIcon,
    text: 'Once food is safe: seal the broken unit, notify maintenance right away, and record exactly what happened — professionals fix the system, not just the moment.',
    icon: '📝',
    color: 'pink',
  },
]

export default {
  n: 34,
  layout: 'coldemergency',
  tips: TIPS,
  // Looked up by App.jsx for the results-screen recap; the buttons
  // themselves are rendered per-stage inside ColdEmergencyScene.jsx.
  shelves: STAGE_ANSWERS,
  items: [
    {
      id: 'l34-round-1',
      stage: 'check',
      shelf: 'l34-check-log',
      tempPoints: [
        { t: '10:30', c: 5 },
        { t: '10:42', c: 6 },
        { t: '10:55', c: 8 },
      ],
      foods: FOODS,
      question: 'The temperature is climbing — 5°C → 6°C → 8°C. What should you do first?',
      options: [
        {
          id: 'l34-check-log',
          icon: '📋',
          label: 'Check the temperature, note the time, and see what food is actually inside before deciding anything.',
        },
        {
          id: 'l34-check-discard',
          icon: '🗑️',
          label: 'Throw out everything in the fridge right now — 8°C is too high.',
        },
        {
          id: 'l34-check-ignore',
          icon: '🙈',
          label: "Wait and see — it's probably nothing, no need to act yet.",
        },
      ],
      why: "One reading doesn't tell you everything. Check the time elapsed and what's inside before you decide — panic-discarding everything on a single 8°C reading wastes food you may not have needed to lose, and ignoring it risks the whole cold chain.",
    },
    {
      id: 'l34-round-2',
      stage: 'move',
      shelf: 'l34-move-rte-first',
      foods: FOODS,
      question: 'The backup fridge has limited space. Which foods go there first, and which can wait in the insulated cold box?',
      options: [
        {
          id: 'l34-move-rte-first',
          icon: '🧊',
          label: 'Salad, milk and pudding (ready to serve to patients) go to the backup fridge first; cooked meat and raw ingredients wait in the insulated cold box.',
          moveMap: { backup: ['salad', 'milk', 'pudding'], coldbox: ['meat', 'raw'], left: [] },
        },
        {
          id: 'l34-move-all-backup',
          icon: '📥',
          label: 'Cram everything into the backup fridge at once, regardless of space.',
          moveMap: { backup: ['salad', 'milk', 'pudding', 'meat', 'raw'], coldbox: [], left: [] },
        },
        {
          id: 'l34-move-raw-only',
          icon: '🥩',
          label: "Move only the raw ingredients — leave the patients' ready-to-eat food in the broken fridge.",
          moveMap: { backup: [], coldbox: ['raw'], left: ['salad', 'milk', 'pudding', 'meat'] },
        },
      ],
      why: "Ready-to-eat food going straight to a patient carries the highest risk if it warms up, so it earns the reliable backup fridge first. Food that still needs cooking or reheating can safely wait a short while in an insulated cold box.",
    },
    {
      id: 'l34-round-3',
      stage: 'protect',
      shelf: 'l34-protect-seal',
      question: 'All the food is out. What do you do with the broken fridge itself?',
      options: [
        {
          id: 'l34-protect-seal',
          icon: '🔒',
          label: "Close the door, tag it \"Out of Service,\" and stop opening it unless it's for the repair.",
        },
        { id: 'l34-protect-open', icon: '🚪', label: 'Leave the door open so it can air out.' },
        {
          id: 'l34-protect-reuse',
          icon: '📦',
          label: 'Keep using it for non-perishables, with no tag or warning.',
        },
      ],
      why: 'A clear "Out of Service" tag stops anyone from mistaking it for working storage and prevents food from ending up back inside before it\'s repaired.',
    },
    {
      id: 'l34-round-4',
      stage: 'report',
      shelf: 'l34-report-immediate',
      question: 'Who should hear about this, and when?',
      options: [
        { id: 'l34-report-immediate', icon: '📟', label: 'Notify maintenance and the person in charge right away.' },
        { id: 'l34-report-endshift', icon: '⏳', label: 'Wait until the end of the service to mention it.' },
        { id: 'l34-report-informal', icon: '🗣️', label: 'Just mention it to a coworker — no need to report it formally.' },
      ],
      why: 'Reporting immediately gets a repair started sooner and lets whoever is responsible make cold-chain decisions with full information — every hour of delay adds risk.',
    },
    {
      id: 'l34-round-5',
      stage: 'record',
      shelf: 'l34-record-full',
      question: 'Before service goes back to normal, what belongs in the incident record?',
      options: [
        {
          id: 'l34-record-full',
          icon: '📝',
          label: 'The time it was found, the temperature readings, which food moved where, and every action taken.',
        },
        { id: 'l34-record-vague', icon: '✏️', label: 'Just a short note: "fridge broke."' },
        { id: 'l34-record-skip', icon: '🚫', label: "Don't bother — the food ended up safe anyway." },
      ],
      why: 'A full record is the proof that the cold chain was actively managed, not just gotten lucky — it supports audits and helps the unit respond faster next time.',
    },
  ],
}
