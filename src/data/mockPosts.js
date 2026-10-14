
import { getMockUser } from './mockAuth';

const POSTS_KEY = 'node_mock_posts';

export function getMockPosts() {
  try {
    return JSON.parse(
      localStorage.getItem(POSTS_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

function saveMockPosts(posts) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(
      new Error('Gagal membaca file media.')
    );

    reader.readAsDataURL(file);
  });
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
    // Data URL disimpan di localStorage, jadi batasi ukuran file.
    if (media.size > 2 * 1024 * 1024) {
      throw new Error(
        'Mode dummy membatasi ukuran media maksimal 2 MB.'
      );
    }

    const dataUrl = await fileToDataUrl(media);

    mediaItems = [
      {
        id: `media-${Date.now()}`,
        data_url: dataUrl,
        file_type: media.type || 'application/octet-stream',
        file_name: media.name,
      },
    ];
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

  const posts = getMockPosts();
  saveMockPosts([post, ...posts]);

  return {
    success: true,
    data: { post },
  };
}
