import { useState } from 'react'
import ItemChip from './ItemChip.jsx'
import binImg from '../assets/bin.png'

// Table scene: food sitting on top of the table (for hot food or unplaced food)
// and a trash can underneath for spoiled/soggy food.
export default function TableScene({
  items,
  allItems = [],
  placements = {},
  selectedId,
  onSelect,
  onReturnDrop,
  onTrashDrop,
}) {
  const [trashOver, setTrashOver] = useState(false)
  const trashedItems = allItems.filter((it) => placements[it.id] === 'trash')

  const allowDrop = (e) => e.preventDefault()

  const handleTableDrop = (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) onReturnDrop(id)
  }

  const handleTrashDrop = (e) => {
    e.preventDefault()
    setTrashOver(false)
    const id = e.dataTransfer.getData('text/plain')
    if (id) onTrashDrop(id)
  }

  return (
    <div className="table-scene">

      <div
        className="table-top"
        onDragOver={allowDrop}
        onDrop={handleTableDrop}
        onClick={() => {
          if (selectedId && placements[selectedId] !== null) onReturnDrop(selectedId)
        }}
      >
        <div className="table-items">
          {items.map((it) => (
            <ItemChip
              key={it.id}
              item={it}
              selected={selectedId === it.id}
              onClick={() => onSelect(it.id)}
            />
          ))}
          {items.length === 0 && (
            <div className="table-empty">All items sorted! ✨</div>
          )}
        </div>
        <span className="table-leg table-leg--l" />
        <span className="table-leg table-leg--r" />
      </div>

      <div
        className={'trash-zone' + (trashOver ? ' trash-zone--over' : '')}
        onDragOver={allowDrop}
        onDragEnter={() => setTrashOver(true)}
        onDragLeave={() => setTrashOver(false)}
        onDrop={handleTrashDrop}
        onClick={() => {
          if (selectedId) onTrashDrop(selectedId)
        }}
        title="Drag spoiled or soggy items here to toss away"
        style={{ cursor: selectedId ? 'pointer' : 'default' }}
      >
        <img className="trash-img" src={binImg} alt="Trash" draggable="false" />
        {trashedItems.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {trashedItems.map((it) => (
              <span
                key={it.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onReturnDrop(it.id)
                }}
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '1px solid #fca5a5',
                }}
                title="Click to return to table"
              >
                🗑️ {it.label} ✕
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}