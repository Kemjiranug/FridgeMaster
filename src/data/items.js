// Central catalog of every food item art asset used anywhere in the game.
// Levels don't own images directly — they just reference an id here and say
// which shelf that id belongs on for *that* level (see data/levels/*.js).

import fridgeImg from '../assets/fridge.png'
import rawSalmon from '../assets/raw-salmon.png'
import rawMeat from '../assets/raw-meat.png'

// Level 2 — "Soda Stack" grocery-haul icons (also the DEFAULT set reused by
// levels without their own file; salad & soup are shared with Level 7).
import boxedRice from '../assets/level2/boxed-rice.png'
import salad from '../assets/level2/salad.png'
import cake from '../assets/level2/cake.png'
import milk from '../assets/level2/milk.png'
import eggs from '../assets/level2/eggs.png'
import rawChicken from '../assets/level2/raw-chicken.png'
import rawPork from '../assets/level2/raw-pork.png'
import soup from '../assets/level2/soup.png'

// Level 7 — Thai Kitchen Table icons
import friedChicken from '../assets/level7/fried-chicken.svg'
import tea from '../assets/level7/tea.svg'
import curryRice from '../assets/level7/curry-rice.svg'
import noodlesBag from '../assets/level7/noodles-bag.svg'

// Level 4 — Raw Meat & Seafood icons
import shrimp from '../assets/level4/shrimp.svg'
import groundPork from '../assets/level4/ground-pork.svg'

// Level 1 — Fridge-assembly parts (each carries the temperature its slot runs at)
import glassShelf from '../assets/level1/glass-shelf.svg'
import doorBin from '../assets/level1/door-bin.svg'
import crisperDrawer from '../assets/level1/drawer.svg'
import freezerDrawer from '../assets/level1/freezer-drawer.svg'

// Level 3 — "Dairy Drawer": produce, condiments & spreads
import l3Lettuce from '../assets/level3/lettuce.svg'
import l3Broccoli from '../assets/level3/broccoli.svg'
import l3Apple from '../assets/level3/apple.svg'
import l3Carrot from '../assets/level3/carrot.svg'
import l3Juice from '../assets/level3/juice.svg'
import l3Ketchup from '../assets/level3/ketchup.svg'
import l3Chili from '../assets/level3/chili-sauce.svg'
import l3Butter from '../assets/level3/butter.svg'

// Level 5 — "Veggie Vault": chilled vs frozen storage
import l5IceCream from '../assets/level5/ice-cream.svg'
import l5Dumplings from '../assets/level5/frozen-dumplings.svg'
import l5Bread from '../assets/level5/bread.svg'
import l5Lettuce from '../assets/level5/lettuce.svg'
import l5Milk from '../assets/level5/milk.svg'
import l5Ice from '../assets/level5/ice.svg'

// Level 6 — "FEFO Queue": items with different expiry dates the player must
// arrange in shelf order (soonest expiry up front). `expiry` shows as a
// small badge on the item's chip so the player has what they need to work
// out the correct order themselves.
import l6Milk from '../assets/level6/milk.svg'
import l6Pudding from '../assets/level6/pudding.svg'
import l6Ham from '../assets/level6/ham.svg'
import l6Juice from '../assets/level6/juice.svg'
import l6Cheese from '../assets/level6/cheese.svg'
import l6ZoomShelf from '../assets/level6/zoom-shelf.png'

// Level 6 — "Cover Me! ปิดก่อนแช่": cooked/ready-to-eat dishes to cover
import l6Curry from '../assets/level6/curry.svg'
import l6Rice from '../assets/level6/steamed-rice.svg'
import l6CutFruit from '../assets/level6/cut-fruit.svg'
import l6Salad from '../assets/level6/salad.svg'

// Level 10 — "Too Hot to Chill!": sort food into Fridge, Table, or Trash
import l10SoupPot from '../assets/level10/soup-pot.svg'
import l10CurryBox from '../assets/level10/curry-box.svg'
import l10FriedRiceBag from '../assets/level10/fried-rice-bag.svg'
import l10TeaCup from '../assets/level10/tea-cup.svg'
import l10FriedChicken from '../assets/level10/fried-chicken.svg'
import l10SoggySalad from '../assets/level10/soggy-salad.svg'
import l10SoggyFries from '../assets/level10/soggy-fries.svg'
import l10Tomato from '../assets/level10/tomato.svg'
import l10Banana from '../assets/level10/banana.svg'
import l10Pizza from '../assets/level10/pizza.svg'

// Level 34 — "Cold Storage Emergency": the fridge has broken down mid-shift.
// The player orders 5 action cards into the correct emergency sequence
// (see data/levels/level34.js): Check -> Move -> Protect -> Report -> Record.
import l34Check from '../assets/level34/check.svg'
import l34Move from '../assets/level34/move.svg'
import l34Protect from '../assets/level34/protect.svg'
import l34Report from '../assets/level34/report.svg'
import l34Record from '../assets/level34/record.svg'

// Level 35 — "HACCP Fridge Master Audit" (final boss): a walk-in fridge full
// of hidden hazards. The player sorts each hazard card into the HACCP
// category that best explains what's wrong with it.
import l35RteHot from '../assets/level35/rte-hot.svg'
import l35FreezerWarm from '../assets/level35/freezer-warm.svg'
import l35LeakingChicken from '../assets/level35/leaking-chicken.svg'
import l35RawAboveRte from '../assets/level35/raw-above-rte.svg'
import l35ExpiredYogurt from '../assets/level35/expired-yogurt.svg'
import l35MissingLabel from '../assets/level35/missing-label.svg'
import l35OpenedCan from '../assets/level35/opened-can.svg'
import l35Clutter from '../assets/level35/clutter.svg'
import l35NoBackup from '../assets/level35/no-backup.svg'
import l35UncoveredMeal from '../assets/level35/uncovered-meal.svg'
import l35UseFirst from '../assets/level35/use-first.svg'
import l35WrongFridge from '../assets/level35/wrong-fridge.svg'
import l35ThawingCounter from '../assets/level35/thawing-counter.svg'

// Level 31 — "Patient Meal Safe Zone": a Hospital Nutrition Unit's
// ready-to-eat fridge. The player sorts patient meals/drinks that belong in
// the RTE fridge from the one raw item (raw chicken) that was put away in
// the wrong place — see data/levels/level31.js.
import l31RegularMeal from '../assets/level31/regular-meal.svg'
import l31LowSodiumMeal from '../assets/level31/low-sodium-meal.svg'
import l31DiabeticMeal from '../assets/level31/diabetic-meal.svg'

// Level 20 — "Cool & Store!": a big pot of just-cooked soup/curry has to
// become safe leftovers. The player orders 3 action cards into the correct
// cooling sequence — see data/levels/level20.js.
// Level 18 — leaking raw-chicken emergency (see data/levels/level18.js).
import l18Remove from '../assets/level18/remove.svg'
import l18Contain from '../assets/level18/contain.svg'
import l18Clean from '../assets/level18/clean.svg'
import l20BigPot from '../assets/level20/big-pot.svg'
import l20Divide from '../assets/level20/divide.svg'
import l20Cover from '../assets/level20/cover.svg'
import l20Refrigerate from '../assets/level20/refrigerate.svg'

// Level 27 — "Which Fridge?": a daily delivery has to be sorted into the
// right one of three fridges (Ready-to-Eat / Raw Ingredients / Freezer).
// Reuses art already in the catalog wherever it exists; only the frozen
// chicken icon is new (see assets/level27/frozen-chicken.svg).
import l27FrozenChicken from '../assets/level27/frozen-chicken.svg'

export const FRIDGE_IMG = fridgeImg
// Close-up photo of a single fridge shelf, shown when the player taps the
// "Click to zoom" shelf in Level 6 (see components/ZoomShelf.jsx).
export const ZOOM_SHELF_IMG = l6ZoomShelf

export const ITEMS_BY_ID = {
  // Level 6 — "Cover Me! ปิดก่อนแช่" dishes
  'curry': { id: 'curry', label: 'Curry', thaiName: 'แกง', img: l6Curry, category: 'savory', shelf: 'top' },
  'steamed-rice': { id: 'steamed-rice', label: 'Steamed Rice', thaiName: 'ข้าวสวย', img: l6Rice, category: 'savory', shelf: 'top' },
  'cut-fruit': { id: 'cut-fruit', label: 'Cut Fruit', thaiName: 'ผลไม้หั่นเป็นชิ้นแล้ว', img: l6CutFruit, category: 'produce', shelf: 'top' },
  'sliced-fruit': { id: 'cut-fruit', label: 'Cut Fruit', thaiName: 'ผลไม้หั่นเป็นชิ้นแล้ว', img: l6CutFruit, category: 'produce', shelf: 'top' },

  'boxed-rice': { id: 'boxed-rice', label: 'Boxed meal', img: boxedRice, category: 'savory', shelf: 'top' },
  'boxed meal': { id: 'boxed-rice', label: 'Boxed meal', img: boxedRice, category: 'savory', shelf: 'top' },
  'salad': { id: 'salad', label: 'Salad', thaiName: 'สลัด', img: l6Salad, category: 'produce', shelf: 'top' },
  'cake': { id: 'cake', label: 'Cake', img: cake, category: 'sweet', shelf: 'top' },
  'milk': { id: 'milk', label: 'Milk', img: milk, category: 'dairy', shelf: 'middle' },
  'eggs': { id: 'eggs', label: 'Eggs', img: eggs, category: 'dairy', shelf: 'middle' },
  'raw-chicken': { id: 'raw-chicken', label: 'Raw Chicken', img: rawChicken, category: 'savory', shelf: 'bottom' },
  'raw-pork': { id: 'raw-pork', label: 'Raw Pork', img: rawPork, category: 'savory', shelf: 'bottom' },
  'soup': { id: 'soup', label: 'Soup', img: soup, category: 'savory', shelf: 'bottom' },

  'fried-chicken': { id: 'fried-chicken', label: 'Fried Chicken', thaiName: 'ไก่ทอด', img: l10FriedChicken, category: 'savory', shelf: 'top' },
  'thai-salad': { id: 'thai-salad', label: 'Soggy Dressed Salad', thaiName: 'สลัดที่คลุกน้ำสลัดแล้วจนแฉะ', img: l10SoggySalad },
  'thai-soup': { id: 'thai-soup', label: 'Steaming Soup Pot', thaiName: 'หม้อซุปที่มีควัน', img: l10SoupPot },
  'thai-tea': { id: 'thai-tea', label: 'Hot Steaming Tea', thaiName: 'ถ้วยน้ำชามีควัน', img: l10TeaCup, category: 'drink', shelf: 'middle' },
  'curry-rice': { id: 'curry-rice', label: 'Curry Box', thaiName: 'แกงในกล่อง', img: l10CurryBox, category: 'savory', shelf: 'bottom' },
  'noodle-bag': { id: 'noodle-bag', label: 'Bagged Fried Rice', thaiName: 'ข้าวผัดในถุง', img: l10FriedRiceBag, category: 'savory', shelf: 'bottom' },

  'raw-salmon': { id: 'raw-salmon', label: 'Raw Salmon', img: rawSalmon },
  'shrimp': { id: 'shrimp', label: 'Shrimp', img: shrimp },
  'raw-meat': { id: 'raw-meat', label: 'Raw Meat', img: rawMeat },
  'ground-pork': { id: 'ground-pork', label: 'Ground Pork', img: groundPork },

  // Level 1 — fridge parts. `temp` shows on the part's thermometer badge and
  // is the hint the player matches to the right slot.
  'top-shelf': { id: 'top-shelf', label: 'Top Shelf', img: glassShelf, temp: '4–6°C', part: 'shelf' },
  'mid-shelf': { id: 'mid-shelf', label: 'Middle Shelf', img: glassShelf, temp: '0–4°C', part: 'shelf' },
  'crisper': { id: 'crisper', label: 'Crisper Drawer', img: crisperDrawer, temp: '6–10°C', part: 'drawer' },
  'freezer': { id: 'freezer', label: 'Freezer Drawer', img: freezerDrawer, temp: '-18°C', part: 'drawer' },
  'door-top': { id: 'door-top', label: 'Upper Door Bin', img: doorBin, temp: '6°C', part: 'bin' },
  'door-bottom': { id: 'door-bottom', label: 'Lower Door Bin', img: doorBin, temp: '8°C', part: 'bin' },

  // Level 3 — Dairy Drawer
  'l3-lettuce': { id: 'l3-lettuce', label: 'Lettuce', img: l3Lettuce },
  'l3-broccoli': { id: 'l3-broccoli', label: 'Broccoli', img: l3Broccoli },
  'l3-apple': { id: 'l3-apple', label: 'Apple', img: l3Apple },
  'l3-carrot': { id: 'l3-carrot', label: 'Carrot', img: l3Carrot },
  'l3-juice': { id: 'l3-juice', label: 'Juice', img: l3Juice, category: 'drink', shelf: 'middle' },
  'l3-ketchup': { id: 'l3-ketchup', label: 'Ketchup', img: l3Ketchup },
  'l3-chili': { id: 'l3-chili', label: 'Chili Sauce', img: l3Chili },
  'l3-butter': { id: 'l3-butter', label: 'Butter', img: l3Butter, category: 'dairy', shelf: 'middle' },

  // Level 5 — Veggie Vault (chilled vs frozen)
  'l5-ice-cream': { id: 'l5-ice-cream', label: 'Ice Cream', img: l5IceCream, category: 'sweet', shelf: 'top' },
  'l5-dumplings': { id: 'l5-dumplings', label: 'Frozen Dumplings', img: l5Dumplings },
  'l5-bread': { id: 'l5-bread', label: 'Bread', img: l5Bread, category: 'sweet', shelf: 'top' },
  'l5-lettuce': { id: 'l5-lettuce', label: 'Lettuce', img: l5Lettuce },
  'l5-milk': { id: 'l5-milk', label: 'Milk', img: l5Milk },
  'l5-ice': { id: 'l5-ice', label: 'Ice', img: l5Ice },

  // Level 6 — FEFO Queue (sorted here soonest → latest; `shelf` in the level
  // file is what actually decides correctness — see data/levels/level06.js)
  // `expiry` now shows the real best-before date (D/M/BE) instead of a
  // "days left" countdown, so the player has to compare actual dates —
  // today in-game is 20/05/69.
  'l6-milk': { id: 'l6-milk', label: 'Milk', img: l6Milk, expiry: '21/05/69' },
  'l6-pudding': { id: 'l6-pudding', label: 'Pudding Cup', img: l6Pudding, expiry: '23/05/69' },
  'l6-ham': { id: 'l6-ham', label: 'Sliced Ham', img: l6Ham, expiry: '25/05/69' },
  'l6-juice': { id: 'l6-juice', label: 'Orange Juice', img: l6Juice, expiry: '28/05/69' },
  'l6-cheese': { id: 'l6-cheese', label: 'Cheese Block', img: l6Cheese, expiry: '03/06/69' },

  // Level 10 — "Too Hot to Chill!" (7 items)
  'l10-soup': { id: 'l10-soup', label: 'Steaming Soup Pot', thaiName: 'หม้อซุปที่มีควัน', img: l10SoupPot },
  'l10-curry-box': { id: 'l10-curry-box', label: 'Curry Box', thaiName: 'แกงในกล่อง', img: l10CurryBox },
  'l10-fried-rice-bag': { id: 'l10-fried-rice-bag', label: 'Bagged Fried Rice', thaiName: 'ข้าวผัดในถุง', img: l10FriedRiceBag },
  'l10-tea': { id: 'l10-tea', label: 'Hot Steaming Tea', thaiName: 'ถ้วยน้ำชามีควัน', img: l10TeaCup },
  'l10-fried-chicken': { id: 'l10-fried-chicken', label: 'Fried Chicken', thaiName: 'ไก่ทอด', img: l10FriedChicken },
  'l10-soggy-salad': { id: 'l10-soggy-salad', label: 'Soggy Dressed Salad', thaiName: 'สลัดที่คลุกน้ำสลัดแล้วจนแฉะ', img: l10SoggySalad },
  'l10-soggy-fries': { id: 'l10-soggy-fries', label: 'Soggy Fries with Sauce', thaiName: 'มันฝรั่งทอดที่นิ่มและมีซอสราดแล้ว', img: l10SoggyFries },
  'l10-tomato': { id: 'l10-tomato', label: 'Tomato', img: l10Tomato },
  'l10-banana': { id: 'l10-banana', label: 'Banana', img: l10Banana },
  'l10-pizza': { id: 'l10-pizza', label: 'Pizza', img: l10Pizza },

  // Level 8 — "Fridge Thermometers": same 6 zones as Level 1's fridge-assembly,
  // but the parts being placed are colour-coded thermometers (no shelf/drawer
  // art) instead of physical fridge parts. `thermo: true` tells AssemblyScene
  // to render the big Thermometer glyph as the item's art instead of an <img>.
  // `color` is an explicit override (not derived from the temperature number)
  // so the two 6°C door bins can still look visually distinct.
  'therm-top': { id: 'therm-top', label: 'Top Shelf', temp: '4–6°C', color: 'blue', thermo: true, part: 'shelf' },
  'therm-mid': { id: 'therm-mid', label: 'Middle Shelf', temp: '0–4°C', color: 'blue', thermo: true, part: 'shelf' },
  'therm-crisper': { id: 'therm-crisper', label: 'Crisper Drawer', temp: '6–10°C', color: 'green', thermo: true, part: 'drawer' },
  'therm-freezer': { id: 'therm-freezer', label: 'Freezer Drawer', temp: '-18°C', color: 'blue', thermo: true, part: 'drawer' },
  'therm-door-top': { id: 'therm-door-top', label: 'Upper Door Bin', temp: '6°C', color: 'red', thermo: true, part: 'bin' },
  'therm-door-bottom': { id: 'therm-door-bottom', label: 'Lower Door Bin', temp: '6°C', color: 'green', thermo: true, part: 'bin' },

  // Level 34 — "Cold Storage Emergency" action cards. `shelf` is the correct
  // step slot (step-1 = do first ... step-5 = do last): Check the failing
  // fridge's temperature -> Move perishables to backup cold storage ->
  // Protect what's left by closing/sealing the broken unit -> Report it to
  // maintenance -> Record the incident once the food is safe.
  'l34-check': { id: 'l34-check', label: 'Check Temperature', img: l34Check, shelf: 'step-1' },
  'l34-move': { id: 'l34-move', label: 'Move to Backup Fridge', img: l34Move, shelf: 'step-2' },
  'l34-protect': { id: 'l34-protect', label: 'Protect / Seal Unit', img: l34Protect, shelf: 'step-3' },
  'l34-report': { id: 'l34-report', label: 'Report to Maintenance', img: l34Report, shelf: 'step-4' },
  'l34-record': { id: 'l34-record', label: 'Record the Incident', img: l34Record, shelf: 'step-5' },

  // Level 35 — "HACCP Fridge Master Audit" (final boss) hazard cards. `shelf`
  // is the correct HACCP category id, `correctAction` is the ideal fix from
  // the STEP 3 (CORRECT) action list, and `problemText` is what gets written
  // into the STEP 4 Corrective Action Log's "Problem:" line.
  'l35-rte-hot': { id: 'l35-rte-hot', label: 'RTE Fridge Reads 8°C', img: l35RteHot, shelf: 'cat-temp', correctAction: 'adjust', problemText: 'Refrigerator temperature too high (8°C)' },
  'l35-freezer-warm': { id: 'l35-freezer-warm', label: 'Freezer Reads -10°C', img: l35FreezerWarm, shelf: 'cat-temp', correctAction: 'adjust', problemText: 'Freezer temperature too warm (-10°C)' },
  'l35-leaking-chicken': { id: 'l35-leaking-chicken', label: 'Raw Chicken Bag Leaking', img: l35LeakingChicken, shelf: 'cat-cross', correctAction: 'repack', problemText: 'Raw chicken packaging leaking onto shelf' },
  'l35-raw-above-rte': { id: 'l35-raw-above-rte', label: 'Raw Meat Above Salad', img: l35RawAboveRte, shelf: 'cat-cross', correctAction: 'move', problemText: 'Raw meat stored above ready-to-eat food' },
  'l35-expired-yogurt': { id: 'l35-expired-yogurt', label: 'Expired Yogurt Still In Fridge', img: l35ExpiredYogurt, shelf: 'cat-date', correctAction: 'discard', problemText: 'Expired yogurt still in the fridge' },
  'l35-missing-label': { id: 'l35-missing-label', label: 'Container With No Label', img: l35MissingLabel, shelf: 'cat-date', correctAction: 'repack', problemText: 'Container missing name/date label' },
  'l35-use-first': { id: 'l35-use-first', label: 'Soon-to-Expire Milk Buried at the Back', img: l35UseFirst, shelf: 'cat-date', correctAction: 'use-first', problemText: 'Soon-to-expire milk stored behind newer stock (FEFO)' },
  'l35-opened-can': { id: 'l35-opened-can', label: 'Opened Can Left Unsealed', img: l35OpenedCan, shelf: 'cat-storage', correctAction: 'cover', problemText: 'Opened can left unsealed in the fridge' },
  'l35-clutter': { id: 'l35-clutter', label: 'Shelf Packed Too Tight', img: l35Clutter, shelf: 'cat-storage', correctAction: 'move', problemText: 'Shelf overcrowded, blocking cold-air flow' },
  'l35-wrong-fridge': { id: 'l35-wrong-fridge', label: 'Raw Fish Stored In RTE Fridge', img: l35WrongFridge, shelf: 'cat-storage', correctAction: 'move', problemText: 'Raw fish stored in the ready-to-eat fridge' },
  'l35-no-backup': { id: 'l35-no-backup', label: 'Backup Fridge Never Used', img: l35NoBackup, shelf: 'cat-chain', correctAction: 'move', problemText: 'Backup cold storage not used during the outage' },
  'l35-thawing-counter': { id: 'l35-thawing-counter', label: 'Chicken Thawing On the Counter', img: l35ThawingCounter, shelf: 'cat-chain', correctAction: 'move', problemText: 'Raw chicken thawing at room temperature on the counter' },
  'l35-uncovered-meal': { id: 'l35-uncovered-meal', label: 'Patient Meal Left Uncovered', img: l35UncoveredMeal, shelf: 'cat-storage', correctAction: 'cover', problemText: 'Patient meal left uncovered in the fridge' },

  // Level 31 — "Patient Meal Safe Zone" (Hospital Nutrition Unit RTE fridge).
  // `shelf` here is this level's own default — see data/levels/level31.js.
  'l31-regular-meal': { id: 'l31-regular-meal', label: 'Regular Diet', img: l31RegularMeal, shelf: 'keep' },
  'l31-low-sodium-meal': { id: 'l31-low-sodium-meal', label: 'Low Sodium Meal', img: l31LowSodiumMeal, shelf: 'keep' },
  'l31-diabetic-meal': { id: 'l31-diabetic-meal', label: 'Diabetic Meal', img: l31DiabeticMeal, shelf: 'keep' },

  // Level 20 — "Cool & Store!" cooling-sequence action cards. `shelf` is the
  // correct step slot: Divide the hot pot into shallow containers first
  // (fastest cooling) -> Cover once it's no longer steaming hot -> Refrigerate
  // promptly so it spends as little time as possible in the danger zone.
  'l18-remove': { id: 'l18-remove', label: 'Take the Raw Chicken Bag Out', img: l18Remove, shelf: 'step-1' },
  'l18-contain': { id: 'l18-contain', label: 'Move It Into a Leak-proof Tray / Container', img: l18Contain, shelf: 'step-2' },
  'l18-clean': { id: 'l18-clean', label: 'Clean & Sanitise the Spill', img: l18Clean, shelf: 'step-3' },
  'l20-big-pot': { id: 'l20-big-pot', label: 'Big Pot of Soup', img: l20BigPot },
  'l20-divide': { id: 'l20-divide', label: 'Divide Into Shallow Containers', img: l20Divide, shelf: 'step-1' },
  'l20-cover': { id: 'l20-cover', label: 'Cover', img: l20Cover, shelf: 'step-2' },
  'l20-refrigerate': { id: 'l20-refrigerate', label: 'Refrigerate Promptly', img: l20Refrigerate, shelf: 'step-3' },

  // Level 27 — "Which Fridge?" delivery items. `shelf` is the correct
  // fridge id (fridge-a = Ready-to-Eat, fridge-b = Raw Ingredients,
  // fridge-c = Freezer) — see data/levels/level27.js.
  'l27-milk': { id: 'l27-milk', label: 'Pasteurized Milk', img: milk, shelf: 'fridge-a' },
  'l27-salad': { id: 'l27-salad', label: 'Prepared Salad', img: salad, shelf: 'fridge-a' },
  'l27-pudding': { id: 'l27-pudding', label: 'Pudding', img: l6Pudding, shelf: 'fridge-a' },
  'l27-raw-fish': { id: 'l27-raw-fish', label: 'Raw Fish', img: rawSalmon, shelf: 'fridge-b' },
  'l27-raw-chicken': { id: 'l27-raw-chicken', label: 'Raw Chicken', img: rawChicken, shelf: 'fridge-b' },
  'l27-raw-pork': { id: 'l27-raw-pork', label: 'Raw Pork', img: rawPork, shelf: 'fridge-b' },
  'l27-frozen-dumpling': { id: 'l27-frozen-dumpling', label: 'Frozen Dumpling', img: l5Dumplings, shelf: 'fridge-c' },
  'l27-frozen-chicken': { id: 'l27-frozen-chicken', label: 'Frozen Chicken', img: l27FrozenChicken, shelf: 'fridge-c' },
}

// Used by "randomize"-type levels (see data/levels/level06.js): returns every
// catalog item tagged with a given `category`, each already carrying its own
// canonical correct `shelf` — nothing about the picks is ever hardcoded per
// level, it's always pulled live from this shared catalog.
export const itemsInCategory = (category) =>
  Object.values(ITEMS_BY_ID).filter((it) => it.category === category)
