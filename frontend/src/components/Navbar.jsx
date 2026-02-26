import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.scss';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon">⬡</span>
          <span className="navbar__brand-text">
            Cipher<span>SQL</span>Studio
          </span>
        </Link>

        <nav className="navbar__nav">
          <Link
            to="/"
            className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
          >
            Assignments
          </Link>
          {user && (
            <Link to="/profile" className="navbar__link">Profile</Link>
          )}
        </nav>

        <div className="navbar__actions">
          {user ? (
            <>
              <span className="navbar__user">
                <span className="navbar__user-dot" />
                {user.name}
              </span>
              <button className="btn btn--ghost btn--sm" onClick={logout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">Login</Link>
              <Link to="/signup" className="btn btn--primary btn--sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
