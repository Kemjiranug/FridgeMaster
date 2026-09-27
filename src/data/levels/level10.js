import { ITEMS_BY_ID } from '../items.js'

// Level 10 — "Too Hot to Chill!":
// Fridge has active Top, Middle, and Bottom shelves open (same as original),
// Dining Table for cooling hot food, and Trash Bin for spoiled/soggy food.
export const TIPS = [
  {
    title: 'Cool Hot Food First',
    img: ITEMS_BY_ID['l10-soup'].img,
    text: 'Steaming hot food like fresh soup or tea must cool down on the table first. Putting boiling-hot food into the fridge warms up the compartment and risks other food.',
    icon: '🌡️',
    color: 'teal',
  },
  {
    title: 'Cooked & Sealed in the Fridge',
    img: ITEMS_BY_ID['l10-curry-box'].img,
    text: 'Cooked, sealed foods that are ready to chill (boxed curry, bagged fried rice, fried chicken) can go straight into the fridge shelves.',
    icon: '🍱',
    color: 'yellow',
  },
  {
    title: 'Toss Soggy or Spoiled Food',
    img: ITEMS_BY_ID['l10-soggy-fries'].img,
    text: 'Salad drenched in dressing or french fries that have turned limp and soggy with sauce cannot be safely kept fresh. Toss them into the trash bin.',
    icon: '🗑️',
    color: 'pink',
  },
]

export default {
  n: 10,
  name: 'Too Hot to Chill!',
  tips: TIPS,
  layout: 'table',
  // Original locks: only crisper, freezer, and door are locked; all 3 shelves (top, middle, bottom) are open
  locks: ['crisper', 'leftFreezer', 'door', 'freezerRight'],
  shelves: [
    {
      id: 'top',
      name: 'Top Shelf',
      hint: 'Ready-to-eat & cooked food',
      color: '#7FD3B4',
      locked: false,
    },
    {
      id: 'middle',
      name: 'Middle Shelf',
      hint: 'Ready-to-eat & dairy',
      color: '#F6D24B',
      locked: false,
    },
    {
      id: 'bottom',
      name: 'Bottom Shelf',
      hint: 'Packaged & dry goods',
      color: '#F0956B',
      locked: false,
    },
    {
      id: 'table',
      name: 'Dining Table',
      hint: 'Cool down here',
      color: '#F6D24B',
      locked: false,
    },
    {
      id: 'trash',
      name: 'Trash Bin',
      hint: 'Toss spoiled/soggy',
      color: '#F0956B',
      locked: false,
    },
  ],
  items: [
    // 1. Ready to chill into fridge (can be placed into any of the 3 open shelves in the fridge)
    { id: 'l10-curry-box',      shelf: ['top', 'middle', 'bottom'] },
    { id: 'l10-fried-rice-bag', shelf: ['top', 'middle', 'bottom'] },
    { id: 'l10-fried-chicken',  shelf: ['top', 'middle', 'bottom'] },

    // 2. Cool on table
    { id: 'l10-soup',           shelf: 'table' },
    { id: 'l10-tea',            shelf: 'table' },

    // 3. Toss in trash
    { id: 'l10-soggy-salad',    shelf: 'trash' },
    { id: 'l10-soggy-fries',    shelf: 'trash' },
  ],
}
