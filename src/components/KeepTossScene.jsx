import { useState, useMemo, useEffect, useRef } from 'react'
import { KEEP_TOSS_ITEMS } from '../data/levels/level12.js'
import * as audio from '../lib/audio.js'

// Level 12 — "Keep or Toss? เก็บต่อ หรือพอแค่นี้"
// RETIRED — Level 12 now runs on the generic engine as a 'swipecards'
// layout (see components/SwipeCardScene.jsx and data/levels/level12.js),
// so it gets the same shared Hud + Check Answers + result-modal flow as
// every other level. This file is kept only for reference and is no
// longer imported anywhere.
// Four food cards, each already sitting out with a clock on it. The player
// reads the elapsed time and decides KEEP (fridge it) or TOSS (bin it),
// applying the 2-hour rule (1-hour above 32°C ambient) themselves — there's
// no shelf-sorting here, just the clock and the rule.

const ITEMS_BY_ID = Object.fromEntries(KEEP_TOSS_ITEMS.map((f) => [f.id, f]))

// The safe window for THIS food, given its own ambient reading.
const limitFor = (food) => (food.ambientC > 32 ? 60 : 120)

export default function KeepTossScene({
  timeLeft,
  onFinishLevel,
  onBackToMenu,
  onRetry,
  onNextLevel,
}) {
  // foodId -> 'keep' | 'toss' | undefined
  const [decisions, setDecisions] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [shakeId, setShakeId] = useState(null)
  const [glowId, setGlowId] = useState(null)
  const [hoverBin, setHoverBin] = useState(null)
  const [banner, setBanner] = useState({
    type: 'info',
    title: 'Check the Clock',
    text: 'Each dish shows how long it\u2019s been sitting at room temperature. Decide: Keep it, or Toss it?',
  })

  const [submitted, setSubmitted] = useState(false)
  const autoSubmittedRef = useRef(false)

  const decidedCount = KEEP_TOSS_ITEMS.filter((f) => decisions[f.id]).length
  const allDecided = decidedCount === KEEP_TOSS_ITEMS.length

  const decide = (foodId, choice) => {
    if (submitted) return
    const food = ITEMS_BY_ID[foodId]
    if (!food) return

    setDecisions((prev) => ({ ...prev, [foodId]: choice }))
    setSelectedId(null)

    const correct = choice === food.answer
    if (correct) {
      audio.sfxPlace()
      setGlowId(foodId)
      setTimeout(() => setGlowId(null), 1200)
      setBanner({
        type: 'safe',
        title: choice === 'keep' ? 'Good Call — Keep ✔' : 'Good Call — Toss ✔',
        text: `${food.name} at ${food.timeLabel}: ${food.why}`,
      })
    } else {
      audio.sfxWrong()
      setShakeId(foodId)
      setTimeout(() => setShakeId(null), 800)
      setBanner({
        type: 'danger',
        title: choice === 'keep' ? 'Risky Call' : 'Too Cautious',
        text: `${food.name} at ${food.timeLabel}: ${food.why}`,
      })
    }
  }

  const undoDecision = (foodId) => {
    if (submitted) return
    audio.sfxReturn()
    setDecisions((prev) => {
      const next = { ...prev }
      delete next[foodId]
      return next
    })
    if (selectedId === foodId) setSelectedId(null)
  }

  const scoreResults = useMemo(() => {
    let correctCount = 0
    const itemsReview = KEEP_TOSS_ITEMS.map((food) => {
      const choice = decisions[food.id]
      const isCorrect = choice === food.answer
      if (isCorrect) correctCount++
      return { food, choice, isCorrect, limit: limitFor(food) }
    })
    const baseScore = correctCount * 10
    const timeBonus = timeLeft > 0 && decidedCount >= 1 ? 10 : 0
    const totalScore = baseScore + timeBonus
    const passed = baseScore >= 24 // 60% of 40 base points
    const stars = totalScore >= 48 ? 3 : totalScore >= 34 ? 2 : passed ? 1 : 0
    return { correctCount, baseScore, timeBonus, totalScore, passed, stars, itemsReview }
  }, [decisions, timeLeft, decidedCount])

  const handleSubmit = () => {
    if (submitted) return
    setSubmitted(true)
    if (scoreResults.passed) audio.sfxWin()
    else audio.sfxLose()
    onFinishLevel?.({
      score: scoreResults.totalScore,
      stars: scoreResults.stars,
      passed: scoreResults.passed,
    })
  }

  useEffect(() => {
    if (timeLeft <= 0 && !submitted && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted])

  const resetAll = () => {
    setDecisions({})
    setSelectedId(null)
    audio.sfxReturn()
  }

  // ----- Drag & drop -------------------------------------------------------
  const handleDragStart = (e, foodId) => {
    e.dataTransfer.setData('text/plain', foodId)
    e.dataTransfer.effectAllowed = 'move'
    audio.sfxPickup()
  }
  const handleBinDrop = (e, choice) => {
    e.preventDefault()
    setHoverBin(null)
    const foodId = e.dataTransfer.getData('text/plain')
    if (foodId) decide(foodId, choice)
  }

  return (
    <div className="cover-game-container keeptoss-game-container">
      {/* ----- HUD ----- */}
      <header className="cover-hud">
        <div className="cover-hud-main">
          <div className="cover-hud-badge kt-badge">LEVEL 12</div>
          <div className="cover-hud-titles">
            <h1 className="cover-hud-title">Keep or Toss?</h1>
            <span className="cover-hud-sub">เก็บต่อ หรือพอแค่นี้</span>
          </div>
        </div>
        <div className="cover-hud-status">
          <div className="cover-hud-stat">
            <span className="cover-stat-label">TIME</span>
            <span className={`cover-stat-val ${timeLeft <= 15 ? 'is-low' : ''}`}>
              {Math.floor(Math.max(0, timeLeft) / 60)}:{String(Math.max(0, timeLeft) % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="cover-hud-stat">
            <span className="cover-stat-label">DECIDED</span>
            <span className="cover-stat-val cover-stat-progress">
              {decidedCount} / {KEEP_TOSS_ITEMS.length}
            </span>
          </div>
        </div>
      </header>

      {/* ----- Rule reminder ----- */}
      <div className="kt-rule-strip">
        <span className="kt-rule-chip">⏱️ 2-Hour Rule: refrigerate perishable food within 2 hours</span>
        <span className="kt-rule-chip is-warm">🌡️ Above 32°C: only 1 hour</span>
      </div>

      {/* ----- Feedback banner ----- */}
      <div className={`cover-feedback-banner is-${banner.type}`}>
        <strong className="cover-feedback-title">{banner.title}</strong>
        <span className="cover-feedback-body">{banner.text}</span>
      </div>

      <div className="kt-board">
        {/* ----- Food cards ----- */}
        <section className="kt-food-grid">
          {KEEP_TOSS_ITEMS.map((food) => {
            const choice = decisions[food.id]
            const isDecided = !!choice
            const isSelected = selectedId === food.id
            const limit = limitFor(food)
            const overLimit = food.minutesOut > limit
            return (
              <div
                key={food.id}
                className={`kt-food-card ${isDecided ? `is-decided is-${choice}` : ''} ${isSelected ? 'is-selected' : ''} ${shakeId === food.id ? 'animate-shake' : ''} ${glowId === food.id ? 'animate-glow' : ''}`}
                draggable={!isDecided && !submitted}
                onDragStart={(e) => handleDragStart(e, food.id)}
                onClick={() => {
                  if (!submitted && !isDecided) {
                    setSelectedId(isSelected ? null : food.id)
                    audio.sfxClick()
                  }
                }}
              >
                <div className="kt-food-top">
                  <span className="kt-food-icon">{food.icon}</span>
                  <div className={`kt-clock-badge ${overLimit ? 'is-over' : 'is-under'}`}>
                    <span className="kt-clock-time">⏱ {food.timeLabel}</span>
                    <span className="kt-clock-ambient">at {food.ambientC}°C room temp</span>
                  </div>
                </div>

                <div className="kt-food-info">
                  <strong className="kt-food-name">{food.name}</strong>
                  <span className="kt-food-th">{food.thaiName}</span>
                </div>

                <div className="kt-limit-bar">
                  <div
                    className={`kt-limit-fill ${overLimit ? 'is-over' : ''}`}
                    style={{ width: `${Math.min(100, (food.minutesOut / limit) * 100)}%` }}
                  />
                  <span className="kt-limit-label">Safe window: {limit} min</span>
                </div>

                {isDecided ? (
                  <div className="kt-decision-row">
                    <span className={`kt-decision-pill is-${choice}`}>
                      {choice === 'keep' ? '✅ Keep' : '🗑️ Toss'}
                    </span>
                    {!submitted && (
                      <button
                        type="button"
                        className="btn-unpack"
                        onClick={(e) => { e.stopPropagation(); undoDecision(food.id) }}
                        title="Change your decision"
                      >
                        ↺ Undo
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="kt-inline-actions">
                    <button
                      type="button"
                      className="btn kt-btn-keep"
                      onClick={(e) => { e.stopPropagation(); decide(food.id, 'keep') }}
                      disabled={submitted}
                    >
                      ✅ Keep
                    </button>
                    <button
                      type="button"
                      className="btn kt-btn-toss"
                      onClick={(e) => { e.stopPropagation(); decide(food.id, 'toss') }}
                      disabled={submitted}
                    >
                      🗑️ Toss
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {/* ----- Keep / Toss bins (drag targets) ----- */}
        <section className="kt-bins">
          <div
            className={`kt-bin kt-bin-keep ${hoverBin === 'keep' ? 'is-hover' : ''} ${selectedId ? 'is-ready' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (hoverBin !== 'keep') setHoverBin('keep') }}
            onDragLeave={() => setHoverBin(null)}
            onDrop={(e) => handleBinDrop(e, 'keep')}
            onClick={() => { if (selectedId) decide(selectedId, 'keep') }}
          >
            <span className="kt-bin-icon">🧊</span>
            <span className="kt-bin-label">KEEP</span>
            <span className="kt-bin-sub">Back in the fridge</span>
          </div>
          <div
            className={`kt-bin kt-bin-toss ${hoverBin === 'toss' ? 'is-hover' : ''} ${selectedId ? 'is-ready' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (hoverBin !== 'toss') setHoverBin('toss') }}
            onDragLeave={() => setHoverBin(null)}
            onDrop={(e) => handleBinDrop(e, 'toss')}
            onClick={() => { if (selectedId) decide(selectedId, 'toss') }}
          >
            <span className="kt-bin-icon">🗑️</span>
            <span className="kt-bin-label">TOSS</span>
            <span className="kt-bin-sub">Past the safe window</span>
          </div>
        </section>
      </div>

      {/* ----- Footer ----- */}
      <footer className="cover-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={resetAll}
          disabled={submitted || decidedCount === 0}
        >
          Reset All
        </button>
        <div className="cover-footer-center">
          <span className="footer-status-text">
            {allDecided
              ? 'Every dish has a decision. Ready to check your answers.'
              : `${decidedCount} of ${KEEP_TOSS_ITEMS.length} dishes decided.`}
          </span>
        </div>
        <button
          type="button"
          className={`btn btn-play cover-submit-btn ${allDecided ? 'btn-pulse' : ''}`}
          onClick={handleSubmit}
          disabled={decidedCount === 0 || submitted}
        >
          Submit Answers →
        </button>
      </footer>

      {/* ----- Result modal ----- */}
      {submitted && (
        <div className="modal-backdrop">
          <div className="cover-modal-card">
            <header className="cover-modal-header">
              <span className={`modal-status-badge ${scoreResults.passed ? 'is-passed' : 'is-fail'}`}>
                {scoreResults.passed ? 'LEVEL PASSED 🎉' : 'TRY AGAIN 💡'}
              </span>
              <h2 className="cover-modal-headline">Know the window, keep it safe.</h2>
              <span className="cover-modal-thai-sub">เก็บต่อ หรือพอแค่นี้ — The 2-Hour Rule</span>
            </header>

            <div className="cover-modal-scores">
              <div className="modal-star-row">
                {['★', '★', '★'].map((star, idx) => (
                  <span key={idx} className={`modal-star ${idx < scoreResults.stars ? 'is-lit' : ''}`}>{star}</span>
                ))}
              </div>
              <div className="modal-score-numbers">
                <span className="score-total-val">{scoreResults.totalScore}</span>
                <span className="score-total-max">/ 50 PTS</span>
              </div>
              <div className="score-breakdown-row">
                <span>Right Calls: <strong>{scoreResults.baseScore}/40</strong></span>
                <span>Time Bonus: <strong>+{scoreResults.timeBonus}</strong></span>
              </div>
            </div>

            <div className="cover-learning-box">
              <div className="learning-box-title">
                <span>🛡️ Official Food Safety Principle</span>
                <span className="learning-cite">MOPH Standard B.E. 2564 (2021)</span>
              </div>
              <p className="learning-box-text">
                Perishable food should go back into the fridge <strong>within 2 hours</strong> of being left at room temperature — or within just <strong>1 hour if the room is above 32°C</strong>. Past that window, bacteria in the 5–60°C danger zone have multiplied enough to make the food unsafe.
              </p>
            </div>

            <div className="cover-review-list">
              <h3 className="review-heading">Your Decisions</h3>
              {scoreResults.itemsReview.map(({ food, choice, isCorrect, limit }) => (
                <div key={food.id} className={`review-row ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                  <div className="review-food-info">
                    <span className="review-food-ico">{food.icon}</span>
                    <strong className="review-food-name">{food.name}</strong>
                    <span className="review-food-time">⏱ {food.timeLabel} / {limit}-min window</span>
                  </div>
                  <div className="review-container-info">
                    {choice ? (
                      <span className="review-container-tag">
                        {choice === 'keep' ? '✅ Kept' : '🗑️ Tossed'}
                      </span>
                    ) : (
                      <span className="review-container-tag is-missing">No Decision</span>
                    )}
                  </div>
                  <div className="review-outcome">
                    {isCorrect ? (
                      <span className="outcome-pill is-safe">✅ Correct — should {food.answer} (+10)</span>
                    ) : (
                      <span className="outcome-pill is-risk">❌ Should {food.answer} (0)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <footer className="cover-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setSubmitted(false); resetAll(); onBackToMenu?.() }}
              >
                Level Select
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSubmitted(false)
                  autoSubmittedRef.current = false
                  resetAll()
                  onRetry?.()
                }}
              >
                Try Again ↺
              </button>
              {scoreResults.passed && onNextLevel && (
                <button
                  type="button"
                  className="btn btn-play"
                  onClick={() => { setSubmitted(false); onNextLevel() }}
                >
                  Next Level →
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
