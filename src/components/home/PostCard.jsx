
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  toggleReaction,
  toggleBookmark,
  getComments,
  createComment,
  editComment,
  deleteComment,
  editPost,
  deletePost,
} from '../../services/api';

function formatRelativeTime(value) {
  if (!value) return '';

  const date = new Date(String(value).replace(' ', 'T'));
  const elapsed = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime()) || elapsed < 0) return '';

  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  return `${Math.floor(hours / 24)} hari lalu`;
}

function PostCard({
  post,
  currentUser,
  onRequireLogin,
  onPostDeleted,
  onPostUpdated,
  onBookmarkChanged,
}) {
  const [postContent, setPostContent] = useState(post.content ?? '');
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(post.content ?? '');
  const [isPostEditLoading, setIsPostEditLoading] = useState(false);
  const [isPostDeleteLoading, setIsPostDeleteLoading] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [postError, setPostError] = useState('');

  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const [isReacted, setIsReacted] = useState(post.is_reacted ?? false);
  const [reactionCount, setReactionCount] = useState(post.reaction_count ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked ?? false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState('');

  const [comments, setComments] = useState([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [editError, setEditError] = useState('');

  // Izin edit dan hapus ditentukan oleh backend.
  const canEditPost = post.can_edit === true || post.can_edit === 1;
  const canDeletePost = post.can_delete === true || post.can_delete === 1;
  const hasOwnerPermission = canEditPost || canDeletePost;

  useEffect(() => {
    setPostContent(post.content ?? '');
    setEditPostContent(post.content ?? '');
    setIsReacted(post.is_reacted ?? false);
    setReactionCount(post.reaction_count ?? 0);
    setIsBookmarked(post.is_bookmarked ?? false);
  }, [
    post.content,
    post.is_reacted,
    post.reaction_count,
    post.is_bookmarked,
  ]);

  // Tutup menu ketika pengguna mengeklik area di luar menu.
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        !event.target.closest('.post-menu-container')
      ) {
        setIsPostMenuOpen(false);
      }
    }

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const loadComments = useCallback(async () => {
    try {
      setCommentError('');
      const result = await getComments(post.id);
      setComments(result.data.comments);
      setHasLoadedComments(true);
    } catch (err) {
      setCommentError(err.message || 'Gagal mengambil komentar.');
    }
  }, [post.id]);

  async function handleToggleComments() {
    const shouldOpen = !isCommentsOpen;
    setIsCommentsOpen(shouldOpen);

    if (shouldOpen && !hasLoadedComments) {
      await loadComments();
    }
  }

  function handleStartEditPost() {
    if (!canEditPost) return;

    setEditPostContent(postContent);
    setPostError('');
    setIsEditingPost(true);
    setIsPostMenuOpen(false);
  }

  function handleCancelEditPost() {
    setEditPostContent(postContent);
    setPostError('');
    setIsEditingPost(false);
  }

  async function handleEditPost() {
    if (!canEditPost || isPostEditLoading) return;

    if (editPostContent.trim() === '') {
      setPostError('Isi postingan wajib diisi.');
      return;
    }

    setIsPostEditLoading(true);
    setPostError('');

    try {
      const result = await editPost(post.id, editPostContent.trim());
      const updatedContent =
        result.data?.post?.content ?? editPostContent.trim();

      setPostContent(updatedContent);
      setEditPostContent(updatedContent);
      setIsEditingPost(false);
      onPostUpdated?.(post.id, updatedContent);
    } catch (err) {
      setPostError(err.message || 'Gagal mengubah postingan.');
    } finally {
      setIsPostEditLoading(false);
    }
  }

  async function handleDeletePost() {
    if (!canDeletePost || isPostDeleteLoading) return;

    setIsPostMenuOpen(false);

    const confirmed = window.confirm(
      'Yakin ingin menghapus postingan ini?'
    );

    if (!confirmed) return;

    setIsPostDeleteLoading(true);
    setPostError('');

    try {
      await deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (err) {
      setPostError(err.message || 'Gagal menghapus postingan.');
    } finally {
      setIsPostDeleteLoading(false);
    }
  }

  async function handleCopyLink() {
    setIsPostMenuOpen(false);
    setShareMessage('');

    const postUrl = new URL(window.location.href);
    postUrl.hash = `post-${post.id}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(postUrl.toString());
        setShareMessage('Tautan berhasil disalin.');
      } else {
        window.prompt('Salin tautan postingan ini:', postUrl.toString());
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setPostError('Gagal menyalin tautan.');
      }
    }
  }

  function handleReportPost() {
    setIsPostMenuOpen(false);
    window.alert(
      'Fitur laporan belum terhubung ke backend. Postingan belum dilaporkan.'
    );
  }

  async function handleReaction() {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await toggleReaction(post.id, {
        is_reacted: isReacted,
        reaction_count: reactionCount,
      });

      setIsReacted(result.data.is_reacted);
      setReactionCount(result.data.reaction_count);
    } catch (err) {
      setError(err.message || 'Gagal mengubah reaction.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBookmark() {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    setBookmarkError('');

    try {
      const result = await toggleBookmark(post.id, {
        is_bookmarked: isBookmarked,
      });

      setIsBookmarked(result.data.is_bookmarked);
      onBookmarkChanged?.(post.id, result.data.is_bookmarked);
    } catch (err) {
      setBookmarkError(err.message || 'Gagal mengubah bookmark.');
    } finally {
      setIsBookmarkLoading(false);
    }
  }

  async function handleCreateComment(event) {
    event.preventDefault();

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (isCommentLoading) return;

    if (commentContent.trim() === '') {
      setCommentError('Komentar wajib diisi.');
      return;
    }

    setIsCommentLoading(true);
    setCommentError('');

    try {
      await createComment(post.id, commentContent.trim());
      setCommentContent('');
      await loadComments();
    } catch (err) {
      setCommentError(err.message || 'Gagal membuat komentar.');
    } finally {
      setIsCommentLoading(false);
    }
  }

  function handleStartEdit(comment) {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setEditError('');
  }

  function handleCancelEdit() {
    setEditingCommentId(null);
    setEditingContent('');
    setEditError('');
  }

  async function handleEditComment(event) {
    event.preventDefault();

    if (isEditLoading) return;

    if (editingContent.trim() === '') {
      setEditError('Komentar wajib diisi.');
      return;
    }

    setIsEditLoading(true);
    setEditError('');

    try {
      await editComment(editingCommentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent('');
      await loadComments();
    } catch (err) {
      setEditError(err.message || 'Gagal mengubah komentar.');
    } finally {
      setIsEditLoading(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Yakin ingin menghapus komentar ini?')) {
      return;
    }

    setCommentError('');

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err) {
      setCommentError(err.message || 'Gagal menghapus komentar.');
    }
  }

  const mediaItems = Array.isArray(post.media) ? post.media : [];

  return (
    <article className="post-card" id={`post-${post.id}`}>
      <header className="post-author">

        <div className="post-avatar">
          {post.profile_photo && !avatarFailed ? (
            <img
              src={
                post.profile_photo.startsWith('http')
                  ? post.profile_photo
                  : post.profile_photo.startsWith('/node/')
                    ? `http://localhost${post.profile_photo}`
                    : `http://localhost/node/${post.profile_photo.replace(/^\/+/, '')}`
              }
              alt={`Foto profil ${post.full_name || 'Anonim'}`}
              onError={() => setAvatarFailed(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 'inherit',
                display: 'block',
              }}
            />
          ) : (
            <span className="post-avatar-fallback" aria-hidden="true">
              {(post.full_name || 'A')
                .split(' ')
                .map((name) => name[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </div>


        <div className="post-author-info">
          <strong>{post.full_name || 'Anonim'}</strong>
          <span>{formatRelativeTime(post.created_at)}</span>
        </div>

        <div className="post-status-group">
          <span className="post-status">{post.status}</span>

          {post.hashtags?.length > 0 && (
            <div className="post-tags">
              {post.hashtags.map((hashtag, index) => {
                const normalizedTag = String(hashtag)
                  .replace(/^#/, '')
                  .trim();

                return (
                  <Link
                    key={`${normalizedTag}-${index}`}
                    to={`/tag/${encodeURIComponent(normalizedTag)}`}
                    className="post-tag-link"
                  >
                    #{normalizedTag}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="post-menu-container">
          <button
            type="button"
            className="post-menu-trigger"
            aria-label="Menu postingan"
            aria-expanded={isPostMenuOpen}
            aria-haspopup="menu"
            onClick={(event) => {
              event.stopPropagation();
              setIsPostMenuOpen((open) => !open);
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>

          {isPostMenuOpen && (
            <div
              className="post-menu"
              role="menu"
              onClick={(event) => event.stopPropagation()}
            >
              {canEditPost && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleStartEditPost}
                >
                  Edit postingan
                </button>
              )}

              {canDeletePost && (
                <button
                  type="button"
                  role="menuitem"
                  className="post-menu-danger"
                  disabled={isPostDeleteLoading}
                  onClick={handleDeletePost}
                >
                  {isPostDeleteLoading ? 'Menghapus...' : 'Hapus postingan'}
                </button>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={handleCopyLink}
              >
                Copy Link
              </button>

              <button
                type="button"
                role="menuitem"
                disabled={isBookmarkLoading}
                onClick={() => {
                  setIsPostMenuOpen(false);
                  handleBookmark();
                }}
              >
                {isBookmarked ? 'Remove from saved' : 'Save'}
              </button>

              {!hasOwnerPermission && (
                <button
                  type="button"
                  role="menuitem"
                  className="post-menu-danger"
                  onClick={handleReportPost}
                >
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {mediaItems.length > 0 && (
        <div className="post-media">
          {mediaItems.map((media) => {
            const mediaUrl =
              media.data_url ||
              `http://localhost/node/${media.file_path}`;

            if (media.file_type?.startsWith('image/')) {
              return (
                <div className="post-media-image" key={media.id}>
                  <img
                    className="post-media-blur"
                    src={mediaUrl}
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="post-media-main"
                    src={mediaUrl}
                    alt="Media postingan"
                    loading="lazy"
                  />
                </div>
              );
            }

            if (media.file_type?.startsWith('video/')) {
              return (
                <video
                  key={media.id}
                  src={mediaUrl}
                  controls
                />
              );
            }

            return (
              <a
                key={media.id}
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
              >
                Lihat media
              </a>
            );
          })}
        </div>
      )}

      {post.caption && (
        <h3 className="post-caption">{post.caption}</h3>
      )}

      {isEditingPost ? (
        <div className="post-edit-form">
          <textarea
            value={editPostContent}
            onChange={(event) => setEditPostContent(event.target.value)}
            rows="5"
            disabled={isPostEditLoading}
          />

          <button
            type="button"
            onClick={handleEditPost}
            disabled={isPostEditLoading}
          >
            {isPostEditLoading ? 'Menyimpan...' : 'Simpan'}
          </button>

          <button
            type="button"
            onClick={handleCancelEditPost}
            disabled={isPostEditLoading}
          >
            Batal
          </button>
        </div>
      ) : (
        <p className="post-content">{postContent}</p>
      )}

      {postError && (
        <p className="post-feedback" role="alert">{postError}</p>
      )}

      {shareMessage && (
        <p className="post-feedback" role="status">{shareMessage}</p>
      )}

      <div className="post-actions">
        <button
          type="button"
          className={isReacted ? 'post-action is-active' : 'post-action'}
          onClick={handleReaction}
          disabled={isLoading}
          aria-pressed={isReacted}
          aria-label={isReacted ? 'Batalkan reaction' : 'Beri reaction'}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20.8 8.8c0 4.1-8.8 10-8.8 10S3.2 12.9 3.2 8.8a4.3 4.3 0 0 1 8.8-1.2 4.3 4.3 0 0 1 8.8 1.2Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          <span>{reactionCount}</span>
        </button>

        <button
          type="button"
          className="post-action"
          onClick={handleToggleComments}
          aria-expanded={isCommentsOpen}
          aria-label={`${post.comment_count ?? 0} komentar`}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-5.5A7.5 7.5 0 1 1 20 11.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            {hasLoadedComments ? comments.length : (post.comment_count ?? 0)}
          </span>
        </button>

        <button
          type="button"
          className={isBookmarked ? 'post-action is-active' : 'post-action'}
          onClick={handleBookmark}
          disabled={isBookmarkLoading}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? 'Hapus dari tersimpan' : 'Simpan postingan'}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {(error || bookmarkError) && (
        <p className="post-feedback" role="alert">
          {error || bookmarkError}
        </p>
      )}

      {isCommentsOpen && (
        <section className="comments-panel">
          <h4>Komentar</h4>

          {commentError && <p role="alert">{commentError}</p>}

          {comments.length === 0 ? (
            <p>Belum ada komentar.</p>
          ) : (
            <div className="comment-list">
              {comments.map((comment) => (
                <div className="comment-item" key={comment.id}>
                  <p className="comment-author">
                    <strong>{comment.full_name}</strong>
                    {' · '}
                    {comment.status}
                  </p>

                  {editingCommentId === comment.id ? (
                    <form onSubmit={handleEditComment}>
                      <textarea
                        value={editingContent}
                        onChange={(event) =>
                          setEditingContent(event.target.value)
                        }
                        rows="4"
                        disabled={isEditLoading}
                      />

                      <button type="submit" disabled={isEditLoading}>
                        {isEditLoading ? 'Menyimpan...' : 'Simpan'}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isEditLoading}
                      >
                        Batal
                      </button>

                      {editError && <p role="alert">{editError}</p>}
                    </form>
                  ) : (
                    <p className="comment-content">{comment.content}</p>
                  )}

                  {editingCommentId !== comment.id && comment.can_edit && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(comment)}
                    >
                      Edit
                    </button>
                  )}

                  {editingCommentId !== comment.id && comment.can_delete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Hapus
                    </button>
                  )}

                  <hr />
                </div>
              ))}
            </div>
          )}

          <form className="comment-form" onSubmit={handleCreateComment}>
            <textarea
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="Tulis komentar..."
              rows="4"
              disabled={isCommentLoading}
            />

            <button type="submit" disabled={isCommentLoading}>
              {isCommentLoading ? 'Mengirim...' : 'Kirim Komentar'}
            </button>
          </form>
        </section>
      )}
    </article>
  );
}

export default PostCard;
