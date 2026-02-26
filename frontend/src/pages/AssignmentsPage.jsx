import { useState, useEffect } from 'react';
import { fetchAssignments, getProgress } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import AssignmentCard from '../components/AssignmentCard';
import './AssignmentsPage.scss';

const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['all', 'SELECT', 'JOIN', 'GROUP BY', 'Subqueries', 'Window Functions', 'Aggregates'];

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const params = {};
    if (difficulty !== 'all') params.difficulty = difficulty;
    if (category !== 'all') params.category = category;

    setLoading(true);
    fetchAssignments(params)
      .then(setAssignments)
      .catch(() => setError('Failed to load assignments. Is the server running?'))
      .finally(() => setLoading(false));
  }, [difficulty, category]);

  useEffect(() => {
    if (user) {
      getProgress().then(setCompletedIds).catch(() => {});
    } else {
      setCompletedIds([]);
    }
  }, [user]);

  return (
    <div className="assignments-page">
      <section className="assignments-page__hero">
        <div className="assignments-page__hero-content">
          <div className="assignments-page__hero-tag">SQL Learning Platform</div>
          <h1 className="assignments-page__hero-title">
            Master SQL
            <br />
            <span>One Query at a Time</span>
          </h1>
          <p className="assignments-page__hero-sub">
            Practice real SQL against live PostgreSQL databases.
            Get AI-powered hints when you're stuck. No theory — just code.
          </p>
        </div>
        <div className="assignments-page__hero-decoration" aria-hidden="true">
          <pre className="assignments-page__code-preview">{`SELECT name, salary
FROM employees
WHERE dept = 'Engineering'
ORDER BY salary DESC;`}</pre>
        </div>
      </section>

      <section className="assignments-page__filters">
        <div className="filter-group">
          <label className="filter-group__label">Difficulty</label>
          <div className="filter-group__pills">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`filter-pill ${difficulty === d ? 'filter-pill--active' : ''} ${d !== 'all' ? `filter-pill--${d}` : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Category</label>
          <div className="filter-group__pills">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`filter-pill ${category === c ? 'filter-pill--active filter-pill--category' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="assignments-page__content">
        {loading && (
          <div className="assignments-page__loading">
            <div className="spinner spinner--lg" />
            <span>Loading assignments...</span>
          </div>
        )}

        {error && (
          <div className="status status--error assignments-page__error">{error}</div>
        )}

        {!loading && !error && assignments.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🗂</div>
            <div className="empty-state__title">No assignments found</div>
            <div className="empty-state__message">
              Try changing your filters, or ask your administrator to seed the database.
            </div>
          </div>
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="assignments-page__grid">
            {assignments.map((a, i) => (
              <AssignmentCard
                key={a._id}
                assignment={a}
                index={i}
                isCompleted={completedIds.includes(a._id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
