import ItemChip from './ItemChip.jsx'

// Level 22 — "Leftover Countdown!"
// Top half: Inside the fridge (cooling shelf with leftovers to sort)
// Bottom half: The 3 bins (Keep / Eat First / Discard)

export default function SortBinsScene({
  shelves, items, placements, itemsById, selectedId, reveal, hintShelfId,
  onSelect, onDropItem, onPickPlaced, onShelfClick,
}) {
  const trayItems = items.filter((it) => placements[it.id] == null)

  const allowTrayDrop = (e) => { if (!reveal) e.preventDefault() }
  const handleTrayDrop = (e) => {
    if (reveal) return
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) onPickPlaced(id)
  }

  return (
    <div className="sortbins-wrap">
      {/* ----- Top Half: Inside the Fridge ----- */}
      <div
        className="sortbins-fridge-top"
        onDragOver={allowTrayDrop}
        onDrop={handleTrayDrop}
      >
        <div className="sortbins-fridge-header">
          <div className="sortbins-fridge-status">
            <span className="sortbins-fridge-dot" />
            <span className="sortbins-fridge-title">Inside Fridge · 4°C</span>
          </div>
        </div>

        <div className="sortbins-fridge-shelf">
          <div className="sortbins-fridge-items">
            {trayItems.map((it) => (
              <ItemChip
                key={it.id}
                item={it}
                selected={selectedId === it.id}
                onClick={() => onSelect(it.id)}
              />
            ))}
            {trayItems.length === 0 && (
              <div className="sortbins-fridge-empty">All sorted out of the fridge! 🎯</div>
            )}
          </div>
          <div className="sortbins-fridge-glass-rail" aria-hidden="true" />
        </div>
      </div>

      {/* ----- Bottom Half: The 3 Bins ----- */}
      <div className="sortbins-grid">
        {shelves.map((shelf) => {
          const binItems = Object.entries(placements)
            .filter(([, s]) => s === shelf.id)
            .map(([id]) => itemsById[id])
            .filter(Boolean)
          return (
            <SortBin
              key={shelf.id}
              shelf={shelf}
              items={binItems}
              active={!!selectedId && !reveal}
              reveal={reveal}
              hint={shelf.id === hintShelfId}
              onDropItem={onDropItem}
              onPickPlaced={onPickPlaced}
              onShelfClick={onShelfClick}
            />
          )
        })}
      </div>
    </div>
  )
}

function SortBin({ shelf, items, active, reveal, hint, onDropItem, onPickPlaced, onShelfClick }) {
  const allowDrop = (e) => { if (!reveal) e.preventDefault() }
  const handleDrop = (e) => {
    if (reveal) return
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) onDropItem(id, shelf.id)
  }

  return (
    <div
      className={
        'sortbin' +
        ` sortbin--${shelf.id}` +
        (active ? ' sortbin--active' : '') +
        (hint ? ' sortbin--hint' : '')
      }
      style={{ '--bin-color': shelf.color }}
      onDragOver={allowDrop}
      onDrop={handleDrop}
      onClick={() => { if (!reveal) onShelfClick(shelf.id) }}
    >
      <span className="sortbin-label">{shelf.name}</span>
      {shelf.hint && <span className="sortbin-hint">{shelf.hint}</span>}
      <div className="sortbin-items">
        {items.map((it) => {
          const mark = reveal ? (it.shelf === shelf.id ? 'correct' : 'wrong') : undefined
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
    </div>
  )
}
