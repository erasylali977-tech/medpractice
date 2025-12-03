// src/services/subscriptionService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Получение токена
function getToken() {
  return localStorage.getItem('authToken');
}

// Получение планов подписки
export async function getSubscriptionPlans() {
  const response = await fetch(`${API_BASE_URL}/api/subscription/plans`);
  if (!response.ok) {
    throw new Error('Ошибка загрузки планов');
  }
  return response.json();
}

// Проверка доступа к кейсу
export async function checkCaseAccess(caseId) {
  const token = getToken();
  if (!token) {
    return { hasAccess: false, reason: 'Необходима авторизация' };
  }

  const response = await fetch(`${API_BASE_URL}/api/subscription/check-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ caseId }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { hasAccess: false, reason: error.error || 'Ошибка проверки доступа' };
  }

  return response.json();
}

// Использование токена
export async function spendToken() {
  const token = getToken();
  if (!token) {
    throw new Error('Необходима авторизация');
  }

  const response = await fetch(`${API_BASE_URL}/api/subscription/use-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка использования токена');
  }

  return response.json();
}

// Активация подписки
export async function activateSubscription(subscriptionType) {
  const token = getToken();
  if (!token) {
    throw new Error('Необходима авторизация');
  }

  const response = await fetch(`${API_BASE_URL}/api/subscription/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ subscriptionType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка активации подписки');
  }

  return response.json();
}

// Добавление токенов (для тестирования)
export async function addTokens(amount) {
  const token = getToken();
  if (!token) {
    throw new Error('Необходима авторизация');
  }

  const response = await fetch(`${API_BASE_URL}/api/subscription/add-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка добавления токенов');
  }

  return response.json();
}

