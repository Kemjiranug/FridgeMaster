import { useMemo, useState } from 'react'
import { NO_VIOLATION } from '../data/levels/level33.js'
import { ROW_Y, COL_X } from '../data/fridgeRows.js'
import fridgeImg from '../assets/level33/fridge.png'

// Level 33 — "Find the Violations!" (Fridge Audit), on the real fridge photo.
//
// EVERY item in the fridge can be inspected and answered — safe ones too —
// so nothing gives itself away just by being clickable:
//   1. click an item                                   (FIND)
//   2. answer A / B / C, or D "No violation"           (EXPLAIN — scored)
//   3. if you called it a violation: pick the fix      (FIX — practice)
// Only step 2 calls `onResolveHazard(itemId, reasonId)` (App's placeItem),
// so scoring / Check Answers / reveal work like every other level. Safe
// items are tracked locally (a wrong "violation!" on one is a false alarm,
// shown on reveal).
const LETTERS = ['A', 'B', 'C', 'D']

export default function ViolationScene({
  hazards, decor, reasons, actions,
  placements, reveal, hintShelfId,
  onResolveHazard, onSelect,
}) {
  const [fixed, setFixed] = useState({})            // hazardId -> true
  const [decorAnswers, setDecorAnswers] = useState({}) // decorId -> reasonId | 'q-none'
  const [activeId, setActiveId] = useState(null)
  const [phase, setPhase] = useState('idle')        // idle | reason | fix | info
  const [pickedReason, setPickedReason] = useState(null)
  const [pickedFix, setPickedFix] = useState(null)
  const [notice, setNotice] = useState('')

  const byId = useMemo(
    () => Object.fromEntries([...hazards, ...decor].map((i) => [i.id, i])),
    [hazards, decor]
  )
  const active = activeId ? byId[activeId] : null
  const isHazard = (item) => hazards.some((h) => h.id === item.id)

  // Put each tile in one of the 3 columns of its row (shuffled once).
  const tiles = useMemo(() => {
    const all = [
      ...hazards.map((h) => ({ ...h, kind: 'hazard' })),
      ...decor.map((d) => ({ ...d, kind: 'decor' })),
    ]
    const out = []
    for (let r = 1; r <= 6; r++) {
      const row = all.filter((t) => t.row === r)
      const cols = [0, 1, 2]
      for (let i = cols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[cols[i], cols[j]] = [cols[j], cols[i]]
      }
      // Only 1-2 items? centre them on the row rather than leaving gaps.
      const xs = row.length === 3 ? cols.map((c) => COL_X[c])
        : row.length === 2 ? [COL_X[0] + 10, COL_X[2] - 10].sort(() => Math.random() - 0.5)
        : [COL_X[1]]
      row.forEach((t, i) => out.push({ ...t, x: xs[i], y: ROW_Y[r] }))
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 4 fix choices: the right one + 3 random wrong ones (stable per hazard).
  const fixOptions = useMemo(() => {
    if (!active || !isHazard(active) || !active.correctAction) return []
    const right = actions.find((a) => a.id === active.correctAction)
    const others = actions.filter((a) => a.id !== active.correctAction)
    let seed = [...active.id].reduce((n, c) => n + c.charCodeAt(0), 0)
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[others[i], others[j]] = [others[j], others[i]]
    }
    const opts = [right, ...others.slice(0, 3)].filter(Boolean)
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[opts[j], opts[i]] = [opts[i], opts[j]]
    }
    return opts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, actions])

  const answered = (item) => (isHazard(item) ? placements[item.id] : decorAnswers[item.id])
  const total = hazards.length + decor.length
  const inspected = [...hazards, ...decor].filter((i) => answered(i)).length
  const fixedCount = hazards.filter((h) => fixed[h.id]).length
  const allInspected = inspected === total

  const closeModal = () => {
    setActiveId(null)
    setPhase('idle')
    setPickedReason(null)
    setPickedFix(null)
  }

  const clickTile = (item) => {
    if (reveal) return
    setNotice('')
    setActiveId(item.id)
    setPickedReason(null)
    setPickedFix(null)
    onSelect?.(item.id)
    const a = answered(item)
    if (!a) { setPhase('reason'); return }
    if (isHazard(item) && !fixed[item.id] && (a !== NO_VIOLATION.id || allInspected)) setPhase('fix')
    else setPhase('info')
  }

  const confirmReason = () => {
    if (isHazard(active)) onResolveHazard(active.id, pickedReason)
    else setDecorAnswers((d) => ({ ...d, [active.id]: pickedReason }))
    if (isHazard(active) && pickedReason !== NO_VIOLATION.id) {
      setPickedFix(null)
      setPhase('fix')
      return
    }
    setNotice('📝 Answer recorded')
    closeModal()
  }

  const confirmFix = () => {
    setFixed((f) => ({ ...f, [active.id]: true }))
    setNotice(`✅ Fixed: ${active.title}`)
    closeModal()
  }

  const options = [...reasons, NO_VIOLATION]
  const fixIsRight = pickedFix && pickedFix === active?.correctAction
  const fixIsWrong = pickedFix && !fixIsRight
  const reasonName = (id) => (id === NO_VIOLATION.id ? 'No violation' : reasons.find((r) => r.id === id)?.name)
  const showHint = hintShelfId && phase === 'reason'

  return (
    <div className="vio-scene">
      <div className="vio-topbar">
        <span className="vio-chip">🔍 Inspected: <b>{inspected}</b> / {total}</span>
        <span className="vio-chip vio-chip--fix">🛠️ Fixed: <b>{fixedCount}</b> / {hazards.length}</span>
        <span className="vio-banner">
          {notice || (allInspected ? '🎉 Everything inspected! Fix any remaining 🚩 violations, then Check Answers.' : '🔍 Tap any item in the fridge to inspect it')}
        </span>
      </div>

      <div className="vio-body">
        {/* Left: Fridge */}
        <div className="vio-fridge">
          <img className="vio-fridge-img" src={fridgeImg} alt="Walk-in fridge" draggable="false" />
          {tiles.map((item) => {
            const haz = item.kind === 'hazard'
            const a = answered(item)
            const fixed_ = haz && !!fixed[item.id]
            let mark = ''
            if (reveal) {
              if (haz) mark = !a ? 'missed' : a === item.shelf ? 'correct' : 'wrong'
              else if (a && a !== NO_VIOLATION.id) mark = 'wrong'
            }
            const flag = allInspected && haz && !fixed_ && !reveal
            return (
              <button
                key={item.id}
                type="button"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                className={
                  'vio-tile'
                  + (activeId === item.id ? ' is-active' : '')
                  + (a && !fixed_ ? ' is-done' : '')
                  + (fixed_ ? ' is-fixed' : '')
                  + (flag ? ' is-flag' : '')
                  + (mark ? ` is-${mark}` : '')
                }
                onClick={() => clickTile(item)}
              >
                <img src={item.img} alt="" draggable="false" />
                <span>{item.tileLabel || item.label}</span>
                {fixed_ ? <i className="vio-badge">✅</i>
                  : flag ? <i className="vio-badge">🚩</i>
                  : a && !reveal ? <i className="vio-badge vio-badge--seen">✔</i> : null}
              </button>
            )
          })}
        </div>

        {/* Right: Inspection Card (Spacious & Clean) */}
        <div className="vio-card">
          {phase === 'reason' && active && (
            <>
              <div className="vio-card-header">
                <span className="vio-step-pill">STEP 1</span>
                <h2 className="vio-card-title">Choose The Violation</h2>
                <p className="vio-card-sub">Is there a food safety problem with this item?</p>
              </div>

              <div className="vio-item-banner">
                <img className="vio-item-banner-img" src={active.img} alt="" draggable="false" />
                <div className="vio-item-banner-info">
                  <span className="vio-item-tag">Selected Item</span>
                  <strong className="vio-item-name">{active.tileLabel || active.label}</strong>
                </div>
              </div>

              <div className="vio-reason-list" role="radiogroup" aria-label="Reason">
                {options.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={pickedReason === r.id}
                    className={
                      'vio-reason-opt'
                      + (pickedReason === r.id ? ' is-picked' : '')
                      + (showHint && hintShelfId === r.id ? ' is-hint' : '')
                    }
                    onClick={() => setPickedReason(r.id)}
                  >
                    <span className="vio-reason-badge">{LETTERS[i]}</span>
                    <div className="vio-reason-body">
                      <span className="vio-reason-name">{r.name}</span>
                      {r.hint && <span className="vio-reason-hint">{r.hint}</span>}
                    </div>
                  </button>
                ))}
              </div>

              <div className="vio-card-actions">
                <button
                  type="button"
                  className="btn btn-play vio-submit-btn"
                  disabled={!pickedReason}
                  onClick={confirmReason}
                >
                  {isHazard(active) && pickedReason !== NO_VIOLATION.id ? 'Next: Fix it →' : 'Confirm & Save ✓'}
                </button>
              </div>
            </>
          )}

          {phase === 'fix' && active && (
            <>
              <div className="vio-card-header">
                <span className="vio-step-pill vio-step-pill--fix">STEP 2</span>
                <h2 className="vio-card-title">Now Fix It</h2>
                <p className="vio-card-sub">Pick the best corrective action for this hazard.</p>
              </div>

              <div className="vio-item-banner">
                <img className="vio-item-banner-img" src={active.img} alt="" draggable="false" />
                <div className="vio-item-banner-info">
                  <strong className="vio-item-name">{active.title}</strong>
                  <span className="vio-reason-pill">Reason: {reasonName(placements[active.id])}</span>
                </div>
              </div>

              <div className="vio-fix-grid">
                {fixOptions.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={
                      'vio-fix-opt'
                      + (pickedFix === a.id ? (a.id === active.correctAction ? ' is-right' : ' is-bad') : '')
                    }
                    onClick={() => setPickedFix(a.id)}
                  >
                    <span className="vio-fix-icon">{a.icon}</span>
                    <span className="vio-fix-name">{a.name}</span>
                  </button>
                ))}
              </div>

              {fixIsWrong && <div className="vio-feedback is-bad">Not quite — try another fix.</div>}
              {fixIsRight && <div className="vio-feedback is-right">Correct! That solves it.</div>}

              <div className="vio-card-actions">
                <button
                  type="button"
                  className="btn btn-play vio-submit-btn"
                  disabled={!fixIsRight}
                  onClick={confirmFix}
                >
                  Confirm Fix ✓
                </button>
              </div>
            </>
          )}

          {phase === 'info' && active && (
            <div className="vio-card-empty">
              <img className="vio-empty-img" src={active.img} alt="" draggable="false" />
              <h3>{active.tileLabel || active.label}</h3>
              <p>
                {isHazard(active) && fixed[active.id]
                  ? '✅ Already fixed.'
                  : 'You already answered this item.'}
              </p>
              <button type="button" className="btn btn-mint" onClick={() => { setPhase('idle'); setActiveId(null) }}>
                Choose Another Item
              </button>
            </div>
          )}

          {phase === 'idle' && (
            <div className="vio-card-empty">
              {allInspected && !reveal ? (
                <>
                  <div className="vio-empty-icon">🎉</div>
                  <h3>Everything Inspected!</h3>
                  <p>The real violations are flagged 🚩 — fix any that are left, then press Check Answers.</p>
                </>
              ) : (
                <>
                  <div className="vio-empty-icon">🔍</div>
                  <h3>{notice || 'Tap an Item in the Fridge'}</h3>
                  <p>
                    {notice
                      ? 'Keep going — inspect the next item.'
                      : `${hazards.length} violations are hiding in here. Tap any item on the shelves to inspect it.`}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
