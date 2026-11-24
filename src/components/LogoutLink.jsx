import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { logoutCurrentUser } from '../services/logout';

function LogoutLink({ className, onClick, children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout(event) {
    event.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await logoutCurrentUser();
      onClick?.();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat logout.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Link
        to="/"
        className={className}
        onClick={handleLogout}
        aria-disabled={loading}
      >
        {children}
      </Link>
      {error && (
        <span className="logout-link-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

export default LogoutLink;
