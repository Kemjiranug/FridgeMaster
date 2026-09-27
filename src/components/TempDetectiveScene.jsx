import { useRef, useState } from 'react'
import * as audio from '../lib/audio.js'
import fridgeArt from '../assets/level11/fridge-wide.png'

// Level 11 — "Temperature Detective"
// -----------------------------------------------------------------------
// One wide, landscape fridge. Each of the four active zones is a shelf card
// INSIDE the fridge: the food stored there on the left, and that zone's
// temperature dial (turn it, or nudge with +/-) tucked in on the right of the
// same card. `placements[zoneId]` is a plain
// number (°C) — App.jsx scores it against the zone's `range` the same
// way every other level is scored: land anywhere inside the reference
// band and it counts as correct, there's no single "exact" answer.

const STEP = 1
const ARC_START = 135 // degrees — bottom-left of the dial
const ARC_SWEEP = 270 // degrees of travel
const CX = 30, CY = 30, R = 22 // small gauge geometry

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

// Polar → cartesian helper for the gauge arc
const pointOnArc = (cx, cy, r, deg) => {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

const arcPath = (cx, cy, r, fromDeg, toDeg) => {
  const [x1, y1] = pointOnArc(cx, cy, r, fromDeg)
  const [x2, y2] = pointOnArc(cx, cy, r, toDeg)
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

// Where each zone's card sits inside the fridge picture (wide screens), as
// % of the picture (assets/level11/fridge-wide.png, 838 x 1116):
// top / height = the compartment's rows, left / width = its columns.
// On phones the picture is hidden and the cards just stack (see styles.css).
const ZONE_BOX = {
  'tz-chilled': { top: 19.2, h: 14.8, left: 6.5, w: 87.0 }, // top glass shelf
  'tz-produce': { top: 35.0, h: 14.8, left: 6.5, w: 87.0 }, // middle glass shelf
  'tz-raw': { top: 51.0, h: 16.8, left: 6.5, w: 87.0 }, // low glass drawer (raw meat lowest!)
  'tz-freezer': { top: 69.8, h: 22.5, left: 6.5, w: 87.0 }, // bottom pull-out drawers
}

export default function TempDetectiveScene({ items, placements, reveal, onSetTemp }) {
  return (
    <div className="tz-wrap">
      <div className="tz-fridge">
        <img className="tz-fridge-art" src={fridgeArt} alt="" draggable="false" />
        <span className="tz-handle" aria-hidden="true" />
        {items.map((zone) => (
          <TempZoneRow
            key={zone.id}
            zone={zone}
            box={ZONE_BOX[zone.id]}
            value={typeof placements[zone.id] === 'number' ? placements[zone.id] : zone.startTemp}
            reveal={reveal}
            onChange={(v) => onSetTemp(zone.id, v)}
          />
        ))}
      </div>
    </div>
  )
}

function TempZoneRow({ zone, box, value, reveal, onChange }) {
  const dialRef = useRef(null)
  const dragging = useRef(false)
  const [active, setActive] = useState(false)

  const [dialMin, dialMax] = zone.dial
  const [safeMin, safeMax] = zone.range
  const inRange = value >= safeMin && value <= safeMax
  const mark = reveal ? (inRange ? 'correct' : 'wrong') : null

  const valueToDeg = (v) =>
    ARC_START + ((v - dialMin) / (dialMax - dialMin)) * ARC_SWEEP

  const setValue = (v) => {
    if (reveal) return
    const next = clamp(Math.round(v / STEP) * STEP, dialMin, dialMax)
    if (next === value) return
    onChange(next)
    audio.sfxPickup()
  }

  // Turn the knob: pointer angle around the dial centre → temperature.
  const valueFromPointer = (clientX, clientY) => {
    const el = dialRef.current
    if (!el) return value
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI
    let t = deg - ARC_START
    while (t < 0) t += 360
    while (t >= 360) t -= 360
    if (t > ARC_SWEEP) return t < ARC_SWEEP + 45 ? dialMax : dialMin
    return dialMin + (t / ARC_SWEEP) * (dialMax - dialMin)
  }

  const onPointerDown = (e) => {
    if (reveal) return
    dragging.current = true
    setActive(true)
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
    setValue(valueFromPointer(e.clientX, e.clientY))
  }
  const onPointerMove = (e) => {
    if (!dragging.current || reveal) return
    setValue(valueFromPointer(e.clientX, e.clientY))
  }
  const endDrag = (e) => {
    dragging.current = false
    setActive(false)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* noop */ }
  }

  const onKeyDown = (e) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    setValue(value + dir * STEP)
  }

  const valDeg = valueToDeg(value)
  const [knobX, knobY] = pointOnArc(CX, CY, R, valDeg)

  return (
    <section
      style={box && { '--top': `${box.top}%`, '--h': `${box.h}%`, '--left': `${box.left}%`, '--w': `${box.w}%` }}
      className={
        'tz-card' +
        (mark === 'correct' ? ' is-correct' : '') +
        (mark === 'wrong' ? ' is-wrong' : '')
      }
    >
      <div className="tz-head">
        <div className="tz-title-line">
          <h3 className="tz-title">{zone.label}</h3>
          {mark && (
            <span className={`tz-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>
              {mark === 'correct' ? '✓' : '✗'}
            </span>
          )}
        </div>
      </div>

      <div className="tz-foods">
        {zone.foods.slice(0, 3).map((f) => (
          <span className="tz-food" key={f.label} title={f.label}>
            {f.img
              ? <img className="tz-food-img" src={f.img} alt={f.label} draggable="false" />
              : <span className="tz-food-emoji">{f.emoji}</span>}
            <span className="tz-food-label">{f.label}</span>
          </span>
        ))}
      </div>

      {reveal && <p className="tz-why">{zone.why}</p>}

      <div className="tz-gauge">
        <div className="temp-gauge-line">
          <button
            type="button"
            className="temp-step-btn"
            disabled={reveal || value <= dialMin}
            onClick={() => setValue(value - STEP)}
            aria-label={`Lower ${zone.label} temperature`}
          >
            −
          </button>

          <div
            ref={dialRef}
            className={'temp-dial' + (active ? ' is-turning' : '') + (reveal ? ' is-locked' : '')}
            role="slider"
            tabIndex={reveal ? -1 : 0}
            aria-label={`${zone.label} temperature`}
            aria-valuemin={dialMin}
            aria-valuemax={dialMax}
            aria-valuenow={value}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
            title="Drag around the dial, or use −/+, to set the temperature"
          >
            <svg viewBox="0 0 60 60" className="temp-dial-svg">
              <path className="temp-dial-track" d={arcPath(CX, CY, R, ARC_START, ARC_START + ARC_SWEEP)} />
              <path
                className={
                  'temp-dial-fill' +
                  (reveal ? (inRange ? ' is-safe' : ' is-unsafe') : '')
                }
                d={arcPath(CX, CY, R, ARC_START, Math.max(valDeg, ARC_START + 0.01))}
              />
              <circle className="temp-dial-knob" cx={knobX} cy={knobY} r="4.5" />
            </svg>
            <div className="temp-dial-readout">
              <span className={'temp-dial-value' + (value < 0 ? ' is-frozen' : '')}>{fmt(value)}°</span>
            </div>
          </div>

          <button
            type="button"
            className="temp-step-btn"
            disabled={reveal || value >= dialMax}
            onClick={() => setValue(value + STEP)}
            aria-label={`Raise ${zone.label} temperature`}
          >
            +
          </button>
        </div>

        <span className="temp-current-label">Current setting: {fmt(value)}°C</span>

        {reveal && (
          <span className={`temp-row-verdict ${inRange ? 'is-ok' : 'is-no'}`}>
            {inRange ? `✓ In range (${zone.chipLabel})` : `✗ Should be ${zone.chipLabel}`}
          </span>
        )}
      </div>
    </section>
  )
}
