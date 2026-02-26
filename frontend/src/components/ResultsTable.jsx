import './ResultsTable.scss';

export default function ResultsTable({ columns, rows, rowCount, truncated, error, isLoading }) {
  if (isLoading) {
    return (
      <div className="results-table results-table--loading">
        <div className="spinner spinner--lg" />
        <span>Executing query...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-table results-table--error">
        <div className="results-table__error-icon">⚠</div>
        <div>
          <div className="results-table__error-title">Query Error</div>
          <pre className="results-table__error-msg">{error}</pre>
        </div>
      </div>
    );
  }

  if (!columns) {
    return (
      <div className="results-table results-table--empty">
        <span className="results-table__placeholder">
          Run a query to see results here
        </span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="results-table results-table--empty">
        <span className="results-table__placeholder">Query returned 0 rows</span>
      </div>
    );
  }

  return (
    <div className="results-table">
      <div className="results-table__meta">
        <span className="results-table__count">
          {rowCount} row{rowCount !== 1 ? 's' : ''} returned
          {truncated && <span className="results-table__truncated"> (limited to 500)</span>}
        </span>
      </div>
      <div className="results-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col}>
                    {row[col] === null
                      ? <span className="results-table__null">NULL</span>
                      : String(row[col])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
