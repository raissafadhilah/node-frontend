
import {
  Search,
  Bell,
  SquarePlus,
  House,
  Compass,
  Settings,
  ImagePlus,
  X,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  createPost,
  getCurrentUser,
} from '../services/api';

import './CreatePost.css';

const INITIAL_TAGS = [];
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
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Ambil data akun yang sedang login, mengikuti Home.jsx.
  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      try {
        const result = await getCurrentUser();

        if (!mounted) return;

        if (result.success) {
          setCurrentUser(result.data);
        } else {
          setCurrentUser(null);
        }
      } catch {
        if (mounted) {
          setCurrentUser(null);
        }
      }
    }

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Membuat preview media yang dipilih.
  useEffect(() => {
    if (!media) {
      setMediaPreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(media);
    setMediaPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [media]);

  function handleMediaChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!ALLOWED_MEDIA_TYPES.includes(selectedFile.type)) {
      setError('Format media tidak didukung.');
      event.target.value = '';
      return;
    }

    setError('');
    setMedia(selectedFile);
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

    setTags((current) => [...current, cleanTag]);
    setNewTag('');
    setShowTagInput(false);
    setError('');
  }

  function handleRemoveTag(tagToRemove) {
    setTags((current) =>
      current.filter((tag) => tag !== tagToRemove)
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

    setLoading(true);

    try {
      await createPost({
        caption: title.trim(),
        content: content.trim(),
        hashtags: tags.map((tag) => `#${tag}`).join(' '),
        media,
      });

      setMessage('Postingan berhasil dibuat!');

      setTitle('');
      setContent('');
      setTags([]);
      setCategory('');
      setMedia(null);
      setNewTag('');
      setShowTagInput(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

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

  return (
    <div className="feed-page">
      {/* HEADER: disamakan strukturnya dengan Home.jsx */}
      <header className="top-header">
        <Link to="/" className="brand">
          <img
            src="/node-logo.png"
            alt="Node logo"
            className="brand-logo"
          />

          <span className="brand-name">node</span>
        </Link>

        <div className="search-bar">
          <span className="search-icon" aria-hidden="true">
            <Search size={18} strokeWidth={1.6} />
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
            title="Notifications"
          >
            <Bell size={20} strokeWidth={1.6} />
          </button>

          {currentUser ? (
            <Link
              to="/profile"
              className="header-user"
              aria-label={`Profile ${currentUser.full_name || ''}`}
            >
              <div className="header-user-avatar">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${currentUser.full_name || 'User'} profile`}
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

      {/* BODY: sidebar dan konten Create Post */}
      <div className="feed-layout">
        <aside className="sidebar">
          <Link
            to="/create-post"
            className="ask-post-button"
            aria-current="page"
          >
            <SquarePlus
              className="ask-post-icon"
              aria-hidden="true"
            />

            <span>Ask / Post</span>
          </Link>

          <div className="sidebar-section">
            <p className="sidebar-label">MAIN MENU</p>

            <Link to="/" className="sidebar-item">
              <House aria-hidden="true" />
              <span>Home</span>
            </Link>

            <button
              type="button"
              className="sidebar-item disabled"
              disabled
            >
              <Compass aria-hidden="true" />
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
              <Settings aria-hidden="true" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        <main className="create-post-main">
          <div className="create-post-page">
            <div className="create-post-container">
              <nav
                className="create-post-breadcrumb"
                aria-label="Breadcrumb"
              >
                <Link to="/">Node</Link>
                <span aria-hidden="true">›</span>
                <span>Ask / Post</span>
              </nav>

              <form
                className="create-post-form"
                onSubmit={handleSubmit}
              >
                {/* CATEGORY */}
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

                {/* TITLE */}
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

                {/* MEDIA UPLOAD */}
                <div className="create-post-media">
                  {mediaPreview ? (
                    media?.type.startsWith('video/') ? (
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
                    )
                  ) : (
                    <div className="create-post-media-empty">
                      <ImagePlus
                        size={30}
                        strokeWidth={1.4}
                        aria-hidden="true"
                      />

                      <span>
                        Tambahkan gambar atau video
                      </span>
                    </div>
                  )}

                  <button
                    className="create-post-upload-button"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon size={14} aria-hidden="true" />

                    {media ? 'Change media' : 'Add'}
                  </button>

                  {media && (
                    <button
                      className="create-post-remove-media"
                      type="button"
                      onClick={handleRemoveMedia}
                    >
                      <X size={14} aria-hidden="true" />
                      Remove
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    id="post-media"
                    className="create-post-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/ogg"
                    onChange={handleMediaChange}
                  />
                </div>

                {/* BODY TEXT + TOOLBAR */}
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
                        <ImageIcon size={14} />
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
                        <LinkIcon size={14} />
                      </button>

                      <button
                        type="button"
                        className="create-post-toolbar-button"
                        title="Bold"
                        aria-label="Tandai teks tebal"
                        onClick={() => insertFormatting('**')}
                      >
                        <Bold size={15} />
                      </button>

                      <button
                        type="button"
                        className="create-post-toolbar-button"
                        title="Italic"
                        aria-label="Tandai teks miring"
                        onClick={() => insertFormatting('_')}
                      >
                        <Italic size={14} />
                      </button>

                      <button
                        type="button"
                        className="create-post-toolbar-button"
                        title="Strikethrough"
                        aria-label="Tandai teks coret"
                        onClick={() => insertFormatting('~~')}
                      >
                        <Strikethrough size={14} />
                      </button>

                      <button
                        type="button"
                        className="create-post-toolbar-button"
                        title="Bullet list"
                        aria-label="Buat daftar"
                        onClick={() =>
                          insertFormatting('- ')
                        }
                      >
                        <List size={14} />
                      </button>

                      <button
                        type="button"
                        className="create-post-toolbar-button"
                        title="Numbered list"
                        aria-label="Buat daftar bernomor"
                        onClick={() =>
                          insertFormatting('1. ')
                        }
                      >
                        <ListOrdered size={14} />
                      </button>

                      <button
                        type="button"
                        className="create-post-toolbar-button"
                        title="Code"
                        aria-label="Tandai kode"
                        onClick={() => insertFormatting('`')}
                      >
                        <Code2 size={14} />
                      </button>

                      <span
                        style={{
                          marginLeft: 'auto',
                          color: '#999',
                          fontSize: 10,
                        }}
                      >
                        {content.length} characters
                      </span>
                    </div>
                  </div>
                </div>

                {/* TAGS */}
                <div className="create-post-field">
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

                {/* FORM ACTIONS */}
                <div className="create-post-actions">
                  <button
                    type="button"
                    className="create-post-button create-post-button-secondary"
                    disabled
                    title="Fitur draft perlu dukungan penyimpanan di backend."
                  >
                    Save Draft
                  </button>

                  <button
                    type="submit"
                    className="create-post-button"
                    disabled={loading}
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreatePost;
