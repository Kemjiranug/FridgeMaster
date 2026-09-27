// Shared container types for the "pack it, then chill it" levels (6 & 7).
// Same two-phase mechanic as the cutting-board level (36): drag food onto
// a container, then carry that container into the fridge — see
// components/CuttingBoardScene.jsx, which renders these as distinct
// object shapes (lid / plate / bag / clamped box) instead of a colour
// swatch whenever a board has a `shape`.
//
// Only `box-lid` and `airtight-box` are genuinely sealed; `open-plate` and
// `open-bag` are the decoys that teach "uncovered lets drips, dust and
// odours in." Any food item can accept EITHER sealed container as correct
// — see SAFE_CONTAINER_IDS below — so the lesson is "seal it," not
// "memorise one specific box."
export const CONTAINERS = [
  { id: 'box-lid',      name: 'Box with Lid',   shape: 'box-lid',      color: '#f0956b', hint: 'Solid lid, fully closed' },
  { id: 'open-plate',   name: 'Open Plate',     shape: 'open-plate',   color: '#eef2f0', hint: 'No cover — dust & drips get in' },
  { id: 'open-bag',     name: 'Open Bag',       shape: 'open-bag',     color: '#cfe8f7', hint: 'Untied — not sealed' },
  { id: 'airtight-box', name: 'Airtight Box',   shape: 'airtight-box', color: '#57c4a6', hint: 'Clipped shut, fully sealed' },
]

export const SAFE_CONTAINER_IDS = ['box-lid', 'airtight-box']
