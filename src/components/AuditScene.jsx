import { useEffect, useMemo, useState } from 'react'
import fridgeAuditImg from '../assets/level35/fridge-audit.png'
import hospitalBg from '../assets/level35/hospital-bg.png'

// Hand-placed spots (as % of the fridge photo) that line up with the real
// shelves in fridge-audit.png — left door interior, then right door
// interior, 5 shelf bands each with up to 3 items sitting side by side.
// This replaces the old uniform CSS grid: items now sit ON the shelves
// themselves, scattered like they would be in a real fridge, instead of
// stacked in neat rows floating in front of the photo.
const DOORS = [
  { xMin: 6, xMax: 46 },  // left door interior
  { xMin: 54, xMax: 94 }, // right door interior
]
const ROW_BANDS = [
  { top: 18, height: 12 },
  { top: 32, height: 12 },
  { top: 46, height: 12 },
  { top: 60, height: 12 },
  { top: 76, height: 11 },
]
const SLOTS = (() => {
  const slots = []
  ROW_BANDS.forEach((row) => {
    DOORS.forEach((door) => {
      const cols = 3
      for (let c = 0; c < cols; c++) {
        const left = door.xMin + ((door.xMax - door.xMin) * (c + 0.5)) / cols
        slots.push({ left, top: row.top + row.height / 2 })
      }
    })
  })
  return slots
})()

// Level 35 — "HACCP Fridge Master Audit" (final boss).
//
// Renders a big grid mixing every hazard item with the level's "looks fine"
// decor tiles. EVERY tile — hazard or decor — opens the same 4-step wizard
// modal so the player has to actually inspect and diagnose each one (not
// just get an instant toast for the safe ones):
//   STEP 1 INSPECT (auto)  -> STEP 2 IDENTIFY (category, now including a
//   "✅ No Issue Found" choice) -> STEP 3 CORRECT (action, skipped for
//   "No Issue") -> STEP 4 RECORD (confirm the log line)
//
// STEP 2's category choice is the only thing that actually calls
// `onResolveHazard(itemId, categoryId)` — that's the same `onDropItem`
// App.jsx gives every other layout, so scoring/reveal/pass-threshold all
// keep working unchanged (see data/levels/level35.js's big comment).
// Decor items aren't part of the level's scored `items` list, so calling
// onResolveHazard for one is a harmless no-op for scoring — it just marks
// that tile "done" so the player can see they checked it.
// Progress is saved after every cleared round so the (big) level can be
// left and resumed. Only the round number + answers are stored.
const SAVE_KEY = 'fm-l35-audit-progress'
const loadSave = () => {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || null } catch { return null }
}
const writeSave = (data) => {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}

export default function AuditScene({
  hazards, decor, categories, actions, locations,
  placements, reveal,
  onResolveHazard,
  onFinishAudit,
}) {
  const saved = useMemo(() => loadSave(), [])
  const [location] = useState(() => {
    if (saved?.location) return saved.location
    return locations[0] || locations[Math.floor(Math.random() * locations.length)]
  })

  const isHospital = location?.id === 'hospital' || location?.name?.includes('Hospital')

  useEffect(() => {
    if (isHospital) {
      document.body.classList.add('has-hospital-bg')
      document.body.style.setProperty('--hospital-bg-img', `url(${hospitalBg})`)
      return () => {
        document.body.classList.remove('has-hospital-bg')
        document.body.style.removeProperty('--hospital-bg-img')
      }
    }
  }, [isHospital])

  // round 1 = spot, 2 = identify, 3 = fix, 4 = finished
  const [round, setRound] = useState(saved?.round || 1)
  const [identified, setIdentified] = useState(saved?.identified || {}) // id -> categoryId (locked, correct)
  const [fixed, setFixed] = useState(saved?.fixed || {})               // id -> actionId (locked, correct)
  const [flagged, setFlagged] = useState([])                            // round 1 working selection
  const [draft, setDraft] = useState({})                                // round 2/3 working picks
  const [wrongIds, setWrongIds] = useState([])
  const [msg, setMsg] = useState(null)
  const [attempts, setAttempts] = useState({ 1: 0, 2: 0, 3: 0 })

  // Re-feed already-saved Identify answers to the scoring engine after a resume.
  useEffect(() => {
    Object.entries(identified).forEach(([id, cat]) => { if (!placements[id]) onResolveHazard(id, cat) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persist = (next) => writeSave({ round, identified, fixed, location, ...next })

  // Shelf layout for round 1 (same fridge photo + shuffled hazards/decor).
  const tiles = useMemo(() => {
    const all = [
      ...hazards.map((h) => ({ ...h, kind: 'hazard' })),
      ...decor.map((d) => ({ ...d, kind: 'decor' })),
    ]
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[all[i], all[j]] = [all[j], all[i]]
    }
    const slots = [...SLOTS]
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[slots[i], slots[j]] = [slots[j], slots[i]]
    }
    return all.map((item, i) => {
      const slot = slots[i % slots.length]
      return {
        ...item,
        pos: { left: slot.left + (Math.random() - 0.5) * 1.5, top: slot.top + (Math.random() - 0.5) * 0.8 },
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleFlag = (id) => {
    if (round !== 1 || reveal) return
    setMsg(null)
    setFlagged((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  }

  // ---- Round 1: what looks abnormal? ----
  const checkRound1 = () => {
    setAttempts((a) => ({ ...a, 1: a[1] + 1 }))
    const hazardIds = hazards.map((h) => h.id)
    const missed = hazardIds.filter((id) => !flagged.includes(id)).length
    const extra = flagged.filter((id) => !hazardIds.includes(id)).length
    if (!missed && !extra) {
      setRound(2); setFlagged([]); setMsg(null)
      persist({ round: 2 })
    } else {
      setMsg(`Not quite — ${extra} of your picks are actually fine and ${missed} problem${missed === 1 ? ' is' : 's are'} still hiding. Look again!`)
      setFlagged([])
    }
  }

  // ---- Rounds 2 & 3: one answer per hazard, wrong ones are redone ----
  const pick = (id, val) => { setDraft((d) => ({ ...d, [id]: val })); setWrongIds((w) => w.filter((x) => x !== id)); setMsg(null) }

  const checkRound = (r) => {
    setAttempts((a) => ({ ...a, [r]: a[r] + 1 }))
    const key = r === 2 ? 'shelf' : 'correctAction'
    const locked = r === 2 ? identified : fixed
    const wrong = hazards.filter((h) => !locked[h.id] && draft[h.id] !== h[key]).map((h) => h.id)
    const gained = { ...locked }
    hazards.forEach((h) => { if (!locked[h.id] && draft[h.id] === h[key]) gained[h.id] = draft[h.id] })
    if (r === 2) { setIdentified(gained); Object.entries(gained).forEach(([id, c]) => { if (!placements[id]) onResolveHazard(id, c) }) }
    else setFixed(gained)
    setDraft((d) => Object.fromEntries(Object.entries(d).filter(([id]) => wrong.includes(id) ? false : !gained[id])))
    setWrongIds(wrong)
    if (wrong.length) {
      setMsg(null)
      persist(r === 2 ? { identified: gained } : { fixed: gained })
    } else {
      setMsg(null)
      const nextRound = r + 1
      setRound(nextRound)
      persist({ round: nextRound, ...(r === 2 ? { identified: gained } : { fixed: gained }) })
      if (nextRound === 4) { try { localStorage.removeItem(SAVE_KEY) } catch { /* ignore */ } }
    }
  }

  const resolvedCount = round >= 3 ? hazards.length : round === 2 ? Object.keys(identified).length : 0
  const shownCount = round >= 4 ? hazards.length : resolvedCount
  const auditPct = hazards.length ? Math.round((shownCount / hazards.length) * 100) : 0
  const log = round >= 4
    ? hazards.map((h) => {
        const actionObj = actions.find((a) => a.id === fixed[h.id])
        return {
          problem: h.problemText || h.label,
          action: actionObj ? `${actionObj.icon} ${actionObj.name}` : '—',
          status: 'Corrected',
        }
      })
    : []

  const STAGES = [
    { n: 1, name: 'Spot' },
    { n: 2, name: 'Identify' },
    { n: 3, name: 'Fix' },
  ]

  const totalProgressPct = useMemo(() => {
    if (round >= 4) return 100
    const totalHazards = hazards.length || 1
    if (round === 1) {
      const flagRatio = Math.min(1, flagged.length / totalHazards)
      return Math.round(Math.max(4, flagRatio * 33.3))
    }
    if (round === 2) {
      const identifiedCount = Object.keys(identified).length
      const idRatio = Math.min(1, identifiedCount / totalHazards)
      return Math.round(33.3 + idRatio * 33.3)
    }
    if (round === 3) {
      const fixedCount = Object.keys(fixed).length
      const fixRatio = Math.min(1, fixedCount / totalHazards)
      return Math.round(66.6 + fixRatio * 33.4)
    }
    return 0
  }, [round, hazards.length, flagged.length, identified, fixed])

  const catName = (id) => categories.find((c) => c.id === id)

  return (
    <div className={'audit-scene' + (isHospital ? ' audit-scene--hospital' : '')}>
      <div className="audit-header">
        <div className="audit-location">
          <div className="audit-location-name">🧊 {location.name}</div>
          <div className="audit-location-desc">{location.desc}</div>
        </div>
        <div className="audit-tube-meter">
          <div className="audit-tube-labels">
            {STAGES.map((s) => {
              const isDone = round > s.n
              const isActive = round === s.n
              return (
                <div
                  key={s.n}
                  className={'audit-tube-step' + (isActive ? ' is-active' : '') + (isDone ? ' is-done' : '')}
                >
                  <span className="audit-tube-step-name">{s.name}</span>
                  {isDone && <span className="audit-tube-step-check">✓</span>}
                </div>
              )
            })}
          </div>
          <div className="audit-long-tube">
            <div
              className="audit-long-tube-fill"
              style={{ width: `${totalProgressPct}%` }}
            />
            <div className="audit-tube-ticks">
              <span className={'audit-tube-tick tick-1' + (totalProgressPct >= 33.3 ? ' is-passed' : '')} />
              <span className={'audit-tube-tick tick-2' + (totalProgressPct >= 66.6 ? ' is-passed' : '')} />
            </div>
          </div>
        </div>
      </div>

      {msg && <p className="audit-round-msg">{msg}</p>}

      {round === 1 && (
        <>
          <div className="audit-stage-banner">
            <span className="audit-stage-badge">STAGE 1</span>
            <div className="audit-stage-text">
              <strong className="audit-stage-title">What looks wrong?</strong>
              <span className="audit-stage-sub">Tap every item that is a food-safety problem, then press Check.</span>
            </div>
          </div>
          <div className="audit-body">
            <div className="audit-fridge-frame">
              <img className="audit-fridge-img" src={fridgeAuditImg} alt="Walk-in fridge" draggable="false" />
              <div className="audit-fridge-interior">
                {tiles.map((item) => {
                  const on = flagged.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      style={{ left: `${item.pos.left}%`, top: `${item.pos.top}%` }}
                      className={'audit-tile' + (on ? ' audit-tile--flag' : '')}
                      onClick={() => toggleFlag(item.id)}
                    >
                      <span className="audit-tile-chip">
                        <img className="audit-tile-img" src={item.img} alt={item.label} draggable="false" />
                      </span>
                      <span className="audit-tile-label" title={item.label}>{item.label}</span>
                      {on && <span className="audit-tile-check">🚩</span>}
                    </button>
                  )
                })}
              </div>
            </div>
            <aside className="audit-side audit-side--r1">
              <div className="audit-log audit-log--r1">
                <div className="audit-log-title">🚩 Flagged: {flagged.length}</div>
                <button
                  type="button"
                  className="btn btn-play audit-r1-check-btn"
                  disabled={!flagged.length}
                  onClick={checkRound1}
                >
                  Check Stage 1 ✓
                </button>
                {attempts[1] > 0 && <div className="audit-log-empty">Tries: {attempts[1]}</div>}
              </div>
            </aside>
          </div>
        </>
      )}

      {round === 2 && (
        <>
          <div className="audit-stage-banner">
            <span className="audit-stage-badge">STAGE 2</span>
            <div className="audit-stage-text">
              <strong className="audit-stage-title">What category of hazard is this?</strong>
              <span className="audit-stage-sub">Pick the HACCP category for every problem.</span>
            </div>
          </div>
          <div className="audit-round-list">
            {hazards.map((h, idx) => {
              const locked = identified[h.id]
              const value = locked || draft[h.id]
              const isWrong = wrongIds.includes(h.id)
              const lockedCat = categories.find((c) => c.id === locked)
              return (
                <div
                  key={h.id}
                  className={'audit-round-card' + (locked ? ' is-locked' : '') + (isWrong ? ' is-wrong' : '')}
                >
                  <div className="audit-card-head">
                    <span className="audit-card-idx">#{String(idx + 1).padStart(2, '0')}</span>
                    <img src={h.img} alt={h.label} draggable="false" />
                    <div className="audit-card-info">
                      <div className="audit-card-title">{h.label}</div>
                      <div className="audit-card-problem">
                        <strong>Problem:</strong> {h.problemText}
                      </div>
                    </div>
                    <div className="audit-card-status">
                      {locked && <span className="audit-status-tag is-locked">✅ Verified</span>}
                      {isWrong && <span className="audit-status-tag is-wrong">❌ Incorrect</span>}
                    </div>
                  </div>

                  {/* Options box down below (กล่องให้ลงมา) */}
                  <div className="audit-card-box">
                    {locked ? (
                      <div className="audit-card-locked-box">
                        <span className="audit-locked-icon">{lockedCat?.icon}</span>
                        <span>Category: <strong>{lockedCat?.name}</strong></span>
                      </div>
                    ) : (
                      <div className="audit-round-opts">
                        {categories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={'audit-round-opt' + (value === c.id ? ' is-on' : '')}
                            onClick={() => pick(h.id, c.id)}
                          >
                            <span className="audit-opt-ico">{c.icon}</span>
                            <span>{c.name}</span>
                            {value === c.id && <span className="audit-opt-check">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            className="btn btn-play audit-round-check"
            disabled={hazards.some((h) => !identified[h.id] && !draft[h.id])}
            onClick={() => checkRound(2)}
          >
            Check Stage 2 ✓
          </button>
        </>
      )}

      {round === 3 && (
        <>
          <div className="audit-stage-banner">
            <span className="audit-stage-badge">STAGE 3</span>
            <div className="audit-stage-text">
              <strong className="audit-stage-title">How should this be fixed?</strong>
              <span className="audit-stage-sub">Pick the corrective action for every problem.</span>
            </div>
          </div>
          <div className="audit-round-list">
            {hazards.map((h, idx) => {
              const locked = fixed[h.id]
              const value = locked || draft[h.id]
              const isWrong = wrongIds.includes(h.id)
              const cat = categories.find((c) => c.id === identified[h.id])
              const lockedAction = actions.find((a) => a.id === locked)
              return (
                <div
                  key={h.id}
                  className={'audit-round-card' + (locked ? ' is-locked' : '') + (isWrong ? ' is-wrong' : '')}
                >
                  <div className="audit-card-head">
                    <span className="audit-card-idx">#{String(idx + 1).padStart(2, '0')}</span>
                    <img src={h.img} alt={h.label} draggable="false" />
                    <div className="audit-card-info">
                      <div className="audit-card-title">{h.label}</div>
                      {cat && (
                        <div className="audit-card-cat-tag">
                          {cat.icon} {cat.name}
                        </div>
                      )}
                      <div className="audit-card-problem">
                        <strong>Problem:</strong> {h.problemText}
                      </div>
                    </div>
                    <div className="audit-card-status">
                      {locked && <span className="audit-status-tag is-locked">✅ Corrected</span>}
                      {isWrong && <span className="audit-status-tag is-wrong">❌ Incorrect</span>}
                    </div>
                  </div>

                  {/* Options box down below (กล่องให้ลงมา) */}
                  <div className="audit-card-box">
                    {locked ? (
                      <div className="audit-card-locked-box">
                        <span className="audit-locked-icon">{lockedAction?.icon}</span>
                        <span>Corrective Action: <strong>{lockedAction?.name}</strong></span>
                      </div>
                    ) : (
                      <div className="audit-round-opts">
                        {actions.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className={'audit-round-opt' + (value === a.id ? ' is-on' : '')}
                            onClick={() => pick(h.id, a.id)}
                          >
                            <span className="audit-opt-ico">{a.icon}</span>
                            <span>{a.name}</span>
                            {value === a.id && <span className="audit-opt-check">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            className="btn btn-play audit-round-check"
            disabled={hazards.some((h) => !fixed[h.id] && !draft[h.id])}
            onClick={() => checkRound(3)}
          >
            Check Stage 3 ✓
          </button>
        </>
      )}

      {round >= 4 && (
        <div className="audit-body">
          <aside className="audit-side" style={{ maxWidth: 'none', flex: '1 1 auto' }}>
            <div className="audit-log">
              <div className="audit-log-title">📋 Corrective Action Log — Audit Complete 🏆</div>
              <p style={{ margin: '4px 0 14px', fontSize: '13px', color: '#64748b' }}>
                All 13 food safety hazards have been inspected, categorized, and assigned corrective actions according to HACCP standards.
              </p>
              <div className="audit-log-rows">
                {log.map((entry, i) => (
                  <div className="audit-log-row" key={i}>
                    <span className="audit-log-field"><strong>Problem:</strong> {entry.problem}</span>
                    <span className="audit-log-field"><strong>Action:</strong> {entry.action}</span>
                    <span className="audit-log-status"><strong>Status:</strong> {entry.status}</span>
                  </div>
                ))}
              </div>
              {onFinishAudit && (
                <div style={{ marginTop: '22px', textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-play audit-complete-btn"
                    style={{ fontSize: '16px', padding: '12px 28px' }}
                    onClick={onFinishAudit}
                  >
                    🏆 Complete Audit & Claim Fridge Safety Masters ✓
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
