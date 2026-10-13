import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import './Login.css';
import {
  USE_MOCK_AUTH,
  setMockUser,
  findMockAccount,
} from '../../data/mockAuth';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  }
  // DIBAWAH INI KETIKA PAKE API/DATABASE
  // async function handleSubmit(event) {
  //   event.preventDefault();

  //   setError('');
  //   setSuccess('');
  //   setLoading(true);

  //   try {
  //     const result = await loginUser(form);

  //     if (result.success) {
  //       setSuccess(result.message || 'Login berhasil.');

  //       setTimeout(() => {
  //         navigate('/');
  //       }, 500);
  //     } else {
  //       setError(result.message || 'Login gagal.');
  //     }
  //   } catch (err) {
  //     setError(
  //       err.message || 'Terjadi kesalahan saat login.'
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  
async function handleSubmit(event) {
  event.preventDefault();

  setError('');
  setSuccess('');
  setLoading(true);

  try {
    if (USE_MOCK_AUTH) {
      const email = form.email.trim().toLowerCase();

      // Cari akun dummy yang sebelumnya didaftarkan.
      const account = findMockAccount(email);

      // Jika belum terdaftar, buat profil dummy
      // berdasarkan email untuk pengujian frontend.
      const user = account || {
        id: 'mock-user',
        full_name: email.split('@')[0],
        nickname: email.split('@')[0],
        email,
        status: 'mahasiswa',
        profile_photo: null,
      };

      setMockUser(user);

      setSuccess('Login dummy berhasil.');

      setTimeout(() => {
        navigate('/');
      }, 500);

      return;
    }

    // Digunakan kembali saat backend sudah siap.
    const result = await loginUser(form);

    if (result.success) {
      setSuccess(result.message || 'Login berhasil.');

      setTimeout(() => {
        navigate('/');
      }, 500);
    } else {
      setError(result.message || 'Login gagal.');
    }
  } catch (err) {
    setError(
      err.message || 'Terjadi kesalahan saat login.'
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="auth-page">

      {/* LEFT PANEL */}
      <section className="auth-panel">

        {/* BRAND */}
        <div className="auth-brand">
  <img
    src="/NodeLogo.png"
    alt="Node"
    className="auth-brand-Logo"
  />
</div>

        {/* FORM AREA */}
        <div className="auth-content">

          <div className="auth-heading">
            <h1>
              Welcome back to node.
            </h1>

            <p>
              Log in to continue discussions, share experiences,
              and stay connected with HorizonU’s community.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}
            <div className="auth-field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. fict@krw.horizon.ac.id"
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="auth-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password..."
                autoComplete="current-password"
                required
              />
            </div>

            {/* OPTIONS */}
            <div className="auth-options">

              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                />

                <span>
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot password?
              </Link>

            </div>

            {/* ERROR */}
            {error && (
              <div className="auth-message auth-message-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="auth-message auth-message-success">
                {success}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Signing in...'
                : 'Sign in'}
            </button>

          </form>

          {/* REGISTER */}
          <p className="auth-register">
            Don't have an account?

            <Link to="/register">
              Sign up
            </Link>
          </p>

        </div>

        {/* FOOTER */}
        <footer className="auth-footer">
          © 2026 node. All Rights Reserved.
        </footer>

      </section>

      {/* RIGHT IMAGE PANEL */}
      <section className="auth-image-panel">

        <div className="auth-image-wrapper">

          <img
            src="/node-auth-image.png"
            alt="Node community"
            className="auth-image"
          />

        </div>

      </section>

    </main>
  );
}

export default Login;