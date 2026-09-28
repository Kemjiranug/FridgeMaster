import checkIcon from '../../assets/level34/check.svg'
import moveIcon from '../../assets/level34/move.svg'
import recordIcon from '../../assets/level34/record.svg'

// Level 34 — "Cold Storage Emergency": Hospital Nutrition Unit, 10:30am.
// One fridge has broken down mid-service. `layout: 'coldemergency'` renders
// components/ColdEmergencyScene.jsx: five linked stages (Check → Move →
// Protect → Report → Record), each its own mini decision with its own set
// of options — scored on the same generic engine as every other level
// (placements[item.id] vs. item.shelf, via isItemCorrect()/Check Answers).
// No new scoring code — just richer *interactions* feeding the same choice.
//
// Design intent from the brief: don't let the player jump straight to
// "throw everything out" just because they see one 8°C reading — the Check
// stage plays out the rising temperature live and gives them a Temperature
// Log to review before deciding anything. The Move stage is a real
// drag/tap sort into a capacity-limited backup fridge + insulated cold box
// (not a pick-the-right-paragraph multiple choice), so the player has to
// actually triage which food is highest priority. Protect / Report /
// Record are the "professional simulation" layer on top: seal the broken
// unit, notify the right person, and write down what happened.
//
// Food items referenced throughout (used by the Move-stage drag sort):
//   salad / milk / pudding  — ready-to-eat, going straight to a patient
//   meat                    — cooked meat, still needs reheating/plating
//   raw                     — raw ingredients, not yet cooked
export const FOODS = [
  { key: 'salad', icon: '🥗', label: 'Patient Salad', info: 'Temperature-controlled food.' },
  { key: 'milk', icon: '🥛', label: 'Milk', info: 'Temperature-controlled food.' },
  { key: 'pudding', icon: '🍮', label: 'Pudding', info: 'Temperature-controlled food.' },
  { key: 'meat', icon: '🍖', label: 'Cooked Meat', info: 'Temperature-controlled food.' },
  { key: 'raw', icon: '🥩', label: 'Raw Ingredients', info: 'Handle according to storage procedure.' },
]

// Ready-to-eat food goes straight to a patient tray, so it's the highest
// priority for the reliable backup fridge. Food that still needs cooking
// or reheating can wait a short while in an insulated cold box instead.
export const RTE_KEYS = ['salad', 'milk', 'pudding']
export const NEEDS_COOK_KEYS = ['meat', 'raw']

// Backup fridge / insulated cold box capacity — matches the food counts
// above exactly (3 ready-to-eat, 2 needing further prep), so overfilling
// one zone naturally blocks the player and nudges them toward the split
// the brief describes, instead of the game just telling them the answer.
export const BACKUP_CAPACITY = 3
export const COLDBOX_CAPACITY = 2

// Live in-scene readout while the Check stage plays out (stops at 8°C —
// the brief is explicit that escalation should stop there so the level
// doesn't turn into a race against the number).
export const LIVE_TEMP_STEPS = [
  { c: 5, status: 'NORMAL', color: 'green' },
  { c: 6, status: 'WARNING', color: 'yellow' },
  { c: 8, status: 'MALFUNCTION', color: 'red' },
]

// Deeper history shown only when the player opens the TEMPERATURE LOG
// button — deliberately a few readings further back than the live readout,
// so the log rewards actually opening it instead of just repeating what's
// already on screen.
export const HISTORY_LOG = [
  { t: '09:30', c: 4 },
  { t: '09:50', c: 5 },
  { t: '10:10', c: 6 },
  { t: '10:20', c: 7 },
  { t: '10:30', c: 8 },
]

// Correct-option ids per stage, with display names for the results recap
// (App.jsx looks these up as `shelves` to build the "should have been"
// text for anything left wrong).
export const STAGE_ANSWERS = [
  { id: 'l34-check-log', name: 'Check temperature' },
  { id: 'l34-move-rte-first', name: 'RTE Foods to Backup First' },
  { id: 'l34-protect-seal', name: 'Seal & Tag Out of Service' },
  { id: 'l34-report-supervisor', name: 'Report to a Responsible Staff Member' },
  { id: 'l34-record-full', name: 'Record Full Incident Details' },
]

// Centralised copy for every scripted message the brief calls for, so the
// exact wording lives in one place instead of scattered through the
// component. ColdEmergencyScene.jsx imports this directly.
export const MESSAGES = {
  logDeviation: 'Temperature deviation detected. Check the situation before making a food disposition decision.',
  discardWarning: 'A temperature deviation does not automatically determine the disposition of every food item. Protect the food first. Follow facility procedures for evaluation and disposition.',
  ignoreWarning: 'Temperature continues to rise. The cold-chain risk has not been controlled.',
  continueUsingWarning: 'The refrigerator has been identified as malfunctioning.',
  reportGate: 'Incomplete response. Reporting the equipment problem does not replace immediate food protection.',
  recordGate: 'Food protected — system response incomplete. Report and document the equipment failure.',
  checkStorageLocation: 'Check storage location.',
  zoneFull: (name, cap) => `${name} is full (${cap}/${cap}).`,
  reviewSequence: 'Review the response sequence.',
  sequenceComplete: 'RESPONSE SEQUENCE COMPLETE',
  foodProtected: 'Food protected',
  logReviewed: 'Temperature history reviewed',
  incidentReported: 'Incident reported',
  incidentDocumented: 'Incident documented',
  bossBanner: 'REFRIGERATOR FAILURE',
  bossCleared: 'BOSS CLEARED',
  learningEn: 'PROTECT THE FOOD FIRST. THEN FIX AND DOCUMENT THE SYSTEM.',
  learningTh: 'ปกป้องอาหารก่อน จากนั้นแก้ไขระบบและบันทึกเหตุการณ์',
}

// The five action cards the player arranges into the correct response
// order before the Move/Protect/Report/Record stages unlock.
export const SEQUENCE_CARDS = [
  { id: 'check', icon: '🌡️', label: 'CHECK' },
  { id: 'move', icon: '📦', label: 'MOVE' },
  { id: 'protect', icon: '🔒', label: 'PROTECT' },
  { id: 'report', icon: '📟', label: 'REPORT' },
  { id: 'record', icon: '📝', label: 'RECORD' },
]

// Fixed fields shown (and "saved") on the Record stage — the numbers are
// the scenario's own facts, not something the player has to guess.
export const RECORD_FIELDS = [
  { label: 'Time detected', value: '10:30' },
  { label: 'Initial temperature', value: '5°C' },
  { label: 'Highest observed temperature', value: '8°C' },
  { label: 'Action taken', value: 'Food moved to protected storage' },
  { label: 'Equipment status', value: 'OUT OF SERVICE' },
  { label: 'Person notified', value: 'Responsible staff / Maintenance' },
]

// End-of-boss recap badges ("COLD CHAIN STATUS").
export const COLD_CHAIN_STATUS = [
  { icon: '🥗', label: 'Food Protected' },
  { icon: '🔌', label: 'Equipment Isolated' },
  { icon: '📟', label: 'Incident Reported' },
  { icon: '📝', label: 'Temperature Recorded' },
]

// Scripted 2-beat intro shown once before Tips/gameplay — sets up *why*
// there's suddenly a refrigerator emergency this round. See the <Story>
// component in App.jsx (beat1 = the setting, beat2 = the actual fridge
// with today's stock inside, using the same FOODS list the Move stage
// sorts later).
export const STORY = {
  setting: 'Hospital Nutrition Unit \u00b7 10:30 AM',
  title: 'Fridge Down \u2014 Mid Service!',
  sub: "You're prepping lunch trays when Fridge 2's display starts climbing.",
  caption: "It's not a spike \u2014 it's a slow, steady drift upward,",
  highlight: 'and lunch service is not going to wait.',
  cta: "See What's Inside \u2192",
  beat2: {
    title: 'Fridge 2 \u2014 Current Stock',
    sub: "Before you decide anything, here's exactly what's in there right now.",
    cta: "Let's Handle It! \u2192",
  },
}

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
  story: STORY,
  tips: TIPS,
  // Looked up by App.jsx for the results-screen recap; the buttons
  // themselves are rendered per-stage inside ColdEmergencyScene.jsx.
  shelves: STAGE_ANSWERS,
  items: [
    {
      id: 'l34-round-1',
      stage: 'check',
      shelf: 'l34-check-log',
      tempPoints: LIVE_TEMP_STEPS,
      historyLog: HISTORY_LOG,
      foods: FOODS,
      question: 'What should you do first?',
      subTitle: 'The fridge temperature is rising. Protect the food before service',
      options: [
        {
          id: 'l34-check-log',
          label: 'Check temperature',
        },
        {
          id: 'l34-check-move',
          label: 'Move food',
        },
        {
          id: 'l34-check-report',
          label: 'Report Maintenance',
        },
      ],
      why: 'Always check the temperature and situation first before taking action — panic-moving food or reporting without knowing the facts can disrupt service unnecessarily.',
    },
    {
      id: 'l34-round-2',
      stage: 'move',
      shelf: 'l34-move-rte-first',
      foods: FOODS,
      question: 'The backup fridge has limited space. Drag or tap each food to sort it — which go to the backup fridge first, and which can wait in the insulated cold box?',
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
          label: "Close the door, tag it \"Out of Service\" with a DO NOT USE label, and stop opening it unless it's for the repair.",
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
      shelf: 'l34-report-supervisor',
      question: 'REFRIGERATOR MALFUNCTION — Temperature is rising. Current temperature: 8°C. Who should this incident be reported to?',
      options: [
        { id: 'l34-report-supervisor', icon: '🧑‍💼', label: 'Responsible Supervisor' },
        { id: 'l34-report-maintenance', icon: '🔧', label: 'Maintenance' },
        { id: 'l34-report-qa', icon: '🧪', label: 'Food Safety / QA' },
        { id: 'l34-report-unrelated', icon: '🙋', label: 'Unrelated Staff' },
      ],
      // Any of the first three is an appropriate, in-system contact —
      // ColdEmergencyScene.jsx treats all three as "correct" and only
      // scores "Unrelated Staff" as wrong.
      acceptable: ['l34-report-supervisor', 'l34-report-maintenance', 'l34-report-qa'],
      why: 'Reporting to whoever is actually responsible — a supervisor, maintenance, or Food Safety/QA — gets a repair started sooner and lets someone with authority make cold-chain decisions with full information. An unrelated staff member can\'t act on it.',
    },
    {
      id: 'l34-round-5',
      stage: 'record',
      shelf: 'l34-record-full',
      fields: RECORD_FIELDS,
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
