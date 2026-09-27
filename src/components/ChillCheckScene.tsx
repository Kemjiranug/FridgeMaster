import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { FRIDGE_IMG } from '../gameData.js'
import * as audio from '../lib/audio.js'

export type ChillZoneItem = {
  id: string
  label?: string
  desc?: string
  hint?: string
  img?: string
  emoji?: string
  chipLabel?: string
  range: [number, number]
  dial: [number, number]
}

export type ChillRange = { lo: number; hi: number }
export type ChillPlacements = Record<string, ChillRange | undefined>

type ChillCheckSceneProps = {
  items: ChillZoneItem[]
  placements: ChillPlacements
  reveal: boolean
  hintShelfId?: string | null
  onSetTemp: (zoneId: string, value: ChillRange) => void
}

const fmt = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(1))
const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v))

type Handle = 'lo' | 'hi'

const ZONE_POSITIONS: Record<string, { left: string; top: string; width: string; height: string }> = {
  'zone-top': { left: '3.5%', top: '2%', width: '45.5%', height: '14.5%' },
  'zone-mid': { left: '3.5%', top: '17.5%', width: '45.5%', height: '14%' },
  'zone-crisper': { left: '3.5%', top: '46%', width: '45.5%', height: '15.5%' },
  'zone-freezer': { left: '3.5%', top: '64%', width: '45.5%', height: '28.5%' },
}

export default function ChillCheckScene({ items, placements, reveal, hintShelfId, onSetTemp }: ChillCheckSceneProps) {
  return (
    <div className="chill-fridge-container">
      <div className="fridge-scene chill-fridge-scene">
        <div className="fridge-img-wrap chill-img-wrap">
          {/* Refrigerator background image */}
          <img className="fridge-photo chill-fridge-photo" src={FRIDGE_IMG} alt="Fridge" draggable="false" />

          {/* Right door remains clean with a subtle locked compartment look */}
          <div className="chill-door-subtle" aria-hidden="true" />

          {/* Dual-handle range sliders embedded directly inside each fridge compartment */}
          {items.map((it) => {
            const value = placements[it.id]
            const [minSafe, maxSafe] = it.range
            const lo = value && typeof value === 'object' && typeof value.lo === 'number' ? value.lo : null
            const hi = value && typeof value === 'object' && typeof value.hi === 'number' ? value.hi : null

            const isSafe =
              lo != null &&
              hi != null &&
              Math.abs(lo - minSafe) <= 0.5 &&
              Math.abs(hi - maxSafe) <= 0.5

            const mark = reveal ? (isSafe ? 'correct' : 'wrong') : null
            const pos = ZONE_POSITIONS[it.id] || { left: '3.5%', top: '2%', width: '45.5%', height: '14%' }

            const setRange = (nextLo: number, nextHi: number) => {
              if (reveal) return
              onSetTemp(it.id, { lo: nextLo, hi: nextHi })
            }

            return (
              <FridgeCompartmentDualSlider
                key={it.id}
                item={it}
                lo={lo}
                hi={hi}
                pos={pos}
                isSafe={isSafe}
                mark={mark}
                reveal={reveal}
                hint={hintShelfId === it.id}
                disabled={reveal}
                onChange={setRange}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

type FridgeCompartmentDualSliderProps = {
  item: ChillZoneItem
  lo: number | null
  hi: number | null
  pos: { left: string; top: string; width: string; height: string }
  isSafe: boolean
  mark: 'correct' | 'wrong' | null
  reveal: boolean
  hint?: boolean
  disabled: boolean
  onChange: (lo: number, hi: number) => void
}

function FridgeCompartmentDualSlider({
  item,
  lo,
  hi,
  pos,
  isSafe,
  mark,
  reveal,
  hint,
  disabled,
  onChange,
}: FridgeCompartmentDualSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const draggingHandle = useRef<Handle | null>(null)

  const [dialMin, dialMax] = item.dial
  const [minSafe, maxSafe] = item.range

  const shownLo = lo == null ? dialMin : lo
  const shownHi = hi == null ? dialMax : hi

  const valueToPct = (v: number) => ((v - dialMin) / (dialMax - dialMin)) * 100
  const pctToValue = (pct: number) => {
    const raw = dialMin + (pct / 100) * (dialMax - dialMin)
    const stepped = Math.round(raw * 2) / 2 // snap to 0.5°C
    return clamp(stepped, dialMin, dialMax)
  }

  const pctFromPointer = (clientX: number) => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return 0
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
  }

  const moveHandle = (handle: Handle, clientX: number) => {
    const v = pctToValue(pctFromPointer(clientX))
    if (handle === 'lo') {
      const nextLo = clamp(v, dialMin, shownHi)
      onChange(nextLo, shownHi)
    } else {
      const nextHi = clamp(v, shownLo, dialMax)
      onChange(shownLo, nextHi)
    }
    audio.sfxPickup()
  }

  const startDrag = (handle: Handle) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return
    e.stopPropagation()
    draggingHandle.current = handle
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
    moveHandle(handle, e.clientX)
  }

  const onDragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || !draggingHandle.current) return
    moveHandle(draggingHandle.current, e.clientX)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingHandle.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }

  const stepLo = (delta: number) => {
    if (disabled) return
    const nextLo = clamp(shownLo + delta, dialMin, shownHi)
    onChange(nextLo, shownHi)
    audio.sfxPickup()
  }

  const stepHi = (delta: number) => {
    if (disabled) return
    const nextHi = clamp(shownHi + delta, shownLo, dialMax)
    onChange(shownLo, nextHi)
    audio.sfxPickup()
  }

  const onKeyDown = (handle: Handle) => (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const dir =
      e.key === 'ArrowRight' || e.key === 'ArrowUp'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
        ? -1
        : 0
    if (dir === 0) return
    e.preventDefault()
    if (handle === 'lo') {
      onChange(clamp(shownLo + dir * 0.5, dialMin, shownHi), shownHi)
    } else {
      onChange(shownLo, clamp(shownHi + dir * 0.5, shownLo, dialMax))
    }
    audio.sfxPickup()
  }

  const loPct = valueToPct(shownLo)
  const hiPct = valueToPct(shownHi)
  const safeLeftPct = valueToPct(minSafe)
  const safeWidthPct = valueToPct(maxSafe) - safeLeftPct

  return (
    <div
      className={
        'chill-in-fridge-slot' +
        (reveal && isSafe ? ' chill-in-fridge-slot--safe' : '') +
        (mark === 'correct' ? ' chill-in-fridge-slot--correct' : '') +
        (mark === 'wrong' ? ' chill-in-fridge-slot--wrong' : '') +
        (hint ? ' chill-in-fridge-slot--hint' : '')
      }
      style={pos}
    >
      <div className="chill-in-fridge-card">
        {/* Header: Title and Live Range Readout */}
        <div className="chill-in-fridge-head">
          <div className="chill-in-fridge-title">
            <span className="chill-in-fridge-emoji">{item.emoji}</span>
            <span className="chill-in-fridge-name">{item.label}</span>
          </div>
          <div className={'chill-in-fridge-readout' + (reveal && isSafe ? ' chill-in-fridge-readout--safe' : '')}>
            {lo == null && hi == null ? (
              'Set Range'
            ) : (
              <span>
                {fmt(shownLo)}° → {fmt(shownHi)}°C
              </span>
            )}
          </div>
        </div>

        {/* Dual Handle Slider Track with Steppers */}
        <div className="chill-in-fridge-slider-row">
          <div className="chill-stepper-mini">
            <button
              type="button"
              className="chill-step-btn-mini"
              aria-label="Decrease low limit"
              disabled={disabled}
              onClick={() => stepLo(-0.5)}
              title="Low limit -0.5°C"
            >
              ▼
            </button>
            <button
              type="button"
              className="chill-step-btn-mini"
              aria-label="Increase low limit"
              disabled={disabled}
              onClick={() => stepLo(0.5)}
              title="Low limit +0.5°C"
            >
              ▲
            </button>
          </div>

          <div
            ref={trackRef}
            className="chill-in-fridge-track"
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* Target dashed band indicating safe range — only shown on reveal or hint */}
            {(reveal || hint) && (
              <div
                className="chill-in-fridge-band"
                style={{ left: `${safeLeftPct}%`, width: `${Math.max(safeWidthPct, 4)}%` }}
                title={`Safe Target: ${minSafe}°C to ${maxSafe}°C`}
              />
            )}

            {/* Filled range dialed by the player */}
            <div
              className="chill-in-fridge-selected"
              style={{ left: `${loPct}%`, width: `${Math.max(hiPct - loPct, 0)}%` }}
            />

            {/* Low Thumb (drags from left) */}
            <div
              className={
                'chill-thumb-handle chill-thumb-handle--lo' +
                (lo == null ? ' chill-thumb-handle--unset' : '')
              }
              style={{ left: `${loPct}%` }}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label={`${item.label} Low Limit`}
              aria-valuemin={dialMin}
              aria-valuemax={shownHi}
              aria-valuenow={shownLo}
              aria-disabled={disabled}
              onPointerDown={startDrag('lo')}
              onKeyDown={onKeyDown('lo')}
              title={`Low: ${fmt(shownLo)}°C (Drag right)`}
            />

            {/* High Thumb (drags from right) */}
            <div
              className={
                'chill-thumb-handle chill-thumb-handle--hi' +
                (hi == null ? ' chill-thumb-handle--unset' : '')
              }
              style={{ left: `${hiPct}%` }}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label={`${item.label} High Limit`}
              aria-valuemin={shownLo}
              aria-valuemax={dialMax}
              aria-valuenow={shownHi}
              aria-disabled={disabled}
              onPointerDown={startDrag('hi')}
              onKeyDown={onKeyDown('hi')}
              title={`High: ${fmt(shownHi)}°C (Drag left)`}
            />
          </div>

          <div className="chill-stepper-mini">
            <button
              type="button"
              className="chill-step-btn-mini"
              aria-label="Decrease high limit"
              disabled={disabled}
              onClick={() => stepHi(-0.5)}
              title="High limit -0.5°C"
            >
              ▼
            </button>
            <button
              type="button"
              className="chill-step-btn-mini"
              aria-label="Increase high limit"
              disabled={disabled}
              onClick={() => stepHi(0.5)}
              title="High limit +0.5°C"
            >
              ▲
            </button>
          </div>
        </div>

        {/* Footer: Description during play, Safe Target Range & Status on reveal/hint */}
        <div className="chill-in-fridge-footer">
          {reveal || hint ? (
            <>
              <span className="chill-in-fridge-target">
                Target: <strong>{item.chipLabel || `${minSafe}°C to ${maxSafe}°C`}</strong>
              </span>
              {reveal && (
                isSafe ? (
                  <span className="chill-in-fridge-status chill-in-fridge-status--safe">✓ In Range</span>
                ) : (
                  <span className="chill-in-fridge-status chill-in-fridge-status--adjust">Out of Range</span>
                )
              )}
            </>
          ) : (
            <span className="chill-in-fridge-desc" title={item.desc}>
              {item.desc}
            </span>
          )}
        </div>

        {/* Result mark overlay */}
        {mark === 'correct' && <span className="chill-in-fridge-mark chill-in-fridge-mark--ok">✓</span>}
        {mark === 'wrong' && <span className="chill-in-fridge-mark chill-in-fridge-mark--no">✗</span>}
      </div>
    </div>
  )
}
