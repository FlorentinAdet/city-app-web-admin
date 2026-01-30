import Button from './Button'
import './DataTable.css'
import { Inbox, Pencil, Trash2 } from 'lucide-react'

export default function DataTable({ columns, data, onEdit, onDelete, loading, renderActions }) {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p className="table-empty-text">
          <Inbox size={18} aria-hidden="true" />
          Aucune donnée disponible
        </p>
      </div>
    )
  }
  
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td className="table-actions">
                {typeof renderActions === 'function' ? (
                  renderActions(row)
                ) : (
                  <>
                    <Button 
                      variant="warning" 
                      onClick={() => onEdit(row)}
                      icon={<Pencil size={16} />}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => onDelete(row)}
                      icon={<Trash2 size={16} />}
                    >
                      Supprimer
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
