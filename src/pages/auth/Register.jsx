import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../../services/api';

import './Register.css';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    status: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    setLoading(true);

    try {
      const result = await registerUser(form);

      if (result.success) {
        setSuccess(
          result.message || 'Registration berhasil.'
        );

        setTimeout(() => {
          navigate('/verify-otp');
        }, 500);
      } else {
        setError(
          result.message || 'Registration gagal.'
        );
      }
    } catch (err) {
      setError(
        err.message || 'Terjadi kesalahan saat registration.'
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
              Create your account.
            </h1>

            <p>
              Join the discussion, share experiences,
              and connect with HorizonU’s community.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}
            <div className="auth-field">
              <label htmlFor="fullName">
                Full name
              </label>

              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name..."
                autoComplete="name"
                required
              />
            </div>

            {/* STATUS */}
            <div className="auth-field">
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select your status...
                </option>

                <option value="mahasiswa">
                  Mahasiswa
                </option>

                <option value="alumni">
                  Alumni
                </option>
              </select>
            </div>

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
                placeholder="Create a password..."
                autoComplete="new-password"
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password..."
                autoComplete="new-password"
                required
              />
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
                ? 'Creating account...'
                : 'Create account'}
            </button>

          </form>

          {/* LOGIN */}
          <p className="auth-register">
            Already have an account?

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

export default Register;