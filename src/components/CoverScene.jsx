import { useState, useMemo, useEffect, useRef } from 'react'
import { FRIDGE_IMG, LEVEL_TIME } from '../gameData.js'
import { COVER_FOODS, COVER_CONTAINERS } from '../data/levels/level06.js'
import { LOCK_REGIONS } from './Fridge.jsx'
import ItemChip from './ItemChip.jsx'
import * as audio from '../lib/audio.js'

// Level 6 — "Cover Me! ปิดก่อนแช่"
// Same two-phase mechanic as the cutting-board level: drag food onto a
// container, then carry that container into the fridge. Unlike the cutting
// boards (which are just colour swatches), each container here is drawn as
// a distinct shape — a box with a lid, an open plate, an open bag, a
// clamp-sealed box — so it's clear at a glance what each one is.

const TOP_ZONE = { left: '4%', top: '1%', width: '44%', height: '16.5%' }
const OTHER_LOCKS = ['leftUpperMid', 'leftMid', 'crisper', 'leftFreezer', 'door', 'freezerRight']
const CONTAINERS_BY_ID = Object.fromEntries(COVER_CONTAINERS.map((c) => [c.id, c]))

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

// One distinct flat-icon silhouette per container type — this is the whole
// point of the redesign: a player should recognise "lid", "plate", "bag" or
// "clamped box" from the shape alone, no label required.
function ContainerArt({ id }) {
  switch (id) {
    case 'box-lid':
      return (
        <svg viewBox="0 0 64 64" className="pk-art">
          <rect x="10" y="26" width="44" height="26" rx="6" fill="#f6d9a8" stroke="#c98a3e" strokeWidth="2" />
          <rect x="8" y="17" width="48" height="11" rx="5" fill="#f0956b" stroke="#c1613a" strokeWidth="2" />
          <rect x="27" y="12" width="10" height="7" rx="2" fill="#f0956b" stroke="#c1613a" strokeWidth="2" />
        </svg>
      )
    case 'open-plate':
      return (
        <svg viewBox="0 0 64 64" className="pk-art">
          <ellipse cx="32" cy="36" rx="27" ry="16" fill="#eef2f0" stroke="#b9c2bd" strokeWidth="2" />
          <ellipse cx="32" cy="35" rx="16" ry="9" fill="#ffffff" stroke="#d7dedb" strokeWidth="1.5" />
          <path d="M21 34c3-4 8-4 11 0s8 4 11 0" fill="none" stroke="#e4573b" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      )
    case 'open-bag':
      return (
        <svg viewBox="0 0 64 64" className="pk-art">
          <path d="M17 28 L21 54 a4 4 0 0 0 4 4h14 a4 4 0 0 0 4-4 L47 28 Z" fill="#cfe8f7" stroke="#5b9bd5" strokeWidth="2" />
          <path d="M17 28 C12 19 21 12 25 21" fill="none" stroke="#5b9bd5" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M47 28 C52 19 43 12 39 21" fill="none" stroke="#5b9bd5" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      )
    case 'airtight-box':
      return (
        <svg viewBox="0 0 64 64" className="pk-art">
          <rect x="10" y="20" width="44" height="30" rx="6" fill="#dff3ea" stroke="#57c4a6" strokeWidth="2" />
          <rect x="10" y="20" width="44" height="9" rx="4" fill="#bfe8d8" stroke="#57c4a6" strokeWidth="2" />
          <rect x="4" y="30" width="7" height="12" rx="2" fill="#57c4a6" />
          <rect x="53" y="30" width="7" height="12" rx="2" fill="#57c4a6" />
        </svg>
      )
    default:
      return null
  }
}

// A container: holds food (drag food onto it), and can itself be carried
// into the fridge (drag the container in). Same shape as the cutting
// board's Board component, just drawn differently.
function Container({ container, foods, carried, reveal, onDropFood, onReturnFood, onPickUp }) {
  const draggable = !carried && !reveal
  const onDragStart = (e) => {
    if (!draggable) return
    e.dataTransfer.setData('text/plain', 'container:' + container.id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const allowDrop = (e) => { if (!reveal) e.preventDefault() }
  const handleDrop = (e) => {
    if (reveal) return
    const data = e.dataTransfer.getData('text/plain')
    if (!data || data.startsWith('container:')) return
    e.preventDefault()
    e.stopPropagation()
    onDropFood(data, container.id)
  }
  return (
    <div
      className={`pk-container ${container.isSafe ? 'is-safe' : 'is-risky'} ${carried ? 'is-carried' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={allowDrop}
      onDrop={handleDrop}
      onClick={() => { if (draggable) onPickUp?.(container.id) }}
    >
      <ContainerArt id={container.id} />
      <div className="pk-container-items">
        {foods.map((f) => (
          <ItemChip
            key={f.id}
            item={f}
            small
            iconOnly
            onClick={(e) => { e.stopPropagation(); if (!reveal) onReturnFood(f.id) }}
          />
        ))}
      </div>
      <span className="pk-container-name">{container.name}</span>
    </div>
  )
}

export default function CoverScene({
  timeLeft,
  totalTime = LEVEL_TIME,
  onFinishLevel,
  onBackToMenu,
  onRetry,
  onNextLevel,
}) {
  // foodId -> containerId | undefined (step 1)
  const [packPlacements, setPackPlacements] = useState({})
  // containerId -> 'top' | undefined (step 2)
  const [containerFridge, setContainerFridge] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const autoSubmittedRef = useRef(false)

  const foodsOn = (containerId) => COVER_FOODS.filter((f) => packPlacements[f.id] === containerId)
  const trayFoods = COVER_FOODS.filter((f) => !packPlacements[f.id])

  const packFood = (foodId, containerId) => {
    if (submitted) return
    audio.sfxPlace()
    setPackPlacements((p) => ({ ...p, [foodId]: containerId }))
    setSelectedId(null)
  }
  const unpackFood = (foodId) => {
    if (submitted) return
    audio.sfxReturn()
    setPackPlacements((p) => {
      const next = { ...p }
      delete next[foodId]
      return next
    })
  }
  const carryContainer = (containerId, shelfId) => {
    if (submitted) return
    audio.sfxPlace()
    setContainerFridge((p) => ({ ...p, [containerId]: shelfId }))
  }
  const returnContainer = (containerId) => {
    if (submitted) return
    audio.sfxReturn()
    setContainerFridge((p) => {
      const next = { ...p }
      delete next[containerId]
      return next
    })
  }

  const usedContainerIds = [...new Set(Object.values(packPlacements).filter(Boolean))]
  const allPacked = COVER_FOODS.every((f) => packPlacements[f.id])
  const allCarried = usedContainerIds.every((cid) => containerFridge[cid] != null)
  const canCheck = allPacked && allCarried

  const scoreResults = useMemo(() => {
    let correctCount = 0
    const itemsReview = COVER_FOODS.map((food) => {
      const containerId = packPlacements[food.id]
      const container = CONTAINERS_BY_ID[containerId]
      const carried = containerId ? containerFridge[containerId] != null : false
      const isCorrect = !!container?.isSafe && carried
      if (isCorrect) correctCount++
      return { food, container, carried, isCorrect }
    })
    const baseScore = correctCount * 10
    const timeBonus = timeLeft > 0 && usedContainerIds.length >= 1 ? 10 : 0
    const totalScore = baseScore + timeBonus
    const passed = baseScore >= 24 // 60% of 40 base points
    const stars = totalScore >= 48 ? 3 : totalScore >= 34 ? 2 : passed ? 1 : 0
    return { correctCount, baseScore, timeBonus, totalScore, passed, stars, itemsReview }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packPlacements, containerFridge, timeLeft])

  const handleSubmit = () => {
    if (submitted) return
    setSubmitted(true)
    if (scoreResults.passed) audio.sfxWin()
    else audio.sfxLose()
    onFinishLevel?.({ score: scoreResults.totalScore, stars: scoreResults.stars, passed: scoreResults.passed })
  }

  useEffect(() => {
    if (timeLeft <= 0 && !submitted && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted])

  const resetAll = () => {
    setPackPlacements({})
    setContainerFridge({})
    setSelectedId(null)
  }

  const lockList = OTHER_LOCKS.map((k) => LOCK_REGIONS[k]).filter(Boolean)
  const pct = Math.round((Math.max(0, timeLeft) / (totalTime || LEVEL_TIME)) * 100)
  const mm = Math.floor(Math.max(0, timeLeft) / 60)
  const ss = String(Math.max(0, timeLeft) % 60).padStart(2, '0')

  const containersOnShelf = COVER_CONTAINERS.filter((c) => containerFridge[c.id] === 'top')
  const containersOnCounter = COVER_CONTAINERS.filter((c) => containerFridge[c.id] == null)

  return (
    <>
      <div className="hud">
        <div className="hud-level">
          <span>Level 6</span>
          <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className={`timer ${timeLeft <= 15 ? 'timer--low' : ''}`}>⏱ {mm}:{ss}</div>
      </div>

      <div className="fridge-scene">
        <div className="fridge-img-wrap">
          <img className="fridge-photo" src={FRIDGE_IMG} alt="Fridge" draggable="false" />

          {lockList.map((r, i) => (
            <div key={'ov' + i} className="lock-overlay"
              style={{ left: r.left, top: r.top, width: r.width, height: r.height }} />
          ))}

          <div
            className={'cb-slot' + (containersOnShelf.length > 0 ? ' cb-slot--filled' : '')}
            style={TOP_ZONE}
            onDragOver={(e) => { if (!submitted) e.preventDefault() }}
            onDrop={(e) => {
              if (submitted) return
              const data = e.dataTransfer.getData('text/plain')
              if (data && data.startsWith('container:')) { e.preventDefault(); carryContainer(data.slice(10), 'top') }
            }}
          >
            {containersOnShelf.length > 0 ? (
              containersOnShelf.map((c) => (
                <Container
                  key={c.id}
                  container={c}
                  foods={foodsOn(c.id)}
                  carried
                  reveal={submitted}
                  onDropFood={packFood}
                  onReturnFood={unpackFood}
                  onPickUp={returnContainer}
                />
              ))
            ) : (
              <span className="cb-slot-hint">Place a container</span>
            )}
          </div>

          {lockList.map((r, i) => (
            <span key={'lk' + i} className="fridge-lock"
              style={{ left: `calc(${r.left} + ${r.width} / 2)`, top: `calc(${r.top} + ${r.height} / 2)` }}>
              <LockIcon />
            </span>
          ))}
        </div>
      </div>

      <div className="cb-panel">
        <div className="cb-panel-title"><span className="cb-step-num">1</span> Drag food onto a container</div>
        <div className="cb-tray-items">
          {trayFoods.map((f) => (
            <ItemChip
              key={f.id}
              item={f}
              selected={selectedId === f.id}
              onClick={() => setSelectedId((s) => (s === f.id ? null : f.id))}
            />
          ))}
          {trayFoods.length === 0 && <div className="cb-empty">All food packed! ✓</div>}
        </div>

        <div className="cb-panel-title"><span className="cb-step-num">2</span> Then carry it into the fridge</div>
        <div className="pk-container-row">
          {containersOnCounter.map((c) => (
            <Container
              key={c.id}
              container={c}
              foods={foodsOn(c.id)}
              carried={false}
              reveal={submitted}
              onDropFood={packFood}
              onReturnFood={unpackFood}
            />
          ))}
          {containersOnCounter.length === 0 && <div className="cb-empty">All containers stored! 🎯</div>}
        </div>
      </div>

      <div className="actions">
        <button
          type="button"
          className={`btn btn-check ${canCheck ? 'btn-pulse' : ''}`}
          disabled={!canCheck || submitted}
          onClick={handleSubmit}
        >
          {canCheck
            ? 'Check Answers ✓'
            : !allPacked
              ? `Pack all food (${COVER_FOODS.length - trayFoods.length}/${COVER_FOODS.length})`
              : `Carry containers into the fridge (${usedContainerIds.filter((c) => containerFridge[c] != null).length}/${usedContainerIds.length})`}
        </button>
      </div>

      {/* ----- Result modal ----- */}
      {submitted && (
        <div className="modal-backdrop">
          <div className="cover-modal-card">
            <header className="cover-modal-header">
              <span className={`modal-status-badge ${scoreResults.passed ? 'is-passed' : 'is-fail'}`}>
                {scoreResults.passed ? 'LEVEL PASSED 🎉' : 'TRY AGAIN 💡'}
              </span>
              <h2 className="cover-modal-headline">Cover it before you chill it!</h2>
              <span className="cover-modal-thai-sub">ปิดก่อนแช่</span>
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
            </div>

            <div className="cover-review-list">
              {scoreResults.itemsReview.map(({ food, container, isCorrect }) => (
                <div key={food.id} className={`review-row ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                  <div className="review-food-info">
                    <img className="review-food-thumb" src={food.img} alt={food.label} />
                    <strong className="review-food-name">{food.label}</strong>
                  </div>
                  <div className="review-container-info">
                    {container ? (
                      <span className="review-container-tag">{container.name}</span>
                    ) : (
                      <span className="review-container-tag is-missing">Not Packed</span>
                    )}
                  </div>
                  <div className="review-outcome">
                    {isCorrect ? (
                      <span className="outcome-pill is-safe">✅ +10</span>
                    ) : (
                      <span className="outcome-pill is-risk">❌ 0</span>
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
    </>
  )
}
