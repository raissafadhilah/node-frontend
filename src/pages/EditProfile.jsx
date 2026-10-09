import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  getProfile,
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
} from '../services/api';

import './EditProfile.css';

function EditProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordStep, setPasswordStep] = useState('idle');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [status, setStatus] = useState('mahasiswa');

  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [emailStep, setEmailStep] = useState('idle');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getProfile();

        if (!result.success) {
          setError(
            result.message || 'Profile gagal dimuat.'
          );
          return;
        }

        setProfile(result.data);

        setFullName(
          result.data.user.full_name || ''
        );

        setStatus(
          result.data.user.status || 'mahasiswa'
        );
      } catch (err) {
        setError(
          err.message ||
            'Terjadi kesalahan saat memuat profile.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    setSaving(true);

    try {
      const result = await updateProfile({
        fullName: fullName.trim(),
        status,
      });

      if (!result.success) {
        setError(
          result.message ||
            'Profile gagal diperbarui.'
        );
        return;
      }

      setSuccess(
        result.message ||
          'Profile berhasil diperbarui.'
      );

      setTimeout(() => {
        navigate('/profile');
      }, 700);
    } catch (err) {
      setError(
        err.message ||
          'Terjadi kesalahan saat memperbarui profile.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestEmailChange(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    const email = newEmail.trim();

    if (!email) {
      setError('Email baru wajib diisi.');
      return;
    }

    setEmailLoading(true);

    try {
      const result = await requestEmailChange(email);

      if (!result.success) {
        setError(
          result.message ||
            'Gagal mengirim OTP perubahan email.'
        );
        return;
      }

      setEmailStep('verify');

      setSuccess(
        result.message ||
          'OTP berhasil dikirim ke email baru.'
      );
    } catch (err) {
      setError(
        err.message ||
          'Terjadi kesalahan saat meminta perubahan email.'
      );
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleVerifyEmailChange(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setError('OTP wajib diisi.');
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('OTP harus terdiri dari 6 digit.');
      return;
    }

    setEmailLoading(true);

    try {
      const result = await verifyEmailChange(cleanOtp);

      if (!result.success) {
        setError(
          result.message ||
            'OTP tidak valid.'
        );
        return;
      }

      setSuccess(
        result.message ||
          'Email berhasil diperbarui.'
      );

      setOtp('');
      setNewEmail('');
      setEmailStep('idle');

      setProfile((currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        return {
          ...currentProfile,
          user: {
            ...currentProfile.user,
            email: result.data?.email || newEmail.trim(),
          },
        };
      });
    } catch (err) {
      setError(
        err.message ||
          'Terjadi kesalahan saat memverifikasi OTP.'
      );
    } finally {
      setEmailLoading(false);
    }
  }

  function handleCancelEmailChange() {
    setEmailStep('idle');
    setNewEmail('');
    setOtp('');
    setError('');
    setSuccess('');
  }
  async function handleChangePassword(event) {
  event.preventDefault();

  setError('');
  setSuccess('');

  if (!currentPassword) {
    setError('Password saat ini wajib diisi.');
    return;
  }

  if (!newPassword) {
    setError('Password baru wajib diisi.');
    return;
  }

  if (newPassword.length < 8) {
    setError('Password baru minimal 8 karakter.');
    return;
  }

  if (!confirmPassword) {
    setError('Confirm password wajib diisi.');
    return;
  }

  if (newPassword !== confirmPassword) {
    setError(
      'Password baru dan confirm password tidak sama.'
    );
    return;
  }

  setPasswordLoading(true);

  try {
    const result = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      setError(
        result.message ||
          'Password gagal diperbarui.'
      );
      return;
    }

    setSuccess(
      result.message ||
        'Password berhasil diperbarui.'
    );

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setPasswordStep('idle');
  } catch (err) {
    setError(
      err.message ||
        'Terjadi kesalahan saat memperbarui password.'
    );
  } finally {
    setPasswordLoading(false);
  }
}

    function handleCancelPasswordChange() {
    setPasswordStep('idle');

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setError('');
    setSuccess('');
    }


  if (loading) {
    return (
      <main className="edit-profile-state">
        <h1>Node</h1>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="edit-profile-state">
        <h1>Edit Profile</h1>
        <p>{error}</p>

        <Link
          to="/profile"
          className="edit-profile-back"
        >
          Back to Profile
        </Link>
      </main>
    );
  }

  const currentEmail = profile?.user?.email || '';

  return (
    <main className="edit-profile-page">

      <header className="edit-profile-header">
        <Link
          to="/"
          className="edit-profile-brand"
        >
          <img
            src="/node-logo.png"
            alt="Node logo"
          />

          <span>node</span>
        </Link>

        <Link
          to="/profile"
          className="edit-profile-back"
        >
          Back to Profile
        </Link>
      </header>

      <section className="edit-profile-container">

        <div className="edit-profile-card">

          <div className="edit-profile-heading">
            <p>Edit Profile</p>

            <h1>
              Personal information
            </h1>

            <span>
              Update your profile information and account settings.
            </span>
          </div>

          {error && (
            <div className="edit-profile-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="edit-profile-message success">
              {success}
            </div>
          )}

          {/* PERSONAL INFORMATION */}

          <section className="edit-profile-section">

            <div className="edit-profile-section-heading">
              <h2>Personal Information</h2>

              <p>
                Manage your basic profile information.
              </p>
            </div>

            <form
              className="edit-profile-form"
              onSubmit={handleSubmit}
            >

              <div className="edit-profile-field">

                <label htmlFor="full-name">
                  Full Name
                </label>

                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  maxLength={100}
                  disabled={saving}
                  placeholder="Enter your full name"
                />

              </div>

              <div className="edit-profile-field">

                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  disabled={saving}
                >
                  <option value="mahasiswa">
                    Mahasiswa
                  </option>

                  <option value="alumni">
                    Alumni
                  </option>
                </select>

              </div>

              <div className="edit-profile-actions">

                <Link
                  to="/profile"
                  className="edit-profile-cancel"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="edit-profile-save"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

              </div>

            </form>

          </section>

          {/* ACCOUNT */}

          <section className="edit-profile-section">

            <div className="edit-profile-section-heading">
              <h2>Account</h2>

              <p>
                Manage your email and password.
              </p>
            </div>

            {/* EMAIL */}

            <div className="edit-profile-account-item">

              <div className="edit-profile-account-info">

                <span className="edit-profile-account-label">
                  Email
                </span>

                <strong>
                  {currentEmail}
                </strong>

              </div>

              {emailStep === 'idle' && (
                <button
                  type="button"
                  className="edit-profile-secondary-button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setEmailStep('request');
                  }}
                >
                  Change Email
                </button>
              )}

            </div>

            {/* REQUEST EMAIL */}

            {emailStep === 'request' && (
              <form
                className="edit-profile-account-form"
                onSubmit={handleRequestEmailChange}
              >

                <div className="edit-profile-field">

                  <label htmlFor="new-email">
                    New Email
                  </label>

                  <input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(event) =>
                      setNewEmail(event.target.value)
                    }
                    disabled={emailLoading}
                    placeholder="Enter your new email"
                    autoComplete="email"
                  />

                </div>

                <div className="edit-profile-account-actions">

                  <button
                    type="button"
                    className="edit-profile-cancel"
                    onClick={handleCancelEmailChange}
                    disabled={emailLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="edit-profile-secondary-button"
                    disabled={emailLoading}
                  >
                    {emailLoading
                      ? 'Sending...'
                      : 'Send OTP'}
                  </button>

                </div>

              </form>
            )}

            {/* VERIFY EMAIL */}

            {emailStep === 'verify' && (
              <form
                className="edit-profile-account-form"
                onSubmit={handleVerifyEmailChange}
              >

                <div className="edit-profile-otp-info">
                  <p>
                    OTP telah dikirim ke:
                  </p>

                  <strong>
                    {newEmail}
                  </strong>

                  <span>
                    Kode berlaku selama 5 menit.
                  </span>
                </div>

                <div className="edit-profile-field">

                  <label htmlFor="email-otp">
                    Verification Code
                  </label>

                  <input
                    id="email-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6)
                      )
                    }
                    disabled={emailLoading}
                    placeholder="Enter 6-digit OTP"
                    autoComplete="one-time-code"
                  />

                </div>

                <div className="edit-profile-account-actions">

                  <button
                    type="button"
                    className="edit-profile-cancel"
                    onClick={handleCancelEmailChange}
                    disabled={emailLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="edit-profile-secondary-button"
                    disabled={emailLoading}
                  >
                    {emailLoading
                      ? 'Verifying...'
                      : 'Verify Email'}
                  </button>

                </div>

              </form>
            )}

            {/* PASSWORD */}
            <div className="edit-profile-account-item">

                <div className="edit-profile-account-info">

                    <span className="edit-profile-account-label">
                    Password
                    </span>

                    <strong>
                    ••••••••••••
                    </strong>

                    <span className="edit-profile-account-note">
                    Your password is hidden for security.
                    </span>

                </div>

                {passwordStep === 'idle' && (
                    <button
                    type="button"
                    className="edit-profile-secondary-button"
                    onClick={() => {
                        setError('');
                        setSuccess('');
                        setPasswordStep('form');
                    }}
                    >
                    Change Password
                    </button>
                )}
                </div>

                {passwordStep === 'form' && (
                    <form
                    className="edit-profile-account-form"
                    onSubmit={handleChangePassword}
                    >
                    <div className="edit-profile-field">

                        <label htmlFor="current-password">
                        Current Password
                        </label>

                        <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                            setCurrentPassword(event.target.value) 
                        }
                        disabled={passwordLoading}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                        />
                    </div>

                    <div className="edit-profile-field">
                        <label htmlFor="new-password">
                        New Password
                        </label>
                        <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) =>
                            setNewPassword(event.target.value)
                        }
                        disabled={passwordLoading}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        />
                    </div>
                    <div className="edit-profile-field">
                        <label htmlFor="confirm-password">
                        Confirm New Password 
                        </label>
                        <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        disabled={passwordLoading}
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        />
                    </div>
                    <div className="edit-profile-account-actions">
                        <button
                        type="button"
                        className="edit-profile-cancel"
                        onClick={handleCancelPasswordChange}
                        disabled={passwordLoading}
                        >
                        Cancel
                        </button>
                        <button
                        type="submit"
                        className="edit-profile-secondary-button"
                        disabled={passwordLoading}
                        >
                        {passwordLoading
                            ? 'Changing...'
                            : 'Change Password'}
                        </button>
                    </div>
                    </form>
                )}
          </section>

        </div>

      </section>

    </main>
  );
}

export default EditProfile;