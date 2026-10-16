import {
  Search,
  Bell,
  SquarePlus,
  House,
  Compass,
  Settings,
  Image as ImageIcon,
  X,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code2,
  Link as LinkIcon,
  ChevronRight,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  createPost,
  getCurrentUser,
} from '../services/api';

import './CreatePost.css';

const MAX_TAGS = 5;

const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/ogg',
];

function CreatePost() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bodyRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      try {
        const result = await getCurrentUser();

        if (!mounted) return;

        setCurrentUser(
          result.success ? result.data : null
        );
      } catch {
        if (mounted) setCurrentUser(null);
      }
    }

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!media) {
      setMediaPreview('');
      return undefined;
    }

    const url = URL.createObjectURL(media);
    setMediaPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [media]);

  function handleMediaChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      setError('Format media tidak didukung.');
      event.target.value = '';
      return;
    }

    setError('');
    setMedia(file);
  }

  function handleRemoveMedia() {
    setMedia(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleAddTag(event) {
    event.preventDefault();

    const cleanTag = newTag
      .trim()
      .replace(/^#+/, '')
      .replace(/\s+/g, '');

    if (!cleanTag) {
      setError('Nama tag tidak boleh kosong.');
      return;
    }

    if (
      tags.some(
        (tag) => tag.toLowerCase() === cleanTag.toLowerCase()
      )
    ) {
      setError('Tag tersebut sudah ditambahkan.');
      return;
    }

    if (tags.length >= MAX_TAGS) {
      setError('Maksimal 5 tag.');
      return;
    }

    setTags((previous) => [...previous, cleanTag]);
    setNewTag('');
    setShowTagInput(false);
    setError('');
  }

  function handleRemoveTag(tagToRemove) {
    setTags((previous) =>
      previous.filter((tag) => tag !== tagToRemove)
    );
  }

  function insertFormatting(before, after = before) {
    const textarea = bodyRef.current;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);

    const replacement = `${before}${selectedText}${after}`;

    const updatedContent =
      content.slice(0, start) +
      replacement +
      content.slice(end);

    setContent(updatedContent);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!title.trim()) {
      setError('Title tidak boleh kosong.');
      return;
    }

    if (tags.length === 0) {
      setError('Tambahkan setidaknya satu tag.');
      return;
    }

    setLoading(true);

    try {
      await createPost({
        caption: title.trim(),
        content: content.trim(),
        hashtags: tags.map((tag) => `#${tag}`).join(' '),
        media,
      });

      setMessage('Postingan berhasil dibuat!');

      window.setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err) {
      setError(err.message || 'Gagal membuat postingan.');
    } finally {
      setLoading(false);
    }
  }

  const avatarUrl = currentUser?.profile_photo
    ? `http://localhost/node/${currentUser.profile_photo}`
    : '';

  const initials = currentUser?.full_name
    ? currentUser.full_name
        .trim()
        .split(/\s+/)
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const canSubmit =
    Boolean(category) &&
    Boolean(title.trim()) &&
    tags.length > 0 &&
    !loading;

  return (
    <div className="feed-page create-post-layout">
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
            <Search size={21} strokeWidth={1.6} />
          </span>
          <input
            type="text"
            placeholder="What are you curious about today?"
            aria-label="Search"
          />
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="notification-button"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.6} />
          </button>

          {currentUser ? (
            <Link to="/profile" className="header-user">
              <div className="header-user-avatar">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto profil"
                  />
                ) : (
                  initials
                )}
              </div>

              <span className="header-user-name">
                {currentUser.full_name}
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
        <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
          <Link
            to="/create-post"
            className="ask-post-button"
            aria-current="page"
          >
            <SquarePlus className="ask-post-icon" />
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
  </div>

          <div className="sidebar-section">
            <p className="sidebar-label">SETTINGS</p>

            <button
              type="button"
              className="sidebar-item disabled"
              disabled
            >
              <Settings />
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


        <main className="create-post-main">
          <div className="create-post-container">
            <nav
              className="create-post-breadcrumb"
              aria-label="Breadcrumb"
            >
              <Link to="/">Node</Link>
              <ChevronRight size={17} />
              <span>Ask / Post</span>
            </nav>

            <form
              className="create-post-form"
              onSubmit={handleSubmit}
            >
              <div className="create-post-field">
                <label
                  className="create-post-label"
                  htmlFor="post-category"
                >
                  Category
                  <span className="create-post-required">*</span>
                </label>

                <select
                  id="post-category"
                  className="create-post-select"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  required
                >
                  <option value="" disabled>
                    Select category...
                  </option>
                  <option value="FICT">FICT</option>
                  <option value="Academic">Academic</option>
                  <option value="Career">Career</option>
                  <option value="Campus Life">Campus Life</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="create-post-field">
                <label
                  className="create-post-label"
                  htmlFor="post-title"
                >
                  Title
                  <span className="create-post-required">*</span>
                </label>

                <input
                  id="post-title"
                  className="create-post-input"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="What's on your mind?"
                  maxLength={255}
                  required
                />
              </div>

              <div className="create-post-field">
                <label
                  className="create-post-label"
                  htmlFor="post-content"
                >
                  Body text{' '}
                  <span className="create-post-optional">
                    (optional)
                  </span>
                </label>

                <div className="create-post-editor">
                  <textarea
                    ref={bodyRef}
                    id="post-content"
                    value={content}
                    onChange={(event) =>
                      setContent(event.target.value)
                    }
                    placeholder="Share your thoughts, context, or a brief story..."
                    rows={5}
                  />

                  {mediaPreview && (
                    <div className="create-post-media-preview-wrap">
                      {media?.type.startsWith('video/') ? (
                        <video
                          className="create-post-media-preview"
                          src={mediaPreview}
                          controls
                        />
                      ) : (
                        <img
                          className="create-post-media-preview"
                          src={mediaPreview}
                          alt="Preview media postingan"
                        />
                      )}

                      <button
                        type="button"
                        className="create-post-remove-media"
                        onClick={handleRemoveMedia}
                      >
                        <X size={14} />
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="create-post-editor-toolbar">
                    <button
                      type="button"
                      className="create-post-toolbar-button"
                      title="Insert image"
                      aria-label="Insert image"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      <ImageIcon size={16} />
                    </button>

                    <button
                      type="button"
                      className="create-post-toolbar-button"
                      title="Insert link"
                      aria-label="Insert link"
                      onClick={() =>
                        insertFormatting('[', '](https://)')
                      }
                    >
                      <LinkIcon size={15} />
                    </button>

                    <button
                      type="button"
                      className="create-post-toolbar-button bold-tool"
                      title="Bold"
                      aria-label="Teks tebal"
                      onClick={() => insertFormatting('**')}
                    >
                      <Bold size={16} />
                    </button>

                    <button
                      type="button"
                      className="create-post-toolbar-button italic-tool"
                      title="Italic"
                      aria-label="Teks miring"
                      onClick={() => insertFormatting('_')}
                    >
                      <Italic size={15} />
                    </button>

                    <button
                      type="button"
                      className="create-post-toolbar-button"
                      title="Strikethrough"
                      aria-label="Teks coret"
                      onClick={() => insertFormatting('~~')}
                    >
                      <Strikethrough size={16} />
                    </button>

                    <button
                      type="button"
                      className="create-post-toolbar-button"
                      title="Bullet list"
                      aria-label="Daftar"
                      onClick={() => insertFormatting('- ')}
                    >
                      <List size={16} />
                    </button>

                    <button
                      type="button"
                      className="create-post-toolbar-button"
                      title="Numbered list"
                      aria-label="Daftar bernomor"
                      onClick={() => insertFormatting('1. ')}
                    >
                      <ListOrdered size={16} />
                    </button>

                    <button
                      type="button"
                      className="create-post-toolbar-button"
                      title="Code"
                      aria-label="Kode"
                      onClick={() => insertFormatting('`')}
                    >
                      <Code2 size={16} />
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  id="post-media"
                  className="create-post-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/ogg"
                  onChange={handleMediaChange}
                />
              </div>

              <div className="create-post-field create-post-tags-field">
                <label className="create-post-label">
                  Tags
                  <span className="create-post-required">*</span>
                </label>

                <span className="create-post-tags-help">
                  Add up to 5 tags to describe what your question is about.
                </span>

                <div className="create-post-tags-list">
                  {tags.map((tag) => (
                    <span className="create-post-tag" key={tag}>
                      #{tag}
                      <button
                        type="button"
                        className="create-post-tag-remove"
                        aria-label={`Hapus tag ${tag}`}
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {tags.length < MAX_TAGS && !showTagInput && (
                    <button
                      type="button"
                      className="create-post-new-tag"
                      onClick={() => {
                        setError('');
                        setShowTagInput(true);
                      }}
                    >
                      + New Tag
                    </button>
                  )}
                </div>

                {showTagInput && (
                  <div className="create-post-tag-input-row">
                    <input
                      className="create-post-input"
                      type="text"
                      value={newTag}
                      onChange={(event) =>
                        setNewTag(event.target.value)
                      }
                      placeholder="Masukkan nama tag"
                      maxLength={30}
                      autoFocus
                    />

                    <button
                      type="button"
                      className="create-post-button"
                      onClick={handleAddTag}
                    >
                      Add
                    </button>

                    <button
                      type="button"
                      className="create-post-button create-post-button-secondary"
                      onClick={() => {
                        setShowTagInput(false);
                        setNewTag('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <p className="create-post-guideline">
                *Use ethical language, show mutual respect, and avoid spam or hoaxes.
              </p>

              {message && (
                <div
                  className="create-post-message success"
                  role="status"
                >
                  {message}
                </div>
              )}

              {error && (
                <div
                  className="create-post-message error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="create-post-actions">
                <button
                  type="button"
                  className="create-post-button create-post-button-secondary"
                  disabled
                  title="Fitur draft memerlukan dukungan penyimpanan."
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  className="create-post-button create-post-submit"
                  disabled={!canSubmit}
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreatePost;