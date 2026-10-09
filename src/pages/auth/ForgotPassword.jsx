import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { forgotPassword } from '../../services/api';

import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSuccess(
          result.message ||
            'OTP reset password berhasil dikirim.'
        );

        setTimeout(() => {
          navigate('/verify-reset-otp');
        }, 700);
      } else {
        setError(
          result.message ||
            'Gagal mengirim OTP reset password.'
        );
      }
    } catch (err) {
      setError(
        err.message ||
          'Terjadi kesalahan saat mengirim OTP.'
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
              Forgot your password?
            </h1>

            <p>
              Enter your registered email address
              and we’ll send you a verification code
              to reset your password.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            <div className="auth-field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="e.g. fict@krw.horizon.ac.id"
                autoComplete="email"
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

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Sending OTP...'
                : 'Send OTP'}
            </button>

          </form>

          {/* BACK TO LOGIN */}
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

export default ForgotPassword;