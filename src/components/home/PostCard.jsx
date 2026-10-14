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
  if (!value) {
    return '';
  }

  const date = new Date(String(value).replace(' ', 'T'));
  const elapsed = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime()) || elapsed < 0) {
    return '';
  }

  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) {
    return 'baru saja';
  }
  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} jam lalu`;
  }

  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function PostCard({
  post,
  currentUser,
  onRequireLogin,
  onPostDeleted,
  onPostUpdated,
}) {
  const [postContent, setPostContent] = useState(
    post.content
  );
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(
    post.content
  );
  const [isPostEditLoading, setIsPostEditLoading] =
    useState(false);
  const [isPostDeleteLoading, setIsPostDeleteLoading] =
    useState(false);
  const [postError, setPostError] = useState('');
  const [isReacted, setIsReacted] = useState(
    post.is_reacted
  );
  const [reactionCount, setReactionCount] = useState(
    post.reaction_count
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(
    post.is_bookmarked
  );

  const [isBookmarkLoading, setIsBookmarkLoading] =
    useState(false);

  const [bookmarkError, setBookmarkError] = useState('');

  const [comments, setComments] = useState([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  const [editingCommentId, setEditingCommentId] =
    useState(null);

  const [editingContent, setEditingContent] = useState('');

  const [isCommentLoading, setIsCommentLoading] =
    useState(false);

  const [isEditLoading, setIsEditLoading] =
    useState(false);

  const [commentError, setCommentError] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setPostContent(post.content);
    setEditPostContent(post.content);
  }, [post.content]);

  const loadComments = useCallback(async () => {
    try {
      setCommentError('');

      const result = await getComments(post.id);

      setComments(result.data.comments);
      setHasLoadedComments(true);
    } catch (err) {
      setCommentError(
        err.message || 'Gagal mengambil komentar.'
      );
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
    setEditPostContent(postContent);
    setPostError('');
    setIsEditingPost(true);
  }

  function handleCancelEditPost() {
    setEditPostContent(postContent);
    setPostError('');
    setIsEditingPost(false);
  }

  async function handleEditPost() {
    if (isPostEditLoading) {
      return;
    }

    if (editPostContent.trim() === '') {
      setPostError('Isi postingan wajib diisi.');
      return;
    }

    setIsPostEditLoading(true);
    setPostError('');

    try {
      const result = await editPost(
        post.id,
        editPostContent.trim()
      );

      const updatedContent =
        result.data?.post?.content ??
        editPostContent.trim();

      setPostContent(updatedContent);
      setEditPostContent(updatedContent);
      setIsEditingPost(false);

      if (onPostUpdated) {
        onPostUpdated(
          post.id,
          updatedContent
        );
      }
    } catch (err) {
      setPostError(
        err.message || 'Gagal mengubah postingan.'
      );
    } finally {
      setIsPostEditLoading(false);
    }
  }
  async function handleDeletePost() {
    if (isPostDeleteLoading) {
      return;
    }

    const confirmed = window.confirm(
      'Yakin ingin menghapus postingan ini?'
    );

    if (!confirmed) {
      return;
    }

    setIsPostDeleteLoading(true);
    setPostError('');

    try {
      await deletePost(post.id);

      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (err) {
      setPostError(
        err.message || 'Gagal menghapus postingan.'
      );
    } finally {
      setIsPostDeleteLoading(false);
    }
  }
  async function handleReaction() {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await toggleReaction(post.id);

      setIsReacted(
        result.data.is_reacted
      );

      setReactionCount(
        result.data.reaction_count
      );
    } catch (err) {
      setError(
        err.message || 'Gagal mengubah reaction.'
      );
    } finally {
      setIsLoading(false);
    }
  }
  async function handleBookmark() {
    if (!currentUser) {
  onRequireLogin();
  return;
}
    if (isBookmarkLoading) {
      return;
    }

    setIsBookmarkLoading(true);
    setBookmarkError('');

    try {
      const result = await toggleBookmark(post.id);

      setIsBookmarked(
        result.data.is_bookmarked
      );
    } catch (err) {
      setBookmarkError(
        err.message || 'Gagal mengubah bookmark.'
      );
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
    if (isCommentLoading) {
      return;
    }

    if (commentContent.trim() === '') {
      setCommentError(
        'Komentar wajib diisi.'
      );
      return;
    }

    setIsCommentLoading(true);
    setCommentError('');

    try {
      await createComment(
        post.id,
        commentContent.trim()
      );

      setCommentContent('');

      await loadComments();
    } catch (err) {
      setCommentError(
        err.message || 'Gagal membuat komentar.'
      );
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

    if (isEditLoading) {
      return;
    }

    if (editingContent.trim() === '') {
      setEditError(
        'Komentar wajib diisi.'
      );
      return;
    }

    setIsEditLoading(true);
    setEditError('');

    try {
      await editComment(
        editingCommentId,
        editingContent.trim()
      );

      setEditingCommentId(null);
      setEditingContent('');

      await loadComments();
    } catch (err) {
      setEditError(
        err.message || 'Gagal mengubah komentar.'
      );
    } finally {
      setIsEditLoading(false);
    }
  }
  async function handleDeleteComment(commentId) {
    if (
      !window.confirm(
        'Yakin ingin menghapus komentar ini?'
      )
    ) {
      return;
    }

    setCommentError('');

    try {
      await deleteComment(commentId);

      await loadComments();
    } catch (err) {
      setCommentError(
        err.message || 'Gagal menghapus komentar.'
      );
    }
  }

  return (
    <article className="post-card">
      <header className="post-author">
        <div className="post-avatar" aria-hidden="true">
          {(post.full_name || 'A')
            .split(' ')
            .map((name) => name[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
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
      </header>

      {post.caption && (
        <h3 className="post-caption">{post.caption}</h3>
      )}

      {isEditingPost ? (
        <div className="post-edit-form">
          <textarea
            value={editPostContent}
            onChange={(event) =>
              setEditPostContent(
                event.target.value
              )
            }
            rows="5"
            disabled={isPostEditLoading}
          />

          <button
            type="button"
            onClick={handleEditPost}
            disabled={isPostEditLoading}
          >
            {isPostEditLoading
              ? 'Menyimpan...'
              : 'Simpan'}
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

      {post.hashtags.length > 0 && (
        <div className="post-tags">
          {post.hashtags.map((hashtag) => (
            <span key={hashtag}>{hashtag}</span>
          ))}
        </div>
      )}

      {post.media.length > 0 && (
        <div className="post-media">
          {post.media.map((media) => {
            const mediaUrl = `http://localhost/node/${media.file_path}`;

            if (media.file_type.startsWith('image/')) {
              return (
                <img
                  key={media.id}
                  src={mediaUrl}
                  alt="Media postingan"
                />
              );
            }

            if (media.file_type.startsWith('video/')) {
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
            <path d="M20.8 8.8c0 4.1-8.8 10-8.8 10S3.2 12.9 3.2 8.8a4.3 4.3 0 0 1 8.8-1.2 4.3 4.3 0 0 1 8.8 1.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          <span>{reactionCount}</span>
        </button>

        <button
          type="button"
          className="post-action"
          onClick={handleToggleComments}
          aria-expanded={isCommentsOpen}
          aria-label={`${post.comment_count} komentar`}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-5.5A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          <span>{hasLoadedComments ? comments.length : post.comment_count}</span>
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
            <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

        {commentError && (
          <p>{commentError}</p>
        )}

        {comments.length === 0 ? (
          <p>Belum ada komentar.</p>
        ) : (
          <div className="comment-list">
            {comments.map((comment) => (
              <div className="comment-item" key={comment.id}>
                <p className="comment-author">
                  <strong>
                    {comment.full_name}
                  </strong>
                  {' · '}
                  {comment.status}
                </p>

                {/* COMMENT EDIT FORM */}
                {editingCommentId ===
                comment.id ? (
                  <form
                    onSubmit={
                      handleEditComment
                    }
                  >
                    <textarea
                      value={editingContent}
                      onChange={(event) =>
                        setEditingContent(
                          event.target.value
                        )
                      }
                      rows="4"
                      disabled={isEditLoading}
                    />

                    <br />

                    <button
                      type="submit"
                      disabled={isEditLoading}
                    >
                      {isEditLoading
                        ? 'Menyimpan...'
                        : 'Simpan'}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleCancelEdit
                      }
                      disabled={isEditLoading}
                    >
                      Batal
                    </button>

                    {editError && (
                      <p>{editError}</p>
                    )}
                  </form>
                ) : (
                  <p className="comment-content">{comment.content}</p>
                )}

                {/* COMMENT ACTIONS */}
                {editingCommentId !==
                  comment.id &&
                  comment.can_edit && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStartEdit(
                          comment
                        )
                      }
                    >
                      Edit
                    </button>
                  )}

                {editingCommentId !==
                  comment.id &&
                  comment.can_delete && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteComment(
                          comment.id
                        )
                      }
                    >
                      Hapus
                    </button>
                  )}

                <hr />
              </div>
            ))}
          </div>
        )}

        {/* CREATE COMMENT */}
        <form className="comment-form" onSubmit={handleCreateComment}>
          <textarea
            value={commentContent}
            onChange={(event) =>
              setCommentContent(
                event.target.value
              )
            }
            placeholder="Tulis komentar..."
            rows="4"
            disabled={isCommentLoading}
          />

          <br />

          <button
            type="submit"
            disabled={isCommentLoading}
          >
            {isCommentLoading
              ? 'Mengirim...'
              : 'Kirim Komentar'}
          </button>
        </form>
      </section>
      )}
    </article>
  );
}

export default PostCard;
