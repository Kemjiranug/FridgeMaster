import { useCallback, useEffect, useRef, useState } from 'react'
import { FRIDGE_IMG } from '../gameData.js'
import { LOCK_REGIONS } from './Fridge.jsx'
import * as audio from '../lib/audio.js'

// Level 20 — "Cool & Store!" หม้อใหญ่จะเข้าตู้ยังไง?
// -----------------------------------------------------------------------
// Two independent pot → box → fridge cycles, side by side — pouring the
// red pot into its box never touches the steel pot's box, and vice versa.
// Laid out as two soft trays next to the fridge (Pots tray on top, Boxes
// tray below) — real object art sitting loose in each tray, no bordered
// "card" tile around any single item.
//
//   Station A (red pot)   pot-a  → box-a → lid-a → fridge
//   Station B (steel pot) pot-b  → box-b → lid-b → fridge
//
// Only the two "sealed box → fridge" moves are real, scored `item`s — see
// data/levels/level20.js: items l20-store-a / l20-store-b. Everything else
// (pouring, covering) is local UI state this component owns; it never
// touches `placements` until a sealed box is actually dropped in the
// fridge, so App.jsx's scoring / stars / coins / result screens work
// unchanged, and reveal/hint still just point at done-store-a / -b.

const FRIDGE_ZONE = { left: '3.5%', top: '2.5%', width: '45%', height: '59%' }
const LOCKED_KEYS = ['leftFreezer', 'door', 'freezerRight']
const TAP_SLOP = 6 // px — smaller than this counts as a tap, not a drag

const STATIONS = [
  { key: 'a', tone: 'red', potName: 'Red Pot', itemId: 'l20-store-a', doneId: 'done-store-a' },
  { key: 'b', tone: 'steel', potName: 'Steel Pot', itemId: 'l20-store-b', doneId: 'done-store-b' },
]

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

// A whole stockpot, drawn as a real object sitting loose in its tray (no
// frame around it) — `tone` swaps the two pots' colourways (enamel red /
// steel); `empty` tips it and drops the steam once it's been poured out.
function PotGlyph({ tone = 'red', empty }) {
  const body = tone === 'red' ? '#e2503f' : '#c7ccd1'
  const bodyDark = tone === 'red' ? '#b7392b' : '#9aa0a6'
  const rim = tone === 'red' ? '#f2705f' : '#e4e8eb'
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className={empty ? 'cs-pot-svg is-empty' : 'cs-pot-svg'}>
      <ellipse cx="60" cy="30" rx="42" ry="9" fill="#f2b544" />
      <ellipse cx="60" cy="27" rx="34" ry="6.5" fill="#e8973f" />
      <path d="M6 46c0 3 2 5 4 5l4-1M114 46c0 3-2 5-4 5l-4-1" fill="none" stroke={bodyDark} strokeWidth="5" strokeLinecap="round" />
      <path d="M14 40h92l-6 42a8 8 0 0 1-8 7H28a8 8 0 0 1-8-7z" fill={body} stroke={bodyDark} strokeWidth="3" />
      <ellipse cx="60" cy="40" rx="46" ry="8" fill={rim} stroke={bodyDark} strokeWidth="3" />
      {!empty && <path d="M30 50l3 30M60 50l1 32M90 50l-3 30" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".35" />}
      {!empty && (
        <>
          <path className="cs-steam cs-steam--a" d="M46 22c-4-6 4-8 0-14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
          <path className="cs-steam cs-steam--b" d="M62 20c-4-6 4-8 0-14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".65" />
          <path className="cs-steam cs-steam--c" d="M78 22c-4-6 4-8 0-14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        </>
      )}
    </svg>
  )
}

// The box on its own, sitting loose in the tray — no card frame. `fill`
// 0/1 shows empty vs. just-poured-in soup; `sealed` draws the lid already
// resting flush on top instead of as a separate piece.
function BoxGlyph({ fill = 0, sealed = false }) {
  return (
    <svg className="cs-box-svg" viewBox="0 0 120 96" aria-hidden="true">
      <path d="M10 34h100l-8 54a8 8 0 0 1-8 7H26a8 8 0 0 1-8-7z" fill="rgba(160,215,240,.55)" stroke="#3f8fbf" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 46l4 38" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      {fill > 0 && <ellipse key={fill} className="cs-soup-fill" cx="60" cy="60" rx="38" ry="9" fill="#e8973f" opacity=".9" />}
      {sealed && (
        <g>
          <rect x="4" y="18" width="112" height="18" rx="8" fill="#5fb0dc" stroke="#3f8fbf" strokeWidth="3" />
          <rect x="46" y="13" width="28" height="9" rx="4.5" fill="#3f8fbf" />
        </g>
      )}
    </svg>
  )
}

// The lid — its own separate piece until it's dragged onto its box.
function LidGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 30" aria-hidden="true">
      <rect x="4" y="6" width="112" height="18" rx="8" fill="#5fb0dc" stroke="#3f8fbf" strokeWidth="3" />
      <rect x="46" y="1" width="28" height="9" rx="4.5" fill="#3f8fbf" />
    </svg>
  )
}

export default function CoolStoreScene({ placements, reveal, hintShelfId, onPlace }) {
  const [pot, setPot] = useState({ a: { poured: false }, b: { poured: false } })
  const [covered, setCovered] = useState({ a: false, b: false })
  const [msg, setMsg] = useState('')
  const [drag, setDrag] = useState(null) // { kind: 'pot' | 'lid' | 'box', key: 'a' | 'b', x, y }
  const [picked, setPicked] = useState(null) // tap-to-use fallback
  const [overBox, setOverBox] = useState({ a: false, b: false })
  const [overZone, setOverZone] = useState(false)

  const boxRefA = useRef(null)
  const boxRefB = useRef(null)
  const boxRefs = { a: boxRefA, b: boxRefB }
  const zoneRef = useRef(null)
  const msgTimer = useRef(null)
  const gesture = useRef(null)
  const latest = useRef({})

  const stored = {
    a: placements['l20-store-a'] === 'done-store-a',
    b: placements['l20-store-b'] === 'done-store-b',
  }
  const bothStored = stored.a && stored.b
  latest.current = { pot, covered, stored, reveal, onPlace }

  const flash = useCallback((text) => {
    setMsg(text)
    clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setMsg(''), 2600)
  }, [])
  useEffect(() => () => clearTimeout(msgTimer.current), [])

  // ----- applying a pot / lid onto its own box ---------------------------
  const applyToBox = (kind, key) => {
    if (reveal || stored[key]) return
    if (kind === 'pot') {
      if (pot[key].poured) {
        audio.sfxReturn()
        flash("That pot's already empty.")
      } else {
        audio.sfxPlace()
        setPot((p) => ({ ...p, [key]: { poured: true } }))
        flash('Poured in — now drag that box\u2019s lid onto it. ❄️')
      }
    } else if (kind === 'lid') {
      if (!pot[key].poured) {
        audio.sfxReturn()
        flash('That box is still empty — pour the pot into it first.')
      } else if (covered[key]) {
        audio.sfxReturn()
      } else {
        audio.sfxPlace()
        setCovered((c) => ({ ...c, [key]: true }))
        flash('Sealed — get it into the fridge! ❄️')
      }
    }
    setPicked(null)
  }

  // ----- dropping a sealed box into the fridge ----------------------------
  const tryFridge = (kind, key) => {
    if (reveal) return
    const station = STATIONS.find((s) => s.key === key)
    if (kind === 'box' && covered[key]) {
      if (stored[key]) return
      audio.sfxPlace()
      latest.current.onPlace(station.itemId, station.doneId)
      setPicked(null)
      return
    }
    audio.sfxReturn()
    setPicked(null)
    if (kind === 'pot') {
      flash("That's the whole hot pot — pour it into its box first! 🍲➡️🥡")
    } else if (kind === 'box') {
      flash('Seal that box with its lid before it goes in the fridge!')
    } else if (kind === 'lid') {
      flash("That's just the lid — put it on the box first.")
    }
  }

  // ----- pointer-based dragging (mouse + touch) ---------------------------
  const startDrag = (kind, key) => (e) => {
    if (reveal) return
    if (kind === 'pot' && (pot[key].poured || stored[key])) return
    if (kind === 'lid' && (covered[key] || stored[key])) return
    if (kind === 'box' && (!covered[key] || stored[key])) return
    e.preventDefault()
    gesture.current = { kind, key, sx: e.clientX, sy: e.clientY, travelled: 0 }
    setDrag({ kind, key, x: e.clientX, y: e.clientY })
    audio.sfxPickup()
  }

  const dragKind = drag?.kind
  useEffect(() => {
    if (!dragKind) return undefined
    const boxHit = (key, x, y) => {
      const b = boxRefs[key].current?.getBoundingClientRect()
      const pad = 20
      return !!b && x >= b.left - pad && x <= b.right + pad && y >= b.top - pad && y <= b.bottom + pad
    }
    const zoneHit = (x, y) => {
      const z = zoneRef.current?.getBoundingClientRect()
      return !!z && x >= z.left && x <= z.right && y >= z.top && y <= z.bottom
    }
    const move = (e) => {
      const g = gesture.current
      if (!g) return
      g.travelled = Math.hypot(e.clientX - g.sx, e.clientY - g.sy)
      setDrag({ kind: g.kind, key: g.key, x: e.clientX, y: e.clientY })
      if (g.kind === 'box') setOverZone(zoneHit(e.clientX, e.clientY))
      else setOverBox((o) => ({ ...o, [g.key]: boxHit(g.key, e.clientX, e.clientY) }))
    }
    const up = (e) => {
      const g = gesture.current
      gesture.current = null
      setDrag(null)
      setOverBox({ a: false, b: false })
      setOverZone(false)
      if (!g) return
      if (g.travelled < TAP_SLOP) {
        setPicked((p) => (p && p.kind === g.kind && p.key === g.key ? null : { kind: g.kind, key: g.key }))
        return
      }
      if (g.kind === 'box') {
        if (zoneHit(e.clientX, e.clientY)) tryFridge('box', g.key)
        else flash('Drag the sealed box into the fridge.')
      } else if (boxHit(g.key, e.clientX, e.clientY)) {
        applyToBox(g.kind, g.key)
      } else if (g.kind === 'pot') {
        flash("Drop it onto that pot's own box 👈")
      } else if (g.kind === 'lid') {
        flash("Drop it onto that box's own lid slot 👈")
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragKind])

  // ----- tap-to-use fallback ----------------------------------------------
  const onBoxClick = (key) => {
    if (reveal || stored[key]) return
    if (picked && (picked.kind === 'pot' || picked.kind === 'lid') && picked.key === key) {
      applyToBox(picked.kind, key)
    } else if (covered[key]) {
      setPicked((p) => (p && p.kind === 'box' && p.key === key ? null : { kind: 'box', key }))
    } else {
      flash("Drag that pot (then its lid) onto this box.")
    }
  }
  const onZoneClick = () => {
    if (reveal || !picked || picked.kind !== 'box') return
    tryFridge('box', picked.key)
  }

  const dragging = !!drag
  const lockList = LOCKED_KEYS.map((k) => LOCK_REGIONS[k]).filter(Boolean)
  const hintZone = hintShelfId === 'done-store-a' || hintShelfId === 'done-store-b'

  const bannerText =
    msg ||
    (bothStored
      ? 'Both boxes chilling nicely — press Check Answers.'
      : STATIONS.every((s) => covered[s.key] || stored[s.key])
        ? 'Both sealed — drag each box into the fridge.'
        : STATIONS.some((s) => pot[s.key].poured && !covered[s.key])
          ? "Pot's in a box — now seal that box with its own lid."
          : 'Pour EACH pot into its OWN box, seal it, then chill it — one pot at a time.')

  return (
    <div className={'cs-scene' + (dragging ? ' is-dragging' : '')}>
      <div className={'cs-banner' + (msg ? ' is-alert' : bothStored ? ' is-success' : ' is-warn')}>
        <span className="cs-banner-icon">{msg ? '⚠️' : bothStored ? '✨' : '🍲'}</span>
        <span className="cs-banner-text">{bannerText}</span>
      </div>

      <div className="cs-stage">
        <div className="fridge-scene">
          <div className="fridge-img-wrap cs-fridge-wrap">
            <img className="fridge-photo cs-fridge-img" src={FRIDGE_IMG} alt="Fridge" draggable="false" />
            {lockList.map((r, i) => (
              <div key={'ov' + i} className="lock-overlay" style={{ left: r.left, top: r.top, width: r.width, height: r.height }} />
            ))}
            <div
              ref={zoneRef}
              className={'cs-zone' + (overZone ? ' is-over' : '') + (bothStored ? ' is-filled' : '') + (hintZone && !bothStored ? ' is-hint' : '')}
              style={FRIDGE_ZONE}
              onClick={onZoneClick}
            >
              {stored.a || stored.b ? (
                <div className="cs-stored-row">
                  {STATIONS.map((s) =>
                    stored[s.key] ? (
                      <div key={s.key} className="cs-stored-card">
                        <BoxGlyph fill={1} sealed />
                        <span>{s.potName} ✓</span>
                      </div>
                    ) : null
                  )}
                </div>
              ) : null}
            </div>
            {lockList.map((r, i) => (
              <span key={'lk' + i} className="fridge-lock" style={{ left: `calc(${r.left} + ${r.width} / 2)`, top: `calc(${r.top} + ${r.height} / 2)` }}>
                <LockIcon />
              </span>
            ))}
          </div>
        </div>

        <div className="cs-side">
          {!bothStored && (
            <div className="cs-panels">
              {/* Tray 1 — the two whole pots, straight off the stove */}
              <div className="cs-panel">
                {STATIONS.map((s) =>
                  stored[s.key] ? null : (
                    <div
                      key={s.key}
                      className={
                        'cs-obj cs-obj--pot' +
                        (pot[s.key].poured ? ' is-disabled' : '') +
                        (drag?.kind === 'pot' && drag.key === s.key ? ' is-lifted' : '') +
                        (picked?.kind === 'pot' && picked.key === s.key ? ' is-picked' : '')
                      }
                      onPointerDown={pot[s.key].poured ? undefined : startDrag('pot', s.key)}
                    >
                      <PotGlyph tone={s.tone} empty={pot[s.key].poured} />
                    </div>
                  )
                )}
              </div>

              {/* Tray 2 — each pot's own box, and that box's own lid */}
              <div className="cs-panel">
                {STATIONS.map((s) => {
                  if (stored[s.key]) return null
                  const hintBox = hintShelfId === s.doneId
                  return (
                    <div className="cs-obj-pair" key={s.key}>
                      <div
                        ref={boxRefs[s.key]}
                        className={
                          'cs-obj cs-obj--box' +
                          (covered[s.key] ? ' is-sealed' : '') +
                          (overBox[s.key] ? ' is-over' : '') +
                          (pot[s.key].poured && !covered[s.key] ? ' is-ready' : '') +
                          (hintBox ? ' is-hint' : '') +
                          (drag?.kind === 'box' && drag.key === s.key ? ' is-lifted' : '') +
                          (picked?.kind === 'box' && picked.key === s.key ? ' is-picked' : '')
                        }
                        onPointerDown={covered[s.key] ? startDrag('box', s.key) : undefined}
                        onClick={() => onBoxClick(s.key)}
                      >
                        <BoxGlyph fill={pot[s.key].poured ? 1 : 0} sealed={covered[s.key]} />
                        {covered[s.key] && <span className="cs-sealed-badge">Sealed ✓</span>}
                      </div>
                      {!covered[s.key] && (
                        <div
                          className={
                            'cs-obj cs-obj--lid' +
                            (!pot[s.key].poured ? ' is-disabled' : '') +
                            (drag?.kind === 'lid' && drag.key === s.key ? ' is-lifted' : '') +
                            (picked?.kind === 'lid' && picked.key === s.key ? ' is-picked' : '')
                          }
                          onPointerDown={pot[s.key].poured ? startDrag('lid', s.key) : undefined}
                        >
                          <LidGlyph className="cs-lid-svg" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {bothStored && (
            <div className="cs-tray">
              <div className="cs-tray-note">Divide → seal → chill fast, one pot at a time: that's how a big batch gets safely into the fridge.</div>
            </div>
          )}
        </div>
      </div>

      {drag && (
        <div className={'cs-ghost cs-ghost--' + drag.kind} style={{ left: drag.x, top: drag.y }}>
          {drag.kind === 'pot' && <PotGlyph tone={STATIONS.find((s) => s.key === drag.key).tone} />}
          {drag.kind === 'lid' && <LidGlyph className="cs-lid-svg" />}
          {drag.kind === 'box' && <BoxGlyph fill={1} sealed />}
        </div>
      )}
    </div>
  )
}
