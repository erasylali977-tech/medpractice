// src/components/ModuleSelection.js
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Lock, CheckCircle, Grid, List } from 'lucide-react';
import { t } from '../utils/i18n';

const ModuleSelection = ({ modules, onSelectModule, onBack, userData, allCases }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' или 'list'
  if (!modules || modules.length === 0) {
    return (
      <div className="module-selection">
        <div className="selection-header">
          <button onClick={onBack} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <h2>{t('selectModule')}</h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>{t('loadingModules')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-selection">
      <div className="selection-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('selectModuleLearning')}</h2>
        <div className="view-mode-toggle" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button 
            className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Плитки"
          >
            <Grid size={20} />
          </button>
          <button 
            className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Список"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'modules-grid' : 'modules-list'}>
        {modules.map((module) => {
          // Подсчитываем пройденные кейсы для этого модуля
          // Получаем все кейсы модуля
          const moduleCaseIds = allCases
            ? allCases.filter(c => c.moduleId === module.id).map(c => c.id)
            : [];
          
          // Подсчитываем пройденные кейсы из истории пользователя
          const completedCasesCount = userData?.history?.filter(item => 
            moduleCaseIds.includes(item.caseId)
          ).length || 0;
          
          return (
          <div 
            key={module.id} 
            className={`module-card ${module.availableCases > 0 ? 'has-cases' : 'no-cases'}`}
            onClick={() => module.availableCases > 0 && onSelectModule(module)}
            style={{ cursor: module.availableCases > 0 ? 'pointer' : 'default' }}
          >
            <div className="module-card-header">
              <div className="module-icon">{module.icon || '📚'}</div>
              <div className="module-meta">
                <span className={`difficulty-badge ${module.difficulty}`}>
                  {module.difficulty === 'easy' ? t('easy') : 
                   module.difficulty === 'medium' ? t('medium') : 
                   module.difficulty === 'hard' ? t('hard') : module.difficulty}
                </span>
                <span className="module-specialty">{module.specialty || ''}</span>
              </div>
            </div>
            
            <h3>{module.name}</h3>
            <p className="module-description">
              {module.description || 'Выберите этот модуль для начала обучения по выбранной специальности.'}
            </p>
            
            <div className="module-stats">
              <div className="module-stat">
                <BookOpen size={18} />
                <span>
                  <strong style={{ color: '#667eea', fontWeight: 600 }}>
                    {completedCasesCount}
                  </strong>
                  {' / '}
                  <strong style={{ color: '#888', fontWeight: 600 }}>
                    {module.totalCases || 0}
                  </strong>
                  {' '}{t('cases')}
                </span>
              </div>
              {module.totalCases > 0 && (
                <div className="module-progress">
                  <div className="module-progress-bar">
                    <div 
                      className="module-progress-fill"
                      style={{ 
                        width: `${Math.round((completedCasesCount / module.totalCases) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="module-progress-text">
                    {Math.round((completedCasesCount / module.totalCases) * 100)}%
                  </span>
                </div>
              )}
              {module.availableCases === 0 && (
                <span className="coming-soon">{t('comingSoon')}</span>
              )}
            </div>

            <div className="module-footer">
              {module.availableCases > 0 ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectModule(module);
                  }}
                  className="select-module-button"
                >
                  {t('open')}
                </button>
              ) : (
                <button disabled className="select-module-button disabled">
                  <Lock size={16} />
                  {t('comingSoon')}
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleSelection;

