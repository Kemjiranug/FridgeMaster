import { useCallback, useEffect, useRef, useState } from 'react'
import * as audio from '../lib/audio.js'
import fridgeImg from '../assets/level33/fridge.png'
import saladImg from '../assets/level2/salad.png'
import chickenImg from '../assets/level2/raw-chicken.png'
import clothImg from '../assets/level18/clean.svg'
import { ROW_Y } from '../data/fridgeRows.js'

// Level 18 — "Leak Emergency!" (ถุงไก่ดิบรั่ว)
// -----------------------------------------------------------------------
// A real, hands-on version of the clean-up — no ordered cards, no tray:
//   1. DRAG the leaking raw-chicken bag out of the fridge and drop it into
//      the leak-proof box.
//   2. DRAG the cloth over the dirty spots and rub until every stain is
//      wiped away. (The cloth won't clean while the bag is still dripping —
//      stop the leak first, just like in real life.)
// Progress is reported through the normal placement engine, so scoring,
// hints, stars and the result screens all work like any other level:
//   placements['l18-contain'] = 'done-contain'  → chicken is in the box
//   placements['l18-clean']   = 'done-clean'    → every stain is wiped
//
// Everything is drawn on the fridge photo (assets/level33/fridge.png). Object
// positions are % of the FULL photo; only the top CROP of it is shown so the
// scene stays compact.

const CROP = 0.49 // visible fraction of the fridge photo's height
const IMG_RATIO = 472 / 1015 // fridge.png width / height

// Juice puddles on the glass shelves. x / y = centre, w = width (all in % of
// the full fridge photo width / height).
const STAINS = [
  { id: 's1', x: 27, y: 32.4, w: 17 },
  { id: 's2', x: 50, y: 32.6, w: 24 },
  { id: 's3', x: 74, y: 32.3, w: 15 },
  { id: 's4', x: 52, y: 46.4, w: 16 }, // dripped down onto the shelf below
]
const STAIN_ASPECT = 0.34 // puddle height / width (in px)
const RUB_LENGTH = 3.4 // rub distance (in puddle half-widths) to wipe one clean
const TAP_SLOP = 6 // px — smaller than this counts as a tap, not a drag

export const CONTAIN_DONE = 'done-contain'
export const CLEAN_DONE = 'done-clean'

export default function LeakScene({ placements, reveal, hintShelfId, onPlace }) {
  const boxed = placements['l18-contain'] === CONTAIN_DONE
  const cleanedFlag = placements['l18-clean'] === CLEAN_DONE

  const [stains, setStains] = useState(() =>
    STAINS.map((s) => ({ ...s, clean: cleanedFlag ? 1 : 0 }))
  )
  const [drag, setDrag] = useState(null) // { kind: 'chicken' | 'cloth', x, y }
  const [overBox, setOverBox] = useState(false)
  const [picked, setPicked] = useState(null) // tap-to-use fallback: 'chicken' | 'cloth'
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!cleanedFlag) {
      setStains(STAINS.map((s) => ({ ...s, clean: 0 })))
      setPicked(null)
      setDrag(null)
      setOverBox(false)
    }
  }, [cleanedFlag])

  const boxRef = useRef(null)
  const innerRef = useRef(null) // full-size fridge photo box (for % → px)
  const msgTimer = useRef(null)
  const latest = useRef({})
  latest.current = { boxed, cleanedFlag, reveal, onPlace }
  const gesture = useRef(null) // { kind, sx, sy, lx, ly, travelled }

  const flash = useCallback((text) => {
    setMsg(text)
    clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setMsg(''), 2600)
  }, [])
  useEffect(() => () => clearTimeout(msgTimer.current), [])

  const allClean = stains.every((s) => s.clean >= 1)
  useEffect(() => {
    if (allClean && !cleanedFlag && !reveal) onPlace('l18-clean', CLEAN_DONE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClean])

  // ----- wiping ---------------------------------------------------------
  const wipeAt = useCallback((cx, cy, dist) => {
    const inner = innerRef.current
    if (!inner || dist <= 0) return
    const r = inner.getBoundingClientRect()
    setStains((prev) => {
      let touched = false
      const next = prev.map((s) => {
        if (s.clean >= 1) return s
        const rx = ((s.w / 100) * r.width) / 2
        const ry = rx * STAIN_ASPECT
        const dx = cx - (r.left + (s.x / 100) * r.width)
        const dy = cy - (r.top + (s.y / 100) * r.height)
        const hit = (dx / (rx + 16)) ** 2 + (dy / (ry + 18)) ** 2 <= 1
        if (!hit) return s
        touched = true
        return { ...s, clean: Math.min(1, s.clean + dist / (rx * RUB_LENGTH)) }
      })
      return touched ? next : prev
    })
  }, [])

  // ----- dragging ---------------------------------------------------------
  const startDrag = (kind) => (e) => {
    if (reveal) return
    if (kind === 'chicken' && boxed) return
    e.preventDefault()
    gesture.current = { kind, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, travelled: 0 }
    setDrag({ kind, x: e.clientX, y: e.clientY })
    audio.sfxPickup()
  }

  const dragKind = drag?.kind
  useEffect(() => {
    if (!dragKind) return undefined
    const boxHit = (x, y) => {
      const b = boxRef.current?.getBoundingClientRect()
      const pad = 18
      return !!b && x >= b.left - pad && x <= b.right + pad && y >= b.top - pad && y <= b.bottom + pad
    }
    const move = (e) => {
      const g = gesture.current
      if (!g) return
      const d = Math.hypot(e.clientX - g.lx, e.clientY - g.ly)
      g.travelled = Math.hypot(e.clientX - g.sx, e.clientY - g.sy)
      g.lx = e.clientX
      g.ly = e.clientY
      setDrag({ kind: g.kind, x: e.clientX, y: e.clientY })
      if (g.kind === 'chicken') {
        setOverBox(boxHit(e.clientX, e.clientY))
      } else if (g.travelled >= TAP_SLOP) {
        if (latest.current.boxed) wipeAt(e.clientX, e.clientY, d)
      }
    }
    const up = (e) => {
      const g = gesture.current
      gesture.current = null
      setDrag(null)
      setOverBox(false)
      if (!g) return
      if (g.travelled < TAP_SLOP) {
        // A tap, not a drag → select / de-select the tool (tap-to-use fallback)
        setPicked((p) => (p === g.kind ? null : g.kind))
        return
      }
      if (g.kind === 'chicken' && boxHit(e.clientX, e.clientY)) {
        setPicked(null)
        latest.current.onPlace('l18-contain', CONTAIN_DONE)
      } else if (g.kind === 'cloth') {
        // Rubbing over a stain too early? Explain why it isn't working.
        if (!latest.current.boxed) flash('Stop the drip first — put the chicken in the box! 🍗→📦')
      } else if (g.kind === 'chicken') {
        flash('Drop the chicken into the leak-proof box 👈')
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
  }, [dragKind, wipeAt, flash])

  // ----- tap-to-use fallback ----------------------------------------------
  const onBoxClick = () => {
    if (reveal || boxed) return
    if (picked === 'chicken') {
      setPicked(null)
      onPlace('l18-contain', CONTAIN_DONE)
    } else {
      flash('Drag the leaking chicken into this box 🍗')
    }
  }
  const onStainClick = (id) => {
    if (reveal || picked !== 'cloth') return
    if (!boxed) { flash('Stop the drip first — put the chicken in the box! 🍗→📦'); return }
    audio.sfxPickup()
    setStains((prev) => prev.map((s) => (s.id === id ? { ...s, clean: 1 } : s)))
  }

  const cleanCount = stains.filter((s) => s.clean >= 1).length
  const dragging = !!drag
  const hintBox = hintShelfId === CONTAIN_DONE
  const hintStain = hintShelfId === CLEAN_DONE

  return (
    <div className={'leak-scene' + (dragging ? ' is-dragging' : '')}>
      <div
        className={
          'leak-banner' +
          (msg
            ? ' is-alert'
            : allClean && boxed
              ? ' is-success'
              : boxed
                ? ' is-action'
                : ' is-warn')
        }
      >
        <span className="leak-banner-icon">
          {msg ? '⚠️' : allClean && boxed ? '✨' : boxed ? '🧽' : '⚠️'}
        </span>
        <span className="leak-banner-text">
          {msg ||
            (allClean && boxed
              ? 'All clean! Press Check Answers.'
              : boxed
                ? 'Drag the cloth over the stains and rub them away'
                : 'Drag the chicken into the leak-proof box, then wipe the stains with the cloth')}
        </span>
      </div>

      <div className="leak-stage">
        {/* ----- left: the fridge, cropped to the top shelves ----- */}
        <div className="leak-fridge">
          <div className="leak-crop" style={{ aspectRatio: `${IMG_RATIO * 1000} / ${1000 * CROP}` }}>
            <div ref={innerRef} className="leak-inner" style={{ aspectRatio: `${IMG_RATIO * 1000} / 1000` }}>
              <img className="leak-fridge-img" src={fridgeImg} alt="Open fridge" draggable="false" />

              {/* the mess */}
              {stains.map((s) => (
                <div
                  key={s.id}
                  className={'leak-stain' + (s.clean >= 1 ? ' is-clean' : '') + (hintStain && s.clean < 1 ? ' is-hint' : '')}
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${s.w}%`,
                    '--fade': 1 - Math.min(1, s.clean),
                  }}
                  onClick={() => onStainClick(s.id)}
                >
                  {s.clean >= 1 && <span className="leak-sparkle">✨</span>}
                </div>
              ))}

              {/* salad + berries sitting under the leak */}
              <div className="leak-food" style={{ top: `${ROW_Y[3]}%`, left: '25%' }}>
                <img src={saladImg} alt="Salad" draggable="false" />
                <small>Salad</small>
              </div>
              <div className="leak-food" style={{ top: `${ROW_Y[3]}%`, left: '76%' }}>
                <span className="leak-berry">🍓</span>
                <small>Berries</small>
              </div>

              {/* the leaking chicken — grab it! */}
              {!boxed && (
                <div
                  className={
                    'leak-chicken' +
                    (drag?.kind === 'chicken' ? ' is-lifted' : '') +
                    (picked === 'chicken' ? ' is-picked' : '') +
                    (hintBox ? ' is-hint' : '')
                  }
                  style={{ top: `${ROW_Y[2]}%` }}
                  onPointerDown={startDrag('chicken')}
                >
                  <img className="leak-bag" src={chickenImg} alt="Leaking raw chicken" draggable="false" />
                  <span className="leak-drop leak-drop--a">💧</span>
                  <span className="leak-drop leak-drop--b">💧</span>
                  <small>Raw chicken (leaking)</small>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="leak-tools">
          {/* leak-proof box (drop target) */}
          <div
            ref={boxRef}
            className={
              'leak-box' +
              (boxed ? ' is-sealed' : '') +
              (overBox ? ' is-over' : '') +
              (picked === 'chicken' && !boxed ? ' is-ready' : '') +
              (hintBox ? ' is-hint' : '')
            }
            onClick={onBoxClick}
          >
            <div className="leak-box-art">
              {boxed && <img className="leak-box-chicken" src={chickenImg} alt="" draggable="false" />}
              <svg className="leak-box-body" viewBox="0 0 120 84" aria-hidden="true">
                <path d="M10 22h100l-8 54a8 8 0 0 1-8 7H26a8 8 0 0 1-8-7z" fill="rgba(160,215,240,.55)" stroke="#3f8fbf" strokeWidth="3" strokeLinejoin="round" />
                <path d="M28 34l4 38" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
              </svg>
              <svg className="leak-box-lid" viewBox="0 0 120 30" aria-hidden="true">
                <rect x="4" y="6" width="112" height="18" rx="8" fill="#5fb0dc" stroke="#3f8fbf" strokeWidth="3" />
                <rect x="46" y="1" width="28" height="9" rx="4.5" fill="#3f8fbf" />
              </svg>
            </div>
            <small>{boxed ? 'Sealed ✓' : 'Leak-proof box'}</small>
          </div>
          {/* cloth */}
          <div
            className={
              'leak-cloth' +
              (drag?.kind === 'cloth' ? ' is-lifted' : '') +
              (picked === 'cloth' ? ' is-picked' : '')
            }
            onPointerDown={startDrag('cloth')}
          >
            <img src={clothImg} alt="Cloth" draggable="false" />
            <small>
              {allClean ? 'Spotless ✓' : boxed ? `Cloth · rub the stains (${cleanCount}/${stains.length})` : 'Cloth · use after the chicken is out'}
            </small>
          </div>
        </div>
      </div>

      {/* what you're carrying follows the pointer */}
      {drag && (
        <div className={'leak-ghost leak-ghost--' + drag.kind} style={{ left: drag.x, top: drag.y }}>
          <img src={drag.kind === 'chicken' ? chickenImg : clothImg} alt="" draggable="false" />
        </div>
      )}
    </div>
  )
}
