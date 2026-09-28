import { useMemo, useRef, useState } from 'react'
import Modal from './Modal.jsx'
import fridgeAuditImg from '../assets/level35/fridge-audit.png'

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

// Level 39 — "HACCP Fridge Master Audit (Classic)": the ORIGINAL Level 35 wizard version,
// kept as-is when Level 35 was converted to 3 saved rounds (see AuditScene.jsx).
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
const NO_ISSUE = { id: 'no-issue', name: 'No Issue Found', icon: '✅', color: '#bfe6c9' }
export default function AuditWizardScene({
  hazards, decor, categories, actions, locations,
  placements, reveal,
  onResolveHazard,
}) {
  // Randomize the audit site once per play session, not on every re-render.
  const [location] = useState(
    () => locations[Math.floor(Math.random() * locations.length)]
  )

  // Shuffle hazards + decor together once, so hazards aren't just listed
  // first and don't give themselves away by position — then pin each one to
  // one of the fixed shelf SLOTS above (also shuffled, so the same item
  // doesn't always land on the same shelf spot between playthroughs), with
  // a small random jitter so they don't look robotically aligned.
  const tiles = useMemo(() => {
    const all = [
      ...hazards.map((h) => ({ ...h, kind: 'hazard' })),
      ...decor.map((d) => ({ ...d, kind: 'decor' })),
    ]
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[all[i], all[j]] = [all[j], all[i]]
    }
    const shuffledSlots = [...SLOTS]
    for (let i = shuffledSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledSlots[i], shuffledSlots[j]] = [shuffledSlots[j], shuffledSlots[i]]
    }
    return all.map((item, i) => {
      const slot = shuffledSlots[i % shuffledSlots.length]
      const jitterX = (Math.random() - 0.5) * 1.5
      const jitterY = (Math.random() - 0.5) * 0.8
      return { ...item, pos: { left: slot.left + jitterX, top: slot.top + jitterY } }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refs to each tile's DOM node so a click can smoothly scroll/"walk" the
  // view to that exact shelf spot before opening the wizard — like actually
  // stepping up to that part of the fridge to look closer.
  const tileRefs = useRef({})
  const [focusedId, setFocusedId] = useState(null)
  const goToTile = (item, then) => {
    const node = tileRefs.current[item.id]
    setFocusedId(item.id)
    node?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    setTimeout(() => {
      setFocusedId(null)
      then()
    }, 320)
  }

  const [activeHazard, setActiveHazard] = useState(null) // item currently in the wizard
  const [step, setStep] = useState(1) // 1 inspect, 2 identify, 3 correct, 4 record
  const [pickedCategory, setPickedCategory] = useState(null)
  const [pickedAction, setPickedAction] = useState(null)
  const [log, setLog] = useState([]) // Corrective Action Log entries built up as hazards are resolved

  const resolvedCount = hazards.filter((h) => placements[h.id]).length
  const auditPct = hazards.length ? Math.round((resolvedCount / hazards.length) * 100) : 0

  const openWizard = (item) => {
    if (placements[item.id]) return // already diagnosed
    setActiveHazard(item)
    setStep(1)
    setPickedCategory(null)
    setPickedAction(null)
  }

  const closeWizard = () => {
    setActiveHazard(null)
    setStep(1)
    setPickedCategory(null)
    setPickedAction(null)
  }

  // "No Issue Found" skips STEP 3 (nothing to correct) straight to a short
  // record entry — everything else still goes Identify -> Correct -> Record.
  const confirmNoIssue = () => {
    setLog((l) => [
      ...l,
      { problem: activeHazard.label, action: '—', status: 'No Issue Found' },
    ])
    onResolveHazard(activeHazard.id, NO_ISSUE.id)
    closeWizard()
  }

  const confirmLog = () => {
    const actionName = actions.find((a) => a.id === pickedAction)?.name || pickedAction
    setLog((l) => [
      ...l,
      { problem: activeHazard.problemText || activeHazard.label, action: actionName, status: 'Corrected' },
    ])
    onResolveHazard(activeHazard.id, pickedCategory)
    closeWizard()
  }

  return (
    <div className="audit-scene">
      <div className="audit-header">
        <div className="audit-location">
          <div className="audit-location-name">🧊 {location.name}</div>
          <div className="audit-location-desc">{location.desc}</div>
        </div>
        <div className="audit-progress-block">
          <div className="audit-progress">
            🔍 Hazards Found: <strong>{resolvedCount}</strong> / {hazards.length}
          </div>
          <div className="progress audit-progress-bar">
            <div className="progress-fill" style={{ width: `${auditPct}%` }} />
          </div>
        </div>
      </div>

      {/* Fridge on one side, the growing Corrective Action Log on the other —
          side-by-side on wide screens (stacked on narrow ones via CSS) so the
          log reads like a clipboard the auditor is keeping next to the fridge
          instead of a strip that pushes the whole page down as it fills up. */}
      <div className="audit-body">
        <div className="audit-fridge-frame">
          <img className="audit-fridge-img" src={fridgeAuditImg} alt="Walk-in fridge" draggable="false" />
          <div className="audit-fridge-interior">
            {tiles.map((item) => {
              const isHazard = item.kind === 'hazard'
              const done = !!placements[item.id]
              const mark = done && reveal && isHazard
                ? (item.shelf === placements[item.id] ? 'correct' : 'wrong')
                : undefined
              return (
                <button
                  key={item.id}
                  ref={(el) => { tileRefs.current[item.id] = el }}
                  type="button"
                  style={{ left: `${item.pos.left}%`, top: `${item.pos.top}%` }}
                  className={
                    'audit-tile'
                    + (done ? ' audit-tile--done' : '')
                    + (mark === 'correct' ? ' audit-tile--correct' : '')
                    + (mark === 'wrong' ? ' audit-tile--wrong' : '')
                    + (focusedId === item.id ? ' audit-tile--focused' : '')
                  }
                  onClick={() => goToTile(item, () => openWizard(item))}
                >
                  {/* Every level-35 icon is a transparent-background SVG/PNG, so
                      each tile carries its own opaque backdrop chip here — without
                      it the icons would nearly disappear against the fridge photo. */}
                  <span className="audit-tile-chip">
                    <img className="audit-tile-img" src={item.img} alt={item.label} draggable="false" />
                  </span>
                  <span className="audit-tile-label" title={item.label}>{item.label}</span>
                  {done && <span className="audit-tile-check">✅</span>}
                </button>
              )
            })}
          </div>
        </div>

        <aside className="audit-side">
          <div className="audit-log">
            <div className="audit-log-title">📋 Corrective Action Log</div>
            {log.length > 0 ? (
              <div className="audit-log-rows">
                {log.map((entry, i) => (
                  <div className="audit-log-row" key={i}>
                    <span className="audit-log-field"><strong>Problem:</strong> {entry.problem}</span>
                    <span className="audit-log-field"><strong>Action:</strong> {entry.action}</span>
                    <span className="audit-log-status"><strong>Status:</strong> {entry.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="audit-log-empty">
                Tap a shelf item to inspect it — everything you diagnose gets logged here.
              </div>
            )}
          </div>
        </aside>
      </div>

      {activeHazard && (
        <Modal>
          <div className="audit-wizard">
            {step === 1 && (
              <>
                <div className="audit-wizard-icon">🔍</div>
                <h2 className="audit-wizard-title">Take a Closer Look</h2>
                <img className="audit-wizard-img" src={activeHazard.img} alt={activeHazard.label} draggable="false" />
                <p className="audit-wizard-text">{activeHazard.label}</p>
                <div className="audit-wizard-actions">
                  <button className="btn btn-play" onClick={() => setStep(2)}>Next: Identify →</button>
                  <button className="btn audit-btn-ghost" onClick={closeWizard}>Cancel</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="audit-wizard-icon">🧠</div>
                <h2 className="audit-wizard-title">STEP 2 — Identify</h2>
                <p className="audit-wizard-text">Is there a problem here? If so, what kind?</p>
                <div className="audit-option-grid">
                  {[...categories, NO_ISSUE].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={'audit-option' + (pickedCategory === c.id ? ' audit-option--selected' : '')}
                      style={{ '--opt-color': c.color }}
                      onClick={() => setPickedCategory(c.id)}
                    >
                      <span className="audit-option-icon">{c.icon}</span>
                      <span className="audit-option-name">{c.name}</span>
                    </button>
                  ))}
                </div>
                <div className="audit-wizard-actions">
                  <button className="btn audit-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="btn btn-play"
                    disabled={!pickedCategory}
                    onClick={() => (pickedCategory === NO_ISSUE.id ? confirmNoIssue() : setStep(3))}
                  >
                    {pickedCategory === NO_ISSUE.id ? 'Confirm & Log ✓' : 'Next: Correct →'}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="audit-wizard-icon">🛠️</div>
                <h2 className="audit-wizard-title">STEP 3 — Correct</h2>
                <p className="audit-wizard-text">How should this be fixed?</p>
                <div className="audit-option-grid audit-option-grid--actions">
                  {actions.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={'audit-option' + (pickedAction === a.id ? ' audit-option--selected' : '')}
                      onClick={() => setPickedAction(a.id)}
                    >
                      <span className="audit-option-icon">{a.icon}</span>
                      <span className="audit-option-name">{a.name}</span>
                    </button>
                  ))}
                </div>
                <div className="audit-wizard-actions">
                  <button className="btn audit-btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-play" disabled={!pickedAction} onClick={() => setStep(4)}>
                    Next: Record →
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="audit-wizard-icon">📝</div>
                <h2 className="audit-wizard-title">STEP 4 — Record</h2>
                <p className="audit-wizard-text">Confirm this Corrective Action Log entry:</p>
                <div className="audit-log-preview">
                  <div><strong>Problem:</strong> {activeHazard.problemText || activeHazard.label}</div>
                  <div><strong>Action:</strong> {actions.find((a) => a.id === pickedAction)?.name}</div>
                  <div><strong>Status:</strong> Corrected</div>
                </div>
                <div className="audit-wizard-actions">
                  <button className="btn audit-btn-ghost" onClick={() => setStep(3)}>← Back</button>
                  <button className="btn btn-play" onClick={confirmLog}>Confirm & Log ✓</button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
