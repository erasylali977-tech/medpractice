// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  BarChart3, 
  RefreshCw, 
  ArrowLeft,
  Calendar,
  Award,
  Target,
  Activity,
  Eye
} from 'lucide-react';

const AdminDashboard = ({ userData, onBack }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchStatistics();
    // Обновляем каждые 60 секунд
    const interval = setInterval(fetchStatistics, 60000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const url = `${API_BASE_URL}/api/analytics/stats${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      } else {
        console.error('Ошибка загрузки статистики');
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toLocaleString('ru-RU');
  };

  const formatCurrency = (num) => {
    if (!num && num !== 0) return '0₸';
    return `${num.toLocaleString('ru-RU')}₸`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
        <p style={{ marginTop: '16px' }}>Загрузка статистики...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#e0e0e0' }}>
        <p>Ошибка загрузки статистики</p>
        <button onClick={fetchStatistics} style={{ marginTop: '16px', padding: '8px 16px' }}>
          Попробовать снова
        </button>
      </div>
    );
  }

  const { overview, subscriptions, cases, pages, trends } = stats;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#e0e0e0' }}>
      {/* Заголовок */}
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
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>
            📊 Админ-панель: Статистика
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #444',
              background: '#252525',
              color: '#e0e0e0'
            }}
            placeholder="Начало"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #444',
              background: '#252525',
              color: '#e0e0e0'
            }}
            placeholder="Конец"
          />
          <button
            onClick={fetchStatistics}
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
              fontWeight: 600
            }}
          >
            <RefreshCw size={18} />
            Обновить
          </button>
        </div>
      </div>

      {/* Вкладки */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: '2px solid #333'
      }}>
        {[
          { id: 'overview', label: 'Обзор', icon: BarChart3 },
          { id: 'users', label: 'Пользователи', icon: Users },
          { id: 'cases', label: 'Кейсы', icon: CheckCircle },
          { id: 'subscriptions', label: 'Подписки', icon: DollarSign },
          { id: 'trends', label: 'Тренды', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#667eea' : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? 'white' : '#b0b0b0',
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Контент вкладок */}
      {activeTab === 'overview' && (
        <div>
          {/* Основные метрики */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <MetricCard
              icon={Users}
              title="Всего пользователей"
              value={formatNumber(overview.totalUsers)}
              color="#667eea"
            />
            <MetricCard
              icon={Activity}
              title="Активных пользователей"
              value={formatNumber(overview.activeUsers)}
              color="#4CAF50"
            />
            <MetricCard
              icon={Eye}
              title="Уникальных посетителей"
              value={formatNumber(overview.uniqueVisitors)}
              subValue={`Сегодня: ${formatNumber(overview.uniqueVisitorsToday)}`}
              color="#ff9800"
            />
            <MetricCard
              icon={CheckCircle}
              title="Пройдено кейсов"
              value={formatNumber(overview.totalCaseCompletions)}
              subValue={`Уникальных: ${formatNumber(overview.uniqueCasesCompleted)}`}
              color="#2196F3"
            />
            <MetricCard
              icon={Award}
              title="Средний балл"
              value={overview.averageScore.toFixed(1)}
              subValue={`Точность: ${overview.correctDiagnosisRate.toFixed(1)}%`}
              color="#9C27B0"
            />
            <MetricCard
              icon={DollarSign}
              title="Выручка"
              value={formatCurrency(overview.totalRevenue)}
              subValue={`Подписок: ${formatNumber(overview.totalSubscriptions)}`}
              color="#4CAF50"
            />
            <MetricCard
              icon={Target}
              title="Регистраций"
              value={formatNumber(overview.totalRegistrations)}
              subValue={`Сегодня: ${formatNumber(overview.registrationsToday)}`}
              color="#00BCD4"
            />
            <MetricCard
              icon={Users}
              title="С подпиской"
              value={formatNumber(overview.usersWithSubscription)}
              color="#FF5722"
            />
          </div>

          {/* Быстрая статистика */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            <InfoCard title="Популярные страницы">
              {Object.entries(pages.byPage)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([page, views]) => (
                  <div key={page} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #333'
                  }}>
                    <span style={{ color: '#b0b0b0' }}>{page}</span>
                    <span style={{ fontWeight: 600 }}>{formatNumber(views)}</span>
                  </div>
                ))}
            </InfoCard>

            <InfoCard title="Топ кейсов">
              {cases.topCases.slice(0, 5).map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #333'
                }}>
                  <span style={{ color: '#b0b0b0' }}>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>{formatNumber(item.count)}</span>
                </div>
              ))}
            </InfoCard>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <InfoCard title="Топ пользователей по активности">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cases.topUsers.map((user, idx) => (
                <div key={idx} style={{
                  background: '#252525',
                  padding: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{user.name}</div>
                    <div style={{ fontSize: '13px', color: '#888' }}>{user.email}</div>
                  </div>
                  <div style={{ 
                    background: '#667eea',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 700
                  }}>
                    {formatNumber(user.count)} кейсов
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>
      )}

      {activeTab === 'cases' && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <InfoCard title="Всего пройдено">
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#667eea' }}>
                {formatNumber(cases.total)}
              </div>
            </InfoCard>
            <InfoCard title="Уникальных кейсов">
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#4CAF50' }}>
                {formatNumber(cases.unique)}
              </div>
            </InfoCard>
            <InfoCard title="Средний балл">
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#9C27B0' }}>
                {cases.averageScore.toFixed(1)}
              </div>
            </InfoCard>
            <InfoCard title="Точность диагнозов">
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#ff9800' }}>
                {cases.correctDiagnosisRate.toFixed(1)}%
              </div>
            </InfoCard>
          </div>

          <InfoCard title="Топ 10 кейсов">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cases.topCases.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: idx < 3 ? '#252525' : 'transparent',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {idx + 1}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatNumber(item.count)}</span>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <InfoCard title="Всего подписок">
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#667eea' }}>
                {formatNumber(subscriptions.total)}
              </div>
            </InfoCard>
            <InfoCard title="Выручка">
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#4CAF50' }}>
                {formatCurrency(subscriptions.totalRevenue)}
              </div>
            </InfoCard>
          </div>

          <InfoCard title="Подписки по тарифам">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(subscriptions.byPlan).map(([planId, count]) => (
                <div key={planId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#252525',
                  borderRadius: '6px'
                }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {planId === 'plus' ? 'Plus' : planId === 'pro' ? 'Pro' : planId}
                  </span>
                  <span style={{ fontWeight: 700, color: '#667eea' }}>
                    {formatNumber(count)}
                  </span>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>
      )}

      {activeTab === 'trends' && (
        <div>
          <InfoCard title="Посещения за последние 30 дней">
            <div style={{ height: '300px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '600px' }}>
                {trends.visitsByDay.map((day, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px'
                  }}>
                    <span style={{ width: '100px', fontSize: '13px', color: '#888' }}>
                      {formatDate(day.date)}
                    </span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: `${(day.count / Math.max(...trends.visitsByDay.map(d => d.count))) * 100}%`,
                        height: '24px',
                        background: '#667eea',
                        borderRadius: '4px',
                        minWidth: '2px'
                      }} />
                      <span style={{ minWidth: '60px', textAlign: 'right' }}>
                        {formatNumber(day.count)} ({formatNumber(day.unique)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Завершения кейсов за последние 30 дней">
            <div style={{ height: '300px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '600px' }}>
                {trends.caseCompletionsByDay.map((day, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px'
                  }}>
                    <span style={{ width: '100px', fontSize: '13px', color: '#888' }}>
                      {formatDate(day.date)}
                    </span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: `${(day.count / Math.max(...trends.caseCompletionsByDay.map(d => d.count), 1)) * 100}%`,
                        height: '24px',
                        background: '#4CAF50',
                        borderRadius: '4px',
                        minWidth: '2px'
                      }} />
                      <span style={{ minWidth: '60px', textAlign: 'right' }}>
                        {formatNumber(day.count)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </InfoCard>
        </div>
      )}
    </div>
  );
};

// Компонент карточки метрики
const MetricCard = ({ icon: Icon, title, value, subValue, color = '#667eea' }) => (
  <div style={{
    background: '#252525',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #333',
    transition: 'all 0.2s'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = color;
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#333';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#e0e0e0' }}>
          {value}
        </div>
        {subValue && (
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Компонент информационной карточки
const InfoCard = ({ title, children }) => (
  <div style={{
    background: '#252525',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #333'
  }}>
    <h2 style={{ 
      fontSize: '20px', 
      fontWeight: 700, 
      marginBottom: '16px',
      color: '#e0e0e0'
    }}>
      {title}
    </h2>
    {children}
  </div>
);

export default AdminDashboard;


