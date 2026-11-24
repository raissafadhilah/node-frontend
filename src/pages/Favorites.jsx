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

import PostCard from '../components/home/PostCard';
import { getCurrentUser, getHome, getNotifications } from '../services/api';
import './Settings.css';
import './Favorites.css';

const BACKEND_BASE_URL = 'http://localhost/node';

function Favorites() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
        const [userResult, homeResult] = await Promise.all([
          getCurrentUser(),
          getHome(),
        ]);

        if (!mounted) return;
        if (!homeResult.success) {
          throw new Error(homeResult.message || 'Gagal memuat postingan tersimpan.');
        }

        if (userResult.success) {
          setCurrentUser(userResult.data);
          setFavorites(
            (homeResult.data?.posts || []).filter(
              (post) => post.is_bookmarked
            )
          );
        } else {
          setFavorites([]);
        }

        setAuthChecked(true);
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Gagal memuat postingan tersimpan.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function loadUnreadCount() {
      try {
        const result = await getNotifications();
        if (mounted) {
          setUnreadCount(Number(result.data?.unread_count || 0));
        }
      } catch (notificationError) {
        console.error('Gagal memuat jumlah notifikasi:', notificationError);
      }
    }

    loadFavorites();
    loadUnreadCount();

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
    if (keyword) navigate(`/search?q=${encodeURIComponent(keyword)}`);
  }

  function handleBookmarkChanged(postId, isBookmarked) {
    if (!isBookmarked) {
      setFavorites((current) =>
        current.filter((post) => Number(post.id) !== Number(postId))
      );
    }
  }

  const profilePhoto = getPhotoUrl(currentUser?.profile_photo);

  return (
    <div className="feed-page settings-page favorites-page">
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
              className="settings-header-account"
              aria-label={`Profile ${currentUser.full_name || ''}`}
            >
              <span className="header-user-avatar">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={`${currentUser.full_name} profile`}
                  />
                ) : (
                  getInitials(currentUser.full_name)
                )}
              </span>
              <span className="settings-header-name">
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

      <div className={`feed-layout settings-feed-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
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

        <main className="feed-main settings-feed-main favorites-feed-main">
          <div className="settings-workspace favorites-workspace">
            <nav className="settings-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Node</Link>
              <ChevronRight aria-hidden="true" />
              <span>Favorites</span>
            </nav>

            <section className="favorites-content">
              <div className="favorites-heading">
                <h1 className="settings-section-title">Saved posts</h1>
                {!loading && currentUser && (
                  <span>{favorites.length} posts</span>
                )}
              </div>

              {loading ? (
                <p className="favorites-message">Loading saved posts...</p>
              ) : error ? (
                <p className="favorites-message favorites-error" role="alert">
                  {error}
                </p>
              ) : !authChecked || !currentUser ? (
                <div className="favorites-empty">
                  <h2>Sign in to view your Favorites</h2>
                  <p>Your saved posts are private to your account.</p>
                  <Link to="/login" className="signup-button">Sign in</Link>
                </div>
              ) : favorites.length === 0 ? (
                <div className="favorites-empty">
                  <h2>No saved posts yet</h2>
                  <p>Save a post you like and it will appear here.</p>
                  <Link to="/" className="favorites-browse-link">
                    Explore posts
                  </Link>
                </div>
              ) : (
                <div className="favorites-post-list">
                  {favorites.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onRequireLogin={() => navigate('/login')}
                      onBookmarkChanged={handleBookmarkChanged}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Favorites;
