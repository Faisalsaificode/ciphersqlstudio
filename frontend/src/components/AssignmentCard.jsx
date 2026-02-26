import { useNavigate } from 'react-router-dom';
import './AssignmentCard.scss';

const CATEGORY_ICONS = {
  'SELECT': '🔍',
  'JOIN': '🔗',
  'GROUP BY': '📊',
  'Subqueries': '🪆',
  'Window Functions': '🪟',
  'Aggregates': '∑',
  'DML': '✏️',
};

export default function AssignmentCard({ assignment, index, isCompleted }) {
  const navigate = useNavigate();

  return (
    <article
      className={`assignment-card ${isCompleted ? 'assignment-card--completed' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => navigate(`/assignment/${assignment._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/assignment/${assignment._id}`)}
    >
      {isCompleted && (
        <div className="assignment-card__completed-ribbon">✓ Done</div>
      )}
      <div className="assignment-card__header">
        <span className="assignment-card__icon">
          {CATEGORY_ICONS[assignment.category] || '📝'}
        </span>
        <div className="assignment-card__badges">
          <span className={`badge badge--${assignment.difficulty}`}>
            {assignment.difficulty}
          </span>
          <span className="badge badge--category">{assignment.category}</span>
        </div>
      </div>

      <div className="assignment-card__body">
        <h3 className="assignment-card__title">{assignment.title}</h3>
        <p className="assignment-card__desc">{assignment.description}</p>
      </div>

      <div className="assignment-card__footer">
        <span className="assignment-card__cta">
          Attempt →
        </span>
      </div>
    </article>
  );
}
