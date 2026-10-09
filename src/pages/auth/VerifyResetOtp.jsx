import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { verifyResetOtp } from '../../services/api';

import './VerifyResetOtp.css';

function VerifyResetOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleOtpChange(event) {
    const value = event.target.value
      .replace(/\D/g, '')
      .slice(0, 6);

    setOtp(value);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP harus terdiri dari 6 digit angka.');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyResetOtp(otp);

      if (result.success) {
        setSuccess(
          result.message ||
            'OTP berhasil diverifikasi.'
        );

        setTimeout(() => {
          navigate('/reset-password');
        }, 700);
      } else {
        setError(
          result.message ||
            'Verifikasi OTP gagal.'
        );
      }
    } catch (err) {
      setError(
        err.message ||
          'Terjadi kesalahan saat verifikasi OTP.'
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
              Verify your code.
            </h1>

            <p>
              Enter the 6-digit verification code
              we sent to your email to continue
              resetting your password.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* OTP */}
            <div className="auth-field">
              <label htmlFor="otp">
                Verification code
              </label>

              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit code..."
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
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
                ? 'Verifying...'
                : 'Verify code'}
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

export default VerifyResetOtp;