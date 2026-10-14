import { USE_MOCK_AUTH } from '../data/mockAuth';
import { createMockPost } from '../data/mockPosts';

const API_BASE_URL = 'http://localhost/node/api';

export async function checkApi() {
  const response = await fetch(`${API_BASE_URL}/health.php`);

  if (!response.ok) {
    throw new Error('Gagal terhubung ke API Node.');
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me.php`, {
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    return result;
  }

  return result;
}

export async function getHome() {
  const response = await fetch(`${API_BASE_URL}/home/index.php`, {
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengambil data Home.');
  }

  return result;
}

export async function toggleReaction(postId) {
  const response = await fetch(
    `${API_BASE_URL}/reactions/toggle.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal mengubah reaction.'
    );
  }

  return result;
}
export async function toggleBookmark(postId) {
  const response = await fetch(
    `${API_BASE_URL}/bookmarks/toggle.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal mengubah bookmark.'
    );
  }

  return result;
}
export async function createComment(postId, content) {
  const response = await fetch(
    `${API_BASE_URL}/comments/create.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
        content: content,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal membuat komentar.'
    );
  }

  return result;
}
export async function getComments(postId) {
  const response = await fetch(
    `${API_BASE_URL}/comments/list.php?post_id=${postId}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal mengambil komentar.'
    );
  }

  return result;
}
export async function editComment(commentId, content) {
  const response = await fetch(
    `${API_BASE_URL}/comments/edit.php`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment_id: commentId,
        content: content,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal mengubah komentar.'
    );
  }

  return result;
}

export async function deleteComment(commentId) {
  const response = await fetch(
    `${API_BASE_URL}/comments/delete.php`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment_id: commentId,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal menghapus komentar.'
    );
  }

  return result;
}


export async function createPost({
  caption,
  content,
  hashtags,
  media,
}) {
  if (USE_MOCK_AUTH) {
    return createMockPost({
      caption,
      content,
      hashtags,
      media,
    });
  }

  const formData = new FormData();

  formData.append('caption', caption);
  formData.append('content', content);
  formData.append('hashtags', hashtags);

  if (media) {
    formData.append('media', media);
  }

  const response = await fetch(
    `${API_BASE_URL}/posts/create.php`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal membuat postingan.'
    );
  }

  return result;
}


export async function editPost(postId, content) {
  const response = await fetch(
    `${API_BASE_URL}/posts/edit.php`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
        content,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal mengubah postingan.'
    );
  }

  return result;
}

export async function deletePost(postId) {
  const response = await fetch(
    `${API_BASE_URL}/posts/delete.php`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal menghapus postingan.'
    );
  }

  return result;
}
export async function registerUser({
  fullName,
  status,
  email,
  password,
  confirmPassword,
}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/register.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: fullName,
        status,
        email,
        password,
        confirm_password: confirmPassword,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal melakukan registrasi.'
    );
  }

  return result;
}
export async function verifyRegisterOtp(email, otp) {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-otp.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal melakukan verifikasi OTP.'
    );
  }

  return result;
}
export async function loginUser({
  email,
  password,
}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal melakukan login.'
    );
  }

  return result;
}
export async function logoutUser() {
  const response = await fetch(
    `${API_BASE_URL}/auth/logout.php`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal melakukan logout.'
    );
  }

  return result;
}
export async function forgotPassword(email) {
  const response = await fetch(
    `${API_BASE_URL}/auth/forgot-password.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal meminta reset password.'
    );
  }

  return result;
}
export async function verifyResetOtp(otp) {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-reset-otp.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        otp,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal melakukan verifikasi OTP reset password.'
    );
  }

  return result;
}
export async function resetPassword({
  password,
  passwordConfirmation,
}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/reset-password.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
        password_confirmation: passwordConfirmation,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Gagal mengubah password.'
    );
  }

  return result;
}
export async function getProfile(userId = null) {
  const url = userId
    ? `${API_BASE_URL}/profile/index.php?id=${userId}`
    : `${API_BASE_URL}/profile/index.php`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    return result;
  }

  return result;
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();

  formData.append('profile_photo', file);

  const response = await fetch(
    `${API_BASE_URL}/profile/upload-photo.php`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return result;
  }

  return result;
}

export async function deleteProfilePhoto() {
  const response = await fetch(
    `${API_BASE_URL}/profile/delete-photo.php`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return result;
  }

  return result;
}
export async function updateProfile({
  fullName,
  status,
}) {
  const response = await fetch(
    `${API_BASE_URL}/profile/update.php`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: fullName,
        status,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return result;
  }

  return result;
}
export async function requestEmailChange(newEmail) {
  const response = await fetch(
    `${API_BASE_URL}/profile/request-email-change.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_email: newEmail,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return result;
  }

  return result;
}

export async function verifyEmailChange(otp) {
  const response = await fetch(
    `${API_BASE_URL}/profile/verify-email-change.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        otp,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return result;
  }

  return result;
}
export async function changePassword({
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  const response = await fetch(
    `${API_BASE_URL}/profile/change-password.php`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return result;
  }

  return result;
}