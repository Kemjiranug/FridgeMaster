import { useState } from 'react'
import ItemChip from './ItemChip.jsx'
import fridgeImg from '../assets/level33/fridge.png'

// Level 27 — "Which Fridge?"
// Three full upright refrigerators side-by-side using the authentic
// fridge photo from Level 33 (assets/level33/fridge.png):
//   Fridge A — Ready-to-Eat (+3°C)
//   Fridge B — Raw Ingredients (+1°C)
//   Fridge C — Deep Freezer (-18°C)

const FRIDGE_THEMES = {
  'fridge-a': {
    tone: 'rte',
    icon: '🥗',
    temp: '+3°C',
    type: 'Ready-to-Eat',
  },
  'fridge-b': {
    tone: 'raw',
    icon: '🥩',
    temp: '+1°C',
    type: 'Raw Ingredients',
  },
  'fridge-c': {
    tone: 'freezer',
    icon: '🧊',
    temp: '-18°C',
    type: 'Deep Freezer',
  },
}

function WFFridge({ shelf, items, reveal, hint, onDropItem, onPickPlaced, onShelfClick }) {
  const [isOver, setIsOver] = useState(false)
  const theme = FRIDGE_THEMES[shelf.id] || {
    tone: 'rte',
    icon: '❄️',
    temp: '+3°C',
    type: shelf.sub || 'Fridge',
  }

  const allowDrop = (e) => {
    if (!reveal) {
      e.preventDefault()
      setIsOver(true)
    }
  }
  const handleDragLeave = () => setIsOver(false)
  const handleDrop = (e) => {
    if (reveal) return
    e.preventDefault()
    setIsOver(false)
    const id = e.dataTransfer.getData('text/plain')
    if (id) onDropItem(id, shelf.id)
  }

  // Distribute items onto 6 shelf tiers matching the photo:
  // Tier 1-3: Glass shelves
  // Tier 4: Crisper box
  // Tier 5-6: Drawers
  const tiers = [[], [], [], [], [], []]
  items.forEach((it, idx) => {
    tiers[idx % 6].push(it)
  })

  const renderChip = (it) => {
    const mark = reveal ? (it.shelf === shelf.id ? 'correct' : 'wrong') : undefined
    return (
      <ItemChip
        key={it.id}
        item={it}
        small
        mark={mark}
        onClick={(e) => {
          e.stopPropagation()
          if (!reveal) onPickPlaced(it.id)
        }}
      />
    )
  }

  return (
    <div
      className={
        `wf-fridge wf-fridge--${theme.tone}` +
        (isOver ? ' is-over' : '') +
        (hint ? ' wf-fridge--hint' : '')
      }
      onDragOver={allowDrop}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => { if (!reveal) onShelfClick(shelf.id) }}
    >
      {/* Top Appliance Control Panel */}
      <div className="wf-fridge-top">
        <div className="wf-fridge-brand">
          <span className="wf-fridge-badge-icon">{theme.icon}</span>
          <div className="wf-fridge-title-col">
            <span className="wf-fridge-name">{shelf.name}</span>
            <span className="wf-fridge-sub">{theme.type}</span>
          </div>
        </div>
        <div className="wf-fridge-led">
          <span className="wf-led-dot" />
          <span className="wf-led-temp">{theme.temp}</span>
        </div>
      </div>

      {/* Main Refrigerator Body — Level 33 Fridge Photo */}
      <div className="wf-fridge-body">
        <img
          className="wf-fridge-img"
          src={fridgeImg}
          alt={`${shelf.name} - ${theme.type}`}
          draggable="false"
        />

        {/* Shelf Tiers mapped onto the photo's glass shelves & drawers */}
        <div className="wf-shelf-overlays">
          {tiers.map((tierItems, tIdx) => (
            <div key={tIdx} className={`wf-shelf-tier wf-shelf-tier--${tIdx + 1}`}>
              {tierItems.map(renderChip)}
            </div>
          ))}
        </div>

        {/* Frost shimmer badge for Deep Freezer */}
        {theme.tone === 'freezer' && (
          <div className="wf-frost-decor">
            <span className="wf-frost-flake">❄</span>
            <span className="wf-frost-flake">❅</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WhichFridgeScene({
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
    <div className="wf-wrap">
      <div className="wf-fridges">
        {shelves.map((shelf) => {
          const fridgeItems = Object.entries(placements)
            .filter(([, s]) => s === shelf.id)
            .map(([id]) => itemsById[id])
            .filter(Boolean)
          return (
            <WFFridge
              key={shelf.id}
              shelf={shelf}
              items={fridgeItems}
              reveal={reveal}
              hint={shelf.id === hintShelfId}
              onDropItem={onDropItem}
              onPickPlaced={onPickPlaced}
              onShelfClick={onShelfClick}
            />
          )
        })}
      </div>

      <div className="wf-tray-wrap">
        <div className="wf-tray" onDragOver={allowTrayDrop} onDrop={handleTrayDrop}>
          <div className="wf-tray-row">
            {trayItems.map((it) => (
              <ItemChip
                key={it.id}
                item={it}
                selected={selectedId === it.id}
                onClick={() => onSelect(it.id)}
              />
            ))}
            {trayItems.length === 0 && (
              <div className="wf-tray-empty">Every delivery item is put in the right fridge! 🎯</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
