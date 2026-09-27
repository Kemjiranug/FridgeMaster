import { useState, useRef } from 'react'
import { FRIDGE_IMG } from '../gameData.js'
import ItemChip from './ItemChip.jsx'
import { LOCK_REGIONS } from './Fridge.jsx'
import * as audio from '../lib/audio.js'

// Drop-zone rectangles over the left fridge compartment (same coords as Fridge.jsx).
const ZONES = {
  top:    { left: '3.5%', top: '1%',   width: '45.5%', height: '16.5%' },
  middle: { left: '3.5%', top: '17%',  width: '45.5%', height: '14.5%' },
  bottom: { left: '3.5%', top: '31%',  width: '45.5%', height: '14.5%' },
}

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

// =======================================================================
// REAL 3D CONTAINER GRAPHICS (Box with Lid, Airtight Box, Open Plate, Open Bag)
// Real tactile container objects where food actually sits INSIDE the vessel!
// =======================================================================

function ContainerBack({ shape }) {
  switch (shape) {
    case 'box-lid':
      return (
        <svg className="rc-back" viewBox="0 0 120 80" aria-hidden="true">
          <defs>
            <linearGradient id="bl-back-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <linearGradient id="bl-rim-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <path d="M12 24 h96 l-8 48 a8 8 0 0 1 -8 7 H28 a8 8 0 0 1 -8 -7 z" fill="url(#bl-back-grad)" stroke="url(#bl-rim-grad)" strokeWidth="2.5" />
          <ellipse cx="60" cy="68" rx="34" ry="8" fill="rgba(180, 83, 9, 0.14)" />
          <path d="M16 26 h88 l-4 8 H20 z" fill="rgba(180, 83, 9, 0.16)" />
        </svg>
      )
    case 'airtight-box':
      return (
        <svg className="rc-back" viewBox="0 0 120 80" aria-hidden="true">
          <defs>
            <linearGradient id="at-back-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
          </defs>
          <path d="M12 24 h96 l-8 48 a8 8 0 0 1 -8 7 H28 a8 8 0 0 1 -8 -7 z" fill="url(#at-back-grad)" stroke="#059669" strokeWidth="2.5" />
          <ellipse cx="60" cy="68" rx="34" ry="8" fill="rgba(5, 150, 105, 0.12)" />
          <path d="M16 26 h88 l-4 8 H20 z" fill="rgba(5, 150, 105, 0.16)" />
        </svg>
      )
    case 'open-plate':
      return (
        <svg className="rc-back" viewBox="0 0 120 80" aria-hidden="true">
          <defs>
            <radialGradient id="pl-rim-grad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
            <radialGradient id="pl-inner-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="85%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
          </defs>
          <ellipse cx="60" cy="50" rx="55" ry="26" fill="url(#pl-rim-grad)" stroke="#94a3b8" strokeWidth="2.5" />
          <ellipse cx="60" cy="48" rx="43" ry="19" fill="url(#pl-inner-grad)" stroke="#cbd5e1" strokeWidth="1.8" />
          <ellipse cx="60" cy="50" rx="30" ry="12" fill="#ffffff" />
        </svg>
      )
    case 'open-bag':
      return (
        <svg className="rc-back" viewBox="0 0 120 80" aria-hidden="true">
          <defs>
            <linearGradient id="bg-back-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0f7ff" />
              <stop offset="60%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
            <linearGradient id="handle-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {/* Back handles */}
          <path d="M 16 28 C 14 10, 26 4, 30 6 C 34 8, 32 20, 30 28" fill="none" stroke="url(#handle-grad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 90 28 C 88 20, 86 8, 90 6 C 94 4, 106 10, 104 28" fill="none" stroke="url(#handle-grad)" strokeWidth="3" strokeLinecap="round" />
          
          {/* Bag back interior body */}
          <path d="M 16 28 
                   C 10 42, 12 60, 20 72 
                   A 8 8 0 0 0 26 76 
                   H 94 
                   A 8 8 0 0 0 100 72 
                   C 108 60, 110 42, 104 28 
                   C 94 34, 76 36, 60 36 
                   C 44 36, 26 34, 16 28 Z" 
                fill="url(#bg-back-grad)" stroke="#3b82f6" strokeWidth="2.2" strokeLinejoin="round" />
          
          {/* Depth shadow inside bag bottom */}
          <ellipse cx="60" cy="70" rx="36" ry="5" fill="rgba(37, 99, 235, 0.15)" />
          {/* Open mouth inner line */}
          <path d="M 18 28 Q 60 36 102 28" fill="none" stroke="#2563eb" strokeWidth="1.6" strokeDasharray="3 2" opacity="0.6" />
        </svg>
      )
    default:
      return null
  }
}

function ContainerFront({ shape }) {
  switch (shape) {
    case 'box-lid':
      return (
        <svg className="rc-front" viewBox="0 0 120 80" aria-hidden="true">
          <defs>
            <linearGradient id="bl-front-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(254, 243, 199, 0.35)" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0.55)" />
            </linearGradient>
          </defs>
          <path d="M12 24 h96 l-8 48 a8 8 0 0 1 -8 7 H28 a8 8 0 0 1 -8 -7 z" fill="url(#bl-front-grad)" stroke="#d97706" strokeWidth="2.2" />
          <path d="M24 32 l6 34" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
          <path d="M35 34 l4 24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <path d="M96 32 l-4 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M11 24 h98" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'airtight-box':
      return (
        <svg className="rc-front" viewBox="0 0 120 80" aria-hidden="true">
          <defs>
            <linearGradient id="at-front-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(236, 253, 245, 0.4)" />
              <stop offset="100%" stopColor="rgba(167, 243, 208, 0.55)" />
            </linearGradient>
          </defs>
          <path d="M12 24 h96 l-8 48 a8 8 0 0 1 -8 7 H28 a8 8 0 0 1 -8 -7 z" fill="url(#at-front-grad)" stroke="#059669" strokeWidth="2.2" />
          <path d="M24 32 l7 34" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
          <path d="M36 34 l4 22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M96 32 l-5 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
          <rect x="2" y="32" width="7" height="14" rx="2.5" fill="#059669" />
          <rect x="111" y="32" width="7" height="14" rx="2.5" fill="#059669" />
        </svg>
      )
    case 'open-plate':
      return (
        <svg className="rc-front" viewBox="0 0 120 80" aria-hidden="true">
          <path d="M18 52 c12 16 72 16 84 0" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
          <path d="M28 54 c10 10 54 10 64 0" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      )
    case 'open-bag':
      return (
        <svg className="rc-front" viewBox="0 0 120 80" aria-hidden="true">
          <defs>
            <linearGradient id="bg-front-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(240, 247, 255, 0.3)" />
              <stop offset="50%" stopColor="rgba(219, 234, 254, 0.45)" />
              <stop offset="100%" stopColor="rgba(191, 219, 254, 0.65)" />
            </linearGradient>
          </defs>
          {/* Front handles */}
          <path d="M 18 28 C 16 8, 28 2, 32 4 C 36 6, 34 20, 32 30" fill="none" stroke="#3b82f6" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 88 30 C 86 20, 84 6, 88 4 C 92 2, 104 8, 102 28" fill="none" stroke="#3b82f6" strokeWidth="2.6" strokeLinecap="round" />

          {/* Translucent front bag body */}
          <path d="M 16 28 
                   C 10 42, 12 60, 20 72 
                   A 8 8 0 0 0 26 76 
                   H 94 
                   A 8 8 0 0 0 100 72 
                   C 108 60, 110 42, 104 28 
                   C 94 34, 76 36, 60 36 
                   C 44 36, 26 34, 16 28 Z" 
                fill="url(#bg-front-grad)" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />

          {/* Realistic plastic wrinkles / fold highlights */}
          <path d="M 28 34 C 24 48, 30 62, 36 74" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" opacity="0.85" />
          <path d="M 46 36 C 42 46, 52 58, 48 72" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
          <path d="M 92 34 C 96 48, 90 62, 84 74" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
          <path d="M 74 36 C 78 48, 68 60, 70 72" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />

          {/* Plastic side gusset creases */}
          <path d="M 14 36 L 22 70" stroke="rgba(37, 99, 235, 0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 106 36 L 98 70" stroke="rgba(37, 99, 235, 0.4)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Wide open unsealed mouth with red dashed warning indicator */}
          <path d="M 18 28 Q 60 37 102 28" fill="none" stroke="#ef4444" strokeWidth="2.4" strokeDasharray="5 3" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function ContainerLid({ shape, isLoaded }) {
  switch (shape) {
    case 'box-lid':
      return (
        <svg className={'rc-lid' + (isLoaded ? ' is-closed' : ' is-open')} viewBox="0 0 120 32" aria-hidden="true">
          <defs>
            <linearGradient id="bl-lid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="bl-handle-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <rect x="6" y="8" width="108" height="18" rx="8" fill="url(#bl-lid-grad)" stroke="#b45309" strokeWidth="2.5" />
          <rect x="44" y="3" width="32" height="10" rx="5" fill="url(#bl-handle-grad)" stroke="#92400e" strokeWidth="1.5" />
          <path d="M16 13 h88" stroke="#fef3c7" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
          <circle cx="50" cy="8" r="1.5" fill="#fef3c7" opacity="0.8" />
        </svg>
      )
    case 'airtight-box':
      return (
        <svg className={'rc-lid' + (isLoaded ? ' is-closed' : ' is-open')} viewBox="0 0 120 32" aria-hidden="true">
          <defs>
            <linearGradient id="at-lid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <rect x="6" y="8" width="108" height="18" rx="8" fill="url(#at-lid-grad)" stroke="#059669" strokeWidth="2.5" />
          <rect x="12" y="13" width="96" height="5" rx="2.5" fill="#059669" opacity="0.75" />
          <rect x="44" y="4" width="32" height="7" rx="3.5" fill="#047857" />
          <path d="M18 12 h84" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <rect x="0" y="10" width="8" height="15" rx="3" fill="#059669" stroke="#047857" strokeWidth="1" />
          <rect x="112" y="10" width="8" height="15" rx="3" fill="#059669" stroke="#047857" strokeWidth="1" />
        </svg>
      )
    default:
      return null // Open plate and Open bag have no lid!
  }
}

// REAL 3D CONTAINER COMPONENT (Used in Levels 6 & 7)
function RealContainer({
  board, items, reveal, draggable, onDropItem, onReturnItem, onPickBoard,
  boardPlacements, selectedId, isInFridge, isSelected, onSelectBoard, selectedBoardId
}) {
  const [isOver, setIsOver] = useState(false)
  const isLoaded = items.length > 0
  const isSafeContainer = board.shape === 'box-lid' || board.shape === 'airtight-box'

  const onDragStart = (e) => {
    if (!draggable) return
    e.dataTransfer.setData('text/plain', 'board:' + board.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const allowDrop = (e) => {
    if (reveal) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isInFridge) {
      setIsOver(true)
    }
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false)
    }
  }

  const handleDrop = (e) => {
    if (reveal) return
    setIsOver(false)
    const data = e.dataTransfer.getData('text/plain')
    if (!data) return

    // If a board is dropped over a container in the fridge, let it bubble to the shelf!
    if (data.startsWith('board:')) {
      if (isInFridge) {
        return // Let bubble to .cb-slot.onDrop!
      }
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // If an ingredient is dropped over a container in the fridge that already has items,
    // let it bubble to .cb-slot so it creates a new container instance on this shelf!
    if (isInFridge && items.length > 0) {
      return // Let bubble to .cb-slot.onDrop!
    }

    e.preventDefault()
    e.stopPropagation()
    onDropItem(data, board.id)
  }

  const handleClick = (e) => {
    if (reveal) return
    if (selectedId) {
      // Tap-to-place: food is selected in tray!
      // If this container is in the fridge and already has items, bubble to .cb-slot!
      if (isInFridge && items.length > 0) {
        return // Let bubble to .cb-slot.onClick!
      }
      e.stopPropagation()
      onDropItem(selectedId, board.id)
    } else if (isInFridge) {
      // If a container on the table is selected (selectedBoardId):
      // Clicking anywhere on this shelf (even on an existing container) should place it on this shelf!
      if (selectedBoardId) {
        return // Let bubble to .cb-slot.onClick!
      }
      e.stopPropagation()
      if (onPickBoard) {
        onPickBoard(board.id)
      }
    } else if (!isInFridge && onSelectBoard) {
      // Select container on table to tap-to-place onto shelf
      e.stopPropagation()
      onSelectBoard(board.id)
    }
  }

  const itemMark = (it) => {
    if (!reveal) return undefined
    const okIds = Array.isArray(it.board) ? it.board : [it.board]
    const baseId = board.baseId || (board.id ? board.id.split('__')[0] : '')
    if (!okIds.includes(baseId)) return 'wrong'
    const shelfId = boardPlacements?.[board.id] || (board.id && board.id.includes('__') ? board.id.split('__')[1] : null)
    if (it.boardShelf) {
      const allowed = Array.isArray(it.boardShelf) ? it.boardShelf : [it.boardShelf]
      if (!allowed.includes(shelfId)) return 'wrong'
    }
    return 'correct'
  }

  return (
    <div
      className={
        'real-container' +
        ` real-container--${board.shape}` +
        (isOver ? ' is-over' : '') +
        (selectedId ? ' is-ready-target' : '') +
        (isSelected ? ' is-board-selected' : '') +
        (isLoaded ? ' is-loaded' : ' is-empty') +
        (isInFridge ? ' is-in-fridge' : '')
      }
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={allowDrop}
      onDragEnter={allowDrop}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      title={
        selectedId
          ? `Put selected food into ${board.name}`
          : isInFridge
            ? (items.length === 0 ? `${board.name} in fridge (click to remove)` : `${board.name} on shelf`)
            : isLoaded
              ? `${board.name} packed — carry to fridge shelf!`
              : `Drag food here or carry to fridge (${board.name})`
      }
    >
      <div className="real-container-box">
        {/* Layer 1: Back interior wall */}
        <ContainerBack shape={board.shape} />

        {/* Layer 2: Food inside the container! */}
        <div className="real-container-food-slot">
          {items.map((it) => (
            <div
              key={it.id}
              className={'real-container-food-item' + (itemMark(it) ? ` is-${itemMark(it)}` : '')}
              onClick={(e) => {
                e.stopPropagation()
                if (!reveal) onReturnItem(it.id)
              }}
              title={!reveal ? `Click to take ${it.label} out` : it.label}
            >
              <img src={it.img} alt={it.label} draggable="false" />
              {itemMark(it) === 'correct' && <span className="real-food-check">✓</span>}
              {itemMark(it) === 'wrong' && <span className="real-food-cross">✗</span>}
              {!reveal && <span className="real-food-remove-hint">×</span>}
            </div>
          ))}
        </div>

        {/* Layer 3: Front translucent wall with reflection */}
        <ContainerFront shape={board.shape} />

        {/* Layer 4: Lid on top (snaps shut when loaded) */}
        <ContainerLid shape={board.shape} isLoaded={isLoaded} />
      </div>

      {!isInFridge && (
        <div className="real-container-label">
          <strong className="real-container-title">{board.name}</strong>
        </div>
      )}
    </div>
  )
}

// Plain cutting board tile (Used in Level 36)
function Board({ board, items, reveal, draggable, onDropItem, onReturnItem, onPickBoard, boardPlacements, selectedId }) {
  const [isOver, setIsOver] = useState(false)

  const onDragStart = (e) => {
    if (!draggable) return
    e.dataTransfer.setData('text/plain', 'board:' + board.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const allowDrop = (e) => {
    if (reveal) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsOver(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false)
    }
  }

  const handleDrop = (e) => {
    if (reveal) return
    setIsOver(false)
    e.preventDefault()
    e.stopPropagation()
    const data = e.dataTransfer.getData('text/plain')
    if (!data || data.startsWith('board:')) return
    onDropItem(data, board.id)
  }

  const handleClick = (e) => {
    if (reveal) return
    if (selectedId) {
      e.stopPropagation()
      onDropItem(selectedId, board.id)
    } else if (draggable && onPickBoard) {
      onPickBoard(board.id)
    }
  }

  const itemMark = (it) => {
    if (!reveal) return undefined
    const okIds = Array.isArray(it.board) ? it.board : [it.board]
    if (!okIds.includes(board.id)) return 'wrong'
    if (it.boardShelf) {
      const allowed = Array.isArray(it.boardShelf) ? it.boardShelf : [it.boardShelf]
      if (!allowed.includes(boardPlacements?.[board.id])) return 'wrong'
    }
    return 'correct'
  }

  return (
    <div
      className={'cb-board' + (isOver ? ' is-drag-over' : '') + (selectedId ? ' is-ready-target' : '')}
      style={{ '--board-color': board.color }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={allowDrop}
      onDragEnter={allowDrop}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      title={board.name + ' — ' + board.hint}
    >
      <div className="cb-board-face">
        <span className="cb-board-handle" />
        <div className="cb-board-items">
          {items.map((it) => (
            <ItemChip
              key={it.id}
              item={it}
              small
              iconOnly
              mark={itemMark(it)}
              onClick={(e) => { e.stopPropagation(); if (!reveal) onReturnItem(it.id) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CuttingBoardScene({
  shelves, boards, boardPlacements, placements, itemsById, items,
  selectedId, reveal, locks = [], onDropItemOnBoard, onDropBoardInFridge, onReturnBoard, onReturnItem, onSelect,
}) {
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  const [msg, setMsg] = useState('')
  const msgTimer = useRef(null)
  const isContainerLevel = (boards || []).some((b) => b.shape)

  const flash = (m, isError = false) => {
    if (msgTimer.current) clearTimeout(msgTimer.current)
    if (isError) audio.sfxWrong?.()
    setMsg(m)
    msgTimer.current = setTimeout(() => setMsg(''), 2600)
  }

  const getItemWithMeta = (it) => ({
    ...it,
    img: it.img || itemsById?.[it.id]?.img,
    label: it.label || itemsById?.[it.id]?.label,
  })

  const itemsOnBoard = (boardId) =>
    items.filter((it) => placements[it.id] === boardId).map(getItemWithMeta)

  // Reusable container station on table:
  // For container levels: ALWAYS keep all container options on the table ("คากล่องไว้")
  // so the player can reuse any container multiple times over multiple rounds!
  const tableBoards = isContainerLevel
    ? (boards || [])
    : (boards || []).filter((b) => boardPlacements[b.id] == null)

  // Ingredients not placed into any container yet.
  const trayItems = items.filter((it) => placements[it.id] == null).map(getItemWithMeta)

  const lockList = locks.map((k) => LOCK_REGIONS[k]).filter(Boolean)

  const allFoodPacked = items.length > 0 && trayItems.length === 0
  const allInFridge = items.length > 0 && items.every((it) => {
    const bId = placements[it.id]
    return bId && boardPlacements[bId] != null
  })
  const allReady = allFoodPacked && !allInFridge

  const hasRawLevel = (items || []).some(
    (it) => it.boardShelf === 'bottom' || it.id?.includes('raw') || it.id === 'shrimp'
  )

  const handleDropItemOnBoard = (itemId, boardId) => {
    const it = items.find((x) => x.id === itemId)
    const baseId = boardId.split('__')[0]
    if (it && Array.isArray(it.board) && !it.board.includes(baseId)) {
      if (hasRawLevel || it.boardShelf === 'bottom' || itemId.includes('raw') || itemId === 'shrimp') {
        flash('⚠️ Warning: Raw food requires a sealed container to prevent leaks!', true)
      } else {
        flash('⚠️ Warning: Cooked food must be kept in a sealed container with a lid!', true)
      }
    }
    onDropItemOnBoard(itemId, boardId)
  }

  const handleDropBoardInFridge = (boardId, shelfId) => {
    const itemsHere = itemsOnBoard(boardId)
    const isRawItem = itemsHere.some((it) => it.boardShelf === 'bottom' || it.id?.includes('raw') || it.id === 'shrimp')
    if (isRawItem && shelfId !== 'bottom') {
      flash('⚠️ Warning: Raw food must be placed on the bottom shelf to protect ready-to-eat food!', true)
    } else if (!isRawItem && shelfId === 'bottom' && hasRawLevel) {
      flash('⚠️ Warning: Ready-to-eat food must stay on the upper shelves, away from raw food!', true)
    }
    onDropBoardInFridge(boardId, shelfId)
  }

  const allowDrop = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handlePanelDrop = (e) => {
    const data = e.dataTransfer.getData('text/plain')
    if (data) {
      e.preventDefault()
      if (data.startsWith('board:')) {
        onReturnBoard(data.slice(6))
        setSelectedBoardId(null)
      } else {
        onReturnItem(data)
      }
    }
  }

  // Find all containers currently placed in a given shelf
  const getBoardsInShelf = (shelfId) => {
    if (!isContainerLevel) {
      return (boards || []).filter((b) => boardPlacements[b.id] === shelfId)
    }
    const entries = Object.entries(boardPlacements || {}).filter(([_, sId]) => sId === shelfId)
    return entries.map(([key]) => {
      const baseId = key.split('__')[0]
      const baseBoard = (boards || []).find((b) => b.id === baseId) || {
        id: baseId,
        shape: baseId,
        name: baseId,
      }
      return {
        ...baseBoard,
        id: key,
        baseId,
      }
    })
  }

  return (
    <>
      {isContainerLevel && (
        <div className="cb-banner-wrap">
          <div
            className={
              'leak-banner cb-banner' +
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
                  ? 'All containers placed in the fridge! Press Check Answers.'
                  : allReady
                    ? 'All food packed in sealed containers — carry them into the fridge!'
                    : hasRawLevel
                      ? 'Pack raw meat in sealed containers on the bottom shelf — protect ready-to-eat food!'
                      : 'Pack cooked food into sealed containers with lids — cover before chilling!')}
            </span>
          </div>
        </div>
      )}

      <div className="fridge-scene">
        <div className="fridge-img-wrap">
          <img className="fridge-photo" src={FRIDGE_IMG} alt="Fridge" draggable="false" />

          {lockList.map((r, i) => (
            <div key={'ov' + i} className="lock-overlay"
              style={{ left: r.left, top: r.top, width: r.width, height: r.height }} />
          ))}

          {shelves.map((shelf) => {
            const boardsHere = getBoardsInShelf(shelf.id)
            const isTarget = selectedBoardId && !boardsHere.some((b) => b.id === selectedBoardId)
            return (
              <div
                key={shelf.id}
                className={
                  'cb-slot' +
                  (boardsHere.length > 0 ? ' cb-slot--filled' : '') +
                  (isTarget ? ' cb-slot--target' : '')
                }
                style={ZONES[shelf.id]}
                onClick={() => {
                  if (!reveal && selectedBoardId) {
                    handleDropBoardInFridge(selectedBoardId, shelf.id)
                    setSelectedBoardId(null)
                  } else if (!reveal && !selectedBoardId) {
                    if (selectedId && isContainerLevel) {
                      const defaultContainer = 'box-lid'
                      const instanceId = `${defaultContainer}__${shelf.id}__${selectedId}`
                      handleDropBoardInFridge(instanceId, shelf.id)
                      handleDropItemOnBoard(selectedId, instanceId)
                      onSelect(selectedId)
                    } else if (allReady) {
                      flash('Select or carry a packed container into the fridge! 🧊')
                    } else if (!allInFridge) {
                      flash('Pack food into a sealed container before placing it in the fridge! 📦', true)
                    }
                  }
                }}
                onDragOver={(e) => {
                  if (!reveal) {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                  }
                }}
                onDrop={(e) => {
                  if (reveal) return
                  const data = e.dataTransfer.getData('text/plain')
                  if (!data) return
                  e.preventDefault()
                  e.stopPropagation()
                  if (data.startsWith('board:')) {
                    handleDropBoardInFridge(data.slice(6), shelf.id)
                    setSelectedBoardId(null)
                  } else {
                    // Dropped food directly onto this shelf!
                    if (isContainerLevel) {
                      const defaultContainer = 'box-lid'
                      const instanceId = `${defaultContainer}__${shelf.id}__${data}`
                      handleDropBoardInFridge(instanceId, shelf.id)
                      handleDropItemOnBoard(data, instanceId)
                    } else if (boardsHere.length > 0) {
                      onDropItemOnBoard(data, boardsHere[0].id)
                    }
                  }
                }}
              >
                {boardsHere.length > 0 ? (
                  boardsHere.map((board) => (
                    isContainerLevel ? (
                      <RealContainer
                        key={board.id}
                        board={board}
                        items={itemsOnBoard(board.id)}
                        reveal={reveal}
                        draggable={!reveal}
                        onDropItem={handleDropItemOnBoard}
                        onReturnItem={onReturnItem}
                        onPickBoard={onReturnBoard}
                        boardPlacements={boardPlacements}
                        selectedId={selectedId}
                        isInFridge={true}
                        selectedBoardId={selectedBoardId}
                      />
                    ) : (
                      <Board
                        key={board.id}
                        board={board}
                        items={itemsOnBoard(board.id)}
                        reveal={reveal}
                        draggable={!reveal}
                        onDropItem={onDropItemOnBoard}
                        onReturnItem={onReturnItem}
                        onPickBoard={onReturnBoard}
                        boardPlacements={boardPlacements}
                        selectedId={selectedId}
                      />
                    )
                  ))
                ) : (
                  !isContainerLevel && <span className="cb-slot-hint">Place a board</span>
                )}
              </div>
            )
          })}

          {lockList.map((r, i) => (
            <span
              key={'lk' + i}
              className="fridge-lock"
              style={{ left: `calc(${r.left} + ${r.width} / 2)`, top: `calc(${r.top} + ${r.height} / 2)` }}
            >
              <LockIcon />
            </span>
          ))}
        </div>
      </div>

      <div className="cb-panel" onDragOver={allowDrop} onDrop={handlePanelDrop}>
        {!isContainerLevel && (
          <div className="cb-panel-title">
            <span className="cb-step-num">1</span> Drag food onto the right board 🔪
          </div>
        )}
        <div className="cb-tray-items">
          {trayItems.map((it) => (
            <ItemChip
              key={it.id}
              item={it}
              selected={selectedId === it.id}
              onClick={() => onSelect(it.id)}
            />
          ))}
          {trayItems.length === 0 && <div className="cb-empty">All food packed! ✓</div>}
        </div>

        {!isContainerLevel && (
          <div className="cb-panel-title">
            <span className="cb-step-num">2</span> Then carry the board into the fridge 🧊
          </div>
        )}
        <div className={isContainerLevel ? 'pk-container-row' : 'cb-tray-boards'}>
          {tableBoards.map((b) => (
            isContainerLevel ? (
              <RealContainer
                key={b.id}
                board={b}
                items={itemsOnBoard(b.id)}
                reveal={reveal}
                draggable={!reveal}
                onDropItem={handleDropItemOnBoard}
                onReturnItem={onReturnItem}
                onPickBoard={onReturnBoard}
                boardPlacements={boardPlacements}
                selectedId={selectedId}
                isInFridge={false}
                isSelected={selectedBoardId === b.id}
                onSelectBoard={(id) => setSelectedBoardId((cur) => cur === id ? null : id)}
              />
            ) : (
              <Board
                key={b.id}
                board={b}
                items={itemsOnBoard(b.id)}
                reveal={reveal}
                draggable={!reveal}
                onDropItem={onDropItemOnBoard}
                onReturnItem={onReturnItem}
                boardPlacements={boardPlacements}
                selectedId={selectedId}
              />
            )
          ))}
        </div>
      </div>
    </>
  )
}

