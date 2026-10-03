import { useEffect, useState } from 'react'
import * as audio from '../lib/audio.js'
import Modal from './Modal.jsx'
import { FRIDGE_IMG } from '../gameData.js'
import fridgeShelvesImg from '../assets/level33/fridge.png'
import outOfServiceImg from '../assets/level34/out-of-service.png'
import fridgeClosedImg from '../assets/level34/fridge-closed.png'
import {
  BACKUP_CAPACITY,
  COLDBOX_CAPACITY,
  COLD_CHAIN_STATUS,
  MESSAGES,
  NEEDS_COOK_KEYS,
  RTE_KEYS,
  SEQUENCE_CARDS,
} from '../data/levels/level34.js'

// Level 34 — "Cold Storage Emergency" (Hospital Nutrition Unit, 10:30am),
// the boss stage. Five linked decision stages — Check → Move → Protect →
// Report → Record — sit on top of the same generic engine as every other
// level: `placements[item.id]` compared against `item.shelf` by
// isItemCorrect()/Check Answers. Everything below is richer *interaction*
// feeding that same one choice per stage, not new scoring code:
//
//  - Check: the temperature climbs live (5° → 6° → 8°, then stops) with a
//    TEMPERATURE LOG button open at any time; deciding is gated until the
//    escalation finishes so nobody can answer before seeing it play out.
//  - A one-time tap-to-order puzzle (CHECK → MOVE → PROTECT → REPORT →
//    RECORD) gates entry into the rest of the boss once Check is answered
//    correctly and the log has been opened at least once.
//  - Move: a real capacity-limited sort — tap a food, then tap Backup
//    Fridge (max 3) or Insulated Cold Box (max 2) — not a paragraph pick.
//  - Report is blocked (with an on-screen reason) until Move + Protect are
//    both resolved; Record is blocked until Report is. Discarding
//    everything in Check never locks in — it just explains why and lets
//    the player try again, per the brief's "don't punish, redirect" intent.

const STAGE_META = {
  check: { icon: '🌡️', name: 'Check' },
  move: { icon: '📦', name: 'Move' },
  protect: { icon: '🔒', name: 'Protect' },
  report: { icon: '📟', name: 'Report' },
  record: { icon: '📝', name: 'Record' },
}

const STAGE_ORDER = ['check', 'move', 'protect', 'report', 'record']

// ---------------------------------------------------------------------
// Persistent status header — visible across every stage, since the fridge
// is "broken" for the whole scene, not just during the Check round.
// ---------------------------------------------------------------------
function StatusHeader({ liveTemp, sealed, onOpenLog }) {
  const label = sealed ? 'OUT OF SERVICE' : liveTemp.status === 'MALFUNCTION' ? '🔴 MALFUNCTION' : liveTemp.status
  const colorClass = sealed ? 'is-sealed' : `is-${liveTemp.color}`
  return (
    <div className="ce-status">
      <div className={'ce-status-main ' + colorClass}>
        <span className="ce-status-title">MAIN REFRIGERATOR</span>
        <span className="ce-status-temp">{liveTemp.c}°C</span>
        <span className="ce-status-label">{label}</span>
        {sealed && <span className="ce-status-donotuse">DO NOT USE</span>}
      </div>
      <div className="ce-status-actions">
        <button type="button" className="ce-log-btn" onClick={onOpenLog}>
          🌡️ TEMPERATURE LOG
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Temperature Log modal — deeper history than the live readout, plus the
// scripted "deviation detected" line from the brief.
// ---------------------------------------------------------------------
function TemperatureLogModal({ log, equipment = 'Main Refrigerator', notifiedPerson = null, onClose }) {
  const max = Math.max(...log.map((p) => p.c))
  const min = Math.min(...log.map((p) => p.c))
  const range = Math.max(1, max - min)
  const pts = log
    .map((p, i) => {
      const x = (i / (log.length - 1)) * 100
      const y = 32 - ((p.c - min) / range) * 28
      return `${x},${y}`
    })
    .join(' ')
  return (
    <Modal>
      <div className="ce-logmodal">
        <div className="ce-logmodal-head">
          <div className="ce-logmodal-title-wrap">
            <h3>Temperature History</h3>
            <span className="ce-logmodal-unit-tag">❄️ {equipment}</span>
          </div>
          <span className="ce-logmodal-date-badge">📅 Date: 12/10</span>
        </div>

        <p className="ce-logmodal-warn">{MESSAGES.logDeviation}</p>

        <svg className="ce-logmodal-graph" viewBox="0 0 100 32" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke="#e4573b" strokeWidth="2" />
        </svg>

        <div className="ce-logmodal-rows">
          <div className="ce-logmodal-table-header">
            <span>Date &amp; Time</span>
            <span>Temperature</span>
          </div>
          {log.map((p) => (
            <div key={p.t} className={'ce-logmodal-row' + (p.c >= 8 ? ' is-alert-row' : '')}>
              <span className="ce-logmodal-cell-time">
                <span className="ce-logmodal-cell-date">{p.d || '12/10'}</span>
                <span>{p.t}</span>
              </span>
              <b className={p.c >= 8 ? 'is-danger' : ''}>
                {p.c}°C {p.c >= 8 && <span className="ce-logmodal-badge-danger">DEVIATION</span>}
              </b>
            </div>
          ))}
        </div>

        {/* Incident Record Details - ข้อมูลที่ต้องนำไปกรอกในบันทึกเหตุการณ์ */}
        <div className="ce-logmodal-incident-box">
          <div className="ce-logmodal-incident-title">
            <span>📋 Incident Log Information</span>
          </div>
          <div className="ce-logmodal-incident-grid">
            <div className="ce-logmodal-info-item">
              <span className="ce-info-label">Equipment</span>
              <span className="ce-info-val">{equipment}</span>
            </div>
            <div className="ce-logmodal-info-item">
              <span className="ce-info-label">Incident Date &amp; Time</span>
              <span className="ce-info-val">12/10 &bull; 10:30</span>
            </div>
            <div className="ce-logmodal-info-item">
              <span className="ce-info-label">Observed Temperature</span>
              <span className="ce-info-val is-danger">8°C (Deviation)</span>
            </div>
            {notifiedPerson && (
              <div className="ce-logmodal-info-item">
                <span className="ce-info-label">Action Taker / Notified</span>
                <span className="ce-info-val is-reported">{notifiedPerson}</span>
              </div>
            )}
          </div>
        </div>

        <p className="ce-logmodal-ok">✓ {MESSAGES.logReviewed}</p>
        <button type="button" className="ce-next-btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------
// One-time gate: arrange the five action cards in the correct order by
// tapping them (tap a pool card to append it; tap a placed card to undo).
// ---------------------------------------------------------------------
function SequencePuzzle({ onSolved }) {
  const [built, setBuilt] = useState([])
  const [msg, setMsg] = useState(null)

  const pool = SEQUENCE_CARDS.filter((c) => !built.includes(c.id))

  const add = (id) => {
    if (msg) return
    const next = [...built, id]
    setBuilt(next)
    audio.sfxClick?.()
    if (next.length === SEQUENCE_CARDS.length) {
      if (next.join(',') === STAGE_ORDER.join(',')) {
        audio.sfxWin?.()
        setMsg(MESSAGES.sequenceComplete)
        setTimeout(() => onSolved(), 900)
      } else {
        audio.sfxWrong?.()
        setMsg(MESSAGES.reviewSequence)
        setTimeout(() => { setBuilt([]); setMsg(null) }, 1300)
      }
    }
  }
  const remove = (id) => {
    if (msg) return
    setBuilt((b) => b.filter((x) => x !== id))
    audio.sfxReturn?.()
  }

  return (
    <div className="ce-seq">
      <p className="ce-seq-title">REFRIGERATOR FAILURE — arrange the response, in order:</p>
      <div className="ce-seq-slots">
        {Array.from({ length: SEQUENCE_CARDS.length }).map((_, i) => {
          const cardId = built[i]
          const card = SEQUENCE_CARDS.find((c) => c.id === cardId)
          return (
            <button
              key={i}
              type="button"
              className={'ce-seq-slot' + (card ? ' is-filled' : '')}
              onClick={() => card && remove(card.id)}
            >
              {card ? <>{card.icon} {card.label}</> : i + 1}
            </button>
          )
        })}
      </div>
      <div className="ce-seq-pool">
        {pool.map((c) => (
          <button key={c.id} type="button" className="ce-seq-card" onClick={() => add(c.id)}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      {msg && (
        <p className={'ce-seq-msg' + (msg === MESSAGES.sequenceComplete ? ' is-ok' : ' is-warn')}>{msg}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------
// Check stage — live escalating readout, gated options.
// ---------------------------------------------------------------------
function CheckPanel({ liveTemp, tempDone }) {
  return (
    <div className="ce-panel ce-panel-check">
      <div className="ce-hero">
        <img className="ce-hero-fridge" src={FRIDGE_IMG} alt="Fridge" draggable="false" />
      </div>
      <div className={'ce-bigtemp is-' + liveTemp.color}>
        <span className="ce-bigtemp-val">{liveTemp.c}°C</span>
        <span className="ce-bigtemp-status">{liveTemp.status}</span>
      </div>
      {!tempDone && <p className="ce-hint">Watching the reading climb…</p>}
    </div>
  )
}

// ---------------------------------------------------------------------
// Move stage — real open refrigerator with foods sitting on shelves,
// draggable / tappable into Backup Fridge (max 3) or Cold Box (max 2).
// ---------------------------------------------------------------------
function MovePanel({ foods, assign, selected, inspect, onSelectFood, onToggleInspect, onDropZone, decided, mark }) {
  const zoneFoods = (zone) => foods.filter((f) => assign[f.key] === zone)
  const correctZoneFor = (key) => (RTE_KEYS.includes(key) ? 'backup' : 'coldbox')

  const mainFoods = zoneFoods('main')
  const backupFoods = zoneFoods('backup')
  const coldboxFoods = zoneFoods('coldbox')

  // Top shelf: RTE foods (salad, milk, pudding)
  // Bottom shelf: cook / raw foods (meat, raw)
  const topShelfFoods = ['salad', 'milk', 'pudding'].map((k) => foods.find((f) => f.key === k)).filter(Boolean)
  const btmShelfFoods = ['meat', 'raw'].map((k) => foods.find((f) => f.key === k)).filter(Boolean)

  const handleDragStart = (e, key) => {
    if (decided) return
    e.dataTransfer.setData('text/plain', key)
    e.dataTransfer.effectAllowed = 'move'
    onSelectFood(key)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, zone) => {
    e.preventDefault()
    const key = e.dataTransfer.getData('text/plain') || selected
    if (key) onDropZone(key, zone)
  }

  const renderFoodItem = (f, inZone) => {
    const isSel = selected === f.key
    const isCorrect = mark ? assign[f.key] === correctZoneFor(f.key) : null
    return (
      <div
        key={f.key}
        className={
          'ce-real-food' +
          (isSel ? ' is-selected' : '') +
          (isCorrect === true ? ' is-correct' : isCorrect === false ? ' is-wrong' : '') +
          (inZone ? ' is-in-zone' : ' is-in-fridge')
        }
        draggable={!decided}
        onDragStart={(e) => handleDragStart(e, f.key)}
        onClick={(e) => {
          e.stopPropagation()
          onSelectFood(f.key)
        }}
        title={inZone ? `${f.label} — tap or drag to reassign` : `${f.label} — tap or drag to move`}
      >
        <span className="ce-real-food-icon">{f.icon}</span>
        <span className="ce-real-food-name">{f.label}</span>
      </div>
    )
  }

  return (
    <div className="ce-move-interactive">
      {/* Warning banner on top, styled like Level 18 */}
      <div className={'leak-banner ce-move-banner ' + (selected ? 'is-action' : 'is-warn')}>
        <span className="leak-banner-icon">{selected ? '👉' : '⚠️'}</span>
        <span className="leak-banner-text">
          {selected ? (
            <>Selected <b>{foods.find((f) => f.key === selected)?.label}</b> — tap a destination below or drag!</>
          ) : (
            'Drag or tap each food item to move it to safe storage'
          )}
        </span>
      </div>

      {/* 1. Real Refrigerator with shelves containing the food items */}
      <div
        className={'ce-move-real-fridge' + (selected && assign[selected] !== 'main' ? ' is-drop-target' : '')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'main')}
        onClick={() => selected && assign[selected] !== 'main' && onDropZone(selected, 'main')}
      >
        <img className="ce-move-fridge-photo" src={fridgeShelvesImg} alt="Fridge Shelves" draggable="false" />

        <div className="ce-move-fridge-topbar">
          <div className="ce-move-fridge-badge is-broken">
            <span className="ce-pulse-dot" />
            <span>🔴 MAIN REFRIGERATOR (8°C BROKEN)</span>
          </div>
        </div>

        <div className="ce-move-fridge-shelves">
          {/* Shelf 1 */}
          <div className="ce-move-shelf ce-shelf-top">
            <div className="ce-shelf-items">
              {topShelfFoods.map((f) => {
                if (assign[f.key] === 'main') {
                  return renderFoodItem(f, false)
                }
                return null
              })}
            </div>
          </div>

          {/* Shelf 2 */}
          <div className="ce-move-shelf ce-shelf-bottom">
            <div className="ce-shelf-items">
              {btmShelfFoods.map((f) => {
                if (assign[f.key] === 'main') {
                  return renderFoodItem(f, false)
                }
                return null
              })}
            </div>
          </div>
        </div>

        {mainFoods.length === 0 && (
          <div className="ce-fridge-cleared-banner">
            ✨ Main fridge evacuated! All 5 items protected.
          </div>
        )}
      </div>

      {/* 2. Destination Zones (Backup Fridge & Cold Box) */}
      <div className="ce-move-destinations">
        {/* Backup Fridge (ตู้เย็นชั้น) */}
        <div
          className={
            'ce-dest-card ce-dest-backup' +
            (selected ? ' is-droppable' : '') +
            (backupFoods.length >= BACKUP_CAPACITY ? ' is-full' : '')
          }
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'backup')}
          onClick={() => selected && onDropZone(selected, 'backup')}
          title="Backup Fridge"
        >
          <div className="ce-dest-fridge-body">
            <img
              className="ce-dest-fridge-photo"
              src={fridgeShelvesImg}
              alt="Backup Refrigerator"
              draggable="false"
            />

            <div className="ce-dest-fridge-interior">
              <div className="ce-dest-fridge-shelves-zone">
                {Array.from({ length: BACKUP_CAPACITY }).map((_, idx) => {
                  const food = backupFoods[idx]
                  return (
                    <div key={idx} className="ce-dest-mini-shelf">
                      {food ? renderFoodItem(food, true) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="ce-dest-label">
            <b>Backup Fridge</b>
          </div>
        </div>

        {/* Insulated Cold Box (ถังน้ำแข็งแบบ User-Friendly) */}
        <div
          className={
            'ce-dest-card ce-dest-coldbox' +
            (selected ? ' is-droppable' : '') +
            (coldboxFoods.length >= COLDBOX_CAPACITY ? ' is-full' : '')
          }
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'coldbox')}
          onClick={() => selected && onDropZone(selected, 'coldbox')}
          title="Insulated Cold Box — Drag or tap food to place on ice"
        >
          <div className="ce-friendly-cooler">
            {/* Open Lid propped up at the back */}
            <div className="ce-cooler-propped-lid">
              <div className="ce-cooler-lid-body">
                <span className="ce-cooler-lid-handle" />
                <span className="ce-cooler-lid-text">INSULATED COLD BOX</span>
              </div>
              <div className="ce-cooler-lid-hinge" />
            </div>

            {/* Cooler Basin */}
            <div className="ce-cooler-basin">
              {/* Cold vapors rising */}
              <div className="ce-cooler-vapor-wrap">
                <span className="ce-cold-vapor v1" />
                <span className="ce-cold-vapor v2" />
                <span className="ce-cold-vapor v3" />
              </div>

              {/* Side handles */}
              <span className="ce-cooler-side-handle is-left" />
              <span className="ce-cooler-side-handle is-right" />

              {/* Ice chamber with 2 slots */}
              <div className="ce-cooler-ice-chamber">
                <div className="ce-cooler-slots-grid">
                  {Array.from({ length: COLDBOX_CAPACITY }).map((_, idx) => {
                    const food = coldboxFoods[idx]
                    return (
                      <div key={idx} className="ce-cooler-slot">
                        {food ? renderFoodItem(food, true) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="ce-dest-label">
            <b>Insulated Cold Box</b>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProtectPanel({ choice, onSeal }) {
  const isSealed = choice === 'l34-protect-seal'
  const isOpen = choice === 'l34-protect-open'
  const isReuse = choice === 'l34-protect-reuse'

  return (
    <div className="ce-step3-fridge-container">
      {isSealed ? (
        <div className="ce-step3-sealed-wrapper">
          <div className="ce-step3-fridge-box">
            <img
              className="ce-step3-fridge-photo is-closed"
              src={fridgeClosedImg}
              alt="Closed Refrigerator"
              draggable="false"
            />
            <div className="ce-step3-sticker-pos">
              <img
                className="ce-sticker-out-img"
                src={outOfServiceImg}
                alt="OUT OF SERVICE"
                draggable="false"
              />
            </div>
          </div>
          <div className="ce-protect-status-pill is-sealed">
            <span className="ce-pulse-dot is-red" />
            <span>OUT OF SERVICE &bull; TAGGED &amp; SEALED</span>
          </div>
        </div>
      ) : (
        <div className="ce-step3-open-wrapper" onClick={() => onSeal?.()} title="Click to tag Out of Service">
          <img
            className="ce-step3-fridge-photo is-wide-open"
            src={FRIDGE_IMG}
            alt="Open Refrigerator"
            draggable="false"
          />
          {isOpen && (
            <div className="ce-protect-status-pill is-warn">
              <span>⚠️ Door left open &bull; Air escaping</span>
            </div>
          )}
          {isReuse && (
            <div className="ce-protect-status-pill is-warn">
              <span>⚠️ No Tag &bull; Risk of unsafe storage</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReportPanel({ choice }) {
  const notified = choice && choice !== 'l34-report-unrelated'
  return (
    <div className="ce-panel ce-panel-report">
      <div className="ce-fridgebox is-small is-sealed">
        <img className="ce-fridgebox-art" src={fridgeShelvesImg} alt="" draggable="false" />
        <div className="ce-fridgebox-door">
          <div className="ce-fridgebox-handle" />
          <img
            className="ce-sticker-out-img is-small"
            src={outOfServiceImg}
            alt="OUT OF SERVICE"
            draggable="false"
          />
        </div>
      </div>
      <p className="ce-report-alert">REFRIGERATOR MALFUNCTION — Temperature is rising.<br />Current temperature: 8°C.</p>
      <div className={'ce-phone' + (notified ? ' is-ringing' : '')}>📟</div>
    </div>
  )
}

// Record stage — a real fill-in-the-log form instead of a multiple-choice
// pick. The player types the numbers themselves; onSubmit grades whatever
// they typed against the scenario's own facts (see gradeRecordForm below),
// so it's "fill it in yourself" but still has to be right to fully clear.
function RecordForm({ onSubmit, onSkip, onOpenLog }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [temperature, setTemperature] = useState('')
  const [equipment, setEquipment] = useState('')
  const [actionTaker, setActionTaker] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const submit = () => {
    if (!date.trim() || !time.trim() || !temperature.trim() || !equipment.trim() || !actionTaker.trim()) {
      setErrorMsg('Please fill in all fields. (Check 🌡️ Temperature Log for details)')
      return
    }
    setErrorMsg('')
    onSubmit({ date, time, temperature, equipment, actionTaker })
  }

  return (
    <div className="ce-recordform">
      <div className="ce-recordform-head">
        <span className="ce-recordform-title">Temperature log</span>
        <span className="ce-recordform-sub">Fill in the incident record using the log details</span>
        <button type="button" className="ce-recordform-openlog-btn" onClick={onOpenLog}>
          🌡️ View Temperature Log
        </button>
      </div>

      <label className="ce-recordform-row">
        <span>Date</span>
        <span className="ce-recordform-pair">
          <input
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrorMsg('') }}
            placeholder="DD/MM"
          />
          <input
            value={time}
            onChange={(e) => { setTime(e.target.value); setErrorMsg('') }}
            placeholder="HH:MM"
          />
        </span>
      </label>
      <label className="ce-recordform-row">
        <span>Temperature</span>
        <input
          value={temperature}
          onChange={(e) => { setTemperature(e.target.value); setErrorMsg('') }}
          placeholder="Temp (°C)"
        />
      </label>
      <label className="ce-recordform-row">
        <span>Equipment</span>
        <input
          value={equipment}
          onChange={(e) => { setEquipment(e.target.value); setErrorMsg('') }}
          placeholder="Equipment name"
        />
      </label>
      <label className="ce-recordform-row">
        <span>Action taker</span>
        <input
          value={actionTaker}
          onChange={(e) => { setActionTaker(e.target.value); setErrorMsg('') }}
          placeholder="Action taker / Notified person"
        />
      </label>

      {errorMsg && <p className="ce-recordform-error">⚠️ {errorMsg}</p>}

      <button type="button" className="ce-next-btn ce-recordform-save" onClick={submit}>Save Record</button>
      <button type="button" className="ce-recordform-skip" onClick={onSkip}>Skip logging (not recommended)</button>
    </div>
  )
}

function RecordPanel({ fields, choice, decided, reveal, onSubmit, onSkip, onOpenLog }) {
  const full = choice === 'l34-record-full'
  if (!decided && !reveal) {
    return (
      <div className="ce-panel ce-panel-record">
        <RecordForm onSubmit={onSubmit} onSkip={onSkip} onOpenLog={onOpenLog} />
      </div>
    )
  }
  return (
    <div className="ce-panel ce-panel-record">
      <div className="ce-logsheet">
        {fields.map((f) => (
          <div key={f.label} className={'ce-logline' + (full ? ' is-filled' : choice ? ' is-partial' : '')}>
            <span className="ce-logline-label">{f.label}:</span> {f.value}
          </div>
        ))}
      </div>
    </div>
  )
}

// Loose grading for the free-text Record form: the exact wording doesn't
// matter, but the temperature has to actually read the scenario's real
// peak (8°C) for the record to count as fully accurate.
function gradeRecordForm({ date, time, temperature, equipment, actionTaker }) {
  const has = (s) => s.trim().length > 0
  const anyFilled = has(date) || has(time) || has(temperature) || has(equipment) || has(actionTaker)
  if (!anyFilled) return 'l34-record-skip'
  const allFilled = has(date) && has(time) && has(temperature) && has(equipment) && has(actionTaker)
  const tempRight = /8/.test(temperature)
  const equipRight = /fridge|refrigerator|ตู้เย็น|main/i.test(equipment)
  if (allFilled && tempRight && equipRight) return 'l34-record-full'
  return 'l34-record-vague'
}

function BossClearedPanel() {
  return (
    <div className="ce-boss-cleared">
      <p className="ce-boss-title">🏆 {MESSAGES.bossCleared}</p>
      <div className="ce-coldchain-status">
        {COLD_CHAIN_STATUS.map((s) => (
          <span key={s.label} className="ce-coldchain-badge">{s.icon} {s.label}</span>
        ))}
      </div>
      <p className="ce-boss-learn-en">{MESSAGES.learningEn}</p>
      <p className="ce-boss-learn-th">{MESSAGES.learningTh}</p>
    </div>
  )
}

export default function ColdEmergencyScene({ items, placements, reveal, onChoose }) {
  const [index, setIndex] = useState(0)
  const [tempPhase, setTempPhase] = useState(0)
  const [showBossBanner, setShowBossBanner] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [hasOpenedLog, setHasOpenedLog] = useState(false)
  const [sequenceActive, setSequenceActive] = useState(false)
  const [sequenceSolved, setSequenceSolved] = useState(false)
  const [assign, setAssign] = useState({ salad: 'main', milk: 'main', pudding: 'main', meat: 'main', raw: 'main' })
  const [selectedFood, setSelectedFood] = useState(null)
  const [inspect, setInspect] = useState(null)
  const [warning, setWarning] = useState(null)
  const [reportSelected, setReportSelected] = useState(null)

  const checkItem = items.find((i) => i.stage === 'check')
  const moveItem = items.find((i) => i.stage === 'move')
  const protectItem = items.find((i) => i.stage === 'protect')
  const reportItem = items.find((i) => i.stage === 'report')
  const recordItem = items.find((i) => i.stage === 'record')

  const checkChoice = placements[checkItem.id] ?? null
  const moveChoice = placements[moveItem.id] ?? null
  const protectChoice = placements[protectItem.id] ?? null
  const reportChoice = placements[reportItem.id] ?? null
  const recordChoice = placements[recordItem.id] ?? null

  const checkDecided = checkChoice != null
  const moveDecided = moveChoice != null
  const protectDecided = protectChoice != null
  const reportDecided = reportChoice != null
  const recordDecided = recordChoice != null

  const moveOk = moveChoice === moveItem.shelf
  const protectOk = protectChoice === protectItem.shelf
  const reportOk = reportChoice === reportItem.shelf
  const recordOk = recordChoice === recordItem.shelf

  const liveTemp = { c: [5, 6, 8][tempPhase], status: ['NORMAL', 'WARNING', 'MALFUNCTION'][tempPhase], color: ['green', 'yellow', 'red'][tempPhase] }
  const tempDone = tempPhase >= 2

  // Live temperature escalation — stops at 8°C, plays once.
  useEffect(() => {
    if (tempPhase >= 2) return
    const id = setTimeout(() => setTempPhase((p) => Math.min(p + 1, 2)), 1300)
    return () => clearTimeout(id)
  }, [tempPhase])
  useEffect(() => {
    if (tempPhase === 1) audio.sfxHint?.()
    if (tempPhase === 2) {
      audio.sfxWrong?.()
      setShowBossBanner(true)
      const t = setTimeout(() => setShowBossBanner(false), 1800)
      return () => clearTimeout(t)
    }
  }, [tempPhase])

  // Once Check is answered correctly and the log has been opened, sequence puzzle
  // can be used if desired, but we keep Step 1 cleanly visible matching Figma design.
  useEffect(() => {
    // Keep sequence puzzle dormant unless triggered explicitly
  }, [checkChoice, hasOpenedLog, sequenceSolved, sequenceActive])

  useEffect(() => {
    if (!warning) return
    const t = setTimeout(() => setWarning(null), 3600)
    return () => clearTimeout(t)
  }, [warning])

  const openLog = () => { setShowLog(true); setHasOpenedLog(true); audio.sfxClick?.() }

  const chooseCheck = (optionId) => {
    if (reveal) return
    if (optionId === 'l34-check-move') {
      setWarning(null)
      audio.sfxWrong?.()
      onChoose(checkItem.id, optionId)
      return
    }
    if (optionId === 'l34-check-report') {
      setWarning(null)
      audio.sfxWrong?.()
      onChoose(checkItem.id, optionId)
      return
    }
    if (optionId === 'l34-check-discard') {
      setWarning(MESSAGES.discardWarning)
      audio.sfxWrong?.()
      return
    }
    if (optionId === 'l34-check-ignore') {
      setWarning(MESSAGES.ignoreWarning)
      onChoose(checkItem.id, optionId)
      audio.sfxWrong?.()
      return
    }
    setWarning(null)
    onChoose(checkItem.id, optionId)
    audio.sfxPlace?.()
    setHasOpenedLog(true)
  }

  const selectFood = (key) => {
    if (moveDecided || reveal) return
    setSelectedFood((s) => (s === key ? null : key))
    audio.sfxPickup?.()
  }

  const dropZone = (key, zone) => {
    if (moveDecided || reveal) return
    setAssign((prev) => {
      if (zone === 'backup') {
        const count = Object.values(prev).filter((v) => v === 'backup').length - (prev[key] === 'backup' ? 1 : 0)
        if (count >= BACKUP_CAPACITY) {
          setWarning(MESSAGES.checkStorageLocation + ' ' + MESSAGES.zoneFull('Backup fridge', BACKUP_CAPACITY))
          audio.sfxWrong()
          return prev
        }
      }
      if (zone === 'coldbox') {
        const count = Object.values(prev).filter((v) => v === 'coldbox').length - (prev[key] === 'coldbox' ? 1 : 0)
        if (count >= COLDBOX_CAPACITY) {
          setWarning(MESSAGES.checkStorageLocation + ' ' + MESSAGES.zoneFull('Insulated cold box', COLDBOX_CAPACITY))
          audio.sfxWrong()
          return prev
        }
      }
      audio.sfxPlace()
      return { ...prev, [key]: zone }
    })
    setSelectedFood(null)
  }

  const allMoved = Object.values(assign).every((v) => v !== 'main')
  const confirmMove = () => {
    if (reveal || moveDecided) return
    if (!allMoved) { setWarning('Protect every item — nothing should stay in the broken fridge.'); return }
    const backupSet = moveItem.foods.filter((f) => assign[f.key] === 'backup').map((f) => f.key).sort().join(',')
    const coldboxSet = moveItem.foods.filter((f) => assign[f.key] === 'coldbox').map((f) => f.key).sort().join(',')
    const correct = backupSet === [...RTE_KEYS].sort().join(',') && coldboxSet === [...NEEDS_COOK_KEYS].sort().join(',')
    onChoose(moveItem.id, correct ? moveItem.shelf : 'l34-move-wrong')
    audio.sfxPlace()
  }

  const chooseProtect = (optionId) => {
    if (reveal) return
    if (optionId !== 'l34-protect-seal') setWarning(MESSAGES.continueUsingWarning)
    else setWarning(null)
    onChoose(protectItem.id, optionId)
    audio.sfxPlace()
  }

  const chooseReport = (optionId) => {
    if (reveal) return
    const acceptable = reportItem.acceptable || [reportItem.shelf]
    if (!acceptable.includes(optionId)) {
      setWarning('Unrelated staff cannot act on cold-chain failures. Report to a supervisor or maintenance.')
    } else {
      setWarning(null)
    }
    setReportSelected(optionId)
    onChoose(reportItem.id, acceptable.includes(optionId) ? reportItem.shelf : optionId)
    audio.sfxPlace()
  }

  const chooseRecord = (optionId) => {
    if (reveal) return
    setWarning(null)
    onChoose(recordItem.id, optionId)
    audio.sfxPlace()
    if (optionId === recordItem.shelf) audio.sfxWin?.()
  }

  const submitRecordForm = (values) => chooseRecord(gradeRecordForm(values))
  const skipRecordForm = () => chooseRecord('l34-record-skip')

  const go = (dir) => { setIndex((i) => (i + dir + items.length) % items.length); audio.sfxClick?.() }

  const item = items[Math.min(index, items.length - 1)]
  const choiceByStage = { check: checkChoice, move: moveChoice, protect: protectChoice, report: reportChoice, record: recordChoice }
  const choice = choiceByStage[item.stage]
  const decided = choice != null
  const okByStage = { check: checkChoice === checkItem.shelf, move: moveOk, protect: protectOk, report: reportOk, record: recordOk }
  const mark = reveal ? (okByStage[item.stage] ? 'correct' : 'wrong') : null
  const meta = STAGE_META[item.stage] || { icon: '❓', name: item.stage }
  const isLast = index === items.length - 1

  const chooseByStage = {
    check: chooseCheck,
    protect: chooseProtect,
    report: chooseReport,
    record: chooseRecord,
  }

  const isStep1 = index === 0
  const isStep3 = item.stage === 'protect'
  const isStep4 = item.stage === 'report'

  const isStep5 = item.stage === 'record'
  const hasReported = Boolean(reportSelected || reportChoice)

  const notifiedPerson = (hasReported && isStep5)
    ? (() => {
        const chosen = reportSelected || (reportChoice === reportItem?.shelf ? 'l34-report-supervisor' : reportChoice)
        if (chosen === 'l34-report-maintenance') return 'Maintenance'
        if (chosen === 'l34-report-qa') return 'Food Safety / QA'
        if (chosen === 'l34-report-unrelated') return 'Unrelated Staff'
        return 'Responsible Supervisor'
      })()
    : null

  return (
    <div className={'ce-wrap' + (isStep1 ? ' is-step1' : '') + (isStep3 ? ' is-step3' : '') + (isStep4 ? ' is-step4' : '')}>
      <StatusHeader
        liveTemp={liveTemp}
        sealed={protectOk}
        onOpenLog={openLog}
      />

      {showBossBanner && <div className="ce-boss-banner">🚨 {MESSAGES.bossBanner} 🚨</div>}
      {showLog && (
        <TemperatureLogModal
          log={checkItem.historyLog}
          equipment="Main Refrigerator"
          notifiedPerson={notifiedPerson}
          onClose={() => setShowLog(false)}
        />
      )}

      {sequenceActive ? (
        <div className="ce-card">
          <SequencePuzzle onSolved={() => { setSequenceSolved(true); setSequenceActive(false); setIndex(1) }} />
        </div>
      ) : isStep1 ? (
        <div className="ce-step1-stage">
          <div className="ce-step1-fridge-area">
            <img className="ce-step1-fridge-img" src={FRIDGE_IMG} alt="Fridge" draggable="false" />
            <div className={'ce-step1-live-badge is-' + liveTemp.color}>
              <span className="ce-step1-badge-pulse" />
              <span className="ce-step1-badge-temp">{liveTemp.c}°C</span>
              <span className="ce-step1-badge-status">{liveTemp.status}</span>
            </div>
          </div>

          <div className={'ce-step1-card' + (mark === 'correct' ? ' is-correct' : '') + (mark === 'wrong' ? ' is-wrong' : '')}>
            {mark && <span className={`ce-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>{mark === 'correct' ? '✓' : '✗'}</span>}

            <h2 className="ce-step1-title">What should you do first?</h2>
            <p className="ce-step1-sub">The fridge temperature is rising. Protect the food before service</p>

            <div className="ce-step1-options">
              {checkItem.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={
                    'ce-step1-btn' +
                    (checkChoice === opt.id ? ' is-selected' : '') +
                    (reveal && checkChoice === opt.id ? (mark === 'correct' ? ' is-correct' : ' is-wrong') : '')
                  }
                  disabled={reveal}
                  onClick={() => chooseCheck(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {warning && <p className="ce-warning ce-step1-warning">⚠️ {warning}</p>}

            {reveal && (
              <p className="ce-why">
                {mark === 'correct' ? '✓ Correct — ' : `✗ Should be "${checkItem.options.find((o) => o.id === checkItem.shelf)?.label}" — `}
                {checkItem.why}
              </p>
            )}

            {!reveal && decided && (
              <div className="ce-step1-actions">
                <button type="button" className="ce-next-btn ce-step1-next-btn" onClick={() => go(1)}>
                  Next Step →
                </button>
              </div>
            )}
          </div>
        </div>
      ) : isStep3 ? (
        <div className="ce-step3-stage">
          <div className="ce-step3-layout">
            {/* Left Column: Big Fridge */}
            <div className="ce-step3-left">
              <ProtectPanel
                choice={protectChoice}
                onSeal={() => chooseProtect('l34-protect-seal')}
              />
            </div>

            {/* Right Column: Choices Card */}
            <div className={'ce-step3-card' + (mark === 'correct' ? ' is-correct' : '') + (mark === 'wrong' ? ' is-wrong' : '')}>
              {mark && <span className={`ce-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>{mark === 'correct' ? '✓' : '✗'}</span>}

              <h2 className="ce-step3-title">Protect the cold chain</h2>
              <p className="ce-step3-sub">Choose the correct action for the broken fridge.</p>

              <div className="ce-step3-options-box">
                {protectItem.options.map((opt) => {
                  const isSel = protectChoice === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={
                        'ce-step3-opt-btn' +
                        (isSel ? ' is-selected' : '') +
                        (reveal && isSel ? (mark === 'correct' ? ' is-correct' : ' is-wrong') : '')
                      }
                      disabled={reveal}
                      onClick={() => chooseProtect(opt.id)}
                    >
                      <span className={'ce-step3-radio' + (isSel ? ' is-active' : '')}>
                        {isSel && <span className="ce-step3-radio-dot" />}
                      </span>
                      <span className="ce-step3-opt-text">{opt.label}</span>
                    </button>
                  )
                })}
              </div>

              {warning && <p className="ce-warning ce-step3-warning">⚠️ {warning}</p>}

              {reveal && (
                <p className="ce-why">
                  {mark === 'correct' ? '✓ Correct — ' : `✗ Should be "${protectItem.options.find((o) => o.id === protectItem.shelf)?.label}" — `}
                  {protectItem.why}
                </p>
              )}

              <div className="ce-step3-actions">
                <button
                  type="button"
                  className="ce-step3-next-btn"
                  onClick={() => {
                    if (!protectChoice && !reveal) {
                      setWarning('Please choose an action for the broken fridge first.')
                      audio.sfxWrong?.()
                      return
                    }
                    go(1)
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

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
      ) : isStep4 ? (
        <div className="ce-step3-stage ce-step4-stage">
          <div className="ce-step3-layout">
            {/* Left Column: Big Fridge from Step 3 */}
            <div className="ce-step3-left">
              <div className="ce-step3-fridge-container">
                <div className="ce-step3-sealed-wrapper">
                  <div className="ce-step3-fridge-box">
                    <img
                      className="ce-step3-fridge-photo is-closed"
                      src={protectOk ? fridgeClosedImg : FRIDGE_IMG}
                      alt="Closed Refrigerator"
                      draggable="false"
                    />
                    <div className="ce-step3-sticker-pos">
                      <img
                        className="ce-sticker-out-img"
                        src={outOfServiceImg}
                        alt="OUT OF SERVICE"
                        draggable="false"
                      />
                    </div>
                  </div>
                  <div className="ce-protect-status-pill is-sealed">
                    <span className="ce-pulse-dot is-red" />
                    <span>OUT OF SERVICE &bull; TAGGED &amp; SEALED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Choices Card */}
            <div className={'ce-step3-card' + (mark === 'correct' ? ' is-correct' : '') + (mark === 'wrong' ? ' is-wrong' : '')}>
              {mark && <span className={`ce-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>{mark === 'correct' ? '✓' : '✗'}</span>}

              <h2 className="ce-step3-title">Report equipment failure</h2>
              <p className="ce-step3-sub">REFRIGERATOR MALFUNCTION (8°C) — Who should this incident be reported to?</p>

              <div className="ce-step3-options-box">
                {reportItem.options.map((opt) => {
                  const isSel = (reportSelected || reportChoice) === opt.id || (reportChoice === reportItem.shelf && (reportSelected ? reportSelected === opt.id : opt.id === reportItem.shelf))
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={
                        'ce-step3-opt-btn ce-step4-opt-btn' +
                        (isSel ? ' is-selected' : '') +
                        (reveal && isSel ? (mark === 'correct' ? ' is-correct' : ' is-wrong') : '')
                      }
                      disabled={reveal}
                      onClick={() => chooseReport(opt.id)}
                    >
                      <span className={'ce-step3-radio' + (isSel ? ' is-active' : '')}>
                        {isSel && <span className="ce-step3-radio-dot" />}
                      </span>
                      <span className="ce-step4-opt-icon">{opt.icon}</span>
                      <span className="ce-step3-opt-text">{opt.label}</span>
                    </button>
                  )
                })}
              </div>

              {warning && <p className="ce-warning ce-step3-warning">⚠️ {warning}</p>}

              {reveal && (
                <p className="ce-why">
                  {mark === 'correct' ? '✓ Correct — ' : `✗ Should be "${reportItem.options.find((o) => o.id === reportItem.shelf)?.label}" — `}
                  {reportItem.why}
                </p>
              )}

              <div className="ce-step3-actions">
                <button
                  type="button"
                  className="ce-step3-next-btn"
                  onClick={() => {
                    if (!reportChoice && !reveal) {
                      setWarning('Please choose who to report the incident to first.')
                      audio.sfxWrong?.()
                      return
                    }
                    go(1)
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

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
      ) : (
        <>
          <button type="button" className="ce-arrow" onClick={() => go(-1)} aria-label="Previous step">‹</button>

          <div className={'ce-card' + (item.stage === 'move' ? ' is-stage-move' : '') + (mark === 'correct' ? ' is-correct' : '') + (mark === 'wrong' ? ' is-wrong' : '')}>
            {mark && <span className={`ce-mark ${mark === 'correct' ? 'is-ok' : 'is-no'}`}>{mark === 'correct' ? '✓' : '✗'}</span>}

            <div className="ce-stage-badge">
              <span className="ce-stage-icon">{meta.icon}</span>
              <span className="ce-stage-text">
                <span className="ce-stage-step">STEP {index + 1}/{items.length}</span>
                <span className="ce-stage-name">{meta.name}</span>
              </span>
            </div>

            {item.stage === 'move' && (
              <MovePanel
                foods={moveItem.foods}
                assign={assign}
                selected={selectedFood}
                inspect={inspect}
                onSelectFood={selectFood}
                onToggleInspect={(k) => setInspect((i) => (i === k ? null : k))}
                onDropZone={dropZone}
                decided={moveDecided}
                mark={reveal ? true : null}
              />
            )}
            {item.stage === 'report' && <ReportPanel choice={reportChoice} />}
            {item.stage === 'record' && (
              <RecordPanel
                fields={recordItem.fields}
                choice={recordChoice}
                decided={recordDecided}
                reveal={reveal}
                onSubmit={submitRecordForm}
                onSkip={skipRecordForm}
                onOpenLog={openLog}
              />
            )}

            {item.stage !== 'move' && item.question && <p className="ce-question">{item.question}</p>}

            {warning && <p className="ce-warning">⚠️ {warning}</p>}

            {item.stage === 'move' ? (
              !moveDecided && !reveal && (
                <button type="button" className="ce-next-btn" disabled={!allMoved} onClick={confirmMove}>
                  {allMoved ? 'Confirm Placement ✓' : 'Move every item out of the broken fridge first'}
                </button>
              )
            ) : item.stage === 'record' ? null : (
              <div className={'ce-options' + (decided ? ' has-choice' : '') + (item.stage === 'report' ? ' ce-options-avatar' : '')}>
                {item.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={
                      (item.stage === 'report' ? 'ce-opt ce-opt-avatar' : 'ce-opt') +
                      (choice === opt.id ? ' is-selected' : '') +
                      (reveal && choice === opt.id ? (mark === 'correct' ? ' is-correct' : ' is-wrong') : '')
                    }
                    disabled={reveal || (item.stage === 'check' && !tempDone)}
                    onClick={() => chooseByStage[item.stage]?.(opt.id)}
                  >
                    <span className="ce-opt-icon">
                      {opt.id === 'l34-protect-seal' ? (
                        <img src={outOfServiceImg} alt="Tag" className="ce-opt-tag-icon" draggable="false" />
                      ) : (
                        opt.icon
                      )}
                    </span>
                    <span className="ce-opt-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}

            {reveal && (
              <p className="ce-why">
                {mark === 'correct' ? '✓ Correct — ' : `✗ Should be "${item.options.find((o) => o.id === item.shelf)?.label}" — `}
                {item.why}
              </p>
            )}
            {!reveal && !decided && item.stage !== 'move' && item.stage !== 'record' && <span className="ce-hint">Decide this step of the emergency plan</span>}

            {item.stage === 'record' && recordDecided && recordOk && !reveal && <BossClearedPanel />}

            {!reveal && decided && !isLast && (
              <button type="button" className="ce-next-btn" onClick={() => go(1)}>Next Step →</button>
            )}
          </div>

          <button type="button" className="ce-arrow" onClick={() => go(1)} aria-label="Next step">›</button>

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
        </>
      )}
    </div>
  )
}
