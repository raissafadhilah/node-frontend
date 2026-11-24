import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { logoutCurrentUser } from '../../services/logout';

function Logout() {
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function handleLogout() {
      try {
        await logoutCurrentUser();
        navigate('/', { replace: true });
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat logout.');
      }
    }

    handleLogout();
  }, [navigate]);

  return (
    <main className="logout-state">
      {error ? (
        <>
          <p role="alert">{error}</p>
          <Link to="/">Kembali ke beranda</Link>
        </>
      ) : (
        <p role="status">Sedang keluar...</p>
      )}
    </main>
  );
}

export default Logout;
