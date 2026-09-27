import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { FRIDGE_IMG, LEVEL_TIME } from '../gameData.js'
import { MEALPREP_FOODS, LABEL_ICON } from '../data/levels/level19.js'
import { LOCK_REGIONS } from './Fridge.jsx'
import * as audio from '../lib/audio.js'
import Modal from './Modal.jsx'

// Level 19 — "Meal Prep Tetris!" ปิดฝา → ติด label → เข้าตู้เย็น
//
// Two things must happen to a container on the counter before it's allowed
// anywhere near the fridge: it needs a Lid (if it doesn't already have one)
// and a Date Label (if it doesn't already have one). Both tools live on a
// tray below the counter and are reusable — drag (or tap-select, then tap
// the container) the Lid onto a container to cover it, the Label to date
// it. Only once `covered && labeled` is true for a container does it
// become draggable, and only then can it be carried into the fridge zone.
// Dropping an unfinished container into the fridge simply isn't possible:
// `carryToFridge` below is a no-op unless both flags are set.

// Big open zone across the fridge's left shelves — where prepped
// containers get carried to. Everything else (right door + both freezer
// drawers) is greyed out with a padlock so the player's eye goes straight
// to the shelves that actually matter for this level.
const FRIDGE_ZONE = { left: '3.5%', top: '2.5%', width: '45%', height: '59%' }
const LOCKED_KEYS = ['leftFreezer', 'door', 'freezerRight']

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path d="M8 11V8a4 4 0 1 1 8 0v3" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="5" y="10.5" width="14" height="10.5" rx="2.4" fill="#fff" />
      <circle cx="12" cy="15" r="1.5" fill="#8b9196" />
      <rect x="11.3" y="15" width="1.4" height="3.2" rx=".7" fill="#8b9196" />
    </svg>
  )
}

// A real container lid, drawn (not photographed) so it can rotate/slide
// like a physical object. Same shape + colours whether it's the loose tool
// on the tray or the lid sitting on a box — reusing Level 18's leak-proof
// box palette so the two levels feel like the same kitchen.
function LidGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 30" aria-hidden="true">
      <rect x="4" y="6" width="112" height="18" rx="8" fill="#5fb0dc" stroke="#3f8fbf" strokeWidth="3" />
      <rect x="46" y="1" width="28" height="9" rx="4.5" fill="#3f8fbf" />
    </svg>
  )
}

// One tool (Lid or Label) on the prep tray — click or drag it onto a
// container. A soft ring shows which one is tap-selected.
function ToolChip({ id, label, selected, onSelect, children }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData('text/plain', 'tool:' + id)
    e.dataTransfer.effectAllowed = 'copy'
  }
  return (
    <div
      className={`mp-tool-photo mp-tool-photo--${id} ${selected ? 'is-selected' : ''}`}
      draggable="true"
      onDragStart={onDragStart}
      onClick={() => onSelect(id)}
      title={label}
    >
      {children}
    </div>
  )
}

// The container itself — a real takeout box (same body/lid art as Level
// 18's leak-proof box) with the food sitting inside it. The lid starts
// propped open at an angle and only rotates flat — actually closing the
// box — once the player applies it; the date sticker (the real label photo
// supplied for this level) is hidden until applied, then pops on stuck to
// the front of the box like a real sticker.
function BoxArt({ food, covered, labeled, compact = false }) {
  return (
    <div className={`mp-box-art ${compact ? 'mp-box-art--compact' : ''} ${covered ? 'is-covered' : ''}`}>
      <svg className="mp-box-body-svg" viewBox="0 0 120 96" aria-hidden="true">
        <path d="M10 26h100l-7 58a8 8 0 0 1-8 7H25a8 8 0 0 1-8-7z" fill="rgba(160,215,240,.5)" stroke="#3f8fbf" strokeWidth="3" strokeLinejoin="round" />
        <path d="M27 38l5 46" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".65" />
      </svg>
      <img className="mp-box-food" src={food.img} alt={food.name} draggable="false" />
      <img className={`mp-box-label ${labeled ? 'is-on' : ''}`} src={LABEL_ICON} alt="" draggable="false" />
      {covered && <LidGlyph className="mp-box-lid-svg" />}
    </div>
  )
}

// One container on the counter, drawn as a real box (see BoxArt). Only
// once both steps are done does it become draggable/pickable to carry into
// the fridge; it's also a drop target for the two tools above.
function FoodCard({ food, covered, labeled, selected, selectedTool, reveal, onApplyTool, onSelect, onUnreadyClick }) {
  const ready = covered && labeled
  const draggable = ready && !reveal
  const onDragStart = (e) => {
    if (!draggable) return
    e.dataTransfer.setData('text/plain', 'food:' + food.id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const allowDrop = (e) => { if (!reveal) e.preventDefault() }
  const handleDrop = (e) => {
    if (reveal) return
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain')
    if (data?.startsWith('tool:')) onApplyTool(food.id, data.slice(5))
  }
  const handleClick = () => {
    if (reveal) return
    if (selectedTool) { onApplyTool(food.id, selectedTool); return }
    if (draggable) {
      onSelect(food.id)
    } else {
      onUnreadyClick?.(food.id)
    }
  }
  return (
    <div
      className={`mp-box ${ready ? 'is-ready' : ''} ${selected ? 'is-selected' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={allowDrop}
      onDrop={handleDrop}
      onClick={handleClick}
      title={food.name}
    >
      <BoxArt food={food} covered={covered} labeled={labeled} />
      <span className="mp-box-caption">{food.name}</span>
    </div>
  )
}

export default function MealPrepScene({
  timeLeft,
  totalTime = LEVEL_TIME,
  onFinishLevel,
  onBackToMenu,
  onRetry,
  onNextLevel,
}) {
  const [covered, setCovered] = useState(() =>
    Object.fromEntries(MEALPREP_FOODS.map((f) => [f.id, !f.needsLid])))
  const [labeled, setLabeled] = useState(() =>
    Object.fromEntries(MEALPREP_FOODS.map((f) => [f.id, !f.needsLabel])))
  const [inFridge, setInFridge] = useState(() =>
    Object.fromEntries(MEALPREP_FOODS.map((f) => [f.id, false])))
  const [selectedId, setSelectedId] = useState(null)
  const [selectedTool, setSelectedTool] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [modalStep, setModalStep] = useState(null) // null | 'feedback' | 'result'
  const [finishReason, setFinishReason] = useState('checked') // 'checked' | 'timeup'
  const [msg, setMsg] = useState('')
  const msgTimer = useRef(null)
  const autoSubmittedRef = useRef(false)

  const flash = useCallback((text) => {
    setMsg(text)
    clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setMsg(''), 2600)
  }, [])
  useEffect(() => () => clearTimeout(msgTimer.current), [])

  const isReady = (foodId) => covered[foodId] && labeled[foodId]

  const applyTool = (foodId, tool) => {
    if (submitted) return
    if (tool === 'lid') {
      // Strict order: no lid until it's labeled.
      if (!labeled[foodId]) {
        audio.sfxWrong?.()
        flash('Label with a date first before closing the lid! 🏷️→🥡')
        return
      }
      if (covered[foodId]) {
        audio.sfxWrong?.()
        flash('This container is already covered! 🥡')
        return
      }
      audio.sfxPlace()
      setCovered((c) => ({ ...c, [foodId]: true }))
    } else if (tool === 'label') {
      if (labeled[foodId]) {
        audio.sfxWrong?.()
        flash('This container already has a date label! 🏷️')
        return
      }
      audio.sfxPlace()
      setLabeled((l) => ({ ...l, [foodId]: true }))
    }
    setSelectedTool(null)
  }

  const carryToFridge = (foodId) => {
    if (submitted || !foodId) return
    if (!isReady(foodId)) {
      audio.sfxWrong?.()
      if (!labeled[foodId] && !covered[foodId]) {
        flash('Label and cover the container before putting it in the fridge! 🏷️🥡')
      } else if (!labeled[foodId]) {
        flash('Label with a date first before putting it in the fridge! 🏷️')
      } else {
        flash('Close the lid before putting it in the fridge! 🥡')
      }
      return
    }
    if (inFridge[foodId]) return
    audio.sfxPlace()
    setInFridge((p) => ({ ...p, [foodId]: true }))
    setSelectedId(null)
  }

  const returnFood = (foodId) => {
    if (submitted) return
    audio.sfxReturn()
    setInFridge((p) => ({ ...p, [foodId]: false }))
  }

  const handleUnreadyClick = (foodId) => {
    if (submitted) return
    audio.sfxWrong?.()
    if (!labeled[foodId] && !covered[foodId]) {
      flash('This container needs a date label and lid first! 🏷️🥡')
    } else if (!labeled[foodId]) {
      flash('This container needs a date label first! 🏷️')
    } else if (!covered[foodId]) {
      flash('This container needs its lid closed first! 🥡')
    }
  }

  const trayFoods = MEALPREP_FOODS.filter((f) => !inFridge[f.id])
  const fridgeFoods = MEALPREP_FOODS.filter((f) => inFridge[f.id])
  const allInFridge = MEALPREP_FOODS.every((f) => inFridge[f.id])
  const allReady = MEALPREP_FOODS.every((f) => isReady(f.id))
  const canCheck = allInFridge

  const scoreResults = useMemo(() => {
    const itemsReview = MEALPREP_FOODS.map((food) => {
      const isCorrect = covered[food.id] && labeled[food.id] && inFridge[food.id]
      return { food, isCorrect, covered: covered[food.id], labeled: labeled[food.id], inFridge: inFridge[food.id] }
    })
    const correctCount = itemsReview.filter((r) => r.isCorrect).length
    const baseScore = correctCount * 10
    const timeBonus = timeLeft > 0 && allInFridge ? 10 : 0
    const totalScore = baseScore + timeBonus
    const passed = baseScore >= 36 // 60% of 60 base points
    const stars = totalScore >= 65 ? 3 : totalScore >= 50 ? 2 : passed ? 1 : 0
    return { correctCount, baseScore, totalScore, passed, stars, itemsReview }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covered, labeled, inFridge, timeLeft, allInFridge])

  const handleSubmit = (reason = 'checked') => {
    if (submitted) return
    setSubmitted(true)
    setFinishReason(reason)
    if (scoreResults.passed) audio.sfxWin()
    else audio.sfxLose()
    onFinishLevel?.({ score: scoreResults.totalScore, stars: scoreResults.stars, passed: scoreResults.passed })

    const wrongItems = scoreResults.itemsReview.filter((r) => !r.isCorrect)
    if (reason === 'checked' && wrongItems.length > 0) {
      setModalStep('feedback')
    } else {
      setModalStep('result')
    }
  }

  useEffect(() => {
    if (timeLeft <= 0 && !submitted && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true
      handleSubmit('timeup')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted])

  const resetAll = () => {
    setCovered(Object.fromEntries(MEALPREP_FOODS.map((f) => [f.id, !f.needsLid])))
    setLabeled(Object.fromEntries(MEALPREP_FOODS.map((f) => [f.id, !f.needsLabel])))
    setInFridge(Object.fromEntries(MEALPREP_FOODS.map((f) => [f.id, false])))
    setSelectedId(null)
    setSelectedTool(null)
    setSubmitted(false)
    setModalStep(null)
    autoSubmittedRef.current = false
  }

  const handleRetry = () => {
    resetAll()
    onRetry?.()
  }

  const handleMenu = () => {
    resetAll()
    onBackToMenu?.()
  }

  const handleNext = () => {
    resetAll()
    onNextLevel?.()
  }

  const lockList = LOCKED_KEYS.map((k) => LOCK_REGIONS[k]).filter(Boolean)
  const pct = Math.round((Math.max(0, timeLeft) / (totalTime || LEVEL_TIME)) * 100)
  const mm = Math.floor(Math.max(0, timeLeft) / 60)
  const ss = String(Math.max(0, timeLeft) % 60).padStart(2, '0')

  const allowFridgeDrop = (e) => { if (!submitted) e.preventDefault() }
  const handleFridgeDrop = (e) => {
    if (submitted) return
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain')
    if (data?.startsWith('food:')) carryToFridge(data.slice(5))
  }
  const handleFridgeClick = () => {
    if (submitted) return
    if (selectedId) {
      carryToFridge(selectedId)
    } else if (!allInFridge) {
      if (allReady) {
        flash('Select or drag a prepped container into the fridge! 🍱')
      } else {
        audio.sfxWrong?.()
        flash('Label and cover containers before putting them in the fridge! 🏷️🥡')
      }
    }
  }

  return (
    <>
      <div className="hud">
        <div className="hud-level">
          <span>Level 19</span>
          <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className={`timer ${timeLeft <= 15 ? 'timer--low' : ''}`}>⏱ {mm}:{ss}</div>
      </div>

      <div className="mp-banner-wrap">
        <div
          className={
            'leak-banner mp-banner' +
            (msg
              ? ' is-alert'
              : allInFridge
                ? ' is-success'
                : allReady
                  ? ' is-action'
                  : ' is-warn')
          }
        >
          <span className="leak-banner-icon">
            {msg ? '⚠️' : allInFridge ? '✨' : allReady ? '🧊' : '⚠️'}
          </span>
          <span className="leak-banner-text">
            {msg ||
              (allInFridge
                ? 'All containers packed in the fridge! Press Check Answers.'
                : allReady
                  ? 'All containers ready — carry them into the fridge!'
                  : 'Label and cover every container before putting it in the fridge')}
          </span>
        </div>
      </div>

      <div className="board board--mealprep">
        <div className="fridge-scene">
          <div className="fridge-img-wrap">
            <img className="fridge-photo" src={FRIDGE_IMG} alt="Fridge" draggable="false" />

            {lockList.map((r, i) => (
              <div key={'ov' + i} className="lock-overlay"
                style={{ left: r.left, top: r.top, width: r.width, height: r.height }} />
            ))}

            <div
              className={'mp-fridge-zone' + (fridgeFoods.length > 0 ? ' mp-fridge-zone--filled' : '') + (selectedId ? ' mp-fridge-zone--active' : '')}
              style={FRIDGE_ZONE}
              onDragOver={allowFridgeDrop}
              onDrop={handleFridgeDrop}
              onClick={handleFridgeClick}
            >
              {fridgeFoods.length > 0 ? (
                fridgeFoods.map((f) => {
                  const mark = submitted
                    ? (scoreResults.itemsReview.find((r) => r.food.id === f.id)?.isCorrect ? 'correct' : 'wrong')
                    : undefined
                  return (
                    <div
                      key={f.id}
                      className={`mp-fridge-card ${mark ? 'mp-fridge-card--' + mark : ''}`}
                      onClick={(e) => { e.stopPropagation(); if (!submitted) returnFood(f.id) }}
                    >
                      <BoxArt food={f} covered={covered[f.id]} labeled={labeled[f.id]} compact />
                      <span className="mp-fridge-card-name">{f.name}</span>
                      {submitted && <span className={`mp-slot-mark mp-slot-mark--${mark}`}>{mark === 'correct' ? '✓' : '✗'}</span>}
                    </div>
                  )
                })
              ) : null}
            </div>

            {lockList.map((r, i) => (
              <span key={'lk' + i} className="fridge-lock"
                style={{ left: `calc(${r.left} + ${r.width} / 2)`, top: `calc(${r.top} + ${r.height} / 2)` }}>
                <LockIcon />
              </span>
            ))}
          </div>
        </div>

        <div className="mp-side">
          <div className="mp-panel">
            <div className="mp-tray">
              {trayFoods.map((f) => (
                <FoodCard
                  key={f.id}
                  food={f}
                  covered={covered[f.id]}
                  labeled={labeled[f.id]}
                  selected={selectedId === f.id}
                  selectedTool={selectedTool}
                  reveal={submitted}
                  onApplyTool={applyTool}
                  onSelect={(id) => setSelectedId((s) => (s === id ? null : id))}
                  onUnreadyClick={handleUnreadyClick}
                />
              ))}
              {trayFoods.length === 0 && <div className="cb-empty">All containers packed away! 🎯</div>}
            </div>
          </div>

          <div className="mp-panel mp-panel--tools">
            <div className="mp-tools-row">
              <ToolChip id="label" label="1. Date Label" selected={selectedTool === 'label'} onSelect={(id) => setSelectedTool((t) => (t === id ? null : id))}>
                <img className="mp-tool-photo-img mp-tool-photo-img--label" src={LABEL_ICON} alt="Date Label" draggable="false" />
              </ToolChip>
              <ToolChip id="lid" label="2. Lid" selected={selectedTool === 'lid'} onSelect={(id) => setSelectedTool((t) => (t === id ? null : id))}>
                <LidGlyph className="mp-tool-lid-glyph" />
              </ToolChip>
            </div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          type="button"
          className={`btn btn-check ${canCheck ? 'btn-pulse' : ''}`}
          disabled={!canCheck || submitted}
          onClick={() => handleSubmit('checked')}
        >
          {canCheck
            ? 'Check Answers'
            : !allReady && trayFoods.length > 0
              ? 'Cover & label every container first'
              : `Carry containers into the fridge (${fridgeFoods.length}/${MEALPREP_FOODS.length})`}
        </button>
      </div>

      {submitted && modalStep === 'feedback' && (
        <Modal>
          <div className={`fb-card ${scoreResults.passed ? '' : 'fb-card--danger'}`}>
            <div className="fb-scroll">
              <div className="fb-icon-row">
                {scoreResults.passed && <span className="fb-sparkle">✨</span>}
                <div className={`fb-icon ${scoreResults.passed ? '' : 'fb-icon--danger'}`}>
                  {scoreResults.passed ? '🔍' : '✕'}
                </div>
                {scoreResults.passed && <span className="fb-sparkle">✨</span>}
              </div>

              <h2 className={`fb-title ${scoreResults.passed ? '' : 'fb-title--danger'}`}>
                {scoreResults.passed ? "Let's Review!" : "Why didn't you pass?"}
              </h2>
              <p className="fb-sub">
                {scoreResults.passed
                  ? 'Great job! Here are the items that need attention.'
                  : "You didn't meet the passing score."}
              </p>

              {scoreResults.passed ? (
                <>
                  <div className="fb-list-head--plain">
                    <span className="fb-list-ico">📋</span> Items to Review
                  </div>
                  <div className="fb-list--plain">
                    {scoreResults.itemsReview.filter((r) => !r.isCorrect).map(({ food, covered: c, labeled: l, inFridge: f }) => {
                      const reasonText = !f
                        ? 'Must be labeled, covered, and placed in the fridge.'
                        : !l && !c
                          ? 'Needs a date label and lid before storing.'
                          : !l
                            ? 'Needs a date label before storing.'
                            : 'Needs a lid cover before storing.'
                      return (
                        <div className="fb-row" key={food.id}>
                          <div className="fb-row-ico">
                            <img src={food.img} alt={food.name} />
                          </div>
                          <div className="fb-row-main">
                            <div className="fb-row-name">{food.name}</div>
                            <div className="fb-row-desc">{reasonText}</div>
                          </div>
                          <span className="fb-row-badge">Needs Attention</span>
                          <span className="fb-row-chevron">›</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="fb-danger-box">
                  <div className="fb-danger-head">Containers that need attention</div>
                  <div className="fb-danger-list">
                    {scoreResults.itemsReview.filter((r) => !r.isCorrect).map(({ food, covered: c, labeled: l, inFridge: f }) => {
                      const reasonText = !f
                        ? 'Must be labeled, covered, and placed in the fridge.'
                        : !l && !c
                          ? 'Needs a date label and lid before storing.'
                          : !l
                            ? 'Needs a date label before storing.'
                            : 'Needs a lid cover before storing.'
                      return (
                        <div className="fb-danger-row" key={food.id}>
                          <div className="fb-row-ico">
                            <img src={food.img} alt={food.name} />
                          </div>
                          <div className="fb-row-main">
                            <div className="fb-row-name">{food.name}</div>
                            <div className="fb-row-desc">{reasonText}</div>
                          </div>
                          <span className="fb-danger-row-x">✕</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-play end-primary fb-next"
              onClick={() => setModalStep('result')}
            >
              {scoreResults.passed ? 'Got it! →' : 'Next →'}
            </button>
          </div>
        </Modal>
      )}

      {submitted && modalStep === 'result' && (
        <Modal>
          {finishReason === 'timeup' && !scoreResults.passed ? (
            <div className="end-card">
              <div className="end-clock">🕐</div>
              <h2 className="end-title">Time Up!</h2>
              <p className="end-sub2">Too bad, you didn't finish sorting in time.</p>
              <div className="stat-row">
                <div className="stat-box">
                  <div className="stat-label">LEVEL SCORE</div>
                  <div className="stat-val stat-val--green">{scoreResults.totalScore} / 70</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">PREPPED &amp; STORED</div>
                  <div className={`stat-val ${scoreResults.correctCount >= 4 ? 'stat-val--green' : 'stat-val--red'}`}>
                    {scoreResults.correctCount} / {MEALPREP_FOODS.length}
                  </div>
                </div>
              </div>
              <button type="button" className="btn btn-play end-primary" onClick={handleRetry}>
                Try Again ↻
              </button>
              <button type="button" className="btn btn-mint" onClick={handleMenu}>
                ⌂ Main Menu
              </button>
            </div>
          ) : !scoreResults.passed ? (
            <div className="end-card">
              <div className="end-clock">😥</div>
              <h2 className="end-title">Not Passed Yet</h2>
              <p className="end-sub">You need at least 60% of the max score to pass this level.</p>
              <div className="stars">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`star ${i < scoreResults.stars ? 'on' : ''}`}>★</span>
                ))}
              </div>
              <div className="stat-row">
                <div className="stat-box">
                  <div className="stat-label">LEVEL SCORE</div>
                  <div className="stat-val stat-val--green">{scoreResults.totalScore} / 70</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">PREPPED &amp; STORED</div>
                  <div className={`stat-val ${scoreResults.correctCount >= 4 ? 'stat-val--green' : 'stat-val--red'}`}>
                    {scoreResults.correctCount} / {MEALPREP_FOODS.length}
                  </div>
                </div>
              </div>
              <button type="button" className="btn btn-play end-primary" onClick={handleRetry}>
                ↻ Retry This Level
              </button>
              <button type="button" className="btn btn-mint" onClick={handleMenu}>
                ⌂ Main Menu
              </button>
            </div>
          ) : (
            <div className="end-card end-card--win">
              <h2 className="end-title end-title--win">Level Completed!</h2>
              <p className="end-sub end-sub--caps">
                {scoreResults.correctCount === MEALPREP_FOODS.length
                  ? 'PERFECTLY ORGANIZED!'
                  : `${scoreResults.correctCount}/${MEALPREP_FOODS.length} SORTED CORRECTLY`}
              </p>

              <div className="stars stars--win">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`star ${i < scoreResults.stars ? 'on' : ''}`}>★</span>
                ))}
              </div>

              <div className="win-scorelabel">Final Score</div>
              <div className="win-score">{scoreResults.totalScore}</div>

              {onNextLevel && (
                <button type="button" className="btn btn-play end-primary" onClick={handleNext}>
                  Next Level →
                </button>
              )}
              <button type="button" className="btn btn-mint" onClick={handleRetry}>
                ↻ Replay
              </button>
              <button type="button" className="btn btn-mint" onClick={handleMenu}>
                ⌂ Main Menu
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
