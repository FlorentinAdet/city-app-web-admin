import './EntityCardGrid.css'

export default function EntityCardGrid({
  items,
  loading,
  emptyText = 'Aucun élément.',
  onItemClick,
  getKey,
  renderTitle,
  renderMeta,
  renderBody
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
        <button
          key={keyFn(item)}
          type="button"
          className="entity-card"
          onClick={() => onItemClick?.(item)}
        >
          <h3 className="entity-card-title">{renderTitle?.(item)}</h3>
          {renderMeta && <div className="entity-card-meta">{renderMeta(item)}</div>}
          {renderBody && <p className="entity-card-content">{renderBody(item)}</p>}
        </button>
      ))}
    </div>
  )
}
