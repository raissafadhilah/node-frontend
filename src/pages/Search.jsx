
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { getCurrentUser, getHome, searchNode } from '../services/api';
import TrendingTopics from '../components/home/TrendingTopics';
import PostList from '../components/home/PostList';
import './Search.css';

function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [trendingTopicsError, setTrendingTopicsError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function loadTrendingTopics() {
      try {
        const result = await getHome(3);

        if (!result?.success || !Array.isArray(result.data?.trending_topics)) {
          throw new Error(
            result?.message || 'Gagal mengambil Trending Topics.'
          );
        }

        if (!cancelled) {
          setTrendingTopics(result.data.trending_topics);
          setTrendingTopicsError('');
        }
      } catch (err) {
        if (!cancelled) {
          setTrendingTopicsError(
            err.message || 'Gagal mengambil Trending Topics.'
          );
        }
      }
    }

    loadTrendingTopics();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSearch() {
      setLoading(true);
      setError('');
      setUsers([]);
      setPosts([]);

      try {
        const userResult = await getCurrentUser();

        if (cancelled) return;

        if (userResult?.success && userResult.data) {
          setCurrentUser(userResult.data);
        } else {
          setCurrentUser(null);
        }

        if (!query.trim()) {
          return;
        }

        const result = await searchNode(query);

        if (cancelled) return;

        setUsers(result.data?.users || []);
        setPosts(result.data?.posts || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Gagal mengambil hasil pencarian.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSearch();

    return () => {
      cancelled = true;
    };
  }, [query]);

  function handleSearch(event) {
    event.preventDefault();

    const keyword = searchInput.trim();

    if (!keyword) return;

    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  }

  function handlePostDeleted(postId) {
    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => String(post.id) !== String(postId)
      )
    );
  }

  function handlePostUpdated(postId, updatedContent) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        String(post.id) === String(postId)
          ? { ...post, content: updatedContent }
          : post
      )
    );
  }

  return (
    <div className="feed-page">
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

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="What are you curious about today?"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label="Cari akun atau postingan"
          />
        </form>

        <div className="header-actions">
          <button
            type="button"
            className="notification-button"
            aria-label="Notifications"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
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
          </button>

          {currentUser ? (
            <Link to="/profile" className="header-user">
              <div className="header-user-avatar">
                {currentUser.profile_photo ? (
                  <img
                    src={`http://localhost/node/${currentUser.profile_photo}`}
                    alt={`${currentUser.full_name || 'User'} profile`}
                  />
                ) : (
                  (currentUser.full_name || '?')
                    .split(' ')
                    .map((name) => name[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>

              <span className="header-user-name">
                {currentUser.nickname || currentUser.full_name}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="signup-button">
              Sign up
            </Link>
          )}
        </div>
      </header>

      <div
        className={`feed-layout ${
          sidebarOpen ? '' : 'sidebar-collapsed'
        }`}
      >
        <aside
          className={`sidebar ${
            sidebarOpen ? '' : 'sidebar-hidden'
          }`}
        >
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
                <svg viewBox="0 0 24 24" fill="none">
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

            <button
              type="button"
              className="sidebar-item"
              onClick={() => navigate('/')}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Home</span>
            </button>

            <button
              type="button"
              className="sidebar-item active"
              aria-current="page"
            >
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
              <span>Search</span>
            </button>
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

        <main className="feed-main search-page-main">
          <section className="search-results-page">
            <nav className="tag-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">&gt;</span>
              <span>Search</span>
            </nav>



           

            {!query.trim() ? (
              <p className="search-state">
                Masukkan kata kunci pada kolom pencarian di atas.
              </p>
            ) : loading ? (
              <p className="search-state">Mencari akun dan postingan...</p>
            ) : error ? (
              <p className="search-state search-error" role="alert">
                {error}
              </p>
            ) : (
              <>
                <section className="search-section">
                  <h2>Postingan</h2>

                  {posts.length === 0 ? (
                    <p className="search-state">
                      Tidak ada postingan yang cocok.
                    </p>
                  ) : (
                    <PostList
                      posts={posts}
                      currentUser={currentUser}
                      onRequireLogin={() => navigate('/login')}
                      onPostDeleted={handlePostDeleted}
                      onPostUpdated={handlePostUpdated}
                    />
                  )}
                </section>

                {users.length === 0 && posts.length === 0 && (
                  <p className="search-state">
                    Tidak ditemukan akun atau postingan untuk kata kunci ini.
                  </p>
                )}
              </>
            )}
          </section>

          <div className="search-topics-panel">
            <TrendingTopics topics={trendingTopics} />
            {trendingTopicsError && (
              <p className="search-state search-error" role="alert">
                {trendingTopicsError}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Search;
