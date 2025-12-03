// src/services/medcoinsService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Получение токена
function getToken() {
  return localStorage.getItem('authToken');
}

// Получить баланс медкоинов
export async function getMedcoinBalance() {
  const token = getToken();
  if (!token) {
    return { balance: 0, todayUsage: 0, dailyLimit: null };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/medcoins/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка получения баланса');
    }

    return response.json();
  } catch (error) {
    console.error('Ошибка получения баланса медкоинов:', error);
    return { balance: 0, todayUsage: 0, dailyLimit: null };
  }
}

// Потратить медкоины
export async function spendMedcoins(amount, caseId, description) {
  const token = getToken();
  if (!token) {
    throw new Error('Необходима авторизация');
  }

  const response = await fetch(`${API_BASE_URL}/api/medcoins/spend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, caseId, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка списания медкоинов');
  }

  return response.json();
}

// Купить пакет медкоинов
export async function purchaseMedcoins(packageId) {
  const token = getToken();
  if (!token) {
    throw new Error('Необходима авторизация');
  }

  const response = await fetch(`${API_BASE_URL}/api/medcoins/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ packageId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка покупки медкоинов');
  }

  return response.json();
}

// Получить историю транзакций
export async function getMedcoinTransactions(limit = 50, offset = 0) {
  const token = getToken();
  if (!token) {
    return { transactions: [], total: 0 };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/medcoins/transactions?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка получения транзакций');
    }

    return response.json();
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    return { transactions: [], total: 0 };
  }
}



