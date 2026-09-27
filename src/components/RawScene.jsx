import { useCallback, useEffect, useRef, useState } from 'react'
import * as audio from '../lib/audio.js'
import fridgeImg from '../assets/level33/fridge.png'
import saladImg from '../assets/level2/salad.png'
import cakeImg from '../assets/level2/cake.png'
import milkImg from '../assets/level2/milk.png'
import eggsImg from '../assets/level2/eggs.png'
import rawChickenImg from '../assets/level2/raw-chicken.png'
import rawPorkImg from '../assets/level2/raw-pork.png'
import rawSalmonImg from '../assets/raw-salmon.png'
import shrimpImg from '../assets/level4/shrimp.svg'
import { ROW_Y } from '../data/fridgeRows.js'

// Level 7 — "Raw Goes Low! ของดิบ อย่าให้หยด!"
// -----------------------------------------------------------------------
// Hands-on realistic fridge scene, same design language as Level 18 (LeakScene):
//   1. Pack raw meats & seafood into leak-proof sealed containers
//      (airtight box or box with lid; open plates and open bags will drip!).
//   2. Carry them into the fridge and store them on the LOWEST (bottom) shelf,
//      below ready-to-eat foods like salad and cake.
// If placed above ready-to-eat foods or left unsealed, juices drip and warn
// of cross-contamination!

const CROP = 0.54 // Shows rows 1, 2, and 3 with plenty of room on the bottom shelf deck
const IMG_RATIO = 472 / 1015
const TAP_SLOP = 6

export const CONTAINERS = [
  {
    id: 'airtight-box',
    name: 'Airtight Box',
    thaiName: 'กล่องสุญญากาศ',
    isSafe: true,
    badge: 'Leak-proof ✓',
    icon: '🥡',
    hint: 'Seals tight, zero leaks',
  },
  {
    id: 'box-lid',
    name: 'Box with Lid',
    thaiName: 'กล่องมีฝาปิด',
    isSafe: true,
    badge: 'Sealed ✓',
    icon: '📦',
    hint: 'Firm lid stops drips',
  },
  {
    id: 'open-plate',
    name: 'Open Plate',
    thaiName: 'จานไม่มีฝา',
    isSafe: false,
    badge: 'Drips ⚠️',
    icon: '🍽️',
    hint: 'Juices can spill over',
  },
  {
    id: 'open-bag',
    name: 'Open Bag',
    thaiName: 'ถุงเปิดปาก',
    isSafe: false,
    badge: 'Leaks ⚠️',
    icon: '🛍️',
    hint: 'Liquid seeps out',
  },
]

export const RAW_FOODS = [
  {
    id: 'raw-chicken',
    name: 'Raw Chicken',
    thaiName: 'อกไก่สด',
    dripName: 'น้ำเนื้อไก่สด (เชื้อซาลโมเนลลา)',
    img: rawChickenImg,
    icon: '🍗',
    shelfId: 'done-chicken',
  },
  {
    id: 'raw-pork',
    name: 'Raw Pork',
    thaiName: 'หมูดิบ',
    dripName: 'น้ำเลือดหมูดิบ',
    img: rawPorkImg,
    icon: '🥩',
    shelfId: 'done-pork',
  },
  {
    id: 'raw-salmon',
    name: 'Raw Salmon',
    thaiName: 'แซลมอนสด',
    dripName: 'น้ำคาวปลาดิบ',
    img: rawSalmonImg,
    icon: '🐟',
    shelfId: 'done-salmon',
  },
  {
    id: 'shrimp',
    name: 'Fresh Shrimp',
    thaiName: 'กุ้งสด',
    dripName: 'น้ำคาวกุ้งสด',
    img: shrimpImg,
    icon: '🦐',
    shelfId: 'done-shrimp',
  },
]

function ContainerSvg({ id }) {
  switch (id) {
    case 'airtight-box':
      return (
        <svg viewBox="0 0 64 64" className="raw-box-art" aria-hidden="true">
          <rect x="8" y="22" width="48" height="30" rx="7" fill="rgba(190, 240, 230, 0.7)" stroke="#22a688" strokeWidth="2.5" />
          <rect x="8" y="20" width="48" height="9" rx="4" fill="#6ee7b7" stroke="#22a688" strokeWidth="2.5" />
          <rect x="3" y="29" width="6" height="13" rx="2" fill="#22a688" />
          <rect x="55" y="29" width="6" height="13" rx="2" fill="#22a688" />
          <path d="M18 36l3 12M32 36l1 12M46 36l-2 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      )
    case 'box-lid':
      return (
        <svg viewBox="0 0 64 64" className="raw-box-art" aria-hidden="true">
          <rect x="9" y="25" width="46" height="28" rx="6" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
          <rect x="7" y="16" width="50" height="11" rx="5" fill="#f59e0b" stroke="#b45309" strokeWidth="2.5" />
          <rect x="26" y="11" width="12" height="7" rx="2" fill="#d97706" />
          <path d="M18 37l2 12M32 37v12M44 37l-2 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      )
    case 'open-plate':
      return (
        <svg viewBox="0 0 64 64" className="raw-box-art" aria-hidden="true">
          <ellipse cx="32" cy="38" rx="28" ry="16" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2.5" />
          <ellipse cx="32" cy="37" rx="18" ry="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" />
          <path d="M22 36c3-3 7-3 10 0s7 3 10 0" fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )
    case 'open-bag':
      return (
        <svg viewBox="0 0 64 64" className="raw-box-art" aria-hidden="true">
          {/* Handles */}
          <path d="M 12 24 C 10 10, 18 6, 21 8 C 24 10, 23 18, 21 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 43 24 C 41 18, 40 10, 43 8 C 46 6, 54 10, 52 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
          {/* Bag body */}
          <path d="M 12 24 C 8 36, 10 48, 16 56 H 48 C 54 48, 56 36, 52 24 Q 32 30, 12 24 Z" fill="rgba(191, 219, 254, 0.65)" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
          {/* Plastic crinkles */}
          <path d="M 21 28 C 18 38, 22 46, 26 54" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M 43 28 C 46 38, 42 46, 38 54" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
          {/* Open mouth indicator */}
          <path d="M 12 24 Q 32 30, 52 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="3 2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

export default function RawScene({ placements, reveal, hintShelfId, onPlace }) {
  // foodId -> containerId
  const [foodContainers, setFoodContainers] = useState({})
  // drag: { kind: 'food' | 'packed', id, x, y }
  const [drag, setDrag] = useState(null)
  // picked for tap-to-use: { kind: 'food' | 'packed', id }
  const [picked, setPicked] = useState(null)
  // feedback banner message
  const [msg, setMsg] = useState('')
  // hover states
  const [overZone, setOverZone] = useState(null) // 'top' | 'mid' | 'bottom'
  const [overContainerId, setOverContainerId] = useState(null)
  // drip feedback: { shelf: 'top' | 'mid' | 'bottom', label: string }
  const [drip, setDrip] = useState(null)
  const [shakeShelf, setShakeShelf] = useState(null)

  const innerRef = useRef(null)
  const topShelfRef = useRef(null)
  const midShelfRef = useRef(null)
  const bottomShelfRef = useRef(null)
  const containerRefs = useRef({})
  const msgTimer = useRef(null)
  const dripTimer = useRef(null)
  const gesture = useRef(null)
  const latest = useRef({})

  const isPlaced = useCallback((foodId) => {
    if (reveal) return true
    const food = RAW_FOODS.find((f) => f.id === foodId)
    return food && placements[foodId] === food.shelfId
  }, [placements, reveal])

  const storedCount = RAW_FOODS.filter((f) => isPlaced(f.id)).length
  const allStored = storedCount === RAW_FOODS.length

  latest.current = { foodContainers, placements, reveal, onPlace, isPlaced }

  const flash = useCallback((text) => {
    setMsg(text)
    clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setMsg(''), 3000)
  }, [])

  const triggerDrip = useCallback((shelf, label) => {
    clearTimeout(dripTimer.current)
    setDrip({ shelf, label })
    setShakeShelf(shelf)
    audio.sfxWrong()
    dripTimer.current = setTimeout(() => {
      setDrip(null)
      setShakeShelf(null)
    }, 2400)
  }, [])

  useEffect(() => () => {
    clearTimeout(msgTimer.current)
    clearTimeout(dripTimer.current)
  }, [])

  // ----- Pack a raw food into a container ---------------------------------
  const packFood = (foodId, containerId) => {
    if (reveal) return
    const container = CONTAINERS.find((c) => c.id === containerId)
    const food = RAW_FOODS.find((f) => f.id === foodId)
    if (!container || !food) return

    setFoodContainers((prev) => ({ ...prev, [foodId]: containerId }))
    setPicked({ kind: 'packed', id: foodId })

    if (container.isSafe) {
      audio.sfxPlace()
      flash(`ปิดฝา ${food.name} ใน ${container.name} เรียบร้อย! นำไปใส่ชั้นล่างสุดได้เลย 🧊`)
    } else {
      audio.sfxWrong()
      flash(`⚠️ ระวัง! ${container.name} ไม่มีฝาปิดสนิท น้ำจาก ${food.name} อาจหยดเลอะได้!`)
    }
  }

  const unpackFood = (foodId) => {
    if (reveal) return
    audio.sfxReturn()
    setFoodContainers((prev) => {
      const next = { ...prev }
      delete next[foodId]
      return next
    })
    const food = RAW_FOODS.find((f) => f.id === foodId)
    if (food && placements[foodId]) {
      onPlace(foodId, null)
    }
    if (picked?.id === foodId) setPicked(null)
    flash('เปลี่ยนภาชนะสำหรับใส่ของดิบ 📦')
  }

  // ----- Store a packed food onto a fridge shelf -------------------------
  const storeOnShelf = (foodId, targetShelf) => {
    if (reveal) return
    const food = RAW_FOODS.find((f) => f.id === foodId)
    if (!food) return
    const containerId = foodContainers[foodId]
    const container = CONTAINERS.find((c) => c.id === containerId)

    // Check if food was packed in a container first
    if (!container) {
      triggerDrip(targetShelf || 'bottom', `${food.dripName} หยดเลอะ!`)
      flash(`⚠️ ต้องใส่กล่องปิดฝาก่อนเข้าตู้เย็น! (${food.name} ยังไม่ได้ใส่กล่อง)`)
      return
    }

    // Wrong shelf: Top Shelf (Ready-to-Eat)
    if (targetShelf === 'top') {
      triggerDrip('top', `${food.dripName} หยดใส่สลัด!`)
      flash(`🚨 ห้ามวางของดิบชั้นบนเด็ดขาด! น้ำหยดใส่อาหารพร้อมทาน (สลัด/เค้ก) แน่นอน!`)
      return
    }

    // Wrong shelf: Middle Shelf (Cooked / Dairy)
    if (targetShelf === 'mid') {
      triggerDrip('mid', `${food.dripName} หยดเลอะชั้นกลาง!`)
      flash(`⚠️ ชั้นกลางยังสูงเกินไป! ของดิบต้องอยู่ชั้นล่างสุดเท่านั้น (Raw Goes Low!)`)
      return
    }

    // Target shelf: Bottom Shelf
    if (targetShelf === 'bottom') {
      // Check if container leaks
      if (!container.isSafe) {
        triggerDrip('bottom', `${food.dripName} ไหลซึมออกมา!`)
        flash(`⚠️ ${container.name} ไม่มีฝาปิดสนิท น้ำดิบจะซึมเปื้อนตู้เย็น! กรุณาใช้กล่องปิดมิดชิด`)
        return
      }

      // Safe container on Bottom Shelf -> SUCCESS!
      audio.sfxPlace()
      onPlace(food.id, food.shelfId)
      setPicked(null)
      flash(`เยี่ยมมาก! ${food.name} ปิดฝาสนิท แช่ที่ชั้นล่างสุดเรียบร้อยแล้ว ไม่หยดใส่อาหารอื่น ✔`)
    }
  }

  // Remove from bottom shelf back to counter
  const removeFromFridge = (foodId) => {
    if (reveal) return
    audio.sfxReturn()
    onPlace(foodId, null)
    setPicked({ kind: 'packed', id: foodId })
    flash('หยิบของดิบออกมาปรับเปลี่ยน ↺')
  }

  // ----- Drag & Drop Logic (Mouse + Touch) -------------------------------
  const startDrag = (kind, id) => (e) => {
    if (reveal) return
    if (isPlaced(id)) return
    e.preventDefault()
    gesture.current = { kind, id, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, travelled: 0 }
    setDrag({ kind, id, x: e.clientX, y: e.clientY })
    audio.sfxPickup()
  }

  const dragId = drag?.id
  useEffect(() => {
    if (!dragId) return undefined

    const hitRect = (ref, pad = 12) => {
      const b = ref.current?.getBoundingClientRect()
      return b ? { left: b.left - pad, right: b.right + pad, top: b.top - pad, bottom: b.bottom + pad } : null
    }

    const isHit = (rect, x, y) => rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom

    const move = (e) => {
      const g = gesture.current
      if (!g) return
      g.travelled = Math.hypot(e.clientX - g.sx, e.clientY - g.sy)
      g.lx = e.clientX
      g.ly = e.clientY
      setDrag({ kind: g.kind, id: g.id, x: e.clientX, y: e.clientY })

      // Check collision with fridge shelves
      const topRect = hitRect(topShelfRef)
      const midRect = hitRect(midShelfRef)
      const bottomRect = hitRect(bottomShelfRef, 20)

      if (isHit(topRect, e.clientX, e.clientY)) {
        setOverZone('top')
      } else if (isHit(midRect, e.clientX, e.clientY)) {
        setOverZone('mid')
      } else if (isHit(bottomRect, e.clientX, e.clientY)) {
        setOverZone('bottom')
      } else {
        setOverZone(null)
      }

      // Check collision with counter containers (when dragging raw food)
      let hitContainer = null
      if (g.kind === 'food') {
        CONTAINERS.forEach((c) => {
          const r = hitRect({ current: containerRefs.current[c.id] })
          if (isHit(r, e.clientX, e.clientY)) hitContainer = c.id
        })
      }
      setOverContainerId(hitContainer)
    }

    const up = (e) => {
      const g = gesture.current
      gesture.current = null
      setDrag(null)
      setOverZone(null)
      setOverContainerId(null)
      if (!g) return

      // Tap fallback
      if (g.travelled < TAP_SLOP) {
        setPicked((p) => (p?.id === g.id ? null : { kind: g.kind, id: g.id }))
        return
      }

      // Dropped on a container
      if (g.kind === 'food') {
        let droppedOnContainer = null
        CONTAINERS.forEach((c) => {
          const r = hitRect({ current: containerRefs.current[c.id] })
          if (isHit(r, e.clientX, e.clientY)) droppedOnContainer = c.id
        })

        if (droppedOnContainer) {
          packFood(g.id, droppedOnContainer)
          return
        }
      }

      // Dropped onto fridge shelves
      const topRect = hitRect(topShelfRef)
      const midRect = hitRect(midShelfRef)
      const bottomRect = hitRect(bottomShelfRef, 22)

      if (isHit(topRect, e.clientX, e.clientY)) {
        storeOnShelf(g.id, 'top')
      } else if (isHit(midRect, e.clientX, e.clientY)) {
        storeOnShelf(g.id, 'mid')
      } else if (isHit(bottomRect, e.clientX, e.clientY)) {
        storeOnShelf(g.id, 'bottom')
      }
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [dragId, isPlaced])

  // Tap-to-use fallbacks
  const onContainerClick = (containerId) => {
    if (reveal) return
    if (picked?.kind === 'food') {
      packFood(picked.id, containerId)
    } else {
      flash('เลือกของดิบก่อน แล้วแตะกล่องนี้เพื่อบรรจุ 🍗→📦')
    }
  }

  const onShelfZoneClick = (targetShelf) => {
    if (reveal) return
    if (picked) {
      storeOnShelf(picked.id, targetShelf)
    } else if (targetShelf === 'bottom') {
      flash('แตะของดิบที่ปิดฝาแล้ว แล้วแตะชั้นล่างนี้เพื่อจัดเก็บ 📦→❄️')
    }
  }

  const dragging = !!drag
  const draggedFood = drag ? RAW_FOODS.find((f) => f.id === drag.id) : null
  const draggedContainer = drag && foodContainers[drag.id] ? CONTAINERS.find((c) => c.id === foodContainers[drag.id]) : null

  return (
    <div className={'raw-scene' + (dragging ? ' is-dragging' : '')}>
      {/* ----- Top Banner: Clear guidance, warm alerts & celebratory success ----- */}
      <div
        className={
          'raw-banner' +
          (msg
            ? ' is-alert'
            : allStored
              ? ' is-success'
              : storedCount > 0
                ? ' is-action'
                : ' is-warn')
        }
      >
        <span className="raw-banner-icon">
          {msg ? '⚠️' : allStored ? '✨' : storedCount > 0 ? '🧊' : '🍗'}
        </span>
        <span className="raw-banner-text">
          {msg ||
            (allStored
              ? 'ยอดเยี่ยม! จัดเก็บของดิบทุกอย่างปิดฝาสนิทในชั้นล่างสุดเรียบร้อยแล้ว กด "Check Answers" ได้เลย!'
              : storedCount > 0
                ? `จัดเก็บแล้ว ${storedCount}/4 ชิ้น — ลากของดิบที่เหลือใส่กล่องปิดสนิทแล้วแช่ชั้นล่างสุด!`
                : 'ใส่ของดิบลงในกล่องปิดสนิท แล้วนำไปแช่ที่ชั้นล่างสุดของตู้เย็น เพื่อป้องกันน้ำหยดใส่อาหารอื่น 🍗→📦→❄️')}
        </span>
      </div>

      <div className="raw-stage">
        {/* ===================================================================
            LEFT: THE FRIDGE (Cropped view of rows 1, 2, and 3)
            =================================================================== */}
        <div className="raw-fridge">
          <div className="raw-crop" style={{ aspectRatio: `${IMG_RATIO * 1000} / ${1000 * CROP}` }}>
            <div ref={innerRef} className="raw-inner" style={{ aspectRatio: `${IMG_RATIO * 1000} / 1000` }}>
              <img className="raw-fridge-img" src={fridgeImg} alt="Open fridge shelves" draggable="false" />

              {/* ----- Top Shelf: Ready-to-Eat Food (Row 1) ----- */}
              <div
                ref={topShelfRef}
                className={'raw-shelf-zone raw-shelf-zone--top' + (shakeShelf === 'top' ? ' is-shaking' : '') + (overZone === 'top' ? ' is-over' : '')}
                style={{ top: '6%', height: '17%' }}
                onClick={() => onShelfZoneClick('top')}
              >
                <div className="raw-shelf-tag is-rte">
                  <span>🥗 ชั้นบนสุด · Ready-to-Eat (อาหารพร้อมทาน)</span>
                </div>
              </div>

              {/* Ready-to-eat items sitting safely on Top Shelf */}
              <div className="raw-shelf-item" style={{ top: `${ROW_Y[1]}%`, left: '26%' }}>
                <img src={saladImg} alt="Salad" draggable="false" />
                <small>สลัดผัก 🥗</small>
              </div>
              <div className="raw-shelf-item" style={{ top: `${ROW_Y[1]}%`, left: '54%' }}>
                <img src={cakeImg} alt="Cake" draggable="false" />
                <small>เค้กครีม 🍰</small>
              </div>
              <div className="raw-shelf-item" style={{ top: `${ROW_Y[1]}%`, left: '80%' }}>
                <img src={milkImg} alt="Milk" draggable="false" />
                <small>นมสด 🥛</small>
              </div>

              {/* ----- Middle Shelf: Cooked Foods & Dairy (Row 2) ----- */}
              <div
                ref={midShelfRef}
                className={'raw-shelf-zone raw-shelf-zone--mid' + (shakeShelf === 'mid' ? ' is-shaking' : '') + (overZone === 'mid' ? ' is-over' : '')}
                style={{ top: '21.5%', height: '15%' }}
                onClick={() => onShelfZoneClick('mid')}
              >
                <div className="raw-shelf-tag is-mid">
                  <span>🍳 ชั้นกลาง · Cooked Dishes & Eggs (ของปรุงสุก/ไข่)</span>
                </div>
              </div>

              {/* Cooked items sitting on Middle Shelf */}
              <div className="raw-shelf-item" style={{ top: `${ROW_Y[2]}%`, left: '33%' }}>
                <img src={eggsImg} alt="Eggs" draggable="false" />
                <small>ไข่ไก่ 🥚</small>
              </div>
              <div className="raw-shelf-item" style={{ top: `${ROW_Y[2]}%`, left: '72%' }}>
                <span className="raw-cooked-dish-emoji">🍲</span>
                <small>ต้มจืดปรุงสุก</small>
              </div>

              {/* ----- Bottom Shelf: Raw Meat & Seafood (Row 3 — THE TARGET!) ----- */}
              <div
                ref={bottomShelfRef}
                className={
                  'raw-shelf-zone raw-shelf-zone--bottom' +
                  (overZone === 'bottom' ? ' is-over' : '') +
                  (shakeShelf === 'bottom' ? ' is-shaking' : '') +
                  (hintShelfId && !allStored ? ' is-hint' : '')
                }
                style={{ top: '35.5%', height: '17%' }}
                onClick={() => onShelfZoneClick('bottom')}
              >
                <div className="raw-shelf-tag is-raw">
                  <span>🍗 ชั้นล่างสุด · Raw Meat & Seafood (ของดิบ ป้องกันน้ำหยด)</span>
                </div>

                {/* Guide prompt inside empty bottom shelf */}
                {storedCount === 0 && !reveal && (
                  <div className="raw-bottom-prompt">
                    <span>⬇️ วางของดิบปิดฝาที่ชั้นนี้ (Lowest Shelf) ⬇️</span>
                  </div>
                )}
              </div>

              {/* =============================================================
                  ITEMS ACTUALLY PLACED INSIDE THE BOTTOM SHELF FOR REAL!
                  ("แบบชั้นเอาเข้าไปใส่ไรพวกนั้นข้างล่างได้จิงงง")
                  ============================================================= */}
              <div className="raw-stored-deck" style={{ top: `${ROW_Y[3]}%` }}>
                {RAW_FOODS.map((food) => {
                  const placed = isPlaced(food.id)
                  if (!placed) return null
                  const containerId = foodContainers[food.id] || 'airtight-box'
                  const container = CONTAINERS.find((c) => c.id === containerId) || CONTAINERS[0]
                  return (
                    <div
                      key={food.id}
                      className="raw-stored-box"
                      onClick={() => removeFromFridge(food.id)}
                      title={`${food.name} แช่ใน ${container.name} (แตะเพื่อหยิบออก)`}
                    >
                      <div className="raw-stored-box-visual">
                        <ContainerSvg id={container.id} />
                        <img className="raw-stored-food-img" src={food.img} alt={food.name} draggable="false" />
                        <span className="raw-stored-check">✓</span>
                      </div>
                      <small>{food.thaiName}</small>
                    </div>
                  )
                })}
              </div>

              {/* ----- Juice Drip Animation Layer (Cross-contamination warning) ----- */}
              {drip && (
                <div
                  className="raw-drip-stream"
                  style={{
                    top: drip.shelf === 'top' ? '18%' : drip.shelf === 'mid' ? '32%' : '46%',
                  }}
                >
                  <span className="raw-drip-drop raw-drip-drop--1">💧</span>
                  <span className="raw-drip-drop raw-drip-drop--2">💧</span>
                  <span className="raw-drip-drop raw-drip-drop--3">💧</span>
                  <div className="raw-drip-badge">
                    <span>⚠️ {drip.label}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT: COUNTER / PREPARATION STATION
            =================================================================== */}
        <div className="raw-counter">
          {/* Section 1: Raw Meat & Seafood items to pack and store */}
          <div className="raw-section">
            <div className="raw-section-header">
              <span className="raw-step-badge">1</span>
              <div className="raw-section-text">
                <h3>ของดิบที่ต้องจัดเก็บ (Raw Foods)</h3>
                <small>ลากใส่กล่อง หรือแตะเลือกเพื่อบรรจุลงในภาชนะ</small>
              </div>
            </div>

            <div className="raw-foods-grid">
              {RAW_FOODS.map((food) => {
                const stored = isPlaced(food.id)
                const containerId = foodContainers[food.id]
                const container = CONTAINERS.find((c) => c.id === containerId)
                const isSelected = picked?.id === food.id
                const isLifted = drag?.id === food.id

                return (
                  <div
                    key={food.id}
                    className={
                      'raw-food-card' +
                      (stored ? ' is-stored' : '') +
                      (container ? ' is-packed' : '') +
                      (container && !container.isSafe ? ' is-risky' : '') +
                      (isSelected ? ' is-picked' : '') +
                      (isLifted ? ' is-lifted' : '') +
                      (hintShelfId === food.shelfId && !stored ? ' is-hint' : '')
                    }
                    onPointerDown={stored ? undefined : startDrag(container ? 'packed' : 'food', food.id)}
                    title={
                      stored
                        ? `${food.name} อยู่ในตู้เย็นชั้นล่างสุดแล้ว`
                        : container
                          ? `ลาก ${food.name} ไปแช่ในตู้เย็นชั้นล่างสุด`
                          : `ลาก ${food.name} ใส่กล่องปิดสนิท`
                    }
                  >
                    <div className="raw-food-card-left">
                      <div className="raw-food-img-wrap">
                        <img src={food.img} alt={food.name} draggable="false" />
                        <span className="raw-meat-badge">RAW</span>
                      </div>
                      <div className="raw-food-names">
                        <strong>{food.thaiName}</strong>
                        <span>{food.name}</span>
                      </div>
                    </div>

                    <div className="raw-food-card-right">
                      {stored ? (
                        <span className="raw-status-pill is-stored-pill">แช่แล้ว ✓</span>
                      ) : container ? (
                        <div className="raw-packed-status">
                          <span className={'raw-status-pill ' + (container.isSafe ? 'is-safe' : 'is-risk')}>
                            {container.icon} {container.isSafe ? 'ปิดสนิท ✓' : 'น้ำหยด ⚠️'}
                          </span>
                          <button
                            type="button"
                            className="raw-btn-unpack"
                            onClick={(e) => {
                              e.stopPropagation()
                              unpackFood(food.id)
                            }}
                          >
                            ↺ เปลี่ยน
                          </button>
                        </div>
                      ) : (
                        <span className="raw-status-pill is-waiting">ลากใส่กล่อง 📦</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 2: Packaging Containers */}
          <div className="raw-section">
            <div className="raw-section-header">
              <span className="raw-step-badge">2</span>
              <div className="raw-section-text">
                <h3>เลือกภาชนะบรรจุ (Containers)</h3>
                <small>เฉพาะกล่องปิดสนิทเท่านั้นที่ป้องกันน้ำเนื้อหยดเลอะ</small>
              </div>
            </div>

            <div className="raw-containers-grid">
              {CONTAINERS.map((c) => {
                const isOver = overContainerId === c.id
                return (
                  <div
                    key={c.id}
                    ref={(el) => {
                      containerRefs.current[c.id] = el
                    }}
                    className={
                      'raw-container-card' +
                      (c.isSafe ? ' is-safe-card' : ' is-risky-card') +
                      (isOver ? ' is-over' : '')
                    }
                    onClick={() => onContainerClick(c.id)}
                    title={`${c.name} — ${c.hint}`}
                  >
                    <div className="raw-container-card-header">
                      <span className="raw-c-icon">{c.icon}</span>
                      <span className={'raw-c-badge ' + (c.isSafe ? 'is-safe' : 'is-risk')}>
                        {c.badge}
                      </span>
                    </div>
                    <div className="raw-container-card-body">
                      <strong>{c.thaiName}</strong>
                      <small>{c.hint}</small>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Ghost Element following pointer during drag */}
      {drag && (
        <div className="raw-ghost" style={{ left: drag.x, top: drag.y }}>
          {draggedContainer ? (
            <div className="raw-ghost-packed">
              <ContainerSvg id={draggedContainer.id} />
              {draggedFood && <img src={draggedFood.img} alt="" draggable="false" />}
            </div>
          ) : draggedFood ? (
            <div className="raw-ghost-food">
              <img src={draggedFood.img} alt="" draggable="false" />
              <span>{draggedFood.thaiName}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
