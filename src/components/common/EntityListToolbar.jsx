import './EntityListToolbar.css'
import { Search } from 'lucide-react'

export default function EntityListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher…',
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  dateLabel = 'Date',
  sortValue,
  onSortChange,
  sortOptions,
  children
}) {
  return (
    <div className="entity-toolbar" role="region" aria-label="Recherche et filtres">
      <div className="entity-toolbar-row">
        <div className="entity-toolbar-search">
          <Search size={16} aria-hidden="true" />
          <input
            className="entity-toolbar-input"
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Recherche"
          />
        </div>

        <div className="entity-toolbar-group">
          <label className="entity-toolbar-label">
            {dateLabel}
            <input
              className="entity-toolbar-input"
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange?.(e.target.value)}
              aria-label={`${dateLabel} - début`}
            />
          </label>

          <label className="entity-toolbar-label">
            <span className="entity-toolbar-sublabel">à</span>
            <input
              className="entity-toolbar-input"
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange?.(e.target.value)}
              aria-label={`${dateLabel} - fin`}
            />
          </label>
        </div>

        {children}

        {Array.isArray(sortOptions) && sortOptions.length > 0 && (
          <label className="entity-toolbar-label entity-toolbar-sort">
            Trier
            <select
              className="entity-toolbar-input"
              value={sortValue}
              onChange={(e) => onSortChange?.(e.target.value)}
              aria-label="Trier"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  )
}
