// src/components/AdminPayments.js
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertCircle, Copy, ArrowLeft } from 'lucide-react';

const AdminPayments = ({ userData, onBack }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchPayments();
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/payments/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        console.error('Ошибка загрузки платежей');
      }
    } catch (error) {
      console.error('Ошибка загрузки платежей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (paymentId) => {
    setActivating(paymentId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Подписка активирована!\n\nПользователь: ${data.payment?.user?.email || data.payment?.user?.id}\nТариф: ${data.payment?.planName}\nМедкоинов начислено: ${data.subscription?.medcoinsAdded || 0}`);
        fetchPayments(); // Обновляем список
      } else {
        const error = await response.json();
        alert(`Ошибка активации: ${error.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка активации:', error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setActivating(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#e0e0e0' }}>
        <RefreshCw 
          size={32} 
          style={{ 
            animation: 'spin 1s linear infinite',
            display: 'inline-block'
          }} 
        />
        <p style={{ marginTop: '16px' }}>Загрузка платежей...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: '1px solid #444',
                color: '#e0e0e0',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#333';
                e.target.style.borderColor = '#555';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#444';
              }}
            >
              <ArrowLeft size={18} />
              Назад
            </button>
          )}
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#e0e0e0', margin: 0 }}>
            💳 Ожидающие платежи
          </h1>
        </div>
        <button
          onClick={fetchPayments}
          style={{
            background: '#667eea',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#5568d3';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#667eea';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <RefreshCw size={18} />
          Обновить
        </button>
      </div>

      {payments.length === 0 ? (
        <div style={{
          background: '#252525',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #333'
        }}>
          <AlertCircle size={48} color="#888" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#b0b0b0', fontSize: '18px' }}>
            Нет ожидающих платежей
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {payments.map((payment) => (
            <div
              key={payment.id}
              style={{
                background: '#252525',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid #333',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#e0e0e0', margin: 0 }}>
                      Тариф: {payment.planName}
                    </h3>
                    <span style={{
                      background: '#ff9800',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      Ожидает
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ color: '#888', fontSize: '13px' }}>Email:</span>
                      <p style={{ color: '#e0e0e0', margin: '4px 0 0 0', fontWeight: 500 }}>
                        {payment.email}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#888', fontSize: '13px' }}>User ID:</span>
                      <p style={{ color: '#667eea', margin: '4px 0 0 0', fontWeight: 600, fontFamily: 'monospace' }}>
                        {payment.userComment || payment.userId}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#888', fontSize: '13px' }}>Сумма:</span>
                      <p style={{ color: '#ffd700', margin: '4px 0 0 0', fontWeight: 700, fontSize: '18px' }}>
                        {payment.amount}₸
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#888', fontSize: '13px' }}>Начислится медкоинов:</span>
                      <p style={{ color: '#4CAF50', margin: '4px 0 0 0', fontWeight: 600 }}>
                        {payment.medcoins} 🪙
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#888', fontSize: '13px' }}>Дата создания:</span>
                      <p style={{ color: '#b0b0b0', margin: '4px 0 0 0', fontSize: '13px' }}>
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #333'
              }}>
                <button
                  onClick={() => handleActivate(payment.id)}
                  disabled={activating === payment.id}
                  style={{
                    background: activating === payment.id ? '#555' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: activating === payment.id ? 'wait' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activating !== payment.id) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activating !== payment.id) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {activating === payment.id ? (
                    <>
                      <RefreshCw 
                        size={18} 
                        style={{ 
                          animation: 'spin 1s linear infinite',
                          display: 'inline-block'
                        }} 
                      />
                      Активация...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Активировать подписку
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPayments;

