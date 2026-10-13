
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logoutUser } from '../../services/api';
import {
  USE_MOCK_AUTH,
  clearMockUser,
} from '../../data/mockAuth';

function Logout() {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setError('');
    setLoading(true);

    try {
      if (USE_MOCK_AUTH) {
        // Hapus status login dummy dari browser.
        clearMockUser();

        // Kembali ke Home sebagai pengunjung.
        navigate('/', { replace: true });
        return;
      }

      // Logout API untuk digunakan ketika backend siap.
      const result = await logoutUser();

      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.message || 'Logout gagal.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat logout.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Logout Node</h1>

      <button
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? 'Logout...' : 'Logout'}
      </button>

      {error && <p>{error}</p>}
    </div>
  );
}

export default Logout;
