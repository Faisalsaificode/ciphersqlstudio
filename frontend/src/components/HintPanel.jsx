import { useState } from 'react';
import { getHint } from '../services/api';
import './HintPanel.scss';

export default function HintPanel({ assignmentId, userQuery }) {
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const handleGetHint = async () => {
    setLoading(true);
    setError(null);
    try {
      const hint = await getHint(assignmentId, userQuery, hints);
      setHints(prev => [...prev, hint]);
      setExpanded(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get hint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hint-panel">
      <div className="hint-panel__header">
        <div className="hint-panel__title">
          <span className="hint-panel__icon">💡</span>
          <span>Hints</span>
          {hints.length > 0 && (
            <span className="hint-panel__count">{hints.length}</span>
          )}
        </div>
        <div className="hint-panel__actions">
          {hints.length > 0 && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Hide' : 'Show'}
            </button>
          )}
          <button
            className={`btn btn--hint btn--sm ${loading ? 'btn--loading' : ''}`}
            onClick={handleGetHint}
            disabled={loading}
          >
            {!loading && '✨ Get Hint'}
          </button>
        </div>
      </div>

      {error && (
        <div className="status status--error hint-panel__error">{error}</div>
      )}

      {expanded && hints.length > 0 && (
        <div className="hint-panel__list">
          {hints.map((hint, i) => (
            <div key={i} className="hint-panel__item">
              <div className="hint-panel__item-num">#{i + 1}</div>
              <p className="hint-panel__item-text">{hint}</p>
            </div>
          ))}
        </div>
      )}

      {hints.length === 0 && !error && (
        <p className="hint-panel__empty">
          Stuck? Click "Get Hint" for a nudge — no spoilers, promise.
        </p>
      )}
    </div>
  );
}
