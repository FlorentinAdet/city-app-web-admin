import './EntityCardGrid.css'

export default function EntityCardGrid({
  items,
  loading,
  emptyText = 'Aucun élément.',
  onItemClick,
  getKey,
  renderCover,
  renderTitle,
  renderMeta,
  renderBody,
  renderActions
}) {
  const list = Array.isArray(items) ? items : []
  const keyFn = getKey || ((item) => item?.id)

  if (loading) {
    return (
      <div className="entity-empty">
        <p>Chargement…</p>
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="entity-empty">
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="entity-grid">
      {list.map((item) => (
        <div
          key={keyFn(item)}
          className="entity-card"
          onClick={() => onItemClick?.(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onItemClick?.(item)
            }
          }}
        >
          {renderCover && <div className="entity-card-cover">{renderCover(item)}</div>}
          <h3 className="entity-card-title">{renderTitle?.(item)}</h3>
          {renderMeta && <div className="entity-card-meta">{renderMeta(item)}</div>}
          {renderBody && <p className="entity-card-content">{renderBody(item)}</p>}
          {renderActions && (
            <div className="entity-card-actions" onClick={(e) => e.stopPropagation()}>
              {renderActions(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
