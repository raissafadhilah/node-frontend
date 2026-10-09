import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  getProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from '../services/api';

import './Profile.css';

const BACKEND_BASE_URL = 'http://localhost/node';

function Profile() {
  const [searchParams] = useSearchParams();

  const profileId = searchParams.get('id');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [photoLoading, setPhotoLoading] = useState(false);

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const result = await getProfile(
        profileId ? Number(profileId) : null
      );

      if (result.success) {
        setProfile(result.data);
      } else {
        setError(
          result.message || 'Profile gagal dimuat.'
        );
      }
    } catch (err) {
      setError(
        err.message || 'Terjadi kesalahan saat memuat profile.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  function getProfilePhotoUrl(photoPath) {
    if (!photoPath) {
      return null;
    }

    return `${BACKEND_BASE_URL}/${photoPath}`;
  }

  function getInitials(fullName) {
    if (!fullName) {
      return '?';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    setError('');
    setSuccess('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Format foto harus JPG, PNG, atau WEBP.'
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(
        'Ukuran foto maksimal 2 MB.'
      );
      return;
    }

    setPhotoLoading(true);

    try {
      const result = await uploadProfilePhoto(file);

      if (result.success) {
        setSuccess(
          result.message || 'Foto profile berhasil diperbarui.'
        );

        await loadProfile();
      } else {
        setError(
          result.message || 'Foto profile gagal diperbarui.'
        );
      }
    } catch (err) {
      setError(
        err.message || 'Terjadi kesalahan saat upload foto.'
      );
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleDeletePhoto() {
    const confirmed = window.confirm(
      'Yakin ingin menghapus foto profile?'
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setPhotoLoading(true);

    try {
      const result = await deleteProfilePhoto();

      if (result.success) {
        setSuccess(
          result.message || 'Foto profile berhasil dihapus.'
        );

        await loadProfile();
      } else {
        setError(
          result.message || 'Foto profile gagal dihapus.'
        );
      }
    } catch (err) {
      setError(
        err.message || 'Terjadi kesalahan saat menghapus foto.'
      );
    } finally {
      setPhotoLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="profile-page-state">
        <h1>Node</h1>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="profile-page-state">
        <h1>Profile</h1>
        <p>{error}</p>

        <Link
          to="/"
          className="profile-back-link"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const {
    user,
    is_own_profile: isOwnProfile,
    posts,
    replies,
  } = profile;

  const profilePhotoUrl = getProfilePhotoUrl(
    user.profile_photo
  );

  return (
    <main className="profile-page">

      {/* HEADER */}

      <header className="profile-header">
        <Link
          to="/"
          className="profile-brand"
        >
          <img
            src="/node-logo.png"
            alt="Node logo"
            className="profile-brand-logo"
          />

          <span>node</span>
        </Link>

        <Link
          to="/"
          className="profile-home-link"
        >
          Back to Home
        </Link>
      </header>

      {/* PROFILE */}

      <section className="profile-card">

        <div className="profile-main">

          <div className="profile-photo-section">

            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt={`${user.full_name} profile`}
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo profile-photo-placeholder">
                {getInitials(user.full_name)}
              </div>
            )}

            {isOwnProfile && (
              <div className="profile-photo-actions">

                <label
                  htmlFor="profile-photo-input"
                  className="profile-photo-button"
                >
                  {photoLoading
                    ? 'Uploading...'
                    : user.profile_photo
                      ? 'Change photo'
                      : 'Upload photo'}
                </label>

                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  disabled={photoLoading}
                  hidden
                />

                {user.profile_photo && (
                  <button
                    type="button"
                    className="profile-photo-delete"
                    onClick={handleDeletePhoto}
                    disabled={photoLoading}
                  >
                    Remove photo
                  </button>
                )}

              </div>
            )}

          </div>

          <div className="profile-info">

            <p className="profile-label">
              PROFILE
            </p>

            <h1>
              {user.full_name}
            </h1>

            <p className="profile-status">
              {user.status === 'mahasiswa'
                ? 'Mahasiswa'
                : 'Alumni'}
            </p>

            {isOwnProfile && (
              <Link
                to="/profile/edit"
                className="profile-edit-button"
              >
                Edit Profile
              </Link>
            )}

            {error && (
              <div className="profile-message profile-message-error">
                {error}
              </div>
            )}

            {success && (
              <div className="profile-message profile-message-success">
                {success}
              </div>
            )}

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section className="profile-content">

        {/* POSTS */}

        <div className="profile-section">

          <div className="profile-section-heading">
            <div>
              <p className="profile-section-label">
                ACTIVITY
              </p>

              <h2>
                Posts
              </h2>
            </div>

            <span className="profile-count">
              {posts.length}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="profile-empty">
              <p>
                Belum ada postingan.
              </p>
            </div>
          ) : (
            <div className="profile-post-list">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="profile-post"
                >
                  <p className="profile-post-content">
                    {post.content}
                  </p>

                  <time className="profile-post-date">
                    {post.created_at}
                  </time>
                </article>
              ))}
            </div>
          )}

        </div>

        {/* REPLIES */}

        <div className="profile-section">

          <div className="profile-section-heading">
            <div>
              <p className="profile-section-label">
                ACTIVITY
              </p>

              <h2>
                Replies
              </h2>
            </div>

            <span className="profile-count">
              {replies.length}
            </span>
          </div>

          {replies.length === 0 ? (
            <div className="profile-empty">
              <p>
                Belum ada balasan.
              </p>
            </div>
          ) : (
            <div className="profile-reply-list">
              {replies.map((reply) => (
                <article
                  key={reply.id}
                  className="profile-reply"
                >
                  <p className="profile-reply-content">
                    {reply.content}
                  </p>

                  <div className="profile-reply-meta">
                    <span>
                      Post #{reply.post_id}
                    </span>

                    <time>
                      {reply.created_at}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>

      </section>

    </main>
  );
}

export default Profile;