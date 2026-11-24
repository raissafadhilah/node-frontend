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

import { getCurrentUser, getNotifications } from '../services/api';
import './Settings.css';

const BACKEND_BASE_URL = 'http://localhost/node';

const notificationOptions = [
  {
    id: 'webPush',
    title: 'Web Push Notifications',
  },
  {
    id: 'popularDiscussions',
    title: 'Popular Discussions',
    description: 'Notify me of any new discussion updates.',
  },
  {
    id: 'newReplies',
    title: 'New Replies',
    description: 'Notify me if there are new answers to questions I have asked.',
  },
];

const settingTabs = ['Privacy', 'Preferences', 'Notifications'];
const PREFERENCES_STORAGE_KEY = 'node_settings_preferences';
const NOTIFICATIONS_STORAGE_KEY = 'node_settings_notifications';
const defaultPreferences = {
  primaryFaculty: 'FICT',
  secondaryFaculties: ['FMB', 'FHS', 'FESS'],
  followedTags: ['Thesis', 'StudentsLife', 'WorksLife'],
};
const defaultNotificationSettings = {
  webPush: false,
  popularDiscussions: false,
  newReplies: false,
};
const facultyOptions = ['FICT', 'FMB', 'FHS', 'FESS', 'FEB', 'FT'];

function readStoredSettings(key, defaults) {
  const savedSettings = localStorage.getItem(key);
  if (!savedSettings) return defaults;

  const parsedSettings = JSON.parse(savedSettings);
  if (!parsedSettings || typeof parsedSettings !== 'object' || Array.isArray(parsedSettings)) {
    return defaults;
  }

  if (key === PREFERENCES_STORAGE_KEY) {
    const primaryFaculty = facultyOptions.includes(parsedSettings.primaryFaculty)
      ? parsedSettings.primaryFaculty
      : defaults.primaryFaculty;
    return {
      primaryFaculty,
      secondaryFaculties: Array.isArray(parsedSettings.secondaryFaculties)
        ? [...new Set(parsedSettings.secondaryFaculties)].filter(
          (faculty) => facultyOptions.includes(faculty) && faculty !== primaryFaculty
        )
        : defaults.secondaryFaculties,
      followedTags: Array.isArray(parsedSettings.followedTags)
        ? parsedSettings.followedTags.filter(
          (tag) => typeof tag === 'string' && tag.trim()
        )
        : defaults.followedTags,
    };
  }

  return { ...defaults, ...parsedSettings };
}

function Settings() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Preferences');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState(
    () => readStoredSettings(NOTIFICATIONS_STORAGE_KEY, defaultNotificationSettings)
  );
  const [preferences, setPreferences] = useState(
    () => readStoredSettings(PREFERENCES_STORAGE_KEY, defaultPreferences)
  );
  const [facultyPickerOpen, setFacultyPickerOpen] = useState(false);
  const [tagInputOpen, setTagInputOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notificationSettings)
    );
  }, [notificationSettings]);

  useEffect(() => {
    let mounted = true;

    async function loadHeaderData() {
      try {
        const userResult = await getCurrentUser();

        if (!mounted || !userResult.success) return;

        setCurrentUser(userResult.data);

        const notificationResult = await getNotifications();

        if (mounted) {
          setUnreadCount(
            Number(notificationResult.data?.unread_count || 0)
          );
        }
      } catch (error) {
        console.error('Gagal memuat informasi header:', error);
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

  function handleNotificationChange(optionId) {
    setNotificationSettings((current) => ({
      ...current,
      [optionId]: !current[optionId],
    }));
  }

  function handlePrimaryFacultyChange(event) {
    setPreferences((current) => ({
      ...current,
      primaryFaculty: event.target.value,
      secondaryFaculties: current.secondaryFaculties.filter(
        (faculty) => faculty !== event.target.value
      ),
    }));
  }

  function toggleSecondaryFaculty(faculty) {
    setPreferences((current) => {
      const selected = current.secondaryFaculties.includes(faculty);
      return {
        ...current,
        secondaryFaculties: selected
          ? current.secondaryFaculties.filter((item) => item !== faculty)
          : [...current.secondaryFaculties, faculty],
      };
    });
  }

  function addFollowedTag(event) {
    event.preventDefault();
    const tag = tagInput.trim().replace(/[\s#]+/g, '').slice(0, 30);

    if (!tag) return;

    setPreferences((current) => {
      const alreadyFollowed = current.followedTags.some(
        (item) => item.toLowerCase() === tag.toLowerCase()
      );
      return alreadyFollowed
        ? current
        : { ...current, followedTags: [...current.followedTags, tag] };
    });
    setTagInput('');
    setTagInputOpen(false);
  }

  function removeFollowedTag(tagToRemove) {
    setPreferences((current) => ({
      ...current,
      followedTags: current.followedTags.filter((tag) => tag !== tagToRemove),
    }));
  }

  const profilePhoto = getPhotoUrl(currentUser?.profile_photo);

  return (
    <div className="feed-page settings-page">
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

        <main className="feed-main settings-feed-main">
          <div className="settings-workspace">
            <nav className="settings-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Node</Link>
              <ChevronRight aria-hidden="true" />
              <span>Settings</span>
            </nav>

            <nav className="settings-tabs" role="tablist" aria-label="Settings">
              {settingTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`settings-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls="settings-panel"
                >
                  {tab}
                </button>
              ))}
            </nav>

            <section
              id="settings-panel"
              className="settings-panel"
              role="tabpanel"
              aria-label={`${activeTab} settings`}
            >
              {activeTab === 'Notifications' ? (
                <>
                  <h1 className="settings-section-title">General</h1>
                  <div className="settings-notification-options">
                    {notificationOptions.map((option) => (
                      <div className="settings-option" key={option.id}>
                        <div className="settings-option-copy">
                          <h2>{option.title}</h2>
                          {option.description && <p>{option.description}</p>}
                        </div>
                        <label className="settings-switch">
                          <input
                            type="checkbox"
                            role="switch"
                            aria-label={option.title}
                            checked={notificationSettings[option.id]}
                            onChange={() => handleNotificationChange(option.id)}
                          />
                          <span className="settings-switch-track" aria-hidden="true" />
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              ) : activeTab === 'Preferences' ? (
                <>
                  <h1 className="settings-section-title">
                    Topic &amp; Faculty Interest
                  </h1>
                  <p className="settings-section-description">
                    Customize your feed by following specific academic departments and hashtags.
                  </p>

                  <div className="settings-preference-fields">
                    <div className="settings-preference-row">
                      <label htmlFor="primary-faculty">Primary Faculty</label>
                      <select
                        id="primary-faculty"
                        value={preferences.primaryFaculty}
                        onChange={handlePrimaryFacultyChange}
                      >
                        {facultyOptions.map((faculty) => (
                          <option key={faculty} value={faculty}>{faculty}</option>
                        ))}
                      </select>
                    </div>

                    <div className="settings-preference-row">
                      <span className="settings-preference-label">Secondary Faculty</span>
                      <div className="settings-chip-list">
                        {preferences.secondaryFaculties.map((faculty) => (
                          <button
                            key={faculty}
                            type="button"
                            className="settings-faculty-chip"
                            onClick={() => toggleSecondaryFaculty(faculty)}
                            aria-label={`Remove ${faculty} secondary faculty`}
                          >
                            {faculty}
                          </button>
                        ))}
                        <div className="settings-picker-wrap">
                          <button
                            type="button"
                            className="settings-add-faculty"
                            aria-label="Add secondary faculty"
                            aria-expanded={facultyPickerOpen}
                            onClick={() => setFacultyPickerOpen((open) => !open)}
                          >
                            +
                          </button>
                          {facultyPickerOpen && (
                            <div className="settings-picker-menu">
                              {facultyOptions
                                .filter((faculty) =>
                                  faculty !== preferences.primaryFaculty
                                  && !preferences.secondaryFaculties.includes(faculty)
                                )
                                .map((faculty) => (
                                  <button
                                    key={faculty}
                                    type="button"
                                    onClick={() => {
                                      toggleSecondaryFaculty(faculty);
                                      setFacultyPickerOpen(false);
                                    }}
                                  >
                                    {faculty}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="settings-preference-row settings-tags-row">
                      <span className="settings-preference-label">Followed Tags</span>
                      <div className="settings-chip-list">
                        {preferences.followedTags.map((tag) => (
                          <span className="settings-tag-chip" key={tag}>
                            #{tag}
                            <button
                              type="button"
                              aria-label={`Unfollow ${tag}`}
                              onClick={() => removeFollowedTag(tag)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {tagInputOpen ? (
                          <form className="settings-add-tag-form" onSubmit={addFollowedTag}>
                            <input
                              autoFocus
                              value={tagInput}
                              onChange={(event) => setTagInput(event.target.value)}
                              placeholder="Tag name"
                              aria-label="New tag name"
                            />
                            <button type="submit">Add</button>
                            <button
                              type="button"
                              aria-label="Cancel adding tag"
                              onClick={() => {
                                setTagInputOpen(false);
                                setTagInput('');
                              }}
                            >
                              ×
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            className="settings-add-tag"
                            onClick={() => setTagInputOpen(true)}
                          >
                            + Add Tag
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="settings-storage-note">
                    Preferences are saved on this device.
                  </p>
                </>
              ) : (
                <div className="settings-privacy">
                  <h1 className="settings-section-title">Your privacy on Node</h1>
                  <p className="settings-section-description">
                    A few ways Node keeps your account and activity private.
                  </p>
                  <div className="settings-privacy-item">
                    <h2>Email address</h2>
                    <p>Your email address is only shown to you on your profile.</p>
                  </div>
                  <div className="settings-privacy-item">
                    <h2>Saved posts</h2>
                    <p>Your Favorites list is tied to your account and is not shown on your public profile.</p>
                  </div>
                  <div className="settings-privacy-item">
                    <h2>Profile information</h2>
                    <p>Only share information you are comfortable showing to other Node users.</p>
                    <Link to="/profile/edit">Review your profile</Link>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;
