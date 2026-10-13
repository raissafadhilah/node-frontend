import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockHome } from '../data/homeMockData';
import { getMockUser } from '../data/mockAuth';

import {
  getHome,
  getCurrentUser,
} from '../services/api';

import TrendingTopics from '../components/home/TrendingTopics';
import TrendingDiscussions from '../components/home/TrendingDiscussions';
import PostList from '../components/home/PostList';

function Home() {
  const navigate = useNavigate();
  const [home, setHome] = useState(null);
  const [currentUser, setCurrentUser] = useState(
  () => getMockUser()
  );
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('');
  
  useEffect(() => {
    async function loadHome() {
      try {
        const [homeResult, userResult] = await Promise.all([
          getHome(),
          getCurrentUser(),
        ]);

        if (homeResult.success) {
          setHome(homeResult.data);
        } else {
          setHome(mockHome);
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

        setHome(mockHome);
setCurrentUser(getMockUser());
setError('');
      }
    }

    loadHome();
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
          <img
            src="/NodeLogo.png"
            alt="Node logo"
            className="brand-logo"
          />
        </div>

        <div className="search-bar">
          <span className="search-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
          </span>

          <input
            type="text"
            placeholder="What are you curious about today?"
          />
        </div>

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
          </button>

          {currentUser ? (
            <Link to="/profile" className="header-user">
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

      <div className={`feed-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}> 
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

            <button type="button" className="sidebar-item active">
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
              className="sidebar-item disabled"
              disabled
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
            </button>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">SETTINGS</p>

            <button
              type="button"
              className="sidebar-item disabled"
              disabled
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3h-.2a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Settings</span>
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

        <main className="feed-main">
       <TrendingDiscussions
            discussions={home?.trending_discussions || []}
            selectedTopic={selectedTopic}
          />

          <TrendingTopics
            topics={home?.trending_topics || []}
            selectedTopic={selectedTopic}
            onTopicClick={setSelectedTopic}
          />

          <PostList
            posts={home.posts}
            currentUser={currentUser}
            onRequireLogin={() => navigate('/login')}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
          />
          
        </main>
      </div>
    </div>
  );
}

export default Home;
