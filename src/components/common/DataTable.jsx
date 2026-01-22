import Button from './Button'
import './DataTable.css'

export default function DataTable({ columns, data, onEdit, onDelete, loading }) {
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
        <p>📭 Aucune donnée disponible</p>
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
                <Button 
                  variant="warning" 
                  onClick={() => onEdit(row)}
                  icon="✏️"
                >
                  Modifier
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => onDelete(row)}
                  icon="🗑️"
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
