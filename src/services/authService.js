// src/services/authService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Сохранение токена
export function saveToken(token) {
  localStorage.setItem('authToken', token);
}

// Получение токена
export function getToken() {
  return localStorage.getItem('authToken');
}

// Удаление токена
export function removeToken() {
  localStorage.removeItem('authToken');
}

// Сохранение пользователя
export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Получение пользователя
export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Удаление пользователя
export function removeUser() {
  localStorage.removeItem('user');
}

// Регистрация
export async function register(email, password, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    // Проверяем Content-Type перед парсингом
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Сервер вернул не JSON:', text.substring(0, 200));
      throw new Error(`Сервер вернул неверный формат ответа. Проверьте, что сервер запущен на ${API_BASE_URL}`);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Ошибка регистрации' }));
      throw new Error(error.error || 'Ошибка регистрации');
    }

    const data = await response.json();
    saveToken(data.token);
    saveUser(data.user);
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Не удалось подключиться к серверу. Убедитесь, что сервер запущен на ${API_BASE_URL}`);
    }
    throw error;
  }
}

// Вход
export async function login(email, password) {
  const url = `${API_BASE_URL}/api/auth/login`;
  console.log('🔐 Попытка входа:', url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📡 Ответ сервера:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });

    // Проверяем Content-Type перед парсингом
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Сервер вернул не JSON. Первые 500 символов:', text.substring(0, 500));
      console.error('❌ Полный URL ответа:', response.url);
      throw new Error(`Сервер вернул неверный формат ответа (получен ${contentType || 'неизвестный тип'}). Проверьте, что сервер запущен на ${API_BASE_URL} и доступен по адресу ${url}`);
    }

    if (!response.ok) {
      const error = await response.json().catch((e) => {
        console.error('❌ Ошибка парсинга JSON ошибки:', e);
        return { error: `Ошибка входа (${response.status} ${response.statusText})` };
      });
      throw new Error(error.error || 'Ошибка входа');
    }

    const data = await response.json();
    console.log('✅ Успешный вход:', data.user?.email || 'пользователь');
    saveToken(data.token);
    saveUser(data.user);
    return data;
  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Не удалось подключиться к серверу. Убедитесь, что сервер запущен на ${API_BASE_URL}. Проверьте консоль браузера (F12) для подробностей.`);
    }
    throw error;
  }
}

// Выход
export function logout() {
  removeToken();
  removeUser();
}

// Получение текущего пользователя
export async function getCurrentUser() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Проверяем Content-Type перед парсингом
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Сервер вернул не JSON при получении пользователя');
      logout();
      return null;
    }

    if (!response.ok) {
      logout();
      return null;
    }

    const data = await response.json();
    saveUser(data.user);
    return data.user;
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
      console.error('❌ Не удалось подключиться к серверу. Проверьте, что сервер запущен.');
    }
    return null;
  }
}

// Обновление профиля
export async function updateProfile(updates) {
  const token = getToken();
  if (!token) {
    throw new Error('Необходима авторизация');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    // Проверяем Content-Type перед парсингом
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Сервер вернул не JSON:', text.substring(0, 200));
      throw new Error(`Сервер вернул неверный формат ответа. Проверьте, что сервер запущен на ${API_BASE_URL}`);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Ошибка обновления профиля' }));
      throw new Error(error.error || 'Ошибка обновления профиля');
    }

    const data = await response.json();
    saveUser(data.user);
    return data.user;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Не удалось подключиться к серверу. Убедитесь, что сервер запущен на ${API_BASE_URL}`);
    }
    throw error;
  }
}

// Добавление токенов (вспомогательная функция)
export async function addTokensToUser(amount) {
  const { addTokens } = await import('./subscriptionService');
  return addTokens(amount);
}

// Проверка авторизации
export function isAuthenticated() {
  return !!getToken();
}

