// Game-wide metadata: tips, level-select cards, scoring constants, rewards.
// The actual per-level item/shelf data now lives in `src/data/` — see
// `data/levels/index.js` for how per-level sets are assembled, and
// `data/levels/levelNN.js` for each level's content.

import { FRIDGE_IMG, ITEMS_BY_ID } from './data/items.js'
import { LEVEL_SETS, DEFAULT_LEVEL_SET, DIFFICULTY_POOLS, pickRandomItems } from './data/levels/index.js'

export { FRIDGE_IMG, LEVEL_SETS, DEFAULT_LEVEL_SET, DIFFICULTY_POOLS, pickRandomItems }

export const TIPS = [
  {
    title: 'Raw Food',
    img: ITEMS_BY_ID['raw-chicken'].img,
    text: 'Keep raw meat on the bottom shelf, away from cooked food.',
  },
  {
    title: 'Cooked Food',
    img: ITEMS_BY_ID['cake'].img,
    text: 'Store cooked & ready-to-eat food up top, separate from raw food.',
  },
  {
    title: 'Dairy',
    img: ITEMS_BY_ID['milk'].img,
    text: 'Milk and eggs stay cool in the middle of the fridge.',
  },
]

// Level Selection screen — display metadata ONLY (name/color/order).
// The `stars` field below is intentionally unused: LevelSelect.jsx fetches
// the player's REAL per-level stars from Supabase (game_progress) and their
// real total from users.total_stars, then merges it with this static
// metadata at render time.
//
// Locking is now fully DYNAMIC (computed in LevelSelect.jsx), not stored
// here:
//  - Levels marked `locked: true` below have no level-data file yet (see
//    src/data/levels/index.js — currently 1-10 exist, plus bonus levels
//    36,37), so they stay locked "???" placeholders no matter what the
//    player does.
//  - Every other level unlocks in order: level 1 is always open, and each
//    next one unlocks once the previous one has been earned at least 1 star.
//  - `current` (the "PLAY" badge) is computed too — it's always the first
//    unlocked level the player hasn't starred yet, no need to hardcode it.
//
// Names below were realigned to the spec doc (Fridge_Master_project-35_level)
// during the level1-5 pass: level content that was previously mislabeled
// n:2/n:3 turned out to actually be the doc's Level 4 ("Stack It Right!")
// and Level 5 ("Find Their Home!") — moved to n:4/n:5 and renamed to match.
// The doc's real Level 2 ("Chill Check!" — real drag/rotate temperature
// dial, see components/ChillCheckScene.jsx) and Level 3 ("Drag It Home!" —
// a 4-item guided drag tutorial, see Fridge.jsx's `guided` prop) are now
// built too — see data/levels/level02.js / level03.js.
export const LEVELS = [
  { n: 1, name: 'Meet Your Fridge!', color: '#f4a3a3' },
  { n: 2, name: 'Chill Check!', color: '#4ea8de' },
  { n: 3, name: 'Drag It Home!', color: '#7FD3B4' },
  { n: 4, name: 'Stack It Right!',   color: '#f7c6c6' },
  { n: 5, name: 'Find Their Home!',  color: '#0d7355' },
  { n: 6, name: 'Cover Me!', color: '#f2b53a' },
  { n: 7, name: 'Raw Goes Low!', color: '#e4573b' },
  { n: 8, name: 'Freeze Like a Pro!', color: '#0d7355' },
  { n: 9, name: 'FEFO Queue', color: '#57c4a6' },
  { n: 10, name: 'Too Hot to Chill!', color: '#e4573b' },
  { n: 11, name: 'Temperature Detective', color: '#4ea8de' },
  { n: 12, name: 'Keep or Toss?', color: '#e4573b' },
  { n: 13, name: 'Fix the Fridge!', color: '#f2b53a' },
  { n: 14, name: '???', locked: true },
  { n: 15, name: 'Full Grocery Haul', color: '#4ea8de' },
  // Preview builds of Stage 3 (Fridge Safety Master) levels, out of numeric
  // order with the placeholders above on purpose — they're here to demo the
  // "Cool & Store!" (cooling queue/sequence), "Patient Meal Safe Zone" (RTE
  // sort), "Cold Storage Emergency" (queue/sequence) and "HACCP Audit"
  // (hazard-category sort) mechanics before the rest of levels 13-33 are built.
  { n: 18, name: 'Leak Emergency!', color: '#4ea8de' },
  { n: 19, name: 'Meal Prep Tetris!', color: '#f0956b' },
  { n: 20, name: 'Cool & Store!', color: '#f2b53a' },
  { n: 22, name: 'Leftover Countdown!', color: '#57c4a6' },
  { n: 24, name: 'Fridge Blackout!', color: '#2f7fc1' },
  { n: 27, name: 'Which Fridge?', color: '#f0956b' },
  { n: 31, name: 'Patient Meal Safe Zone', color: '#4ea8de' },
  { n: 33, name: 'Find the Violations!', color: '#8b5cf6' },
  { n: 34, name: 'Cold Storage Emergency', color: '#e4573b' },
  { n: 35, name: 'HACCP Fridge Master Audit', color: '#0d7355' },
  // Bonus levels — not part of the 35-level spec doc (see level36.js /
  // level37.js / level38.js for why). Kept outside the main 1-35 sequence so they don't
  // collide with the real Level 4 / Level 5 / Level 9.
  { n: 36, name: 'Raw Meat Market (Bonus)', color: '#f7c6c6' },
  { n: 37, name: 'Fridge Thermometers (Bonus)', color: '#f2b53a' },
  { n: 38, name: 'Fridge Fix-Up (Bonus)',   color: '#f0956b' },
  { n: 39, name: 'HACCP Audit Classic (Bonus)', color: '#0d7355' },
]

export const LEVEL_TIME = 60 // seconds (1:00) — fallback / levels 1-15, see levelTimeFor()

// ----- Per-tier time limit -----
// Level 1-15: 1:00 · Level 16-25: 1:30 · Level 26-35: 2:00.
export const levelTimeFor = (lvl) => {
  if (lvl === 35) return 240 // 4:00 for the full 4-round HACCP audit
  if (lvl >= 26) return 120
  if (lvl >= 16) return 90
  return LEVEL_TIME
}

// ----- Scoring rules (4.1–4.7) -----
export const CORRECT_POINTS = 10     // 4.1 วางของถูกตำแหน่ง: +10
export const WRONG_POINTS = -10      // 4.4 วางผิดตำแหน่ง: -10
export const TIME_FINISH_BONUS = 10  // 4.3 ทำเสร็จในเวลาที่กำหนด (กด Check เอง ไม่ใช่หมดเวลา): โบนัส +10 ครั้งเดียว
export const HINT_PENALTY = -5       // 4.7 กดขอคำใบ้ 1 ครั้ง: -5 คะแนน
export const PASS_THRESHOLD = 0.6    // 4.6 ต้องได้ >= 60% ของคะแนนเต็มถึงจะผ่านด่าน

export const START_SCORE = 480 // matches the HUD score in the mockups

// Rewards screen (static showcase, matching the mockup)
export const REWARDS = {
  unlockedCount: 12,
  totalCount: 48,
  items: [
    { name: 'Golden Croissant', emoji: '🥐', state: 'claimed' },
    { name: 'Rainbow Cake', emoji: '🍰', state: 'unlock' },
    { name: 'Shiny Soda', emoji: '🥤', state: 'locked', unlockAt: 'LVL 15' },
  ],
  achievements: [
    { name: 'Master Sorter', desc: 'Organize 500 total items.', pct: 85, icon: '⭐', color: '#57c4a6' },
    { name: 'Speed Demon', desc: 'Finish a level in under 60 seconds.', pct: 40, icon: '⚡', color: '#f4de3b' },
    { name: 'Clean Fridge', desc: 'Achieve 3 stars on all Level 1 stages.', pct: 100, icon: '🧼', color: '#f4a08c' },
  ],
}

// Profile page — game-flavoured stats & badges.
// NOTE: coins/trophies aren't persisted yet, so these act as display defaults;
// stars and the display name come from the real Supabase account.
//
// Badges are earned by PASSING the last level of each difficulty stage —
// Stage 1 (Fridge Freshies) is levels 1-15, Stage 2 (Kitchen Keeper) is
// 16-25, Stage 3 (Fridge Safety Masters) is 26-35 (same boundaries as
// levelTimeFor() above). `id` matches achievement_id in the `achievements` /
// `user_achievements` tables (see backend/achievements.sql); App.jsx's
// finish() calls unlockAchievement(userId, id) the moment `earnAtLevel` is
// passed, and shows a "Congratulations, you've been promoted!" modal.
// ProfilePage reads getMyAchievements() to know which of these are actually
// unlocked vs. still locked for this player.
export const PROFILE = {
  starGoal: 60,
  badges: [
    { id: 'fridge_freshies', name: 'Fridge Freshies', emoji: '🥉', earnAtLevel: 15 },
    { id: 'kitchen_keeper', name: 'Kitchen Keeper', emoji: '🥈', earnAtLevel: 25 },
    { id: 'fridge_safety_masters', name: 'Fridge Safety Masters', emoji: '🥇', earnAtLevel: 35 },
  ],
}

// The Fresh Market — power-ups the player can buy with coins. Each one lasts
// exactly 1 level (see `POWERUP_DURATION_LEVELS` below and App.jsx's
// startLevel(), which clears whatever was active the moment a new level begins).
export const POWERUP_DURATION_LEVELS = 1

export const SHOP = {
  intro: 'Spend coins on power-ups — they go into your inventory and you can use them in any level, whenever you want.',
  items: [
    {
      id: 'time',
      name: 'Add Time',
      desc: 'Adds extra seconds straight to the timer — use it whenever you need it, in any level.',
      coins: 5,
      icon: '⏰',
      tone: 'purple',
      badge: `+${15}s`,
      seconds: 15, // added to timeLeft when USED from the inventory (see App.jsx confirmUseItemNow)
    },
    {
      id: 'hint',
      name: 'Buy Hint',
      desc: 'Get a Hint without the usual −5 point penalty.',
      coins: 10,
      icon: '🔍',
      tone: 'gold',
      badge: 'x1',
    },
    {
      id: 'multiplier',
      name: 'Score x2',
      desc: "Doubles this level's Final Score (applied after the Streak Multiplier) — coins earned double too.",
      coins: 20,
      icon: '2X',
      tone: 'blue',
      badge: 'x2',
    },
  ],
}
