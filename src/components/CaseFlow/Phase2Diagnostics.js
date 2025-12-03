import React, { useState, useEffect, useCallback } from 'react';
import './CaseFlow.css';
import { useTranslation } from '../../utils/i18n';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * ФАЗА 2: ДИАГНОСТИКА
 * Интегрированный симулятор выбора диагностических методов
 * с AI-генерацией результатов и анализом
 */
const Phase2Diagnostics = ({ 
  caseInfo,
  onCompletePhase,
  onBack,
  onBackToInterview,
  conversationHistory = []
}) => {
  const { t } = useTranslation();
  // State
  const [catalog, setCatalog] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [limit] = useState(8); // Лимит тестов
  const [activeCategory, setActiveCategory] = useState('laboratory');
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  // Загрузка каталога
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setCatalogLoading(true);
      const response = await fetch(`${API_URL}/api/diagnostic-simulation/catalog`);
      const data = await response.json();
      if (data.success) {
        setCatalog(data.catalog);
        // Раскрываем первую подкатегорию
        const firstCat = Object.keys(data.catalog)[0];
        if (firstCat && data.catalog[firstCat].subcategories) {
          const firstSub = Object.keys(data.catalog[firstCat].subcategories)[0];
          if (firstSub) {
            setExpandedSubcategories({ [firstSub]: true });
          }
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки каталога:', err);
      setError(t('catalogError'));
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleTestToggle = useCallback((testId) => {
    setSelectedTests(prev => {
      if (prev.includes(testId)) {
        return prev.filter(id => id !== testId);
      } else {
        return [...prev, testId];
      }
    });
  }, []);

  const toggleSubcategory = (subcategoryKey) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryKey]: !prev[subcategoryKey]
    }));
  };

  const runSimulation = async () => {
    if (selectedTests.length === 0) {
      setError(t('selectAtLeastOne'));
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Формируем данные кейса из caseInfo
      const caseData = {
        age: caseInfo?.age || extractAge(caseInfo),
        gender: caseInfo?.gender || 'не указан',
        complaints: caseInfo?.symptoms?.join(', ') || caseInfo?.description || '',
        history: caseInfo?.additionalInfo?.join('. ') || caseInfo?.examinationFindings || '',
        diagnosis: caseInfo?.correctDiagnosis || '',
        // Дополнительные данные из conversation history
        interviewData: summarizeInterview(conversationHistory)
      };

      const response = await fetch(`${API_URL}/api/diagnostic-simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData,
          selectedTests,
          limit
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || t('simulationError'));
      }
    } catch (err) {
      console.error('Ошибка симуляции:', err);
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  // Извлекаем возраст из данных кейса
  const extractAge = (caseInfo) => {
    if (!caseInfo) return 'не указан';
    // Пытаемся найти возраст в различных полях
    if (caseInfo.age) return caseInfo.age;
    // Возраст может быть в описании
    const ageMatch = caseInfo.description?.match(/(\d+)\s*(лет|год)/);
    if (ageMatch) return ageMatch[1];
    return 'взрослый';
  };

  // Суммируем информацию из интервью
  const summarizeInterview = (history) => {
    if (!history || history.length === 0) return '';
    return history
      .filter(msg => msg.type === 'patient')
      .map(msg => msg.text)
      .slice(-5) // Последние 5 ответов пациента
      .join('. ');
  };

  const isLimitExceeded = selectedTests.length > limit;

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return t('instant');
    if (minutes < 60) return `${minutes} ${t('minutes')}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}${t('hours')}`;
    return `${hours}${t('hours')} ${mins}${t('minutes')}`;
  };

  const handleProceedToTreatment = () => {
    // Передаем результаты диагностики в следующую фазу
    onCompletePhase({
      selectedTests,
      results
    });
  };

  if (catalogLoading) {
    return (
      <div className="phase-container diagnostic-simulator-phase">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('loadingCatalog')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-container diagnostic-simulator-phase">
      {/* Header */}
      <div className="phase-header">
        <h2>{t('phase2Title')}</h2>
        <p>{t('phase2Subtitle')}</p>
      </div>

      {/* Case Summary */}
      <div className="case-summary-card">
        <h3>{t('interviewData')}</h3>
        <div className="case-summary-content">
          <div className="summary-item">
            <span className="label">{t('patientLabel')}</span>
            <span className="value">{caseInfo?.gender || t('notSpecified')}</span>
          </div>
          <div className="summary-item">
            <span className="label">{t('mainComplaints')}</span>
            <span className="value">{caseInfo?.symptoms?.slice(0, 3).join(', ') || caseInfo?.description || t('fromInterview')}</span>
          </div>
          {conversationHistory && conversationHistory.length > 0 && (
            <div className="summary-item">
              <span className="label">{t('questionsAskedLabel')}</span>
              <span className="value">{conversationHistory.filter(m => m.type === 'doctor').length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Limit Indicator */}
      <div className={`limit-indicator-card ${isLimitExceeded ? 'exceeded' : ''}`}>
        <div className="limit-info">
          <span className="limit-label">{t('selectedTests')}</span>
          <span className={`limit-count ${isLimitExceeded ? 'over' : ''}`}>
            {selectedTests.length} / {limit}
          </span>
        </div>
      </div>

      {/* Error for limit exceeded */}
      {isLimitExceeded && (
        <div className="error-banner">
          {t('tooManyTests').replace('{count}', selectedTests.length).replace('{limit}', limit)}
        </div>
      )}

      {/* Diagnostic Catalog */}
      {catalog && !results && (
        <div className="diagnostic-catalog-section">
          <h3>{t('diagnosticMethods')}</h3>
          
          {/* Category Tabs */}
          <div className="category-tabs">
            {Object.entries(catalog).map(([key, category]) => (
              <button
                key={key}
                className={`category-tab ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                {category.icon} {category.name.replace(/^[🧪🏥🔍]\s*/, '')}
              </button>
            ))}
          </div>

          {/* Subcategories and Tests */}
          {catalog[activeCategory] && (
            <div className="subcategories-list">
              {Object.entries(catalog[activeCategory].subcategories || {}).map(([subKey, subcategory]) => (
                <div key={subKey} className="subcategory-block">
                  <div 
                    className={`subcategory-header ${expandedSubcategories[subKey] ? 'expanded' : ''}`}
                    onClick={() => toggleSubcategory(subKey)}
                  >
                    <h4>{subcategory.name}</h4>
                    <span className="toggle-icon">{expandedSubcategories[subKey] ? '▼' : '▶'}</span>
                  </div>
                  
                  {expandedSubcategories[subKey] && (
                    <div className="tests-grid">
                      {(subcategory.tests || []).map(test => (
                        <div
                          key={test.id}
                          className={`test-card ${selectedTests.includes(test.id) ? 'selected' : ''}`}
                          onClick={() => handleTestToggle(test.id)}
                        >
                          <div className="test-checkbox">
                            {selectedTests.includes(test.id) ? '✓' : ''}
                          </div>
                          <div className="test-content">
                            <div className="test-name">{test.name}</div>
                            <div className="test-description">{test.description}</div>
                            <div className="test-meta">
                              <span className="test-time">⏱️ {formatTime(test.time_minutes)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Run Simulation Button */}
          {selectedTests.length > 0 && (
            <button
              className={`run-simulation-btn ${loading ? 'loading' : ''}`}
              onClick={runSimulation}
              disabled={loading || isLimitExceeded}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {t('analyzingResults')}
                </>
              ) : (
                <>
                  {t('getResults').replace('{count}', selectedTests.length)}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && !isLimitExceeded && (
        <div className="error-banner">{error}</div>
      )}

      {/* Results Section */}
      {results && results.success && (
        <div className="simulation-results-section">
          <div className="results-header">
            <h3>{t('diagnosticResults')}</h3>
            {results.analysis?.score !== undefined && (
              <span className={`score-badge ${getScoreClass(results.analysis.score)}`}>
                {results.analysis.score}/100
              </span>
            )}
          </div>

          {/* Test Results */}
          <div className="result-block">
            <h4>{t('testResults')}</h4>
            <div className="test-results-grid">
              {Object.entries(results.results || {}).map(([testId, result]) => (
                <div key={testId} className="test-result-card">
                  <h5>{result.testName}</h5>
                  {result.values && result.values.length > 0 && (
                    <div className="result-values">
                      {result.values.map((val, idx) => (
                        <div key={idx} className={`result-value ${val.status}`}>
                          <span className="value-name">{val.name}:</span>
                          <span className="value-data">
                            {val.value} {val.unit}
                            {val.status === 'high' && ' ↑'}
                            {val.status === 'low' && ' ↓'}
                          </span>
                          <span className="value-ref">({t('normal')} {val.reference})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.interpretation && (
                    <div className="result-interpretation">
                      💡 {result.interpretation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Analysis */}
          {results.analysis && (
            <>
              {/* Correct */}
              {results.analysis.correct?.length > 0 && (
                <div className="result-block correct">
                  <h4>{t('correctPrescriptions')}</h4>
                  <ul>
                    {results.analysis.correct.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing */}
              {results.analysis.missing?.length > 0 && (
                <div className="result-block missing">
                  <h4>{t('missing')}</h4>
                  <ul>
                    {results.analysis.missing.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Excessive */}
              {results.analysis.excessive?.length > 0 && (
                <div className="result-block excessive">
                  <h4>{t('excessiveTests')}</h4>
                  <ul>
                    {results.analysis.excessive.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diagnoses */}
              {results.analysis.diagnoses?.length > 0 && (
                <div className="result-block diagnoses">
                  <h4>{t('suggestedDiagnoses')}</h4>
                  <div className="diagnoses-list">
                    {results.analysis.diagnoses.map((diag, idx) => (
                      <div key={idx} className="diagnosis-card">
                        <span className={`probability ${diag.probability === 'высокая' || diag.probability === t('high') ? 'high' : diag.probability === 'средняя' || diag.probability === t('mediumProb') ? 'medium' : 'low'}`}>
                          {diag.probability}
                        </span>
                        <div className="diagnosis-content">
                          <strong>{diag.diagnosis}</strong>
                          <p>{diag.reasoning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {results.analysis.recommendations?.length > 0 && (
                <div className="result-block recommendations">
                  <h4>{t('recommendations')}</h4>
                  <ul>
                    {results.analysis.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feedback */}
              {results.analysis.feedback && (
                <div className="result-block feedback">
                  <h4>{t('feedback')}</h4>
                  <p>{results.analysis.feedback}</p>
                </div>
              )}
            </>
          )}

          {/* Proceed Button */}
          <div className="phase-actions">
            {onBackToInterview && (
              <button 
                className="btn-secondary"
                onClick={onBackToInterview}
                style={{ marginRight: '8px' }}
              >
                ← Вернуться к опросу
              </button>
            )}
            <button 
              className="btn-secondary"
              onClick={() => {
                setResults(null);
                setSelectedTests([]);
              }}
            >
              {t('changePrescriptions')}
            </button>
            <button 
              className="btn-primary"
              onClick={handleProceedToTreatment}
            >
              {t('proceedToTreatment')}
            </button>
          </div>
        </div>
      )}

      {/* Initial state - no tests selected */}
      {!results && selectedTests.length === 0 && (
        <div className="empty-state">
          <p>{t('selectMethods')}</p>
          <p className="hint">{t('expandSubcategories')}</p>
          {onBackToInterview && (
            <div style={{ marginTop: '20px' }}>
              <button 
                className="btn-secondary"
                onClick={onBackToInterview}
              >
                ← Вернуться к опросу
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Phase2Diagnostics;
