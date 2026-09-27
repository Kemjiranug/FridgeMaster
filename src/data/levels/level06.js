import { ITEMS_BY_ID } from '../items.js'
import { CONTAINERS, SAFE_CONTAINER_IDS } from '../containers.js'

// Level 6 — "Cover Me! ปิดก่อนแช่"
// -----------------------------------------------------------------------
// Two-phase 'boards' level — same engine as the cutting-board level (36),
// reused here for containers instead of colour-coded boards (see
// components/CuttingBoardScene.jsx and data/containers.js):
//   Phase 1: drag each cooked dish onto a container.
//   Phase 2: carry that container into the fridge (top shelf).
// A container only counts if it's actually SEALED — box-lid or
// airtight-box. open-plate and open-bag are decoys that stay wrong no
// matter which shelf they land on.
//
// Reference: ประกาศกระทรวงสาธารณสุข — อาหารปรุงสำเร็จต้องเก็บในภาชนะที่
// สะอาดและปิดมิดชิด ก่อนแช่ในตู้เย็น.

export const TIPS = [
  {
    title: 'Cover Before You Chill',
    img: ITEMS_BY_ID['curry'].img,
    text: 'Cooked food like curry must go into a clean, tightly covered container before it goes in the fridge.',
    icon: '🥡',
    color: 'teal',
  },
  {
    title: 'Open Plates Catch Drips',
    img: ITEMS_BY_ID['salad'].img,
    text: 'An uncovered plate or an untied bag lets drips, dust and odours reach your food.',
    icon: '🍽️',
    color: 'yellow',
  },
  {
    title: 'Ready-to-Eat Goes Up Top',
    img: ITEMS_BY_ID['steamed-rice'].img,
    text: 'Once sealed, store cooked dishes like steamed rice and cut fruit on the top shelf.',
    icon: '🍚',
    color: 'pink',
  },
]

export default {
  n: 6,
  layout: 'boards',
  tips: TIPS,
  // Only the top shelf is in play for this level — grey out every other
  // compartment so it's obvious where the containers belong.
  locks: ['leftUpperMid', 'leftMid', 'crisper', 'leftFreezer', 'door', 'freezerRight'],
  shelves: [
    { id: 'top', name: 'Top Shelf', hint: 'Covered, ready-to-eat food', color: '#7FD3B4' },
  ],
  // The four container shapes (Thai "cover it" system). Any of the two
  // sealed ones is a correct pick for every dish here; the open ones are
  // shown as decoys, same idea as Level 36's unused board colours.
  boards: CONTAINERS,
  items: [
    { id: 'curry',        board: SAFE_CONTAINER_IDS },
    { id: 'steamed-rice', board: SAFE_CONTAINER_IDS },
    { id: 'cut-fruit',    board: SAFE_CONTAINER_IDS },
    { id: 'salad',        board: SAFE_CONTAINER_IDS },
  ],
}
