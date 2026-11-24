
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Check } from 'lucide-react';

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
  const [isResetComplete, setIsResetComplete] = useState(false);

  const hasMinLength = form.password.length >= 8;
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(form.password);

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

    if (!hasMinLength) {
      setError('Password harus memiliki minimal 8 karakter.');
      return;
    }

    if (!hasSpecialCharacter) {
      setError('Password harus memiliki minimal satu karakter spesial.');
      return;
    }

    if (form.password !== form.passwordConfirmation) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(form);

      if (result.success) {
        setForm({
          password: '',
          passwordConfirmation: '',
        });

        setIsResetComplete(true);
      } else {
        setError(
          result.message || 'Gagal mengubah password.'
        );
      }
    } catch (err) {
      setError(
        err.message || 'Terjadi kesalahan saat mengubah password.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (isResetComplete) {
    return (
      <main className="reset-password-page">

        <section className="reset-success-container">

          {/* SUCCESS ICON */}
          <div className="reset-success-icon">
            <Check size={25} strokeWidth={3} />
          </div>

          {/* HEADING */}
          <div className="reset-success-heading">
            <h1>Password reset!</h1>

            <p>
              You've successfully created a new password,
              click below to sign in.
            </p>
          </div>

          {/* SIGN IN */}
          <Link
            to="/login"
            className="reset-success-button"
          >
            Sign in
          </Link>

        </section>

      </main>
    );
  }
  return (
    <main className="reset-password-page">

      <section className="reset-password-container">

        {/* ICON */}
        <div className="reset-password-icon">
          <img
            src="/key-icon.png"
            alt="Key"
            className="reset-password-key-image"
          />
        </div>

        {/* HEADING */}
        <div className="reset-password-heading">
          <h1>Set a new password</h1>

          <p>
            Your new password must be different from previously used passwords.
          </p>
        </div>

        {/* FORM */}
        <form
          className="reset-password-form"
          onSubmit={handleSubmit}
        >

          {/* PASSWORD */}
          <div className="reset-password-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="reset-password-field">
            <label htmlFor="passwordConfirmation">
              Confirm Password
            </label>

            <input
              type="password"
              id="passwordConfirmation"
              name="passwordConfirmation"
              value={form.passwordConfirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {/* PASSWORD REQUIREMENTS */}
          <div className="password-requirements">

            <div className={`password-requirement ${hasMinLength ? 'valid' : ''}`}>
              <ShieldCheck size={20} strokeWidth={1.8} />
              <span>Must be at least 8 characters.</span>
            </div>

            <div className={`password-requirement ${hasSpecialCharacter ? 'valid' : ''}`}>
              <ShieldCheck size={20} strokeWidth={1.8} />
              <span>Must contain one special character.</span>
            </div>

          </div>

          {/* MESSAGE */}
          {error && (
            <div className="reset-password-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="reset-password-message success">
              {success}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="reset-password-submit"
            disabled={loading}
          >
            {loading ? 'Updating password...' : 'Reset Password'}
          </button>

        </form>

        {/* BACK TO LOGIN */}
        <Link
          to="/login"
          className="reset-password-back"
        >
          <span>←</span> Back to log in
        </Link>

      </section>

    </main>
  );
}

export default ResetPassword;
