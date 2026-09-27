import { useState } from 'react'
import * as audio from '../lib/audio.js'

// Level 12 — "Keep or Toss?"
// One food card at a time: flip through the deck with the ‹ › arrows
// (dots show where you are), read how long it's been sitting out, then
// tap KEEP or TOSS. `placements[itemId]` is 'keep' | 'toss' | null — same
// shape as every other generic level, scored by App.jsx's isItemCorrect()
// against each item's `shelf` (the correct call).

export default function SwipeCardScene({ items, placements, reveal, onChoose }) {
  const [index, setIndex] = useState(0)
  const item = items[Math.min(index, items.length - 1)]
  const choice = placements[item.id] ?? null
  const decided = choice === 'keep' || choice === 'toss'
  const mark = reveal ? (choice === item.shelf ? 'correct' : 'wrong') : null

  const go = (dir) => {
    setIndex((i) => (i + dir + items.length) % items.length)
    audio.sfxClick?.()
  }

  const choose = (shelfId) => {
    if (reveal) return
    onChoose(item.id, shelfId)
    audio.sfxPlace?.()
    // Little nicety: hop to the next undecided card automatically.
    if (index < items.length - 1) {
      setTimeout(() => setIndex((i) => Math.min(i + 1, items.length - 1)), 260)
    }
  }

  return (
    <div className="swc-wrap">
      <button
        type="button"
        className="swc-arrow"
        onClick={() => go(-1)}
        aria-label="Previous dish"
      >
        ‹
      </button>

      <div
        className={
          'swc-card' +
          (mark === 'correct' ? ' is-correct' : '') +
          (mark === 'wrong' ? ' is-wrong' : '')
        }
      >
        {mark && (
          <span className={`swc-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>
            {mark === 'correct' ? '✓' : '✗'}
          </span>
        )}

        <h3 className="swc-title">{item.label}</h3>

        <div className="swc-image-box">
          {item.img
            ? <img className="swc-image" src={item.img} alt={item.label} draggable="false" />
            : <span className="swc-emoji">{item.icon}</span>}
        </div>

        <span className="swc-caption">⏱ {item.timeLabel} at Room Temperature ({item.ambientC}°C)</span>

        <div className={'swc-actions' + (decided ? ' has-choice' : '')}>
          <button
            type="button"
            className={'swc-btn swc-btn-keep' + (choice === 'keep' ? ' is-selected' : '')}
            disabled={reveal}
            onClick={() => choose('keep')}
          >
            ✓ Keep
          </button>
          <button
            type="button"
            className={'swc-btn swc-btn-toss' + (choice === 'toss' ? ' is-selected' : '')}
            disabled={reveal}
            onClick={() => choose('toss')}
          >
            ✕ Toss
          </button>
        </div>

        {reveal && (
          <p className="swc-why">
            {mark === 'correct' ? '✓ Correct — ' : `✗ Should ${item.shelf} — `}
            {item.why}
          </p>
        )}
        {!reveal && !decided && <span className="swc-hint">Tap Keep or Toss to decide</span>}
      </div>

      <button
        type="button"
        className="swc-arrow"
        onClick={() => go(1)}
        aria-label="Next dish"
      >
        ›
      </button>

      <div className="swc-dots">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className={
              'swc-dot' +
              (i === index ? ' is-active' : '') +
              (placements[it.id] ? ' is-decided' : '')
            }
            aria-label={`Go to ${it.label}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
