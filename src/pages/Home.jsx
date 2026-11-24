import { useEffect, useState, useRef } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';

import Explore from './Explore';
import { mockHome } from '../data/homeMockData';
import { getMockUser } from '../data/mockAuth';

import {
  getMockPosts,
  getMockPostInteraction,
} from '../data/mockPosts';

import {
  getHome,
  getCurrentUser,
  getNotifications,
} from '../services/api';

import TrendingTopics from '../components/home/TrendingTopics';
import TrendingDiscussions from '../components/home/TrendingDiscussions';
import PostList from '../components/home/PostList';
import LogoutLink from '../components/LogoutLink';



function withMockPosts(homeData) {
  const posts = [
    ...getMockPosts(),
    ...(homeData.posts || []),
  ].map((post) => ({
    ...post,
    ...getMockPostInteraction(post.id),
  }));

  return {
    ...homeData,
    posts,
  };
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const isExplorePage = location.pathname === '/explore';
  const isTrendingDiscussionsPage =
    location.pathname === '/trending-discussions';
  const [home, setHome] = useState(null);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(
    () => getMockUser()
  );
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { tagName } = useParams();

  const selectedTopic = tagName
    ? tagName.replace(/^#/, '')
    : '';

  // Tutup dropdown ketika user berpindah halaman.
  useEffect(() => {
    setAccountMenuOpen(false);
  }, [location.pathname]);

  // Tutup dropdown ketika klik di luar menu atau tekan Escape.
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

  useEffect(() => {
    async function loadHome() {
      try {
        const [homeResult, userResult] = await Promise.all([
          getHome(isTrendingDiscussionsPage ? 8 : 3),
          getCurrentUser(),
        ]);

        if (homeResult.success) {
          setHome(withMockPosts(homeResult.data));
        } else {
          setHome(withMockPosts(mockHome));
          setError('');
        }

        if (userResult.success) {
          setCurrentUser(userResult.data);
        } else {
          setCurrentUser(getMockUser());
        }
      } catch (err) {
        console.warn(
          'Backend belum tersedia. Menggunakan data dummy untuk frontend.',
          err
        );

        setHome(withMockPosts(mockHome));
        setCurrentUser(getMockUser());
        setError('');
      }
    }

    loadHome();
  }, [isTrendingDiscussionsPage]);

  useEffect(() => {
    let isMounted = true;

    const fetchUnreadNotifications = async () => {
      try {
        const result = await getNotifications();

        console.log('HASIL API NOTIFIKASI:', result);

        if (isMounted) {
          setUnreadCount(
            Number(result.data?.unread_count || 0)
          );
        }
      } catch (err) {
        console.error(
          'Gagal mengambil jumlah notifikasi:',
          err
        );
      }
    };

    fetchUnreadNotifications();

    const intervalId = setInterval(
      fetchUnreadNotifications,
      30000
    );

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  function handlePostDeleted(postId) {
    setHome((currentHome) => {
      if (!currentHome) return currentHome;

      return {
        ...currentHome,
        posts: currentHome.posts.filter(
          (post) => post.id !== postId
        ),
      };
    });
  }

  function handleTopicClick(topic) {
    if (!topic) {
      navigate('/');
      return;
    }

    navigate(
      `/tag/${encodeURIComponent(topic.replace(/^#/, ''))}`
    );
  }

  function handlePostUpdated(postId, updatedContent) {
    setHome((currentHome) => {
      if (!currentHome) return currentHome;

      return {
        ...currentHome,
        posts: currentHome.posts.map((post) =>
          post.id === postId
            ? { ...post, content: updatedContent }
            : post
        ),
      };
    });
  }

  if (error) {
    return (
      <main className="page-state">
        <h1>Node</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!home) {
    return (
      <main className="page-state">
        <h1>Node</h1>
        <p>Loading Home...</p>
      </main>
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



        <div className="search-bar">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="10.8"
              cy="10.8"
              r="6.8"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="m16 16 4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="What are you curious about today?"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();

                const keyword = searchQuery.trim();

                if (keyword) {
                  navigate(`/search?q=${encodeURIComponent(keyword)}`);
                }
              }
            }}
          />
        </div>

        <div className="header-actions">
          <Link
            to="/notifications"
            className="notification-button"
            aria-label="Notifications"
            title="Notifications"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8C18 5.79086 16.2091 4 14 4H10C7.79086 4 6 5.79086 6 8V12.5C6 13.5 5.6 14.4 5 15.2L4 16.5H20L19 15.2C18.4 14.4 18 13.5 18 12.5V8Z"
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


          {currentUser ? (
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
                  {currentUser.profile_photo ? (
                    <img
                      src={`http://localhost/node/${currentUser.profile_photo}`}
                      alt={`${currentUser.full_name} profile`}
                    />
                  ) : (
                    currentUser.full_name
                      ? currentUser.full_name
                        .split(' ')
                        .map((name) => name[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                      : '?'
                  )}
                </div>
                <span className="header-user-name">
                  {currentUser.full_name || 'Node User'}
                </span>
              </button>

              {accountMenuOpen && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    <div className="account-dropdown-avatar">
                      {currentUser.profile_photo ? (
                        <img
                          src={`http://localhost/node/${currentUser.profile_photo}`}
                          alt={`${currentUser.full_name} profile`}
                        />
                      ) : (
                        currentUser.full_name
                          ? currentUser.full_name
                            .split(' ')
                            .map((name) => name[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                          : '?'
                      )}
                    </div>

                    <div className="account-dropdown-info">
                      <strong>{currentUser.full_name || 'Node User'}</strong>
                      {currentUser.email && (
                        <span>{currentUser.email}</span>
                      )}
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
          ) : (
            <Link to="/login" className="signup-button">
              Sign up
            </Link>
          )}
        </div>
      </header>

      <div className={`feed-layout ${sidebarOpen ? '' : 'sidebar-collapsed'} ${selectedTopic ? 'has-selected-tag' : ''}`}>
        {/* Ini memberi CSS penanda saat sidebar ditutup, sehingga ruang untuk tombol dapat disediakan tanpa menindih konten.  */}
        <aside
          className={`sidebar ${sidebarOpen ? '' : 'sidebar-hidden'}`}
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
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

            <Link
              to="/"
              className={`sidebar-item ${
                !isExplorePage &&
                !selectedTopic &&
                !isTrendingDiscussionsPage
                  ? 'active'
                  : ''
              }`}
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
            </Link>

            <Link
              to="/explore"
              className={`sidebar-item ${isExplorePage ? 'active' : ''}`}
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
              <span>Explore</span>
            </Link>
          </div>

          <div className="sidebar-section">
  
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
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



        <main className={`feed-main ${isExplorePage ? 'explore-feed-main' : ''} ${selectedTopic ? 'selected-tag-main' : ''} ${isTrendingDiscussionsPage ? 'trending-page-main' : ''}`}>

          {isTrendingDiscussionsPage ? (
            <>
              <section className="trending-page-content">
                <nav
                  className="trending-page-breadcrumb"
                  aria-label="Breadcrumb"
                >
                  <Link to="/">Home</Link>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="m9 18 6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Trending Discussions</span>
                </nav>

                <TrendingDiscussions
                  discussions={home?.trending_discussions || []}
                  showAll
                />
              </section>

              <TrendingTopics topics={home?.trending_topics || []} />
            </>
          ) : isExplorePage ? (
            <Explore />
          ) : selectedTopic ? (
            <>
              <section className="selected-tag-page">
                <nav className="tag-breadcrumb" aria-label="Breadcrumb">
                  <Link to="/">Home</Link>
                  <span aria-hidden="true">&gt;</span>
                  <span>#{selectedTopic}</span>
                </nav>

                <h1>#{selectedTopic}</h1>

                <PostList
                  posts={(home.posts || []).filter((post) => {
                    const tags = [
                      ...(post.hashtags || []),
                      post.topic || '',
                      post.topic_name || '',
                    ].map((tag) =>
                      String(tag)
                        .replace(/^#/, '')
                        .trim()
                        .toLowerCase()
                    );

                    return tags.includes(
                      selectedTopic.trim().toLowerCase()
                    );
                  })}
                  currentUser={currentUser}
                  onRequireLogin={() => navigate('/login')}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              </section>

              <TrendingTopics
                topics={home?.trending_topics || []}
                selectedTopic={selectedTopic}
              />
            </>
          ) : (
            <>
              <TrendingDiscussions
                discussions={home?.trending_discussions || []}
                selectedTopic={selectedTopic}
              />

              <TrendingTopics
                topics={home?.trending_topics || []}
                selectedTopic={selectedTopic}
              />

              <PostList
                posts={home.posts}
                currentUser={currentUser}
                onRequireLogin={() => navigate('/login')}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            </>
          )}

        </main>
      </div>
    </div>
  );
}

export default Home;
