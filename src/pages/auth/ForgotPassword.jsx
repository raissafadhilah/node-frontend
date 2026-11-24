
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
      const result = await forgotPassword(
        email.trim().toLowerCase()
      );

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
    <main className="forgot-page">

      <section className="forgot-content">

        {/* ICON */}
        <img
          src="/Password.png"
          alt="Password recovery"
          className="forgot-icon"
        />

        {/* HEADING */}
        <div className="forgot-heading">
          <h1>Forgot your password?</h1>

          <p>
            Please enter the Email associated with your
            account and we’ll send an OTP.
          </p>
        </div>

        {/* FORM */}
        <form
          className="forgot-form"
          onSubmit={handleSubmit}
        >

          <div className="forgot-field">
            <label htmlFor="forgot-email">
              Email address
            </label>

            <input
              type="email"
              id="forgot-email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="forgot-message forgot-message-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div
              className="forgot-message forgot-message-success"
              role="status"
            >
              {success}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="forgot-submit"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Reset Password'}
          </button>

        </form>

        {/* BACK TO LOGIN */}
        <Link to="/login" className="forgot-back">
          <span aria-hidden="true">←</span>
          Back to log in
        </Link>

      </section>

    </main>
  );
}

export default ForgotPassword;
