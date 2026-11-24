
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Trash2,
  Send,
  X,
} from 'lucide-react';

import {
  getExplorePosts,
  getCurrentUser,
  toggleReaction,
  toggleBookmark,
  getComments,
  createComment,
  editComment,
  deleteComment,
  editPost,
  deletePost,
} from '../services/api';

import './Explore.css';

const filters = [
  { label: 'All Topics', value: 'all' },
  { label: 'Hot', value: 'hot' },
  { label: 'FICT', value: 'FICT' },
  { label: 'FMB', value: 'FMB' },
  { label: 'FHS', value: 'FHS' },
];

function getProfilePhotoUrl(path) {
  if (!path) return '';

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = String(path).replace(/^\/+/, '');

  if (normalizedPath.startsWith('node/')) {
    return `http://localhost/${normalizedPath}`;
  }

  return `http://localhost/node/${normalizedPath}`;
}

function getCategoryLabel(category) {
  const labels = {
    FICT: 'FICT Students',
    FMB: 'FMB Students',
    FHS: 'FHS Students',
  };

  return labels[category] || 'Community member';
}

function getRelativeTime(dateString) {
  if (!dateString) return '';

  const date = new Date(String(dateString).replace(' ', 'T'));

  if (Number.isNaN(date.getTime())) return '';

  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getPostHashtags(post) {
  let hashtags = [];

  if (Array.isArray(post.hashtags)) {
    hashtags = post.hashtags;
  } else if (typeof post.hashtags === 'string') {
    hashtags = post.hashtags.split(',');
  }

  const text = `${post.caption || ''} ${post.content || ''}`;
  const extracted = text.match(/#[\p{L}\p{N}_]+/gu) || [];

  const combined = [...hashtags, ...extracted]
    .map((tag) => {
      const normalized = String(tag).trim().replace(/^#/, '');
      return normalized ? `#${normalized}` : '';
    })
    .filter(Boolean);

  return [...new Set(combined)].slice(0, 4);
}

function ExplorePostCard({
  post,
  currentUser,
  onRequireLogin,
  onPostDeleted,
  onPostUpdated,
}) {
  const [isReacted, setIsReacted] = useState(
    Boolean(post.is_reacted ?? post.is_reacted_by_me)
  );

  const [reactionCount, setReactionCount] = useState(
    Number(post.reaction_count || 0)
  );

  const [isBookmarked, setIsBookmarked] = useState(
    Boolean(post.is_bookmarked ?? post.is_bookmarked_by_me)
  );

  const [isReactionLoading, setIsReactionLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);

  const [commentContent, setCommentContent] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [isCommentEditing, setIsCommentEditing] = useState(false);

  const [commentError, setCommentError] = useState('');
  const [postError, setPostError] = useState('');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(post.content || '');
  const [isPostSaving, setIsPostSaving] = useState(false);
  const [isPostDeleting, setIsPostDeleting] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const canEditPost = post.can_edit === true || post.can_edit === 1;
  const canDeletePost = post.can_delete === true || post.can_delete === 1;

  const hashtags = getPostHashtags(post);

  useEffect(() => {
    setIsReacted(
      Boolean(post.is_reacted ?? post.is_reacted_by_me)
    );

    setReactionCount(Number(post.reaction_count || 0));

    setIsBookmarked(
      Boolean(post.is_bookmarked ?? post.is_bookmarked_by_me)
    );

    setEditPostContent(post.content || '');
  }, [
    post.is_reacted,
    post.is_reacted_by_me,
    post.reaction_count,
    post.is_bookmarked,
    post.is_bookmarked_by_me,
    post.content,
  ]);

  const loadComments = useCallback(async () => {
    setIsCommentsLoading(true);
    setCommentError('');

    try {
      const result = await getComments(post.id);

      setComments(
        Array.isArray(result.data?.comments)
          ? result.data.comments
          : []
      );

      setHasLoadedComments(true);
    } catch (err) {
      setCommentError(
        err.message || 'Gagal mengambil komentar.'
      );
    } finally {
      setIsCommentsLoading(false);
    }
  }, [post.id]);

  function handleRequireLogin() {
    onRequireLogin();
  }

  async function handleReaction() {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    if (isReactionLoading) return;

    setIsReactionLoading(true);
    setPostError('');

    try {
      const result = await toggleReaction(post.id, {
        is_reacted: isReacted,
        reaction_count: reactionCount,
      });

      setIsReacted(Boolean(result.data?.is_reacted));
      setReactionCount(Number(result.data?.reaction_count || 0));
    } catch (err) {
      setPostError(err.message || 'Gagal mengubah reaction.');
    } finally {
      setIsReactionLoading(false);
    }
  }

  async function handleBookmark() {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    if (isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    setPostError('');

    try {
      const result = await toggleBookmark(post.id, {
        is_bookmarked: isBookmarked,
      });

      setIsBookmarked(Boolean(result.data?.is_bookmarked));
    } catch (err) {
      setPostError(err.message || 'Gagal menyimpan postingan.');
    } finally {
      setIsBookmarkLoading(false);
    }
  }

  async function handleMenuBookmark() {
    setIsMenuOpen(false);
    await handleBookmark();
  }

  async function handleToggleComments() {
    const shouldOpen = !isCommentsOpen;

    setIsCommentsOpen(shouldOpen);
    setCommentError('');

    if (shouldOpen && !hasLoadedComments) {
      await loadComments();
    }
  }

  async function handleCreateComment(event) {
    event.preventDefault();

    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    if (!commentContent.trim()) {
      setCommentError('Komentar wajib diisi.');
      return;
    }

    if (isCommentSubmitting) return;

    setIsCommentSubmitting(true);
    setCommentError('');

    try {
      await createComment(post.id, commentContent.trim());

      setCommentContent('');
      await loadComments();
    } catch (err) {
      setCommentError(err.message || 'Gagal mengirim komentar.');
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  function handleStartEditComment(comment) {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content || '');
    setCommentError('');
  }

  async function handleSaveEditComment(event) {
    event.preventDefault();

    if (!editingCommentContent.trim()) {
      setCommentError('Komentar wajib diisi.');
      return;
    }

    if (isCommentEditing) return;

    setIsCommentEditing(true);
    setCommentError('');

    try {
      await editComment(
        editingCommentId,
        editingCommentContent.trim()
      );

      setEditingCommentId(null);
      setEditingCommentContent('');
      await loadComments();
    } catch (err) {
      setCommentError(err.message || 'Gagal mengubah komentar.');
    } finally {
      setIsCommentEditing(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    const confirmed = window.confirm(
      'Yakin ingin menghapus komentar ini?'
    );

    if (!confirmed) return;

    setCommentError('');

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err) {
      setCommentError(err.message || 'Gagal menghapus komentar.');
    }
  }

  async function handleSharePost() {
    setIsMenuOpen(false);
    setShareMessage('');

    const postUrl = new URL(window.location.href);
    postUrl.hash = `post-${post.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.caption || 'Postingan Node',
          url: postUrl.toString(),
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(postUrl.toString());
        setShareMessage('Link berhasil disalin.');
      } else {
        window.prompt('Salin link postingan:', postUrl.toString());
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setPostError('Gagal membagikan postingan.');
      }
    }
  }

  function handleReportPost() {
    setIsMenuOpen(false);

    window.alert(
      'Fitur laporan belum terhubung ke backend. Postingan belum dilaporkan.'
    );
  }

  function handleStartEditPost() {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    setEditPostContent(post.content || '');
    setIsEditingPost(true);
    setIsMenuOpen(false);
    setPostError('');
  }

  async function handleSavePost() {
    if (!editPostContent.trim()) {
      setPostError('Isi postingan wajib diisi.');
      return;
    }

    if (isPostSaving) return;

    setIsPostSaving(true);
    setPostError('');

    try {
      const result = await editPost(
        post.id,
        editPostContent.trim()
      );

      const updatedContent =
        result.data?.post?.content ?? editPostContent.trim();

      setEditPostContent(updatedContent);
      setIsEditingPost(false);

      onPostUpdated?.(post.id, updatedContent);
    } catch (err) {
      setPostError(err.message || 'Gagal mengubah postingan.');
    } finally {
      setIsPostSaving(false);
    }
  }

  async function handleDeletePost() {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    setIsMenuOpen(false);

    const confirmed = window.confirm(
      'Yakin ingin menghapus postingan ini?'
    );

    if (!confirmed) return;

    setIsPostDeleting(true);
    setPostError('');

    try {
      await deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (err) {
      setPostError(err.message || 'Gagal menghapus postingan.');
    } finally {
      setIsPostDeleting(false);
    }
  }

  return (
    <article
      className="explore-post-card"
      id={`post-${post.id}`}
    >
      <div className="explore-post-top">
        <div className="explore-post-author">
          <div className="explore-avatar">
            <span>
              {post.full_name?.charAt(0)?.toUpperCase() || '?'}
            </span>

            {post.profile_photo && (
              <img
                src={getProfilePhotoUrl(post.profile_photo)}
                alt={post.full_name || 'User'}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>

          <div className="explore-author-info">
            <strong>{post.full_name || 'Node User'}</strong>
            <span>{getRelativeTime(post.created_at)}</span>
          </div>
        </div>

        <div className="explore-post-labels">
          <span className="explore-category">
            <span className="category-dot" />
            {getCategoryLabel(post.category)}
          </span>

          {hashtags.map((tag) => {
            const normalizedTag = tag.replace(/^#/, '');

            return (
              <Link
                className="explore-hashtag"
                key={normalizedTag}
                to={`/tag/${encodeURIComponent(normalizedTag)}`}
              >
                #{normalizedTag}
              </Link>
            );
          })}
        </div>

        <div className="explore-menu-container">
          <button
            type="button"
            className="explore-more-icon"
            aria-label="More options"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <MoreHorizontal size={21} />
          </button>

          {isMenuOpen && (
            <div className="explore-post-menu">
              <button
                type="button"
                onClick={handleSharePost}
              >
                Share post
              </button>

              <button
                type="button"
                onClick={handleReportPost}
                className="explore-menu-danger"
              >
                Report post
              </button>

              <button
                type="button"
                onClick={handleMenuBookmark}
                disabled={isBookmarkLoading}
                aria-pressed={isBookmarked}
              >
                {isBookmarked ? 'Remove saved post' : 'Save post'}
              </button>

              {canEditPost && (
                <button
                  type="button"
                  onClick={handleStartEditPost}
                >
                  <Pencil size={16} />
                  Edit post
                </button>
              )}

              {canDeletePost && (
                <button
                  type="button"
                  onClick={handleDeletePost}
                  disabled={isPostDeleting}
                  className="explore-menu-danger"
                >
                  <Trash2 size={16} />
                  {isPostDeleting ? 'Deleting...' : 'Delete post'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {post.caption && (
        <h2 className="explore-post-title">
          {post.caption}
        </h2>
      )}

      {isEditingPost ? (
        <div className="explore-edit-post">
          <textarea
            value={editPostContent}
            onChange={(event) =>
              setEditPostContent(event.target.value)
            }
            rows={5}
            disabled={isPostSaving}
          />

          <div className="explore-edit-actions">
            <button
              type="button"
              onClick={handleSavePost}
              disabled={isPostSaving}
            >
              {isPostSaving ? 'Saving...' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditingPost(false);
                setEditPostContent(post.content || '');
                setPostError('');
              }}
              disabled={isPostSaving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        post.content && (
          <p className="explore-post-content">
            {post.content}
          </p>
        )
      )}

      {postError && (
        <p className="explore-feedback" role="alert">
          {postError}
        </p>
      )}

      {shareMessage && (
        <p className="explore-feedback" role="status">
          {shareMessage}
        </p>
      )}

      <div className="explore-post-actions">
        <button
          type="button"
          className={`explore-action-item ${isReacted ? 'is-active' : ''}`}
          onClick={handleReaction}
          disabled={isReactionLoading}
          aria-pressed={isReacted}
          aria-label="Like post"
        >
          <Heart
            size={21}
            strokeWidth={1.7}
            fill={isReacted ? 'currentColor' : 'none'}
          />
          <span>{reactionCount}</span>
        </button>

        <button
          type="button"
          className="explore-action-item"
          onClick={handleToggleComments}
          aria-expanded={isCommentsOpen}
          aria-label="Show comments"
        >
          <MessageCircle size={21} strokeWidth={1.7} />
          <span>{post.comment_count || 0}</span>
        </button>

        <button
          type="button"
          className={`explore-action-item explore-bookmark ${isBookmarked ? 'is-active' : ''}`}
          onClick={handleBookmark}
          disabled={isBookmarkLoading}
          aria-pressed={isBookmarked}
          aria-label="Bookmark post"
        >
          <Bookmark
            size={21}
            strokeWidth={1.7}
            fill={isBookmarked ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {isCommentsOpen && (
        <section className="explore-comments-panel">
          <div className="explore-comments-heading">
            <h3>Comments</h3>

            <button
              type="button"
              onClick={() => setIsCommentsOpen(false)}
              aria-label="Close comments"
            >
              <X size={18} />
            </button>
          </div>

          {isCommentsLoading ? (
            <p className="explore-comment-state">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="explore-comment-state">
              Belum ada komentar.
            </p>
          ) : (
            <div className="explore-comment-list">
              {comments.map((comment) => (
                <div
                  className="explore-comment-item"
                  key={comment.id}
                >
                  <strong>
                    {comment.full_name || 'Node User'}
                  </strong>

                  <span className="explore-comment-status">
                    {comment.status}
                  </span>

                  {editingCommentId === comment.id ? (
                    <form onSubmit={handleSaveEditComment}>
                      <textarea
                        value={editingCommentContent}
                        onChange={(event) =>
                          setEditingCommentContent(event.target.value)
                        }
                        rows={3}
                        disabled={isCommentEditing}
                      />

                      <div className="explore-comment-actions">
                        <button
                          type="submit"
                          disabled={isCommentEditing}
                        >
                          {isCommentEditing ? 'Saving...' : 'Save'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingCommentContent('');
                          }}
                          disabled={isCommentEditing}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p>{comment.content}</p>
                  )}

                  {editingCommentId !== comment.id && (
                    <div className="explore-comment-actions">
                      {comment.can_edit && (
                        <button
                          type="button"
                          onClick={() => handleStartEditComment(comment)}
                        >
                          Edit
                        </button>
                      )}

                      {comment.can_delete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {commentError && (
            <p className="explore-feedback" role="alert">
              {commentError}
            </p>
          )}

          {currentUser ? (
            <form
              className="explore-comment-form"
              onSubmit={handleCreateComment}
            >
              <textarea
                value={commentContent}
                onChange={(event) => setCommentContent(event.target.value)}
                placeholder="Write a comment..."
                rows={2}
                disabled={isCommentSubmitting}
              />

              <button
                type="submit"
                disabled={isCommentSubmitting}
              >
                <Send size={16} />
                {isCommentSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="explore-login-prompt"
              onClick={handleRequireLogin}
            >
              Login untuk menulis komentar
            </button>
          )}
        </section>
      )}
    </article>
  );
}

function Explore() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const result = await getCurrentUser();

        if (isMounted) {
          setCurrentUser(
            result?.success ? result.data : null
          );
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadExplorePosts() {
      setLoading(true);
      setError('');

      try {
        const result = await getExplorePosts(activeFilter);

        if (!result || !result.success) {
          throw new Error(
            result?.message || 'Gagal mengambil data Explore.'
          );
        }

        if (isMounted) {
          setPosts(
            Array.isArray(result.data?.posts)
              ? result.data.posts
              : []
          );

          setTrendingTopics(
            Array.isArray(result.data?.trending_topics)
              ? result.data.trending_topics
              : []
          );
        }
      } catch (err) {
        console.error('Gagal mengambil data Explore:', err);

        if (isMounted) {
          setError(err.message || 'Gagal memuat Explore.');
          setPosts([]);
          setTrendingTopics([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadExplorePosts();

    return () => {
      isMounted = false;
    };
  }, [activeFilter, retry]);

  function handleRequireLogin() {
    navigate('/login');
  }

  function handlePostDeleted(postId) {
    setPosts((previousPosts) =>
      previousPosts.filter(
        (post) => String(post.id) !== String(postId)
      )
    );
  }

  function handlePostUpdated(postId, updatedContent) {
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        String(post.id) === String(postId)
          ? { ...post, content: updatedContent }
          : post
      )
    );
  }

  return (
    <div className="explore-page">
      <div className="explore-layout">
        <section className="explore-main">
          <header className="explore-header">
            <h1>Explore Discussions</h1>
          </header>

          <nav
            className="explore-filters"
            aria-label="Filter discussions"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  activeFilter === filter.value ? 'active' : ''
                }
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </nav>

          <section className="explore-posts">
            {loading ? (
              <div className="explore-state">
                <p>Loading discussions...</p>
              </div>
            ) : error ? (
              <div className="explore-state explore-error">
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => setRetry((previous) => previous + 1)}
                >
                  Try again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="explore-state">
                <h3>No discussions yet</h3>
                <p>Belum ada diskusi untuk kategori ini.</p>
              </div>
            ) : (
              <div className="explore-post-list">
                {posts.map((post) => (
                  <ExplorePostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onRequireLogin={handleRequireLogin}
                    onPostDeleted={handlePostDeleted}
                    onPostUpdated={handlePostUpdated}
                  />
                ))}
              </div>
            )}
          </section>
        </section>

        <aside className="explore-sidebar">
          <div className="trending-topics-card">
            <h2>Trending Topics</h2>

            <div className="trending-topics-list">
              {trendingTopics.map((topic) => (
                <Link
                  className="trending-topic"
                  key={`${topic.type}-${topic.name}`}
                  to={`/tag/${encodeURIComponent(
                    String(topic.name).replace(/^#/, '')
                  )}`}
                >
                  #{String(topic.name).replace(/^#/, '')}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Explore;
