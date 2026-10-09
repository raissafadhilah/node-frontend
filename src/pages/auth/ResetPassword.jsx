import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { resetPassword } from '../../services/api';

import './ResetPassword.css';

function ResetPassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: '',
    passwordConfirmation: '',
  });

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

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (form.password.length < 8) {
      setError(
        'Password harus memiliki minimal 8 karakter.'
      );
      return;
    }

    if (
      form.password !==
      form.passwordConfirmation
    ) {
      setError(
        'Password dan konfirmasi password tidak sama.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(form);

      if (result.success) {
        setSuccess(
          result.message ||
            'Password berhasil diubah.'
        );

        setForm({
          password: '',
          passwordConfirmation: '',
        });

        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setError(
          result.message ||
            'Gagal mengubah password.'
        );
      }
    } catch (err) {
      setError(
        err.message ||
          'Terjadi kesalahan saat mengubah password.'
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
            src="/node-logo.png"
            alt="Node logo"
            className="auth-brand-logo"
          />

          <span className="auth-brand-name">
            node
          </span>
        </div>

        {/* CONTENT */}
        <div className="auth-content">

          <div className="auth-heading">
            <h1>
              Create a new password.
            </h1>

            <p>
              Choose a new password for your
              account. Make sure it is at least
              8 characters long.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* NEW PASSWORD */}
            <div className="auth-field">
              <label htmlFor="password">
                New password
              </label>

              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your new password..."
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="auth-field">
              <label htmlFor="passwordConfirmation">
                Confirm new password
              </label>

              <input
                type="password"
                id="passwordConfirmation"
                name="passwordConfirmation"
                value={form.passwordConfirmation}
                onChange={handleChange}
                placeholder="Confirm your new password..."
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {/* MESSAGE */}
            {error && (
              <div className="auth-message auth-message-error">
                {error}
              </div>
            )}

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
                ? 'Updating password...'
                : 'Reset password'}
            </button>

          </form>

          {/* LOGIN */}
          <p className="auth-register">
            Remember your password?

            <Link to="/login">
              Sign in
            </Link>
          </p>

        </div>

        {/* FOOTER */}
        <footer className="auth-footer">
          © 2026 node. All Rights Reserved.
        </footer>

      </section>

      {/* RIGHT IMAGE */}
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

export default ResetPassword;