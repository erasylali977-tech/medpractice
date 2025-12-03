import React from 'react';
import { ArrowLeft, User, Zap, CheckCircle, TrendingUp, Calendar, Award } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

const Profile = ({ userData, onBack }) => {
  const { t } = useTranslation();
  const stats = [
    { icon: CheckCircle, label: t('casesCompleted'), value: userData?.casesCompleted || 0 },
    { icon: Zap, label: t('tokens'), value: userData?.tokens || 0 },
    { icon: TrendingUp, label: t('daysStreak'), value: userData?.streak || 0 },
  ];

  const recentCases = userData?.history || [];
  const correctCases = recentCases.filter(c => c.isCorrect === true).length;
  const accuracy = recentCases.length > 0 
    ? Math.round((correctCases / recentCases.length) * 100) 
    : 0;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('profileTitle')}</h2>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h3>{userData?.name || t('user')}</h3>
          <p className="profile-role">{t('internDoctor')}</p>
        </div>

        <div className="stats-section">
          <h3>{t('statistics')}</h3>
          <div className="stats-grid-profile">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="stat-card-profile">
                  <Icon size={24} />
                  <div>
                    <h4>{stat.value}</h4>
                    <p>{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="achievement-section">
          <h3>
            <Award size={20} />
            {t('achievements')}
          </h3>
          <div className="achievement-card">
            <div className="achievement-item">
              <CheckCircle size={20} />
              <div>
                <strong>{t('diagnosticAccuracy')}</strong>
                <p>{accuracy}%</p>
              </div>
            </div>
            {userData?.streak >= 7 && (
              <div className="achievement-item">
                <Calendar size={20} />
                <div>
                  <strong>{t('weekOfPractice')}</strong>
                  <p>7 {t('daysInRow')}</p>
                </div>
              </div>
            )}
            {userData?.casesCompleted >= 10 && (
              <div className="achievement-item">
                <Award size={20} />
                <div>
                  <strong>{t('experiencedDiagnostician')}</strong>
                  <p>10+ {t('casesSolved')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="history-section">
          <h3>{t('caseHistory')}</h3>
          {recentCases.length > 0 ? (
            <div className="history-list-profile">
              {recentCases.slice().reverse().map((item, idx) => (
                <div key={idx} className="history-item-profile">
                  <div className="history-item-main">
                    <CheckCircle 
                      size={16} 
                      className={item.isCorrect === true ? 'correct' : item.isCorrect === false ? 'incorrect' : ''} 
                    />
                    <span>{item.caseName || t('clinicalCase')}</span>
                  </div>
                  <span className="history-date">
                    {new Date(item.date).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-history">{t('noHistory')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

