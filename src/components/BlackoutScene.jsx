import { useState, useMemo, useEffect } from 'react'
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
  { id: 'closed', label: 'Keep Closed', icon: '🔒' },
  { id: 'open', label: 'Open Fridge', icon: '🚪' },
  { id: 'cooler', label: 'Move to Ice Cooler', icon: '❄️' },
]

export default function BlackoutScene({ items, placements, reveal, onChoose }) {
  const [index, setIndex] = useState(0)
  const item = items[Math.min(index, items.length - 1)]
  const choice = placements[item.id] ?? null
  const decided = choice != null
  const mark = reveal ? (choice === item.shelf ? 'correct' : 'wrong') : null
  const doorOpen = choice === 'open'

  // Reset back to stage 0 when level is reset or placements are cleared
  useEffect(() => {
    if (!placements || Object.keys(placements).length === 0) {
      setIndex(0)
    }
  }, [placements])

  // The fridge visibly gets dimmer / more stale-looking as the outage drags
  // on — purely a mood cue tied to which stage we're on (0, 1, 2 …).
  const dimLevel = Math.min(index, 2)

  // Calculate status for current stage (designed like Level 34)
  const stageMeta = useMemo(() => {
    const hrs = item.hours || (index === 0 ? 1 : index === 1 ? 3 : 5)
    if (hrs <= 1) {
      return {
        color: 'green',
        label: 'SAFE WINDOW',
      }
    }
    if (hrs <= 3) {
      return {
        color: 'yellow',
        label: 'WARNING',
      }
    }
    return {
      color: 'red',
      label: '🔴 MALFUNCTION',
    }
  }, [item.hours, index])

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
      {/* ----- Refrigerator Status Header Capsule — Level 34 vibe ----- */}
      <div className="bo-status">
        <div className={'bo-status-main is-' + stageMeta.color}>
          <span className="bo-status-title">MAIN REFRIGERATOR</span>
          <span className="bo-status-temp">{item.timerValue} {item.timerUnit}</span>
          <span className="bo-status-label">{stageMeta.label}</span>
        </div>
      </div>

      <button type="button" className="bo-arrow" onClick={() => go(-1)} aria-label="Previous stage">
        ‹
      </button>

      {/* ----- Top Area: Enlarged Refrigerator Illustration ----- */}
      <div className="bo-fridge-area">
        <div className="bo-fridge-stage">
          <div className={`bo-fridge-case dim-${dimLevel}`}>
            <div className="bo-fridge-cavity">
              <span className="bo-fridge-shelf" />
              <span className="bo-fridge-shelf" />
              {doorOpen && (
                <>
                  <div className="bo-fridge-food-row row-1">
                    <div className="bo-food-card">
                      <span className="bo-food-icon">🥛</span>
                      <span className="bo-food-name">Milk</span>
                    </div>
                    <div className="bo-food-card">
                      <span className="bo-food-icon">🥗</span>
                      <span className="bo-food-name">Salad</span>
                    </div>
                  </div>
                  <div className="bo-fridge-food-row row-2">
                    <div className="bo-food-card">
                      <span className="bo-food-icon">🥩</span>
                      <span className="bo-food-name">Raw Meat</span>
                    </div>
                    <div className="bo-food-card">
                      <span className="bo-food-icon">🍲</span>
                      <span className="bo-food-name">Cooked Soup</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="bo-fridge-hinge bo-fridge-hinge-top" />
            <div className="bo-fridge-hinge bo-fridge-hinge-bottom" />
            <div className={'bo-fridge-door' + (doorOpen ? ' is-open' : '')}>
              <span className="bo-fridge-handle" />
            </div>
          </div>
        </div>

        {doorOpen && (
          <div className="bo-escape">
            <span className="bo-escape-arrows">↓↓↓</span> Cold air escaped!
          </div>
        )}

      </div>

      {/* ----- Question Card — EXACT match to user mockup ----- */}
      <div className={'bo-card' + (mark === 'correct' ? ' is-correct' : '') + (mark === 'wrong' ? ' is-wrong' : '')}>
        {mark && (
          <span className={`bo-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>
            {mark === 'correct' ? '✓' : '✗'}
          </span>
        )}

        <h3 className="bo-q-title">
          {index === 0
            ? 'What should you do first?'
            : index === 1
              ? 'What should you do next?'
              : 'What should you do now?'}
        </h3>
        <p className="bo-q-sub">
          The fridge temperature is rising. Protect the food before service
        </p>

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
              <span className="bo-btn-label">
                {b.id === 'cooler' ? (
                  <>MOVE TO<br />ICE COOLER</>
                ) : (
                  b.label.toUpperCase()
                )}
              </span>
            </button>
          ))}
        </div>

        {reveal && (
          <div className={`leak-banner bo-banner ${mark === 'correct' ? 'is-success' : 'is-alert'}`}>
            <span className="leak-banner-icon">{mark === 'correct' ? '✓' : '⚠️'}</span>
            <span className="leak-banner-text">
              <b>{mark === 'correct' ? '✓ Correct — ' : `✗ Should be ${BUTTONS.find((b) => b.id === item.shelf)?.label} — `}</b>
              {item.why}
            </span>
          </div>
        )}

        {!reveal && decided && !isLast && (
          <div className="bo-next-wrap">
            <button type="button" className="bo-next-btn" onClick={() => go(1)}>
              Next Stage →
            </button>
          </div>
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
