import { useState } from 'react';
import './SampleDataViewer.scss';

export default function SampleDataViewer({ sampleTables }) {
  const [activeTable, setActiveTable] = useState(0);

  if (!sampleTables || sampleTables.length === 0) return null;

  const table = sampleTables[activeTable];

  // Parse INSERT statements to extract preview data
  const parseInserts = (insertSql) => {
    if (!insertSql) return { columns: [], rows: [] };
    try {
      // Extract VALUES tuples
      const valuesMatch = insertSql.match(/VALUES\s*([\s\S]+)$/i);
      if (!valuesMatch) return { columns: [], rows: [] };
      
      // Extract column names from CREATE schema for the same table
      const colMatch = (sampleTables[activeTable].schema || '').match(/\(([^)]+)\)/s);
      const columns = colMatch
        ? colMatch[1].split(',')
            .map(c => c.trim().split(/\s+/)[0])
            .filter(c => c && !['PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK', 'CONSTRAINT'].includes(c.toUpperCase()))
        : [];

      const tuples = valuesMatch[1]
        .split(/\),\s*\(|\);\s*$/)
        .map(t => t.replace(/^\s*\(/, '').trim())
        .filter(Boolean);

      const rows = tuples.slice(0, 8).map(tuple => {
        const vals = [];
        let current = '';
        let inString = false;
        for (const ch of tuple) {
          if (ch === "'" && !inString) { inString = true; continue; }
          if (ch === "'" && inString) { inString = false; continue; }
          if (ch === ',' && !inString) { vals.push(current.trim()); current = ''; continue; }
          current += ch;
        }
        if (current.trim()) vals.push(current.trim());
        return vals;
      });

      return { columns, rows };
    } catch {
      return { columns: [], rows: [] };
    }
  };

  const { columns, rows } = parseInserts(table.sampleData);

  return (
    <div className="sample-viewer">
      <div className="sample-viewer__tabs">
        {sampleTables.map((t, i) => (
          <button
            key={i}
            className={`sample-viewer__tab ${i === activeTable ? 'sample-viewer__tab--active' : ''}`}
            onClick={() => setActiveTable(i)}
          >
            <span className="sample-viewer__tab-icon">▦</span>
            {t.tableName}
          </button>
        ))}
      </div>

      <div className="sample-viewer__content">
        {table.description && (
          <p className="sample-viewer__desc">{table.description}</p>
        )}

        <div className="sample-viewer__schema">
          <div className="sample-viewer__schema-label">Schema</div>
          <pre className="sample-viewer__code">{table.schema}</pre>
        </div>

        {columns.length > 0 && rows.length > 0 && (
          <div className="sample-viewer__preview">
            <div className="sample-viewer__schema-label">Sample Data Preview</div>
            <div className="sample-viewer__table-wrap">
              <table>
                <thead>
                  <tr>
                    {columns.map(c => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri}>
                      {columns.map((_, ci) => (
                        <td key={ci}>{row[ci] ?? ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
