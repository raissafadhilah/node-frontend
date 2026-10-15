
import { getMockUser } from './mockAuth';

const POSTS_KEY = 'node_mock_posts';
const INTERACTIONS_KEY = 'node_mock_post_interactions';
const COMMENTS_KEY = 'node_mock_comments';

function readStorage(key, fallback = {}) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getMockPosts() {
  return readStorage(POSTS_KEY, []);
}

function saveMockPosts(posts) {
  writeStorage(POSTS_KEY, posts);
}

// Mengambil status reaction, bookmark, dan jumlah komentar per postingan.
export function getMockPostInteraction(postId) {
  const interactions = readStorage(INTERACTIONS_KEY, {});
  const comments = readStorage(COMMENTS_KEY, {});
  const result = interactions[String(postId)] || {};

  if (Object.prototype.hasOwnProperty.call(comments, String(postId))) {
    result.comment_count = comments[String(postId)].length;
  }

  return result;
}

function saveInteraction(postId, updates) {
  const interactions = readStorage(INTERACTIONS_KEY, {});
  const key = String(postId);

  interactions[key] = {
    ...(interactions[key] || {}),
    ...updates,
  };

  writeStorage(INTERACTIONS_KEY, interactions);
}

export function toggleMockReaction(postId, currentState = {}) {
  const saved = getMockPostInteraction(postId);
  const isReacted = saved.is_reacted ?? currentState.is_reacted ?? false;
  const count = saved.reaction_count ?? currentState.reaction_count ?? 0;
  const nextReacted = !isReacted;
  const nextCount = Math.max(0, Number(count) + (nextReacted ? 1 : -1));

  saveInteraction(postId, {
    is_reacted: nextReacted,
    reaction_count: nextCount,
  });

  return {
    success: true,
    data: {
      is_reacted: nextReacted,
      reaction_count: nextCount,
    },
  };
}

export function toggleMockBookmark(postId, currentState = {}) {
  const saved = getMockPostInteraction(postId);
  const isBookmarked =
    saved.is_bookmarked ?? currentState.is_bookmarked ?? false;
  const nextBookmarked = !isBookmarked;

  saveInteraction(postId, {
    is_bookmarked: nextBookmarked,
  });

  return {
    success: true,
    data: { is_bookmarked: nextBookmarked },
  };
}

export function getMockComments(postId) {
  const comments = readStorage(COMMENTS_KEY, {});
  return comments[String(postId)] || [];
}

export function createMockComment(postId, content) {
  const user = getMockUser();

  if (!user) {
    throw new Error('Silakan login terlebih dahulu.');
  }

  const comments = readStorage(COMMENTS_KEY, {});
  const key = String(postId);
  const postComments = comments[key] || [];

  const comment = {
    id: `mock-comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    post_id: postId,
    full_name: user.full_name || user.nickname || 'Pengguna Dummy',
    status: user.status || 'Mahasiswa',
    content: content.trim(),
    created_at: new Date().toISOString(),
    can_edit: true,
    can_delete: true,
  };

  comments[key] = [...postComments, comment];
  writeStorage(COMMENTS_KEY, comments);

  return { success: true, data: { comment } };
}

export function editMockComment(commentId, content) {
  const comments = readStorage(COMMENTS_KEY, {});
  let updatedComment = null;

  for (const key of Object.keys(comments)) {
    comments[key] = comments[key].map((comment) => {
      if (String(comment.id) !== String(commentId)) return comment;

      updatedComment = { ...comment, content: content.trim() };
      return updatedComment;
    });
  }

  if (!updatedComment) {
    throw new Error('Komentar tidak ditemukan.');
  }

  writeStorage(COMMENTS_KEY, comments);
  return { success: true, data: { comment: updatedComment } };
}

export function deleteMockComment(commentId) {
  const comments = readStorage(COMMENTS_KEY, {});
  let found = false;

  for (const key of Object.keys(comments)) {
    comments[key] = comments[key].filter((comment) => {
      if (String(comment.id) === String(commentId)) {
        found = true;
        return false;
      }
      return true;
    });
  }

  if (!found) {
    throw new Error('Komentar tidak ditemukan.');
  }

  writeStorage(COMMENTS_KEY, comments);
  return { success: true };
}

export async function createMockPost({
  caption,
  content,
  hashtags,
  media,
}) {
  const user = getMockUser();
  let mediaItems = [];

  if (media) {
    if (media.size > 2 * 1024 * 1024) {
      throw new Error('Mode dummy membatasi ukuran media maksimal 2 MB.');
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Gagal membaca file media.'));
      reader.readAsDataURL(media);
    });

    mediaItems = [{
      id: `media-${Date.now()}`,
      data_url: dataUrl,
      file_type: media.type || 'application/octet-stream',
      file_name: media.name,
    }];
  }

  const normalizedHashtags = String(hashtags || '')
    .split(/\s+/)
    .map((tag) => tag.replace(/^#/, '').trim())
    .filter(Boolean);

  const post = {
    id: `mock-${Date.now()}`,
    full_name: user?.full_name || user?.nickname || 'Pengguna Dummy',
    status: user?.status || 'Mahasiswa',
    caption: caption.trim(),
    content: content.trim(),
    created_at: new Date().toISOString(),
    hashtags: normalizedHashtags,
    media: mediaItems,
    is_reacted: false,
    reaction_count: 0,
    is_bookmarked: false,
    comment_count: 0,
    can_edit: true,
    can_delete: true,
  };

  saveMockPosts([post, ...getMockPosts()]);
  return { success: true, data: { post } };
}
