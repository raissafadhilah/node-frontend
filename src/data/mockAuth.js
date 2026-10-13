
const USER_KEY = 'node_mock_user';
const ACCOUNTS_KEY = 'node_mock_accounts';

// true = gunakan autentikasi dummy selama backend belum siap
export const USE_MOCK_AUTH = true;

export function getMockUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setMockUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearMockUser() {
  localStorage.removeItem(USER_KEY);
}

export function getMockAccounts() {
  try {
    return JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

export function saveMockAccount(account) {
  const accounts = getMockAccounts();

  const updatedAccounts = [
    ...accounts.filter(
      (item) => item.email !== account.email
    ),
    account,
  ];

  localStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts)
  );
}

export function findMockAccount(email) {
  return getMockAccounts().find(
    (account) =>
      account.email.toLowerCase() === email.toLowerCase()
  );
}
