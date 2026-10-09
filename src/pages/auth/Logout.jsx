import { useState } from 'react';

import { logoutUser } from '../../services/api';

function Logout() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await logoutUser();

      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
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

      {error && (
        <p>
          {error}
        </p>
      )}

      {success && (
        <p>
          {success}
        </p>
      )}
    </div>
  );
}

export default Logout;