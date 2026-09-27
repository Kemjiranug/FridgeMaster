import { FRIDGE_IMG } from '../gameData.js'
import ItemChip from './ItemChip.jsx'

// Drop-zone rectangles over the left compartment. The compartment shelves span
// ~1%–50% of the image width, and the glass surfaces sit at ~17.7%, 31.7% and
// 45.7% of the height. Each zone's BOTTOM lands on a shelf; items rest on it.
const ZONES = {
  top:    { left: '4%', top: '1%',   width: '44%', height: '16.5%' },
  middle: { left: '4%', top: '17%',  width: '44%', height: '14.5%' },
  bottom: { left: '4%', top: '31%',  width: '44%', height: '14.5%' },
}

// Named fridge compartments that a level can grey-out + padlock when they're
// not used as drop targets (keeps players from wondering where things go).
// Each level lists the keys it wants locked in its data file (`locks: [...]`).
// Each region is just its rectangle (left/top/width/height as % of the photo);
// the white padlock is auto-centred inside it at render time, so it can never
// drift out of its grey overlay. Bottoms of the freezer/lower locks run to ~91%
// — the drawer fronts end there, just above the base/legs.
// Each rectangle hugs one real compartment of the fridge photo (left/top/
// width/height as % of the image) so a locked cover sits exactly over its
// slot; the padlock is auto-centred inside it at render time.
export const LOCK_REGIONS = {
  // left food shelves — fill each compartment but leave ~2% gap at the dividers
  leftTop:      { left: '3.5%',  top: '2.5%',  width: '45%',   height: '13.5%' },
  leftUpperMid: { left: '3.5%',  top: '18%',   width: '45%',   height: '13%' },
  leftMid:      { left: '3.5%',  top: '33%',   width: '45%',   height: '12%' },
  middle:       { left: '3.5%',  top: '18%',   width: '45%',   height: '13%' },
  bottom:       { left: '3.5%',  top: '33%',   width: '45%',   height: '12%' },
  // left crisper drawer
  crisper:      { left: '3.5%',  top: '47%',   width: '45%',   height: '14.5%' },
  // left freezer (both drawers, down to just above the base)
  leftFreezer:  { left: '3.5%',  top: '64%',   width: '45%',   height: '30%' },
  // right door (fills the door interior, gap above the freezer)
  door:         { left: '53%',   top: '2%',    width: '45%',   height: '59.5%' },
  // bottom-right freezer (down to just above the base)
  freezerRight: { left: '53%',   top: '64%',   width: '45%',   height: '30%' },
}

export default function Fridge({
  shelves, placements, itemsById, selectedId, reveal, hintShelfId,
  onDropItem, onPickPlaced, onShelfClick, onZoomClick, locks = [], guided = false,
}) {
  const lockList = locks.map((k) => LOCK_REGIONS[k]).filter(Boolean)
  // Guided tutorial levels (e.g. Level 3): while an item is selected, only
  // the ONE compartment it actually belongs in is interactive — every other
  // compartment ignores drops/clicks so a first-timer can't get it wrong.
  const guidedTargetShelf = guided && selectedId ? itemsById[selectedId]?.shelf : null
  return (
    <div className="fridge-scene">
      <div className="fridge-img-wrap">
        <img className="fridge-photo" src={FRIDGE_IMG} alt="Fridge" draggable="false" />

        {/* Grey overlays over the unused compartments for this level */}
        {lockList.map((r, i) => (
          <div
            key={'ov' + i}
            className="lock-overlay"
            style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
          />
        ))}

        {/* Drop zones */}
        {shelves.filter((s) => s.zone || ZONES[s.id]).map((shelf) => {
          const items = Object.entries(placements)
            .filter(([, s]) => s === shelf.id)
            .map(([id]) => itemsById[id])
          return (
            <Zone
              key={shelf.id}
              shelf={shelf}
              items={items}
              active={
                guidedTargetShelf
                  ? shelf.id === guidedTargetShelf
                  : !!selectedId && !reveal
              }
              inert={!!guidedTargetShelf && shelf.id !== guidedTargetShelf}
              reveal={reveal}
              hint={shelf.id === hintShelfId}
              onDropItem={onDropItem}
              onPickPlaced={onPickPlaced}
              onShelfClick={onShelfClick}
              onZoomClick={onZoomClick}
            />
          )
        })}

        {/* White padlocks, auto-centred inside each locked region */}
        {lockList.map((r, i) => (
          <span
            key={'lk' + i}
            className="fridge-lock"
            style={{ left: `calc(${r.left} + ${r.width} / 2)`, top: `calc(${r.top} + ${r.height} / 2)` }}
          >
            <LockIcon />
          </span>
        ))}
      </div>
    </div>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path d="M8 11V8a4 4 0 1 1 8 0v3" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="5" y="10.5" width="14" height="10.5" rx="2.4" fill="#fff" />
      <circle cx="12" cy="15" r="1.5" fill="#8b9196" />
      <rect x="11.3" y="15" width="1.4" height="3.2" rx=".7" fill="#8b9196" />
    </svg>
  )
}

function Zone({ shelf, items, active, inert, reveal, hint, onDropItem, onPickPlaced, onShelfClick, onZoomClick }) {
  const locked = !!shelf.locked
  const isZoom = !!shelf.zoomTrigger
  // Guided tutorial (Level 3): every compartment except the one true target
  // ignores drops and clicks while an item is selected — it just isn't the
  // right place, so nothing happens if you try.
  const allowDrop = (e) => { if (!reveal && !locked && !isZoom && !inert) e.preventDefault() }
  const handleDrop = (e) => {
    if (reveal || locked || isZoom) return
    e.preventDefault()
    if (inert) return
    const id = e.dataTransfer.getData('text/plain')
    if (id) onDropItem(id, shelf.id)
  }
  const handleClick = () => {
    if (locked || inert) return
    if (isZoom) { onZoomClick?.(shelf.id); return }
    if (!reveal) onShelfClick(shelf.id)
  }
  return (
    <div
      className={'zone'
        + (active && !locked && !isZoom ? ' zone--active' : '')
        + (locked ? ' zone--locked' : '')
        + (isZoom ? ' zone--zoom' : '')
        + (inert ? ' zone--inert' : '')
        + (hint && !locked ? ' zone--hint' : '')}
      style={{ ...(shelf.zone || ZONES[shelf.id]), '--shelf-color': shelf.color }}
      onDragOver={allowDrop}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <span className="zone-tag">{shelf.name}</span>
      {locked ? (
        <div className="zone-lock" title="Sort the shelf above first">
          <span className="zone-lock-icon"><LockIcon /></span>
        </div>
      ) : isZoom ? (
        <div className="zone-zoom">
          <span className="zone-zoom-icon">🔍</span>
          <span className="zone-zoom-label">Click to zoom</span>
        </div>
      ) : (
        <div className="zone-items">
          {items.map((it) => {
            const isCorrect = Array.isArray(it.shelf) ? it.shelf.includes(shelf.id) : it.shelf === shelf.id
            const mark = reveal ? (isCorrect ? 'correct' : 'wrong') : undefined
            return (
              <ItemChip
                key={it.id}
                item={it}
                small
                mark={mark}
                onClick={(e) => { e.stopPropagation(); if (!reveal) onPickPlaced(it.id) }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
