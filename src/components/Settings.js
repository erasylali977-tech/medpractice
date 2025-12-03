import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Save, Lock, Volume2, Music, Sun, Moon } from 'lucide-react';
import { updateProfile } from '../services/authService';
import { useMusicPlayer } from './MusicPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../utils/i18n';

const Settings = ({ user, onLogout, onUpdateUser }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Смена пароля
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Музыка
  const { volume, updateVolume } = useMusicPlayer();
  
  // Тема
  const { theme, toggleTheme } = useTheme();

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const updated = await updateProfile({ name });
      onUpdateUser(updated);
      setMessage(t('profileUpdated'));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || t('profileUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return t('passwordTooShort');
    }
    if (!/\d/.test(password)) {
      return t('passwordMustHaveDigit');
    }
    if (!/[a-zA-Zа-яА-Я]/.test(password)) {
      return t('passwordMustHaveLetter');
    }
    return null;
  };

  const handlePasswordChange = async () => {
    setPasswordMessage('');
    
    // Валидация
    if (!newPassword || !confirmPassword) {
      setPasswordMessage(t('fillAllFields'));
      return;
    }
    
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordMessage(validationError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage(t('passwordsDontMatch'));
      return;
    }
    
    setPasswordLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('passwordChangeError'));
      }
      
      setPasswordMessage(t('passwordChanged'));
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordMessage('');
      }, 2000);
    } catch (error) {
      setPasswordMessage(error.message || t('passwordChangeError'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <SettingsIcon size={24} />
        <h2>{t('settingsTitle')}</h2>
      </div>

      <div className="settings-content">
        {/* Профиль */}
        <section className="settings-section">
          <h3>
            <User size={20} />
            {t('profile')}
          </h3>
          <div className="form-group">
            <label>{t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('yourName')}
            />
          </div>
          <div className="form-group">
            <label>{t('email')}</label>
            <input
              type="email"
              value={email}
              disabled
              className="disabled-input"
            />
            <small>{t('emailCannotChange')}</small>
          </div>
          {message && (
            <div className={`message ${message.includes(t('profileUpdated').split(' ')[0]) ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <button 
            onClick={handleSave}
            className="primary-action-button"
            disabled={loading}
          >
            <Save size={18} />
            {t('saveChanges')}
          </button>
        </section>

        {/* Безопасность - Смена пароля */}
        <section className="settings-section">
          <h3>
            <Lock size={20} />
            {t('security')}
          </h3>
          
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="secondary-action-button"
            >
              {t('changePassword')}
            </button>
          ) : (
            <div className="password-change-form">
              <div className="form-group">
                <label>{t('newPassword')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('newPasswordPlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('confirmNewPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmNewPasswordPlaceholder')}
                />
              </div>
              
              <div className="password-requirements" style={{
                background: 'rgba(102, 126, 234, 0.1)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>
                  {t('passwordRequirements')}
                </strong>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>{t('passwordMinLength')}</li>
                  <li>{t('passwordMustHaveNumber')}</li>
                </ul>
              </div>
              
              {passwordMessage && (
                <div className={`message ${passwordMessage.includes(t('passwordChanged').split(' ')[0]) ? 'success' : 'error'}`}>
                  {passwordMessage}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handlePasswordChange}
                  className="primary-action-button"
                  disabled={passwordLoading}
                >
                  <Save size={18} />
                  {passwordLoading ? t('saving') : t('savePassword')}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordMessage('');
                  }}
                  className="secondary-action-button"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Тема */}
        <section className="settings-section">
          <h3>
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            {t('theme')}
          </h3>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              {t('currentTheme')} {theme === 'dark' ? t('darkTheme') : t('lightTheme')}
            </label>
            <button
              onClick={toggleTheme}
              className="primary-action-button"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={18} />
                  {t('switchToLight')}
                </>
              ) : (
                <>
                  <Moon size={18} />
                  {t('switchToDark')}
                </>
              )}
            </button>
            <small style={{ marginTop: '8px', display: 'block', color: 'var(--text-muted)' }}>
              {t('changesAppliedInstantly')}
            </small>
          </div>
        </section>

        {/* Музыка */}
        <section className="settings-section">
          <h3>
            <Music size={20} />
            {t('backgroundMusic')}
          </h3>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Volume2 size={18} />
              {t('volumeLevel')} {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => updateVolume(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, #667eea 0%, #667eea ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%, rgba(255, 255, 255, 0.2) 100%)`,
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6'
            }}>
              <strong style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>
                {t('musicInfo')}
              </strong>
              <div style={{ marginBottom: '4px' }}>
                <strong>{t('title')}</strong> Relaxing Kazakh National Music, Dombra, Deep sleep, Soothing music
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>{t('author')}</strong> E.S. Prodaction
              </div>
              <div>
                <strong>{t('link')}</strong>{' '}
                <a 
                  href="https://youtu.be/PbeVJEXXHuM?si=FgYZ1MyiJhAJ7KPy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#667eea', textDecoration: 'underline' }}
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;

