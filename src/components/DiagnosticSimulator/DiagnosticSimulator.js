/**
 * DIAGNOSTIC SIMULATOR COMPONENT
 * Симулятор выбора диагностических методов для клинических кейсов
 */

import React, { useState, useEffect, useCallback } from 'react';
import './DiagnosticSimulator.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const DiagnosticSimulator = () => {
  // State
  const [catalog, setCatalog] = useState(null);
  const [sampleCases, setSampleCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [limit, setLimit] = useState(8);
  const [activeCategory, setActiveCategory] = useState('laboratory');
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Загрузка каталога и примеров кейсов
  useEffect(() => {
    fetchCatalog();
    fetchSampleCases();
  }, []);

  const fetchCatalog = async () => {
    try {
      const response = await fetch(`${API_URL}/api/diagnostic-simulation/catalog`);
      const data = await response.json();
      if (data.success) {
        setCatalog(data.catalog);
      }
    } catch (err) {
      console.error('Ошибка загрузки каталога:', err);
      setError('Не удалось загрузить каталог диагностических методов');
    }
  };

  const fetchSampleCases = async () => {
    try {
      const response = await fetch(`${API_URL}/api/diagnostic-simulation/sample-cases`);
      const data = await response.json();
      if (data.success) {
        setSampleCases(data.cases);
      }
    } catch (err) {
      console.error('Ошибка загрузки кейсов:', err);
    }
  };

  const handleCaseSelect = (caseItem) => {
    setSelectedCase(caseItem);
    setLimit(caseItem.recommendedLimit || 8);
    setSelectedTests([]);
    setResults(null);
    setError(null);
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
    if (!selectedCase || selectedTests.length === 0) {
      setError('Выберите кейс и хотя бы один диагностический метод');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${API_URL}/api/diagnostic-simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData: {
            age: selectedCase.age,
            gender: selectedCase.gender,
            complaints: selectedCase.complaints,
            history: selectedCase.history,
            diagnosis: selectedCase.diagnosis
          },
          selectedTests,
          limit
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Ошибка выполнения симуляции');
      }
    } catch (err) {
      console.error('Ошибка симуляции:', err);
      setError('Не удалось выполнить симуляцию. Проверьте соединение с сервером.');
    } finally {
      setLoading(false);
    }
  };

  const isLimitExceeded = selectedTests.length > limit;

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}ч`;
    return `${hours}ч ${mins}м`;
  };

  return (
    <div className="diagnostic-simulator">
      {/* Header */}
      <header className="simulator-header">
        <h1>🩺 ДиагноТренажёр</h1>
        <p>Быстрая тренировка диагностики. Узнай, какие методы исследования ты назначил правильно, а какие — нет. Прокачивай клиническое мышление каждый день.</p>
      </header>

      {/* Case Selector */}
      <section className="case-selector">
        <h2>📋 Выберите клинический случай</h2>
        <div className="case-cards">
          {sampleCases.map(caseItem => (
            <div
              key={caseItem.id}
              className={`case-card ${selectedCase?.id === caseItem.id ? 'selected' : ''}`}
              onClick={() => handleCaseSelect(caseItem)}
            >
              <h3>{caseItem.name}</h3>
              <p className="case-preview">
                {caseItem.age} лет, {caseItem.gender}. {caseItem.complaints.substring(0, 100)}...
              </p>
              <div className="case-meta">
                <span>📊 Лимит: {caseItem.recommendedLimit} тестов</span>
                <span>🎯 {caseItem.keyTests.length} ключевых</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Case Display */}
      {selectedCase && (
        <section className="clinical-case">
          <h2>🧍‍♀️ Клинический случай</h2>
          <div className="case-info">
            <div className="case-info-item">
              <label>Пациент</label>
              <p>{selectedCase.age} лет, {selectedCase.gender}</p>
            </div>
            <div className="case-info-item">
              <label>Жалобы</label>
              <p>{selectedCase.complaints}</p>
            </div>
            <div className="case-info-item">
              <label>Анамнез</label>
              <p>{selectedCase.history}</p>
            </div>
          </div>
        </section>
      )}

      {/* Limit Indicator */}
      {selectedCase && (
        <div className={`limit-indicator ${isLimitExceeded ? 'limit-exceeded' : ''}`}>
          <div className="limit-text">
            Выбрано: <strong>{selectedTests.length}</strong> / {limit} тестов
          </div>
        </div>
      )}

      {/* Error for limit exceeded */}
      {isLimitExceeded && (
        <div className="error-message">
          ❗ Вы назначили слишком много тестов ({selectedTests.length}). 
          Выберите не более {limit} методов диагностики. 
          Пациент не готов тратить лишние деньги/время.
        </div>
      )}

      {/* Diagnostic Catalog */}
      {selectedCase && catalog && (
        <section className="diagnostic-catalog">
          <h2>📋 Диагностические методы</h2>
          
          {/* Category Tabs */}
          <div className="category-tabs">
            {Object.entries(catalog).map(([key, category]) => (
              <button
                key={key}
                className={`category-tab ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Subcategories and Tests */}
          {catalog[activeCategory] && (
            <div className="subcategories">
              {Object.entries(catalog[activeCategory].subcategories || {}).map(([subKey, subcategory]) => (
                <div key={subKey} className="subcategory">
                  <div 
                    className={`subcategory-header ${expandedSubcategories[subKey] ? 'expanded' : ''}`}
                    onClick={() => toggleSubcategory(subKey)}
                  >
                    <h4>{subcategory.name}</h4>
                    <span className="toggle-icon">▼</span>
                  </div>
                  
                  {expandedSubcategories[subKey] && (
                    <div className="tests-grid">
                      {(subcategory.tests || []).map(test => (
                        <div
                          key={test.id}
                          className={`test-card ${selectedTests.includes(test.id) ? 'selected' : ''}`}
                          onClick={() => handleTestToggle(test.id)}
                        >
                          <div className="checkbox"></div>
                          <div className="test-info">
                            <div className="test-name">{test.name}</div>
                            <div className="test-description">{test.description}</div>
                            <div className="test-meta">
                              {test.time_minutes > 0 && (
                                <span className="test-time">⏱️ {formatTime(test.time_minutes)}</span>
                              )}
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
        </section>
      )}

      {/* Run Simulation Button */}
      {selectedCase && selectedTests.length > 0 && (
        <button
          className={`run-simulation-btn ${loading ? 'loading' : ''}`}
          onClick={runSimulation}
          disabled={loading || isLimitExceeded}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Анализ результатов...
            </>
          ) : (
            <>
              🚀 Запустить симуляцию ({selectedTests.length} тестов)
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && !isLimitExceeded && (
        <div className="error-message">{error}</div>
      )}

      {/* Results Section */}
      {results && results.success && (
        <section className="simulation-results">
          <div className="results-header">
            <h2>📊 Результаты симуляции</h2>
            {results.analysis?.score !== undefined && (
              <span className={`score-badge ${getScoreClass(results.analysis.score)}`}>
                {results.analysis.score}/100
              </span>
            )}
          </div>

          <div className="results-content">
            {/* Test Results */}
            <div className="result-section">
              <h3>🧪 Результаты исследований</h3>
              <div className="test-results-list">
                {Object.entries(results.results || {}).map(([testId, result]) => (
                  <div key={testId} className="test-result-item">
                    <h4>{result.testName}</h4>
                    {result.values && result.values.length > 0 && (
                      <div className="result-values">
                        {result.values.map((val, idx) => (
                          <div key={idx} className="result-value">
                            <span className="name">{val.name}</span>
                            <span className={`value ${val.status}`}>
                              {val.value} {val.unit}
                              {val.status === 'high' && ' ↑'}
                              {val.status === 'low' && ' ↓'}
                            </span>
                            <span className="reference">(норма: {val.reference})</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.interpretation && (
                      <div className="test-interpretation">
                        💡 {result.interpretation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis - Correct */}
            {results.analysis?.correct?.length > 0 && (
              <div className="result-section">
                <h3>👍 Правильные назначения</h3>
                <div className="analysis-items">
                  {results.analysis.correct.map((item, idx) => (
                    <div key={idx} className="analysis-item analysis-correct">
                      <span className="icon">✓</span>
                      <span className="text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis - Missing */}
            {results.analysis?.missing?.length > 0 && (
              <div className="result-section">
                <h3>⚠️ Не хватает</h3>
                <div className="analysis-items">
                  {results.analysis.missing.map((item, idx) => (
                    <div key={idx} className="analysis-item analysis-missing">
                      <span className="icon">!</span>
                      <span className="text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis - Excessive */}
            {results.analysis?.excessive?.length > 0 && (
              <div className="result-section">
                <h3>🚫 Лишние исследования</h3>
                <div className="analysis-items">
                  {results.analysis.excessive.map((item, idx) => (
                    <div key={idx} className="analysis-item analysis-excessive">
                      <span className="icon">✗</span>
                      <span className="text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnoses */}
            {results.analysis?.diagnoses?.length > 0 && (
              <div className="result-section">
                <h3>🎯 Предполагаемые диагнозы</h3>
                <div className="diagnoses-list">
                  {results.analysis.diagnoses.map((diag, idx) => (
                    <div key={idx} className="diagnosis-item">
                      <span className={`probability-badge ${
                        diag.probability === 'высокая' ? 'high' : 
                        diag.probability === 'средняя' ? 'medium' : 'low'
                      }`}>
                        {diag.probability}
                      </span>
                      <div className="diagnosis-info">
                        <div className="diagnosis-name">{diag.diagnosis}</div>
                        <div className="diagnosis-reasoning">{diag.reasoning}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.analysis?.recommendations?.length > 0 && (
              <div className="result-section">
                <h3>📘 Рекомендации</h3>
                <div className="recommendations-list">
                  {results.analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="recommendation-item">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {results.analysis?.feedback && (
              <div className="result-section feedback-section">
                <h3>💬 Обратная связь</h3>
                <p className="feedback-text">{results.analysis.feedback}</p>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
};

export default DiagnosticSimulator;

