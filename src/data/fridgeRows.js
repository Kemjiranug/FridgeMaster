// Where the shelves / drawers sit inside the user's fridge photo
// (assets/level33/fridge.png, 472x1015), as % of the image. Shared by
// Level 11 (TempDetectiveScene) and Level 33 (ViolationScene) so both put
// their food + dials on the REAL shelves of the picture.
//   row 1-3 = the three glass shelves, row 4 = the crisper (green drawer),
//   row 5 = the upper pull-out drawer, row 6 = the bottom drawer.
export const ROW_Y = { 1: 12.8, 2: 25.5, 3: 39.8, 4: 55, 5: 70.5, 6: 85.5 }
// Row bands (top, bottom) — handy for drawing a zone's bracket.
export const ROW_BAND = { 1: [7, 17], 2: [19.5, 31], 3: [34, 45], 4: [48.5, 61.5], 5: [66, 75], 6: [78.5, 92] }
export const COL_X = [22, 50, 78]
