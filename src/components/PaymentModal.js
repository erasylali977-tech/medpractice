// src/components/PaymentModal.js
import React, { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PaymentModal = ({ isOpen, onClose, planId, userData, onPaymentCreated }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans = {
    plus: {
      name: 'Plus',
      price: 3800,
      medcoins: 3000,
      link: 'https://pay.kaspi.kz/pay/oncz5m8v'
    },
    pro: {
      name: 'Pro',
      price: 6500,
      medcoins: 5000,
      link: 'https://pay.kaspi.kz/pay/oncz5m8v'
    }
  };

  const plan = plans[planId];
  // Используем короткий 6-значный ID, если он есть, иначе полный ID
  const displayUserId = userData?.shortUserId || 
                        (userData?.id ? userData.id.slice(-6) : userData?.email?.slice(0, 6)) || 
                        'unknown';

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText(displayUserId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = displayUserId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Автоматически создаем запись о платеже при открытии модального окна
  useEffect(() => {
    if (isOpen && plan && userData) {
      const createPaymentRecord = async () => {
        try {
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
          const token = localStorage.getItem('authToken');

          if (!token) {
            return;
          }

          // Создаем запись о платеже в базе данных
          const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              planId,
              userId: userData?.id || userData?.email,
              email: userData?.email || '',
              amount: plan.price,
              userComment: displayUserId,
              planName: plan.name,
              medcoins: plan.medcoins
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Платеж создан:', result);
            if (onPaymentCreated) {
              onPaymentCreated(result.payment || {
                planId,
                userId: userData?.id || userData?.email,
                amount: plan.price
              });
            }
          }
        } catch (error) {
          console.error('❌ Ошибка создания платежа:', error);
        }
      };

      createPaymentRecord();
    }
  }, [isOpen, plan, userData, planId, displayUserId, onPaymentCreated]);

  if (!isOpen) return null;

  return (
    <div 
      className="payment-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div 
        className="payment-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#252525',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          border: '2px solid #333',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#e0e0e0', margin: 0 }}>
            Оплата подписки {plan.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#b0b0b0',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#333'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        {/* КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ ПРО ID */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
          border: '3px solid rgba(255, 87, 34, 0.6)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(255, 87, 34, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
            <AlertCircle size={32} color="#ff5722" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '22px', 
                fontWeight: 700, 
                color: '#ff5722', 
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ⚠️ ВАЖНО! ОБЯЗАТЕЛЬНО ПРОЧИТАЙТЕ!
              </h3>
              <p style={{ 
                color: '#ffccbc', 
                lineHeight: '1.8', 
                margin: 0,
                fontSize: '16px',
                fontWeight: 600
              }}>
                При оплате <strong style={{ color: '#fff', fontSize: '18px' }}>ОБЯЗАТЕЛЬНО</strong> укажите ваш User ID в комментарии к платежу!
              </p>
              <p style={{ 
                color: '#ffccbc', 
                lineHeight: '1.8', 
                margin: '12px 0 0 0',
                fontSize: '15px'
              }}>
                Без указания ID администратор не сможет определить, какому пользователю подключить подписку, и она <strong style={{ color: '#ff5722' }}>НЕ БУДЕТ АКТИВИРОВАНА</strong>!
              </p>
            </div>
          </div>
        </div>

        {/* Информация о платеже */}
        <div style={{
          background: '#2a2a2a',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#b0b0b0' }}>Тариф:</span>
            <span style={{ color: '#e0e0e0', fontWeight: 600 }}>{plan.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#b0b0b0' }}>Сумма:</span>
            <span style={{ color: '#ffd700', fontSize: '20px', fontWeight: 700 }}>{plan.price}₸</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#b0b0b0' }}>Начислится медкоинов:</span>
            <span style={{ color: '#4CAF50', fontWeight: 600 }}>{plan.medcoins} 🪙</span>
          </div>
        </div>

        {/* User ID для комментария */}
        <div style={{
          background: '#2a2a2a',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              color: '#e0e0e0', 
              fontWeight: 600, 
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Ваш User ID для комментария:
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              background: '#1a1a1a',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #333'
            }}>
              <code style={{
                flex: 1,
                color: '#667eea',
                fontWeight: 700,
                fontSize: '16px',
                fontFamily: 'monospace',
                background: 'transparent',
                border: 'none',
                outline: 'none'
              }}>
                {displayUserId}
              </code>
              <button
                onClick={handleCopyUserId}
                style={{
                  background: copied ? '#4CAF50' : '#667eea',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
              >
                {copied ? (
                  <>
                    <CheckCircle size={18} />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Копировать
                  </>
                )}
              </button>
            </div>
          </div>
          <p style={{
            color: '#888',
            fontSize: '12px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            ⚠️ Обязательно укажите этот ID в комментарии к платежу, иначе подписка не будет активирована!
          </p>
        </div>

        {/* QR-код для оплаты */}
        <div style={{
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '2px solid #333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: '#e0e0e0', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📱 Сканируйте QR-код для оплаты
            </h3>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            <QRCodeSVG 
              value={plan.link}
              size={240}
              level="H"
              includeMargin={true}
            />
          </div>
          <p style={{
            color: '#888',
            fontSize: '12px',
            textAlign: 'center',
            margin: 0
          }}>
            Откройте приложение Kaspi и сканируйте QR-код
          </p>
        </div>

        {/* Инструкция по оплате */}
        <div style={{
          background: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #333'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: '#e0e0e0', 
            marginBottom: '12px' 
          }}>
            📝 Как оплатить:
          </h3>
          <ol style={{
            color: '#b0b0b0',
            paddingLeft: '20px',
            margin: 0,
            lineHeight: '2',
            fontSize: '14px'
          }}>
            <li><strong>Если вы на ПК:</strong> Сканируйте QR-код выше через приложение Kaspi на телефоне</li>
            <li><strong>Если вы на телефоне:</strong> Нажмите на ссылку ниже для оплаты</li>
            <li>Введите сумму: <strong style={{ color: '#ffd700' }}>{plan.price}₸</strong></li>
            <li><strong style={{ color: '#ff5722' }}>ОБЯЗАТЕЛЬНО</strong> в поле "Комментарий" вставьте ваш User ID: <code style={{ 
              color: '#667eea', 
              background: '#1a1a1a', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 700
            }}>{displayUserId}</code></li>
            <li>Подтвердите оплату</li>
            <li>Подписка будет активирована в течение 24 часов после оплаты</li>
          </ol>
        </div>

        {/* Ссылка для мобильных */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: '#b0b0b0', 
            marginBottom: '12px',
            fontSize: '14px'
          }}>
            Или оплатите по прямой ссылке:
          </p>
          <a
            href={plan.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            <ExternalLink size={18} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
            Оплатить через Kaspi Pay
          </a>
        </div>

        {/* Кнопка закрытия */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: '#333',
              border: '1px solid #444',
              color: '#e0e0e0',
              padding: '14px 32px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#3a3a3a';
              e.target.style.borderColor = '#555';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#333';
              e.target.style.borderColor = '#444';
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

