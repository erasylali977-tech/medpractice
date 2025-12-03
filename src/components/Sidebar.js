import React, { useState } from 'react';
import { BookOpen, TrendingUp, CheckCircle, Target, Rocket, HelpCircle, Info, Stethoscope, ChevronDown, FileText, Shield, ClipboardList } from 'lucide-react';
import { t } from '../utils/i18n';

const Sidebar = ({ onModulesClick, onMainScreenClick, onQuickStart, userData, modules = [], currentScreen, cases = [], onOpenAbout, onOpenAIMentor, onOpenGenTest }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  // Подсчитываем статистику
  const totalModules = modules?.length || 0;
  const completedCases = userData?.stats?.casesCompleted || userData?.casesCompleted || 0;
  const totalCases = modules?.reduce((sum, m) => sum + (m.totalCases || 0), 0) || 0;
  const progressPercentage = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;

  return (
    <div className="sidebar">
      <div className="sidebar-content">

        {/* Навигация */}
        <div className="sidebar-modules">
          <button 
            className={`sidebar-modules-button ${currentScreen === 'moduleSelection' ? 'active' : ''}`}
            onClick={onModulesClick}
          >
            <BookOpen size={22} />
            <span>{t('modules')}</span>
          </button>
          <button 
            className={`sidebar-modules-button ${currentScreen === 'ai-mentor' ? 'active' : ''}`}
            onClick={onOpenAIMentor}
          >
            <Stethoscope size={22} />
            <span>AI Ментор</span>
          </button>
          <button 
            className={`sidebar-modules-button ${currentScreen === 'gentest' ? 'active' : ''}`}
            onClick={onOpenGenTest}
          >
            <ClipboardList size={22} />
            <span>ТестКрафт</span>
          </button>
        </div>

        {/* Статистика убрана - теперь в TopBar */}

        {/* Быстрый старт */}
        <div className="sidebar-quick-start">
          <h3 className="sidebar-section-title">
            <Rocket size={18} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
            Быстрый старт
          </h3>
          <button 
            className="sidebar-quick-action-button"
            onClick={onQuickStart}
          >
            Начать случайный кейс
          </button>
        </div>

        {/* Поддержка и Узнать больше - внизу */}
        <div className="sidebar-footer" style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Поддержка */}
          <button 
            className="sidebar-footer-button"
            onClick={() => {
              window.open('mailto:erasyl@medpractice.kz?subject=Поддержка MedPractice', '_blank');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              marginBottom: '8px',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <HelpCircle size={18} />
            <span>Поддержка</span>
          </button>

          {/* Узнать больше - раскрывающееся меню */}
          <div style={{ position: 'relative' }}>
            <button 
              className="sidebar-footer-button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: showMoreMenu ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                border: 'none',
                color: showMoreMenu ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                if (!showMoreMenu) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showMoreMenu) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Info size={18} />
              <span>Узнать больше</span>
              <ChevronDown 
                size={16} 
                style={{ 
                  marginLeft: 'auto',
                  transform: showMoreMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </button>

            {/* Подменю */}
            {showMoreMenu && (
              <div style={{
                marginTop: '4px',
                marginLeft: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                animation: 'slideDown 0.2s ease-out'
              }}>
                <button 
                  onClick={() => {
                    if (onOpenAbout) onOpenAbout();
                    setShowMoreMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    fontSize: '13px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Info size={16} />
                  <span>О проекте</span>
                </button>
                <button 
                  onClick={() => {
                    window.open('/terms', '_blank');
                    setShowMoreMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    fontSize: '13px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <FileText size={16} />
                  <span>Условия использования</span>
                </button>
                <button 
                  onClick={() => {
                    window.open('/privacy', '_blank');
                    setShowMoreMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    fontSize: '13px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Shield size={16} />
                  <span>Политика конфиденциальности</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

