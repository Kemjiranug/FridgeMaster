import { useEffect, useState } from 'react'
import ItemChip from './ItemChip.jsx'
import { FRIDGE_IMG } from '../gameData.js'
import * as audio from '../lib/audio.js'
import hospitalBg from '../assets/level35/hospital-bg.png'

// Level 31 — "Patient Meal Safe Zone"
// Using the authentic original Refrigerator photo (assets/fridge.png)
// with Hospital Nutrition Unit setting.

const ZONES = {
  top:    { left: '4%', top: '1%',   width: '44%', height: '16.5%' },
  middle: { left: '4%', top: '17%',  width: '44%', height: '14.5%' },
  bottom: { left: '4%', top: '31%',  width: '44%', height: '14.5%' },
}

const LOCK_REGIONS = {
  crisper:      { left: '3.5%',  top: '47%',   width: '45%',   height: '14.5%' },
  leftFreezer:  { left: '3.5%',  top: '64%',   width: '45%',   height: '30%' },
  door:         { left: '53%',   top: '2%',    width: '45%',   height: '59.5%' },
  freezerRight: { left: '53%',   top: '64%',   width: '45%',   height: '30%' },
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

export default function PatientMealScene({
  shelves,
  items,
  placements,
  itemsById,
  selectedId,
  reveal,
  hintShelfId,
  onSelect,
  onDropItem,
  onPickPlaced,
  onShelfClick,
}) {
  const [overFridgeZone, setOverFridgeZone] = useState(null)
  const [isOverBox, setIsOverBox] = useState(false)

  // Activate Hospital background
  useEffect(() => {
    document.body.classList.add('has-hospital-bg')
    document.body.style.setProperty('--hospital-bg-img', `url(${hospitalBg})`)
    return () => {
      document.body.classList.remove('has-hospital-bg')
      document.body.style.removeProperty('--hospital-bg-img')
    }
  }, [])

  // Partition items by current placement
  const fridgeItems = items.filter((it) => placements[it.id] === 'keep')
  const removeItems = items.filter((it) => placements[it.id] === 'remove')

  // In Level 31, items do not need expiry badges (e.g. pudding)
  const formatItem = (it) => (it && it.expiry ? { ...it, expiry: null } : it)

  // Group items by authentic shelves of the original fridge
  const topItems = fridgeItems.filter((it) =>
    ['l31-regular-meal', 'l31-low-sodium-meal', 'l31-diabetic-meal'].includes(it.id)
  )
  const midItems = fridgeItems.filter((it) =>
    ['milk', 'salad', 'l6-pudding'].includes(it.id)
  )
  const botItems = fridgeItems.filter(
    (it) =>
      !['l31-regular-meal', 'l31-low-sodium-meal', 'l31-diabetic-meal', 'milk', 'salad', 'l6-pudding'].includes(it.id)
  )

  const handleDragOverFridge = (e, zoneKey) => {
    if (reveal) return
    e.preventDefault()
    setOverFridgeZone(zoneKey)
  }

  const handleDragLeaveFridge = () => {
    setOverFridgeZone(null)
  }

  const handleDropFridge = (e) => {
    if (reveal) return
    e.preventDefault()
    setOverFridgeZone(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      onDropItem(id, 'keep')
      audio.sfxPlace?.()
    }
  }

  const handleDragOverBox = (e) => {
    if (reveal) return
    e.preventDefault()
    setIsOverBox(true)
  }

  const handleDragLeaveBox = () => {
    setIsOverBox(false)
  }

  const handleDropBox = (e) => {
    if (reveal) return
    e.preventDefault()
    setIsOverBox(false)
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      onDropItem(id, 'remove')
      if (id === 'raw-chicken') {
        audio.sfxPlace?.()
      } else {
        audio.sfxWrong?.()
      }
    }
  }

  const handleFridgeClick = () => {
    if (reveal) return
    if (selectedId && placements[selectedId] !== 'keep') {
      onDropItem(selectedId, 'keep')
      audio.sfxPlace?.()
      onSelect(null)
    }
  }

  const handleBoxClick = () => {
    if (reveal) return
    if (selectedId && placements[selectedId] !== 'remove') {
      onDropItem(selectedId, 'remove')
      if (selectedId === 'raw-chicken') {
        audio.sfxPlace?.()
      } else {
        audio.sfxWrong?.()
      }
      onSelect(null)
    }
  }

  const lockList = Object.entries(LOCK_REGIONS)

  return (
    <div className="pm-scene">
      {/* ----- Main Stage: Original Fridge Photo + Move Out Box ----- */}
      <div className="pm-stage">
        {/* Left: Original Fridge with photo + shelf zones */}
        <div className="pm-fridge-container">
          <div
            className={'fridge-img-wrap pm-fridge-wrap' + (overFridgeZone ? ' is-over' : '')}
            onClick={handleFridgeClick}
          >
            <img className="fridge-photo" src={FRIDGE_IMG} alt="Fridge" draggable="false" />

            {/* Lock overlays on crisper, freezer, and door */}
            {lockList.map(([key, r]) => (
              <div
                key={'ov-' + key}
                className="lock-overlay"
                style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
              />
            ))}

            {/* Shelf 1 (Top): Specialized Patient Diets */}
            <div
              className={
                'zone pm-shelf-zone' +
                (overFridgeZone === 'top' ? ' zone--active' : '') +
                (selectedId && placements[selectedId] !== 'keep' ? ' zone--active' : '')
              }
              style={ZONES.top}
              onDragOver={(e) => handleDragOverFridge(e, 'top')}
              onDragLeave={handleDragLeaveFridge}
              onDrop={handleDropFridge}
            >
              <div className="zone-items">
                {topItems.map((it) => (
                  <ItemChip
                    key={it.id}
                    item={formatItem(it)}
                    small
                    selected={selectedId === it.id}
                    mark={reveal ? (placements[it.id] === it.shelf ? 'correct' : 'wrong') : null}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!reveal) onSelect(it.id)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Shelf 2 (Middle): Chilled RTE Foods & Dairy */}
            <div
              className={
                'zone pm-shelf-zone' +
                (overFridgeZone === 'middle' ? ' zone--active' : '') +
                (selectedId && placements[selectedId] !== 'keep' ? ' zone--active' : '')
              }
              style={ZONES.middle}
              onDragOver={(e) => handleDragOverFridge(e, 'middle')}
              onDragLeave={handleDragLeaveFridge}
              onDrop={handleDropFridge}
            >
              <div className="zone-items">
                {midItems.map((it) => (
                  <ItemChip
                    key={it.id}
                    item={formatItem(it)}
                    small
                    selected={selectedId === it.id}
                    mark={reveal ? (placements[it.id] === it.shelf ? 'correct' : 'wrong') : null}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!reveal) onSelect(it.id)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Shelf 3 (Bottom): Lower Shelf (Raw Chicken starts here) */}
            <div
              className={
                'zone pm-shelf-zone' +
                (overFridgeZone === 'bottom' ? ' zone--active' : '') +
                (selectedId && placements[selectedId] !== 'keep' ? ' zone--active' : '')
              }
              style={ZONES.bottom}
              onDragOver={(e) => handleDragOverFridge(e, 'bottom')}
              onDragLeave={handleDragLeaveFridge}
              onDrop={handleDropFridge}
            >
              <div className="zone-items">
                {botItems.map((it) => (
                  <ItemChip
                    key={it.id}
                    item={formatItem(it)}
                    small
                    selected={selectedId === it.id}
                    mark={reveal ? (placements[it.id] === it.shelf ? 'correct' : 'wrong') : null}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!reveal) onSelect(it.id)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Padlock icons over locked compartments */}
            {lockList.map(([key, r]) => (
              <span
                key={'lk-' + key}
                className="fridge-lock"
                style={{
                  left: `calc(${r.left} + ${r.width} / 2)`,
                  top: `calc(${r.top} + ${r.height} / 2)`,
                }}
              >
                <LockIcon />
              </span>
            ))}
          </div>
        </div>

        {/* Right: Move Out Quarantine Box */}
        <div
          className={
            'pm-box' +
            (isOverBox ? ' is-over' : '') +
            (selectedId && placements[selectedId] !== 'remove' ? ' is-target' : '') +
            (removeItems.length > 0 ? ' has-items' : '')
          }
          onDragOver={handleDragOverBox}
          onDragLeave={handleDragLeaveBox}
          onDrop={handleDropBox}
          onClick={handleBoxClick}
        >
          <div className="pm-box-header">
            <span className="pm-box-icon">📦</span>
            <h4 className="pm-box-title">MOVE OUT</h4>
          </div>

          <div className="pm-box-dropzone">
            {removeItems.length > 0 ? (
              <div className="pm-box-items">
                {removeItems.map((it) => (
                  <div key={it.id} className="pm-quarantined-item">
                    <ItemChip
                      item={formatItem(it)}
                      small
                      selected={selectedId === it.id}
                      mark={reveal ? (placements[it.id] === it.shelf ? 'correct' : 'wrong') : null}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!reveal) onSelect(it.id)
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="pm-box-empty">
                <span className="pm-box-empty-icon">📥</span>
                <span className="pm-box-empty-text">
                  Drop Non-RTE Food Here
                  <small>Drag misplaced food here</small>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----- Reveal Learning Card (Standards Summary) ----- */}
      {reveal && (
        <div className="pm-rules-card">
          <div className="pm-rules-title-row">
            <span className="pm-rules-icon">📋</span>
            <h4 className="pm-rules-title">
              Patient Meal Refrigerator Standards (RTE Rules)
            </h4>
          </div>
          <div className="pm-rules-grid">
            <div className="pm-rule-item">
              <span className="pm-rule-num">1</span>
              <div>
                <strong>Ready-to-Eat Foods Only</strong>
                <p>Only store cooked or ready-to-eat patient meals. Never store raw ingredients here.</p>
              </div>
            </div>
            <div className="pm-rule-item">
              <span className="pm-rule-num">2</span>
              <div>
                <strong>Covered &amp; Sealed Containers</strong>
                <p>Every meal tray and container must be properly covered and sealed to prevent contamination.</p>
              </div>
            </div>
            <div className="pm-rule-item">
              <span className="pm-rule-num">3</span>
              <div>
                <strong>Strict Separation from Raw Foods</strong>
                <p>Raw poultry carries harmful pathogens (such as Salmonella) and must be kept in a raw storage unit.</p>
              </div>
            </div>
            <div className="pm-rule-item">
              <span className="pm-rule-num">4</span>
              <div>
                <strong>Hold Below 5°C (&lt;5°C Cold Holding)</strong>
                <p>Cooked chilled patient meals must be strictly maintained below 5°C at all times.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
