import { logoutUser } from './api';
import { clearMockUser, USE_MOCK_AUTH } from '../data/mockAuth';

export async function logoutCurrentUser() {
  if (USE_MOCK_AUTH) {
    clearMockUser();
    return;
  }

  const result = await logoutUser();

  if (!result.success) {
    throw new Error(result.message || 'Logout gagal.');
  }
}
