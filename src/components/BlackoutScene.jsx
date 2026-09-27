import { useState, useMemo } from 'react'
import * as audio from '../lib/audio.js'

// Level 24 — "Fridge Blackout!"
// One power-outage stage at a time, headlined by a big digital "Power Out"
// readout and a real CSS fridge you can watch open/close. Three buttons —
// OPEN FRIDGE / KEEP CLOSED / MOVE TO ICE COOLER — decide the stage.
// `placements[itemId]` is 'open' | 'closed' | 'cooler' | null, scored the
// same way every other generic level is (against each item's `shelf`).
//
// The player can freely re-click between the three buttons — nothing
// auto-advances. Moving to the next stage is always an explicit action
// (the ‹ › arrows, the dots, or the "Next Stage →" pill that appears once
// a choice has been made).

const BUTTONS = [
  { id: 'open', label: 'Open Fridge', icon: '🚪' },
  { id: 'closed', label: 'Keep Closed', icon: '🔒' },
  { id: 'cooler', label: 'Move to Ice Cooler', icon: '🧊' },
]

export default function BlackoutScene({ items, placements, reveal, onChoose }) {
  const [index, setIndex] = useState(0)
  const item = items[Math.min(index, items.length - 1)]
  const choice = placements[item.id] ?? null
  const decided = choice != null
  const mark = reveal ? (choice === item.shelf ? 'correct' : 'wrong') : null
  const doorOpen = choice === 'open'
  const movedOut = choice === 'cooler'

  // The fridge visibly gets dimmer / more stale-looking as the outage drags
  // on — purely a mood cue tied to which stage we're on (0, 1, 2 …).
  const dimLevel = Math.min(index, 2)

  // Cold Meter: drains a little for every stage reached (time passing), and
  // takes a hard hit for every stage where OPEN FRIDGE was picked. Purely a
  // visual gut-check — actual scoring runs on the generic shelf engine.
  const coldPct = useMemo(() => {
    let pct = 100
    items.forEach((it, i) => {
      if (i > index) return
      pct -= 8
      if (placements[it.id] === 'open') pct -= 28
    })
    return Math.max(4, Math.min(100, pct))
  }, [items, placements, index])

  const go = (dir) => {
    setIndex((i) => (i + dir + items.length) % items.length)
    audio.sfxClick?.()
  }

  const choose = (shelfId) => {
    if (reveal) return
    onChoose(item.id, shelfId)
    if (shelfId === 'open') audio.sfxWrong?.() ?? audio.sfxPlace()
    else audio.sfxPlace()
    // No auto-advance — the player can keep tapping between the three
    // buttons as many times as they like before moving on.
  }

  const isLast = index === items.length - 1

  return (
    <div className="bo-wrap">
      <button type="button" className="bo-arrow" onClick={() => go(-1)} aria-label="Previous stage">
        ‹
      </button>

      <div className={'bo-card' + (mark === 'correct' ? ' is-correct' : '') + (mark === 'wrong' ? ' is-wrong' : '')}>
        {mark && (
          <span className={`bo-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>
            {mark === 'correct' ? '✓' : '✗'}
          </span>
        )}

        {/* ----- Headline: big digital "Power Out" readout ----- */}
        <div className="bo-timer-big">
          <span className="bo-timer-caption">
            <span className="bo-timer-dot" />
            POWER OUT
          </span>
          <span className="bo-timer-value">
            {item.timerValue}
            <span className="bo-timer-unit">{item.timerUnit}</span>
          </span>
        </div>

        {/* ----- The fridge itself: a real openable door ----- */}
        <div className={'bo-fridge-stage' + (movedOut ? ' is-moved-out' : '')}>
          <div className={`bo-fridge-case dim-${dimLevel}`}>
            <div className="bo-fridge-cavity">
              <span className="bo-fridge-shelf" />
              <span className="bo-fridge-shelf" />
              <span className="bo-fridge-bulb" aria-hidden="true">💡</span>
              {doorOpen && <span className="bo-fridge-lightoff">Light: OFF</span>}
            </div>
            <div className="bo-fridge-hinge bo-fridge-hinge-top" />
            <div className="bo-fridge-hinge bo-fridge-hinge-bottom" />
            <div className={'bo-fridge-door' + (doorOpen ? ' is-open' : '')}>
              <span className="bo-fridge-handle" />
            </div>
          </div>
          {movedOut && (
            <div className="bo-cooler">
              <span className="bo-cooler-icon">🧊</span>
              <span className="bo-cooler-label">Ice Cooler</span>
            </div>
          )}
        </div>

        {doorOpen && (
          <div className="bo-escape">
            <span className="bo-escape-arrows">↓↓↓</span> Cold air escaped!
          </div>
        )}

        <div className="bo-meter">
          <div className="bo-meter-label">
            <span>❄️ Cold Meter</span>
            <span>{coldPct}%</span>
          </div>
          <div className="bo-meter-track">
            <div
              className={'bo-meter-fill' + (coldPct < 35 ? ' is-low' : coldPct < 70 ? ' is-mid' : '')}
              style={{ width: `${coldPct}%` }}
            />
          </div>
        </div>

        {item.tempInfo && (
          <div className="bo-tempinfo">🌡️ {item.tempInfo}</div>
        )}

        <div className={'bo-actions' + (decided ? ' has-choice' : '')}>
          {BUTTONS.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`bo-btn bo-btn-${b.id}` + (choice === b.id ? ' is-selected' : '')}
              disabled={reveal}
              onClick={() => choose(b.id)}
            >
              <span className="bo-btn-icon">{b.icon}</span>
              {b.label.toUpperCase()}
            </button>
          ))}
        </div>

        {reveal && (
          <p className="bo-why">
            {mark === 'correct' ? '✓ Correct — ' : `✗ Should be ${BUTTONS.find((b) => b.id === item.shelf)?.label} — `}
            {item.why}
          </p>
        )}
        {!reveal && !decided && (
          <span className="bo-hint">Decide what to do as the outage stretches on</span>
        )}
        {!reveal && decided && !isLast && (
          <button type="button" className="bo-next-btn" onClick={() => go(1)}>
            Next Stage →
          </button>
        )}
      </div>

      <button type="button" className="bo-arrow" onClick={() => go(1)} aria-label="Next stage">
        ›
      </button>

      <div className="bo-dots">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className={'bo-dot' + (i === index ? ' is-active' : '') + (placements[it.id] ? ' is-decided' : '')}
            aria-label={`Go to ${it.label}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
