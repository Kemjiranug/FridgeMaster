import { useState } from 'react'
import * as audio from '../lib/audio.js'

// Level 34 — "Cold Storage Emergency" (Hospital Nutrition Unit, 10:30am)
// Five linked decision stages — Check → Move → Protect → Report → Record —
// each with its own mini-scene and its own set of options (not a fixed
// 3-button set like Level 24's BlackoutScene). Scored on the same generic
// engine as every other level: `placements[item.id]` is compared against
// `item.shelf` (the correct option id) by isItemCorrect()/Check Answers.
//
// Deliberately does NOT let "Check" auto-resolve to "throw everything out"
// — Round 1 shows the rising temperature log *and* the food inventory side
// by side, and the correct move is to check + log first, not to panic-toss
// the fridge's contents on the strength of one 8°C reading.

const STAGE_META = {
  check: { icon: '🌡️', name: 'Check' },
  move: { icon: '📦', name: 'Move' },
  protect: { icon: '🔒', name: 'Protect' },
  report: { icon: '📟', name: 'Report' },
  record: { icon: '📝', name: 'Record' },
}

function CheckPanel({ item }) {
  return (
    <div className="ce-panel ce-panel-check">
      <div className="ce-templine">
        {item.tempPoints.map((p, i) => (
          <div key={p.t} className={'ce-tempchip' + (i === item.tempPoints.length - 1 ? ' is-latest' : '')}>
            <span className="ce-tempchip-time">{p.t}</span>
            <span className="ce-tempchip-val">{p.c}°C</span>
          </div>
        ))}
      </div>
      <div className="ce-foodrow">
        {item.foods.map((f) => (
          <span key={f.key} className="ce-foodchip">
            <span className="ce-foodchip-icon">{f.icon}</span>
            {f.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function MovePanel({ item, choice }) {
  const map = item.options.find((o) => o.id === choice)?.moveMap
  const byKey = Object.fromEntries(item.foods.map((f) => [f.key, f]))
  const zone = (keys) => (keys || []).map((k) => byKey[k]).filter(Boolean)

  return (
    <div className="ce-panel ce-panel-move">
      {!choice && (
        <div className="ce-foodrow ce-foodrow-pending">
          {item.foods.map((f) => (
            <span key={f.key} className="ce-foodchip">
              <span className="ce-foodchip-icon">{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>
      )}
      <div className="ce-movezones">
        <div className="ce-movezone ce-movezone-backup">
          <span className="ce-movezone-label">🧊 Backup Fridge</span>
          <div className="ce-movezone-items">
            {zone(map?.backup).map((f) => (
              <span key={f.key} className="ce-foodchip is-small">{f.icon}</span>
            ))}
          </div>
        </div>
        <div className="ce-movezone ce-movezone-coldbox">
          <span className="ce-movezone-label">📦 Cold Box</span>
          <div className="ce-movezone-items">
            {zone(map?.coldbox).map((f) => (
              <span key={f.key} className="ce-foodchip is-small">{f.icon}</span>
            ))}
          </div>
        </div>
        <div className="ce-movezone ce-movezone-left">
          <span className="ce-movezone-label">⚠️ Left in Broken Unit</span>
          <div className="ce-movezone-items">
            {zone(map?.left).map((f) => (
              <span key={f.key} className="ce-foodchip is-small">{f.icon}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProtectPanel({ choice }) {
  const isSealed = choice === 'seal' || choice === 'l34-protect-seal'
  const isOpen = choice === 'open' || choice === 'l34-protect-open'
  const isReuse = choice === 'reuse' || choice === 'l34-protect-reuse'
  return (
    <div className="ce-panel ce-panel-protect">
      <div className={'ce-fridgebox' + (isOpen ? ' is-open' : '')}>
        <div className="ce-fridgebox-door" />
        {isSealed && <span className="ce-tag ce-tag-out">OUT OF SERVICE</span>}
        {isOpen && <span className="ce-escape-note">↓↓ cold air escaping</span>}
        {isReuse && <span className="ce-tag ce-tag-warn">⚠️ no label</span>}
      </div>
    </div>
  )
}

function ReportPanel({ choice }) {
  const ringing = choice === 'immediate' || choice === 'l34-report-immediate'
  return (
    <div className="ce-panel ce-panel-report">
      <div className={'ce-phone' + (ringing ? ' is-ringing' : '')}>📟</div>
      <div className="ce-report-targets">
        <span className={ringing ? 'is-notified' : ''}>🔧 Maintenance</span>
        <span className={ringing ? 'is-notified' : ''}>🧑‍💼 Supervisor</span>
      </div>
    </div>
  )
}

function RecordPanel({ choice }) {
  const full = choice === 'full' || choice === 'l34-record-full'
  const lines = [
    '🕐 Time: 10:30–10:58',
    '🌡️ Temp: 5°C → 6°C → 8°C',
    '🍽️ Food moved: 5 items → backup / cold box',
    '🛠️ Action: sealed unit, notified maintenance',
  ]
  return (
    <div className="ce-panel ce-panel-record">
      <div className="ce-logsheet">
        {lines.map((l) => (
          <div key={l} className={'ce-logline' + (full ? ' is-filled' : choice ? ' is-partial' : '')}>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ColdEmergencyScene({ items, placements, reveal, onChoose }) {
  const [index, setIndex] = useState(0)
  const item = items[Math.min(index, items.length - 1)]
  const choice = placements[item.id] ?? null
  const decided = choice != null
  const mark = reveal ? (choice === item.shelf ? 'correct' : 'wrong') : null
  const meta = STAGE_META[item.stage] || { icon: '❓', name: item.stage }

  const go = (dir) => {
    setIndex((i) => (i + dir + items.length) % items.length)
    audio.sfxClick?.()
  }

  const choose = (optionId) => {
    if (reveal) return
    onChoose(item.id, optionId)
    audio.sfxPlace()
  }

  const isLast = index === items.length - 1

  return (
    <div className="ce-wrap">
      <button type="button" className="ce-arrow" onClick={() => go(-1)} aria-label="Previous step">
        ‹
      </button>

      <div className={'ce-card' + (mark === 'correct' ? ' is-correct' : '') + (mark === 'wrong' ? ' is-wrong' : '')}>
        {mark && (
          <span className={`ce-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>
            {mark === 'correct' ? '✓' : '✗'}
          </span>
        )}

        <div className="ce-stage-badge">
          <span className="ce-stage-icon">{meta.icon}</span>
          <span className="ce-stage-text">
            <span className="ce-stage-step">STEP {index + 1}/{items.length}</span>
            <span className="ce-stage-name">{meta.name}</span>
          </span>
        </div>

        {item.stage === 'check' && <CheckPanel item={item} />}
        {item.stage === 'move' && <MovePanel item={item} choice={choice} />}
        {item.stage === 'protect' && <ProtectPanel choice={choice} />}
        {item.stage === 'report' && <ReportPanel choice={choice} />}
        {item.stage === 'record' && <RecordPanel choice={choice} />}

        <p className="ce-question">{item.question}</p>

        <div className={'ce-options' + (decided ? ' has-choice' : '')}>
          {item.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={
                'ce-opt' +
                (choice === opt.id ? ' is-selected' : '') +
                (reveal && choice === opt.id ? (mark === 'correct' ? ' is-correct' : ' is-wrong') : '')
              }
              disabled={reveal}
              onClick={() => choose(opt.id)}
            >
              <span className="ce-opt-icon">{opt.icon}</span>
              <span className="ce-opt-label">{opt.label}</span>
            </button>
          ))}
        </div>

        {reveal && (
          <p className="ce-why">
            {mark === 'correct'
              ? '✓ Correct — '
              : `✗ Should be "${item.options.find((o) => o.id === item.shelf)?.label}" — `}
            {item.why}
          </p>
        )}
        {!reveal && !decided && <span className="ce-hint">Decide this step of the emergency plan</span>}
        {!reveal && decided && !isLast && (
          <button type="button" className="ce-next-btn" onClick={() => go(1)}>
            Next Step →
          </button>
        )}
      </div>

      <button type="button" className="ce-arrow" onClick={() => go(1)} aria-label="Next step">
        ›
      </button>

      <div className="ce-dots">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className={'ce-dot' + (i === index ? ' is-active' : '') + (placements[it.id] ? ' is-decided' : '')}
            aria-label={`Go to step ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
