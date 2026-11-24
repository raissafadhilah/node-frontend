import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  Compass,
  Home,
  PanelLeft,
  Plus,
  Search,
} from 'lucide-react';

import {
  getCurrentUser,
  getNotifications,
  getProfile,
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
} from '../services/api';

import './EditProfile.css';

const BACKEND_BASE_URL = 'http://localhost/node';

function EditProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  useEffect(() => {
    let mounted = true;

    async function loadHeaderData() {
      try {
        const userResult = await getCurrentUser();

        if (!mounted) return;

        if (userResult.success) {
          setCurrentUser(userResult.data);
        }

        const notificationResult = await getNotifications();

        if (!mounted) return;

        setUnreadCount(
          Number(notificationResult.data?.unread_count || 0)
        );
      } catch (err) {
        console.error('Gagal memuat informasi header:', err);
      }
    }

    loadHeaderData();

    return () => {
      mounted = false;
    };
  }, []);

  function getPhotoUrl(photoPath) {
    if (!photoPath) return null;
    if (/^https?:\/\//i.test(photoPath)) return photoPath;

    return `${BACKEND_BASE_URL}/${photoPath.replace(/^\/+/, '')}`;
  }

  function getInitials(fullName) {
    if (!fullName) return '?';

    return fullName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function handleSearch(event) {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    const keyword = searchQuery.trim();

    if (keyword) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  }

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


  const currentEmail = profile?.user?.email || '';
  const headerPhoto = getPhotoUrl(currentUser?.profile_photo);

  return (
    <div className="feed-page edit-profile-page">
      <header className="top-header">
        <div className="brand">
          <Link to="/" aria-label="Kembali ke Home">
            <img
              src="/NodeLogo.png"
              alt="Node logo"
              className="brand-logo"
            />
          </Link>
        </div>

        <div className="search-bar">
          <span className="search-icon" aria-hidden="true">
            <Search />
          </span>
          <input
            type="text"
            placeholder="What are you curious about today?"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div className="header-actions">
          <Link
            to="/notifications"
            className="notification-button"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {currentUser ? (
            <Link
              to="/profile"
              className="edit-profile-header-account"
              aria-label={`Profile ${currentUser.full_name || ''}`}
            >
              <span className="header-user-avatar">
                {headerPhoto ? (
                  <img
                    src={headerPhoto}
                    alt={`${currentUser.full_name} profile`}
                  />
                ) : (
                  getInitials(currentUser.full_name)
                )}
              </span>
              <span className="edit-profile-header-name">
                {currentUser.full_name || 'Node User'}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="signup-button">
              Sign up
            </Link>
          )}
        </div>
      </header>

      <div className={`feed-layout edit-profile-feed-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
          <Link to="/create-post" className="ask-post-button">
            <span className="ask-post-icon" aria-hidden="true">
              <Plus />
            </span>
            <span>Ask / Post</span>
          </Link>

          <div className="sidebar-section">
            <div className="sidebar-heading">
              <p className="sidebar-label">MAIN MENU</p>
              <button
                type="button"
                className="sidebar-toggle-button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Sembunyikan sidebar"
                title="Sembunyikan sidebar"
              >
                <PanelLeft aria-hidden="true" />
              </button>
            </div>

            <Link to="/" className="sidebar-item">
              <Home aria-hidden="true" />
              <span>Home</span>
            </Link>

            <Link to="/explore" className="sidebar-item">
              <Compass aria-hidden="true" />
              <span>Explore</span>
            </Link>
          </div>
        </aside>

        {!sidebarOpen && (
          <button
            type="button"
            className="sidebar-reopen-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Tampilkan sidebar"
            title="Tampilkan sidebar"
          >
            <PanelLeft aria-hidden="true" />
          </button>
        )}

        <main className="feed-main edit-profile-feed-main">
          <div className="edit-profile-workspace">
            <nav className="edit-profile-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Node</Link>
              <ChevronRight aria-hidden="true" />
              <span>Edit profile</span>
            </nav>

            {loading ? (
              <div className="edit-profile-state">
                <p>Loading profile...</p>
              </div>
            ) : error && !profile ? (
              <div className="edit-profile-card edit-profile-state">
                <h1>Could not load your profile</h1>
                <p>{error}</p>
                <Link to="/profile" className="edit-profile-back">
                  Back to Profile
                </Link>
              </div>
            ) : (
              <div className="edit-profile-card">

          <div className="edit-profile-heading">
            <p>Profile settings</p>

            <h1>
              Edit your profile
            </h1>

            <span>
              Keep your personal information and account details up to date.
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditProfile;