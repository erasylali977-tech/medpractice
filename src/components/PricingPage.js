// src/components/PricingPage.js
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Wallet, Sparkles } from 'lucide-react';
import { t } from '../utils/i18n';
import PaymentModal from './PaymentModal';

const PRICING_PLANS = {
  FREE: {
    id: 'free',
    name: 'Бесплатный',
    price: 0,
    priceKZT: 0,
    medcoins: 100,
    medcoinsMonthly: 0,
    dailyLimit: null,
    features: [
      '3 модуля (Лихорадка, Кашель, Диарея)',
      '15 базовых кейсов',
      '100 медкоинов бонусом при регистрации',
      'Базовая статистика',
    ],
    limitations: [
      'Нет доступа к остальным 17 модулям',
      'Нет AI-режимов',
      'Нет сертификатов',
    ],
  },
  PLUS: {
    id: 'plus',
    name: 'Plus',
    price: 7.31,
    priceKZT: 3800,
    medcoins: 3000,
    medcoinsMonthly: 3000,
    dailyLimit: 120,
    features: [
      'Все 20 модулей (400+ кейсов)',
      '3000 медкоинов ежемесячно',
      'Лимит: 120 медкоинов/день',
      'Полная статистика и аналитика',
      'Сертификаты по модулям',
      'Геймификация (стрики, ачивки, рейтинги)',
      'Разбор ошибок после каждого кейса',
      'Доступ к клиническим протоколам МЗ РК',
    ],
    popular: true,
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 12.5,
    priceKZT: 6500,
    medcoins: 5000,
    medcoinsMonthly: 5000,
    dailyLimit: 200,
    features: [
      'Все функции Plus',
      '5000 медкоинов ежемесячно',
      'Лимит: 200 медкоинов/день',
      'Генерация тестов',
      'AI анализ PDF файлов',
      'Краткий конспект или полноценная подготовка к теме',
      'AI спец режим чат с быстрым ответом',
      'Интеграция с протоколами API MedElement',
    ],
    inDevelopment: true,
  },
};


const PricingPage = ({ onBack, userData, onPurchase }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Проверяем тестовый режим - только если явно включен в localStorage
  const isTestMode = localStorage.getItem('TEST_MODE') === 'true';

  const handlePurchase = async (planId) => {
    if (planId === 'free') {
      if (onPurchase) {
        onPurchase(planId);
      }
      return;
    }

    // Тестовый режим - автоматическая активация (только если явно включен)
    if (isTestMode) {
      setLoading(true);
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          alert('Необходима авторизация');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/subscription/test-activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ subscriptionType: planId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Ошибка активации подписки');
        }

        const result = await response.json();
        
        alert(`✅ Подписка ${planId === 'plus' ? 'Plus' : 'Pro'} активирована (тестовый режим)!\n\nНачислено медкоинов: ${result.subscription.medcoinsAdded || 0}\nНовый баланс: ${result.subscription.newBalance || 0}`);
        
        if (onPurchase) {
          onPurchase(planId);
        }
      } catch (error) {
        console.error('Ошибка активации подписки:', error);
        alert(`Ошибка: ${error.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // РЕАЛЬНЫЙ РЕЖИМ - показываем модальное окно оплаты через Kaspi Pay
    setSelectedPlanId(planId);
    setShowPaymentModal(true);
  };

  return (
    <div className="pricing-page" style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-dark, #1a1a1a)', 
      color: 'var(--text-light, #e0e0e0)',
      padding: '32px 24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Тестовый режим индикатор - показываем только если явно включен */}
        {isTestMode && (
          <div style={{
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
          }}>
            <span>🧪</span>
            <span>ТЕСТОВЫЙ РЕЖИМ: Подписки активируются автоматически без оплаты</span>
          </div>
        )}
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <button 
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#e0e0e0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px'
            }}
          >
            <ArrowLeft size={18} />
            Назад
          </button>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Прозрачные тарифы без скрытых платежей
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)', maxWidth: '800px' }}>
            Мы работаем как обменный пункт: ваши деньги конвертируются в медкоины,
            которые используются для AI-симуляций. Вся экономика прозрачна.
          </p>
        </div>

        {/* Тарифы */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px',
          marginBottom: '64px',
          maxWidth: '800px',
          margin: '0 auto 64px auto'
        }}>
          {/* FREE */}
          <div style={{
            background: '#2a2a2a',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #333',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Бесплатный</h3>
              <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>0₸</div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>Попробуй платформу</p>
            </div>

            <div style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              background: 'rgba(76, 175, 80, 0.1)', 
              borderRadius: '8px',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Бонус при регистрации:</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#4CAF50' }}>
                  100 🪙
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                ≈ 7 кейсов по 15 вопросов
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px', flex: 1, fontSize: '12px' }}>
              {PRICING_PLANS.FREE.features.map((feature, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'start', marginBottom: '8px' }}>
                  <Check size={14} color="#4CAF50" style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }} />
                  <span>{feature}</span>
                </li>
              ))}
              {PRICING_PLANS.FREE.limitations.map((limitation, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'start', marginBottom: '8px', opacity: 0.6 }}>
                  <X size={14} color="#dc3545" style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{limitation}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePurchase('free')}
              style={{
                width: '100%',
                background: '#333',
                border: '1px solid #444',
                color: '#e0e0e0',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.3s ease'
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
              Начать бесплатно
            </button>
          </div>

          {/* PLUS */}
          <div style={{
            background: 'linear-gradient(135deg, #4c1d95 0%, #6b21a8 100%)',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #667eea',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#667eea',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              Популярный выбор
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Plus</h3>
              <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '6px' }}>3800₸</div>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>в месяц</p>
            </div>

            <div style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px' }}>Включено медкоинов:</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#ffd700' }}>
                  3000 🪙
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                ≈ 200 кейсов или 60-70 полных прохождений
              </p>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                Лимит: 120 медкоинов/день (можно пройти 8 кейсов в день)
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px', flex: 1, fontSize: '12px' }}>
              {PRICING_PLANS.PLUS.features.map((feature, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'start', marginBottom: '8px' }}>
                  <Check size={14} color="#4CAF50" style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontWeight: idx === 0 ? 600 : 400 }}>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePurchase('plus')}
              disabled={loading}
              style={{
                width: '100%',
                background: 'white',
                color: '#4c1d95',
                padding: '10px',
                borderRadius: '8px',
                cursor: loading ? 'wait' : 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                transition: 'all 0.3s ease',
                border: 'none',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = 'white';
              }}
            >
              {loading ? 'Активация...' : isTestMode ? 'Активировать (тест)' : 'Оформить подписку'}
            </button>
          </div>

        </div>

      </div>

      {/* Модальное окно оплаты */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlanId(null);
        }}
        planId={selectedPlanId}
        userData={userData}
        onPaymentCreated={(paymentData) => {
          console.log('Платеж создан:', paymentData);
          setShowPaymentModal(false);
          alert('✅ Платеж создан! После оплаты подписка будет активирована в течение 24 часов.');
          if (onPurchase) {
            onPurchase(selectedPlanId);
          }
        }}
      />
    </div>
  );
};


export default PricingPage;

