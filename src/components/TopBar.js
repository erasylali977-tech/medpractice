import React, { useState, useEffect } from 'react';
import { User, TrendingUp, CheckCircle, Target, Wallet, Moon, Sun } from 'lucide-react';
import { t } from '../utils/i18n';

const TopBar = ({ onProfileClick, user, modules = [], userData = null, onMainScreenClick }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Get first letter of email or name for avatar
  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'light') {
      document.body.style.background = '#ffffff';
      document.body.style.color = '#1a1a1a';
    } else {
      document.body.style.background = '#1a1a1a';
      document.body.style.color = '#e0e0e0';
    }
  };

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.body.style.background = '#ffffff';
      document.body.style.color = '#1a1a1a';
    } else {
      document.body.style.background = '#1a1a1a';
      document.body.style.color = '#e0e0e0';
    }
  }, [theme]);

  // Подсчитываем статистику
  const totalModules = modules?.length || 0;
  const completedCases = userData?.stats?.casesCompleted || userData?.casesCompleted || 0;
  const totalCases = modules?.reduce((sum, m) => sum + (m.totalCases || 0), 0) || 0;
  const progressPercentage = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
  
  // Получаем медкоины
  const medcoins = userData?.medcoins || userData?.medcoinBalance || 0;
  const currentPlan = userData?.subscription?.type || userData?.subscription?.planId || 'free';
  const planNames = {
    free: 'Бесплатный',
    plus: 'Plus',
    pro: 'Pro'
  };

  return (
    <div className="topbar">
      <div className="topbar-content">
        {/* Логотип слева */}
        <div 
          className="topbar-logo"
          onClick={onMainScreenClick}
          style={{
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <span className="logo-text">MedPractice.kz</span>
          <img 
            src="/kz-flag.gif" 
            alt="🇰🇿" 
            className="logo-flag"
          />
        </div>
        
        {/* Статистика */}
        <div className="topbar-stats">
          <div className="topbar-stat-item">
            <TrendingUp size={16} color="#667eea" />
            <span className="topbar-stat-label">Прогресс:</span>
            <span className="topbar-stat-value">{completedCases}/{totalCases}</span>
            <span className="topbar-stat-percentage">({progressPercentage}%)</span>
          </div>
          
          <div className="topbar-stat-divider"></div>
          
          <div className="topbar-stat-item">
            <CheckCircle size={16} color="#4CAF50" />
            <span className="topbar-stat-label">Завершено:</span>
            <span className="topbar-stat-value">{completedCases}</span>
          </div>
          
          <div className="topbar-stat-divider"></div>
          
          <div className="topbar-stat-item">
            <Target size={16} color="#ff9800" />
            <span className="topbar-stat-label">Модулей:</span>
            <span className="topbar-stat-value">{totalModules}</span>
          </div>
        </div>
        
        <div className="topbar-actions">
          {/* Медкоины */}
          <div className="topbar-medcoins" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '16px',
            padding: '6px 12px',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={onProfileClick}
          >
            <Wallet size={16} color="#ffd700" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffd700' }}>
              {medcoins.toLocaleString()} 🪙
            </span>
          </div>

          {/* Тариф */}
          <div className="topbar-plan" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '16px',
            padding: '6px 12px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={onProfileClick}
          >
            <span style={{ fontSize: '13px', color: '#667eea' }}>
              Тариф: {planNames[currentPlan] || 'Бесплатный'}
            </span>
          </div>

          {/* Переключатель темы */}
          <button
            onClick={handleThemeToggle}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              marginRight: '12px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
            title={theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            className="topbar-profile-button"
            onClick={onProfileClick}
            title={user?.email || 'Profile'}
          >
            <div className="topbar-profile-avatar">
              {getInitials()}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

