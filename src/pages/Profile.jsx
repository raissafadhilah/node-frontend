
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, MessageCircle, UserRound } from 'lucide-react';

import {
  getProfile,
  getCurrentUser,
  getNotifications,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from '../services/api';

import PostCard from '../components/home/PostCard';
import LogoutLink from '../components/LogoutLink';
import './Profile.css';

const BACKEND_BASE_URL = 'http://localhost/node';

function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const profileId = searchParams.get('id');

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [photoLoading, setPhotoLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const accountMenuRef = useRef(null);

  const isOwnProfile = Boolean(profile?.is_own_profile);
  const user = profile?.user;

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
        setError(result.message || 'Profile gagal dimuat.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat profile.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  useEffect(() => {
    let mounted = true;

    async function loadHeaderData() {
      try {
        const [userResult, notificationResult] = await Promise.all([
          getCurrentUser(),
          getNotifications(),
        ]);

        if (!mounted) return;

        if (userResult.success) {
          setCurrentUser(userResult.data);
        }

        setUnreadCount(
          Number(notificationResult.data?.unread_count || 0)
        );
      } catch (err) {
        console.error('Gagal memuat informasi header:', err);
      }
    }

    loadHeaderData();

    const intervalId = setInterval(async () => {
      try {
        const result = await getNotifications();

        if (mounted) {
          setUnreadCount(Number(result.data?.unread_count || 0));
        }
      } catch (err) {
        console.error('Gagal memperbarui notifikasi:', err);
      }
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function getPhotoUrl(photoPath) {
    if (!photoPath) return null;

    if (photoPath.startsWith('http')) {
      return photoPath;
    }

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

  function handlePostDeleted(postId) {
    setProfile((current) => {
      if (!current) return current;

      return {
        ...current,
        posts: (current.posts || []).filter(
          (post) => Number(post.id) !== Number(postId)
        ),
      };
    });
  }

  function handlePostUpdated(postId, updatedContent) {
    setProfile((current) => {
      if (!current) return current;

      return {
        ...current,
        posts: (current.posts || []).map((post) =>
          Number(post.id) === Number(postId)
            ? { ...post, content: updatedContent }
            : post
        ),
      };
    });
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setError('');
    setSuccess('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Format foto harus JPG, PNG, atau WEBP.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto maksimal 2 MB.');
      return;
    }

    setPhotoLoading(true);

    try {
      const result = await uploadProfilePhoto(file);

      if (result.success) {
        setSuccess(result.message || 'Foto profile berhasil diperbarui.');
        await loadProfile();

        const userResult = await getCurrentUser();
        if (userResult.success) {
          setCurrentUser(userResult.data);
        }
      } else {
        setError(result.message || 'Foto profile gagal diperbarui.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat upload foto.');
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleDeletePhoto() {
    if (!window.confirm('Yakin ingin menghapus foto profile?')) return;

    setError('');
    setSuccess('');
    setPhotoLoading(true);

    try {
      const result = await deleteProfilePhoto();

      if (result.success) {
        setSuccess(result.message || 'Foto profile berhasil dihapus.');
        await loadProfile();

        const userResult = await getCurrentUser();
        if (userResult.success) {
          setCurrentUser(userResult.data);
        }
      } else {
        setError(result.message || 'Foto profile gagal dihapus.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menghapus foto.');
    } finally {
      setPhotoLoading(false);
    }
  }

  function handleSearch(event) {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    const keyword = searchQuery.trim();

    if (keyword) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  }

  if (loading) {
    return (
      <main className="page-state">
        <h1>Node</h1>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!profile || !user) {
    return (
      <main className="page-state">
        <h1>Profile</h1>
        <p>{error || 'Profile tidak ditemukan.'}</p>
        <Link to="/">Back to Home</Link>
      </main>
    );
  }

  const posts = profile.posts || [];
  const replies = profile.replies || [];
  const profilePhoto = getPhotoUrl(user.profile_photo);
  const headerPhoto = getPhotoUrl(currentUser?.profile_photo);

  return (
    <div className="feed-page profile-feed-page">
      {/* HEADER */}
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
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 8C18 5.79 16.21 4 14 4H10C7.79 4 6 5.79 6 8V12.5C6 13.5 5.6 14.4 5 15.2L4 16.5H20L19 15.2C18.4 14.4 18 13.5 18 12.5V8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 19C10.5 20 11.2 20.5 12 20.5C12.8 20.5 13.5 20 14 19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {currentUser && (
            <div className="header-account" ref={accountMenuRef}>
              <button
                type="button"
                className="header-user"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="true"
                aria-label="Buka menu akun"
              >
                <div className="header-user-avatar">
                  {headerPhoto ? (
                    <img
                      src={headerPhoto}
                      alt={`${currentUser.full_name} profile`}
                    />
                  ) : (
                    getInitials(currentUser.full_name)
                  )}
                </div>
              </button>

              {accountMenuOpen && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    <div className="account-dropdown-avatar">
                      {headerPhoto ? (
                        <img
                          src={headerPhoto}
                          alt={`${currentUser.full_name} profile`}
                        />
                      ) : (
                        getInitials(currentUser.full_name)
                      )}
                    </div>

                    <div className="account-dropdown-info">
                      <strong>{currentUser.full_name || 'Node User'}</strong>
                      {currentUser.email && <span>{currentUser.email}</span>}
                    </div>
                  </div>

                  <div className="account-dropdown-divider" />

                  <Link
                    to="/profile"
                    className="account-dropdown-item"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <span>👤</span>
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="account-dropdown-item"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </Link>

                  <Link
                    to="/favorites"
                    className="account-dropdown-item"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <span>♡</span>
                    <span>Favorites</span>
                  </Link>

                  <div className="account-dropdown-divider" />

                  <LogoutLink
                    className="account-dropdown-item account-logout"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <span>↪</span>
                    <span>Logout</span>
                  </LogoutLink>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* LAYOUT */}
      <div className={`feed-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
          <Link to="/create-post" className="ask-post-button">
            <span className="ask-post-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M12 8v8M8 12h8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
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
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M9 4v16"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              </button>
            </div>

            <Link to="/" className="sidebar-item">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Home</span>
            </Link>

            <Link to="/explore" className="sidebar-item">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M16 16L21 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
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
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M9 4v16"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
          </button>
        )}

        {/* PROFILE CONTENT */}
        <main className="feed-main profile-feed-main">
          <div className="profile-workspace">
            <nav className="profile-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Node</Link>
              <span aria-hidden="true">&gt;</span>
              <span>Profile</span>
            </nav>

            <section className="profile-intro">
              <div className="profile-intro-avatar">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={`${user.full_name} profile`} />
                ) : (
                  <span>{getInitials(user.full_name)}</span>
                )}
              </div>

              <div className="profile-intro-details">
                <h1>{user.full_name}</h1>

                <div className="profile-faculty-badge">
                  <span className="profile-badge-dot" />
                  {user.faculty || (
                    user.status === 'alumni' ? 'Alumni' : 'Faculty not provided'
                  )}
                  {user.faculty && user.status && (
                    <span className="profile-status-inline">
                      {user.status === 'mahasiswa' ? 'Student' : 'Alumni'}
                    </span>
                  )}
                </div>
              </div>

              {isOwnProfile && (
                <div className="profile-intro-photo-actions">
                  <label
                    htmlFor="profile-photo-input"
                    className={`profile-photo-upload ${photoLoading ? 'disabled' : ''}`}
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
                      className="profile-photo-remove"
                      onClick={handleDeletePhoto}
                      disabled={photoLoading}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </section>

            {user.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}

            {error && (
              <div className="profile-alert profile-alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="profile-alert profile-alert-success">
                {success}
              </div>
            )}

            {/* TABS */}
            <nav className="profile-tabs" aria-label="Profile navigation">
              <button
                type="button"
                className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
                role="tab"
                aria-selected={activeTab === 'profile'}
              >
                <UserRound className="profile-tab-icon" aria-hidden="true" />
                Profile
              </button>

              <button
                type="button"
                className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
                role="tab"
                aria-selected={activeTab === 'posts'}
              >
                <FileText className="profile-tab-icon" aria-hidden="true" />
                Posts
                <span className="profile-tab-count">{posts.length}</span>
              </button>

              <button
                type="button"
                className={`profile-tab ${activeTab === 'replies' ? 'active' : ''}`}
                onClick={() => setActiveTab('replies')}
                role="tab"
                aria-selected={activeTab === 'replies'}
              >
                <MessageCircle className="profile-tab-icon" aria-hidden="true" />
                Replies
                <span className="profile-tab-count">{replies.length}</span>
              </button>
            </nav>

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <section className="profile-tab-panel" role="tabpanel">
                <div className="profile-panel-title">
                  <h2>Profile</h2>
                </div>

                <section className="profile-information-card">
                  <div className="profile-information-heading">
                    <h3>Personal Information</h3>

                    {isOwnProfile && (
                      <Link to="/profile/edit" className="profile-edit-button">
                        Edit Profile
                      </Link>
                    )}
                  </div>

                  <div className="profile-information-fields">
                    <div className="profile-information-field">
                      <label>Full Name</label>
                      <div>{user.full_name || 'Not available'}</div>
                    </div>

                    <div className="profile-information-field">
                      <label>Email Address</label>
                      <div>
                        {isOwnProfile
                          ? user.email || 'Not available'
                          : 'Private'}
                      </div>
                    </div>

                    <div className="profile-information-field">
                      <label>Faculty</label>
                      <div>{user.faculty || 'Not provided'}</div>
                    </div>
                  </div>
                </section>
              </section>
            )}

            {/* POSTS TAB */}
            {activeTab === 'posts' && (
              <section className="profile-tab-panel" role="tabpanel">
                <div className="profile-panel-title">
                  <h2>Posts</h2>
                </div>

                {posts.length === 0 ? (
                  <div className="profile-empty">
                    <h3>Belum ada postingan</h3>
                    <p>Postingan yang dibuat akan muncul di sini.</p>
                  </div>
                ) : (
                  <div className="profile-post-list">
                    {posts.map((post) => (
                      <div className="profile-post-card-shell" key={post.id}>
                        <PostCard
                          post={post}
                          currentUser={isOwnProfile}
                          onRequireLogin={() => navigate('/login')}
                          onPostDeleted={handlePostDeleted}
                          onPostUpdated={handlePostUpdated}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* REPLIES TAB */}
            {activeTab === 'replies' && (
              <section className="profile-tab-panel" role="tabpanel">
                <div className="profile-panel-title">
                  <h2>Replies</h2>
                </div>

                {replies.length === 0 ? (
                  <div className="profile-empty">
                    <h3>Belum ada balasan</h3>
                    <p>Balasan yang ditulis akan muncul di sini.</p>
                  </div>
                ) : (
                  <div className="profile-reply-list">
                    {replies.map((reply) => (
                      <article className="profile-reply-card" key={reply.id}>
                        <p>{reply.content}</p>
                        <div className="profile-reply-meta">
                          <span>Post #{reply.post_id}</span>
                          <time>{reply.created_at}</time>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
