import React, { useState, useEffect, useRef } from 'react';
import { Settings, Globe, ChevronRight, LogOut, User, X, Moon, Sun, Wallet, CreditCard } from 'lucide-react';
import { t, setLanguage, getLanguage } from '../utils/i18n';
import { useTheme } from '../contexts/ThemeContext';

const ProfileMenu = ({ user, onOpenSettings, onLogout, isOpen, onClose, onOpenPricing, userData, onOpenAdminPayments, onOpenAdminDashboard }) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage());
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef(null);
  
  // Получаем данные о медкоинах и тарифе
  const medcoins = userData?.medcoins || userData?.medcoinBalance || 0;
  const currentPlan = userData?.subscription?.type || userData?.subscription?.planId || 'free';
  const planNames = {
    free: 'Бесплатный',
    plus: 'Plus',
    pro: 'Pro'
  };

  const languages = [
    { code: 'ru', name: t('russian'), flag: '🇷🇺' },
    { code: 'kk', name: t('kazakh'), flag: '🇰🇿' },
    { code: 'en', name: t('english'), flag: '🇬🇧' }
  ];


  // Handle language change
  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setCurrentLanguage(langCode);
    setShowLanguageMenu(false);
  };


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Update language when it changes globally
  useEffect(() => {
    const handleLanguageChanged = (event) => {
      setCurrentLanguage(event.detail);
      // Force re-render by updating state
      setShowLanguageMenu(false);
    };

    window.addEventListener('languageChanged', handleLanguageChanged);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="profile-menu-overlay" onClick={onClose}>
      <div className="profile-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        {/* User info header */}
        <div className="profile-menu-header">
          <div className="profile-menu-user">
            <div className="profile-menu-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-menu-user-info">
              <div className="profile-menu-email">{user?.email || 'user@example.com'}</div>
              <div className="profile-menu-plan" style={{ fontSize: '12px', color: '#b0b0b0', marginTop: '4px' }}>
                Тариф: {planNames[currentPlan] || 'Бесплатный'}
              </div>
            </div>
          </div>
          <button className="profile-menu-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Медкоины */}
        <div className="profile-menu-medcoins" style={{ 
          padding: '12px 16px', 
          background: 'rgba(102, 126, 234, 0.1)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} color="#ffd700" />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Медкоины:</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffd700' }}>
            {medcoins.toLocaleString()} 🪙
          </span>
        </div>

        {/* Menu items */}
        <div className="profile-menu-content">
          {/* Тариф */}
          <button 
            className="profile-menu-item"
            onClick={() => {
              if (onOpenPricing) {
                onOpenPricing();
              }
              onClose();
            }}
          >
            <CreditCard size={18} />
            <span>Тариф: {planNames[currentPlan] || 'Бесплатный'}</span>
            <ChevronRight size={16} />
          </button>

          <button 
            className="profile-menu-item"
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
          >
            <Settings size={18} />
            <span>{t('settings')}</span>
            <span className="profile-menu-shortcut">Ctrl+,</span>
          </button>

          {/* Админ-панель */}
          {onOpenAdminPayments && (
            <button 
              className="profile-menu-item"
              onClick={() => {
                onOpenAdminPayments();
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}
            >
              <CreditCard size={18} />
              <span>💳 Админ: Платежи</span>
              <ChevronRight size={16} />
            </button>
          )}

          {onOpenAdminDashboard && (
            <button 
              className="profile-menu-item"
              onClick={() => {
                onOpenAdminDashboard();
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}
            >
              <User size={18} />
              <span>📊 Админ: Статистика</span>
              <ChevronRight size={16} />
            </button>
          )}

          {/* Theme Toggle */}
          <button 
            className="profile-menu-item"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</span>
          </button>

          <div className="profile-menu-item-wrapper">
            <button 
              className="profile-menu-item"
              onClick={() => {
                setShowLanguageMenu(!showLanguageMenu);
              }}
            >
              <Globe size={18} />
              <span>{t('language')}</span>
              <ChevronRight 
                size={16} 
                className={`profile-menu-chevron ${showLanguageMenu ? 'open' : ''}`}
              />
            </button>
            {showLanguageMenu && (
              <div className="profile-menu-submenu">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`profile-menu-submenu-item ${currentLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <span className="profile-menu-submenu-flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <span className="profile-menu-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Logout at bottom */}
        <div className="profile-menu-footer">
          <button 
            className="profile-menu-item profile-menu-logout"
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <LogOut size={18} />
            <span>{t('logOut')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;

