import React, { useState, useEffect, useCallback } from 'react';
import './CaseFlow.css';
import { useTranslation } from '../../utils/i18n';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * ФАЗА 3: ЛЕЧЕНИЕ И ЗАКЛЮЧЕНИЕ
 * Студент выбирает лечение из каталога и заполняет назначения
 */
const Phase3Treatment = ({ 
  caseInfo, 
  diagnosticResults,
  onCompleteCase,
  onSaveDraft,
  onBack,
  onBackToInterview
}) => {
  const { t } = useTranslation();
  // State для каталога лечения
  const [catalog, setCatalog] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('regime');
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  
  // State для выбора лечения
  const [selectedTreatments, setSelectedTreatments] = useState({
    regime: null,
    medications: [],
    diet: [],
    nonMedication: []
  });
  
  // State для проверки лечения
  const [checkResults, setCheckResults] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  
  // State для диагноза и дополнительных полей
  const [diagnosis, setDiagnosis] = useState({
    main: '',
    code: '',
    complications: '',
    comorbidities: ''
  });

  const [observation, setObservation] = useState({
    controlVisit: '3',
    controlTests: [],
    recoveryCriteria: []
  });

  const [hospitalizationIndications, setHospitalizationIndications] = useState('');
  const [referral, setReferral] = useState({
    specialist: '',
    reason: ''
  });
  const [sickLeave, setSickLeave] = useState({
    issue: true,
    days: '5'
  });

  // Загрузка каталога лечения
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setCatalogLoading(true);
      const response = await fetch(`${API_URL}/api/treatment-simulation/catalog`);
      const data = await response.json();
      if (data.success) {
        setCatalog(data.catalog);
        // Раскрываем первую категорию
        const firstCat = Object.keys(data.catalog)[0];
        if (firstCat && data.catalog[firstCat].items) {
          setActiveCategory(firstCat);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки каталога лечения:', err);
      setError(t('treatmentCatalogError'));
    } finally {
      setCatalogLoading(false);
    }
  };

  // Выбор режима
  const handleRegimeSelect = (regimeId) => {
    setSelectedTreatments(prev => ({
      ...prev,
      regime: prev.regime === regimeId ? null : regimeId
    }));
  };

  // Выбор препарата/процедуры
  const handleTreatmentToggle = (treatmentId, category) => {
    setSelectedTreatments(prev => {
      if (category === 'medications') {
        const isSelected = prev.medications.some(m => m.id === treatmentId);
        if (isSelected) {
          return {
            ...prev,
            medications: prev.medications.filter(m => m.id !== treatmentId)
          };
        } else {
          const treatment = findTreatmentInCatalog(treatmentId);
          if (treatment) {
            return {
              ...prev,
              medications: [...prev.medications, {
                id: treatmentId,
                name: treatment.name,
                dose: treatment.dose || '',
                frequency: treatment.frequency || '',
                duration: treatment.duration || '',
                route: treatment.route || 'oral'
              }]
            };
          }
        }
      } else if (category === 'diet') {
        const isSelected = prev.diet.includes(treatmentId);
        return {
          ...prev,
          diet: isSelected 
            ? prev.diet.filter(d => d !== treatmentId)
            : [...prev.diet, treatmentId]
        };
      } else if (category === 'nonMedication') {
        const isSelected = prev.nonMedication.includes(treatmentId);
        return {
          ...prev,
          nonMedication: isSelected
            ? prev.nonMedication.filter(n => n !== treatmentId)
            : [...prev.nonMedication, treatmentId]
        };
      }
      return prev;
    });
  };

  // Найти лечение в каталоге
  const findTreatmentInCatalog = (treatmentId) => {
    if (!catalog) return null;
    
    for (const category of Object.values(catalog)) {
      if (category.items) {
        for (const item of Object.values(category.items)) {
          if (item.id === treatmentId) return item;
        }
      }
      if (category.subcategories) {
        for (const subcat of Object.values(category.subcategories)) {
          if (subcat.items) {
            for (const item of Object.values(subcat.items)) {
              if (item.id === treatmentId) return item;
            }
          }
        }
      }
    }
    return null;
  };

  // Обновить детали препарата
  const updateMedicationDetails = (medicationId, field, value) => {
    setSelectedTreatments(prev => ({
      ...prev,
      medications: prev.medications.map(m =>
        m.id === medicationId ? { ...m, [field]: value } : m
      )
    }));
  };

  // Удалить препарат
  const removeMedication = (medicationId) => {
    setSelectedTreatments(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== medicationId)
    }));
  };

  // Проверка лечения
  const checkTreatment = async () => {
    if (!diagnosis.main) {
      setError(t('specifyDiagnosisFirst'));
      return;
    }

    setChecking(true);
    setError(null);
    setCheckResults(null);

    try {
      const treatmentData = {
        regime: selectedTreatments.regime,
        medications: selectedTreatments.medications,
        diet: selectedTreatments.diet.map(id => {
          const treatment = findTreatmentInCatalog(id);
          return treatment?.name || id;
        }),
        nonMedication: selectedTreatments.nonMedication.map(id => {
          const treatment = findTreatmentInCatalog(id);
          return treatment?.name || id;
        })
      };

      const response = await fetch(`${API_URL}/api/treatment-simulation/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData: {
            id: caseInfo?.id,
            correctDiagnosis: caseInfo?.correctDiagnosis || diagnosis.main,
            age: caseInfo?.age,
            gender: caseInfo?.gender,
            symptoms: caseInfo?.symptoms || []
          },
          treatmentData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCheckResults(data);
      } else {
        setError(data.error || t('treatmentCheckError'));
      }
    } catch (err) {
      console.error('Ошибка проверки лечения:', err);
      setError(t('treatmentCheckConnectionError'));
    } finally {
      setChecking(false);
    }
  };

  // Завершить прием
  const handleComplete = () => {
    const caseData = {
      diagnosis,
      treatment: {
        regime: selectedTreatments.regime,
        medications: selectedTreatments.medications,
        diet: selectedTreatments.diet,
        nonMedication: selectedTreatments.nonMedication
      },
      observation,
      hospitalizationIndications,
      referral,
      sickLeave,
      checkResults
    };
    onCompleteCase(caseData);
  };

  const toggleSubcategory = (subcategoryKey) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryKey]: !prev[subcategoryKey]
    }));
  };

  const toggleControlTest = (test) => {
    setObservation(prev => ({
      ...prev,
      controlTests: prev.controlTests.includes(test)
        ? prev.controlTests.filter(t => t !== test)
        : [...prev.controlTests, test]
    }));
  };

  const toggleRecoveryCriteria = (criterion) => {
    setObservation(prev => ({
      ...prev,
      recoveryCriteria: prev.recoveryCriteria.includes(criterion)
        ? prev.recoveryCriteria.filter(c => c !== criterion)
        : [...prev.recoveryCriteria, criterion]
    }));
  };

  if (catalogLoading) {
    return (
      <div className="phase-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('loadingTreatmentCatalog')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-container">
      <div className="phase-header">
        <h2>{t('phase3Title')}</h2>
        <p>{t('phase3Subtitle')}</p>
      </div>

      {/* Сводка результатов диагностики */}
      {diagnosticResults && diagnosticResults.results && (
        <div className="diagnostic-summary-card">
          <h3>{t('diagnosticResultsSummary')}</h3>
          {diagnosticResults.results.analysis && diagnosticResults.results.analysis.diagnoses && (
            <div className="diagnosis-suggestions">
              <strong>{t('suggestedDiagnosesLabel')}</strong>
              <ul>
                {diagnosticResults.results.analysis.diagnoses.slice(0, 3).map((diag, idx) => (
                  <li key={idx}>
                    <span className={`probability-tag ${diag.probability === 'высокая' || diag.probability === t('high') ? 'high' : diag.probability === 'средняя' || diag.probability === t('mediumProb') ? 'medium' : 'low'}`}>
                      {diag.probability}
                    </span>
                    {diag.diagnosis}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ДИАГНОЗ */}
      <div className="form-section">
        <h3>{t('diagnosisSection')}</h3>
        <div className="form-group">
          <label>{t('mainDiagnosis')}</label>
          <input
            type="text"
            value={diagnosis.main}
            onChange={(e) => setDiagnosis(prev => ({ ...prev, main: e.target.value }))}
            placeholder={t('diagnosisPlaceholder')}
          />
        </div>
        <div className="form-group">
          <label>{t('icd10Code')}</label>
          <input
            type="text"
            value={diagnosis.code}
            onChange={(e) => setDiagnosis(prev => ({ ...prev, code: e.target.value }))}
            placeholder="A02.0"
          />
        </div>
      </div>

      {/* КАТАЛОГ ЛЕЧЕНИЯ */}
      {catalog && !checkResults && (
        <div className="treatment-catalog-section">
          <h3>{t('treatmentCatalog')}</h3>
          
          {/* Category Tabs */}
          <div className="category-tabs">
            {Object.entries(catalog).map(([key, category]) => (
              <button
                key={key}
                className={`category-tab ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Режим */}
          {activeCategory === 'regime' && catalog.regime && (
            <div className="treatments-grid">
              {Object.values(catalog.regime.items || {}).map(item => (
                <div
                  key={item.id}
                  className={`treatment-card ${selectedTreatments.regime === item.id ? 'selected' : ''}`}
                  onClick={() => handleRegimeSelect(item.id)}
                >
                  <div className="treatment-checkbox">
                    {selectedTreatments.regime === item.id ? '✓' : ''}
                  </div>
                  <div className="treatment-content">
                    <div className="treatment-name">{item.name}</div>
                    <div className="treatment-description">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Медикаменты */}
          {(activeCategory === 'antibiotics' || activeCategory === 'rehydration' || 
            activeCategory === 'symptomatic' || activeCategory === 'endocrinology') && (
            <div className="subcategories-list">
              {catalog[activeCategory]?.subcategories && Object.entries(catalog[activeCategory].subcategories).map(([subKey, subcategory]) => (
                <div key={subKey} className="subcategory-block">
                  <div 
                    className={`subcategory-header ${expandedSubcategories[subKey] ? 'expanded' : ''}`}
                    onClick={() => toggleSubcategory(subKey)}
                  >
                    <h4>{subcategory.name}</h4>
                    <span className="toggle-icon">{expandedSubcategories[subKey] ? '▼' : '▶'}</span>
                  </div>
                  
                  {expandedSubcategories[subKey] && (
                    <div className="treatments-grid">
                      {Object.values(subcategory.items || {}).map(item => {
                        const isSelected = selectedTreatments.medications.some(m => m.id === item.id);
                        return (
                          <div
                            key={item.id}
                            className={`treatment-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleTreatmentToggle(item.id, 'medications')}
                          >
                            <div className="treatment-checkbox">
                              {isSelected ? '✓' : ''}
                            </div>
                            <div className="treatment-content">
                              <div className="treatment-name">{item.name}</div>
                              <div className="treatment-description">{item.description}</div>
                              {item.dose && (
                                <div className="treatment-dose">{t('dose')}: {item.dose}</div>
                              )}
                              {item.cost > 0 && (
                                <div className="treatment-cost">💰 {item.cost}₸</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Диета */}
          {activeCategory === 'diet' && catalog.diet && (
            <div className="treatments-grid">
              {Object.values(catalog.diet.items || {}).map(item => (
                <div
                  key={item.id}
                  className={`treatment-card ${selectedTreatments.diet.includes(item.id) ? 'selected' : ''}`}
                  onClick={() => handleTreatmentToggle(item.id, 'diet')}
                >
                  <div className="treatment-checkbox">
                    {selectedTreatments.diet.includes(item.id) ? '✓' : ''}
                  </div>
                  <div className="treatment-content">
                    <div className="treatment-name">{item.name}</div>
                    <div className="treatment-description">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Немедикаментозное */}
          {activeCategory === 'nonMedication' && catalog.nonMedication && (
            <div className="treatments-grid">
              {Object.values(catalog.nonMedication.items || {}).map(item => (
                <div
                  key={item.id}
                  className={`treatment-card ${selectedTreatments.nonMedication.includes(item.id) ? 'selected' : ''}`}
                  onClick={() => handleTreatmentToggle(item.id, 'nonMedication')}
                >
                  <div className="treatment-checkbox">
                    {selectedTreatments.nonMedication.includes(item.id) ? '✓' : ''}
                  </div>
                  <div className="treatment-content">
                    <div className="treatment-name">{item.name}</div>
                    <div className="treatment-description">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Детали выбранных препаратов */}
          {selectedTreatments.medications.length > 0 && (
            <div className="selected-medications-section">
              <h4>{t('selectedMedications')}</h4>
              {selectedTreatments.medications.map((med, idx) => (
                <div key={med.id || idx} className="medication-details-card">
                  <div className="medication-header">
                    <strong>{med.name}</strong>
                    <button 
                      className="btn-remove"
                      onClick={() => removeMedication(med.id)}
                    >
                      {t('remove')}
                    </button>
                  </div>
                  <div className="medication-fields">
                    <input
                      type="text"
                      placeholder={t('dose')}
                      value={med.dose}
                      onChange={(e) => updateMedicationDetails(med.id, 'dose', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder={t('frequency')}
                      value={med.frequency}
                      onChange={(e) => updateMedicationDetails(med.id, 'frequency', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder={t('duration')}
                      value={med.duration}
                      onChange={(e) => updateMedicationDetails(med.id, 'duration', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Кнопка проверки лечения */}
          {diagnosis.main && (
            <button
              className={`run-simulation-btn ${checking ? 'loading' : ''}`}
              onClick={checkTreatment}
              disabled={checking}
            >
              {checking ? (
                <>
                  <span className="spinner"></span>
                  {t('checkingTreatment')}
                </>
              ) : (
                t('checkTreatment')
              )}
            </button>
          )}
        </div>
      )}

      {/* РЕЗУЛЬТАТЫ ПРОВЕРКИ */}
      {checkResults && checkResults.success && (
        <div className="check-results-section">
          <h3>{t('checkResults')}</h3>
          
          {/* Ошибки */}
          {checkResults.compliance?.errors?.length > 0 && (
            <div className="result-block error-block">
              <h4>{t('criticalErrors')}</h4>
              <ul>
                {checkResults.compliance.errors.map((err, idx) => (
                  <li key={idx}>
                    <strong>{err.type}:</strong> {err.message}
                    {err.correction && <div className="correction">→ {err.correction}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Предупреждения */}
          {checkResults.compliance?.warnings?.length > 0 && (
            <div className="result-block warning-block">
              <h4>{t('warnings')}</h4>
              <ul>
                {checkResults.compliance.warnings.map((warn, idx) => (
                  <li key={idx}>{warn.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Правильные назначения */}
          {checkResults.compliance?.correct?.length > 0 && (
            <div className="result-block correct-block">
              <h4>{t('correctPrescriptionsLabel')}</h4>
              <ul>
                {checkResults.compliance.correct.map((item, idx) => (
                  <li key={idx}>{typeof item === 'string' ? item : item.item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Сводка */}
          {checkResults.summary && (
            <div className="summary-card">
              <p>{t('errorsCount')} {checkResults.summary.errorsCount}</p>
              <p>{t('warningsCount')} {checkResults.summary.warningsCount}</p>
              <p>{t('correctCount')} {checkResults.summary.correctCount}</p>
            </div>
          )}

          <button 
            className="btn-secondary"
            onClick={() => setCheckResults(null)}
          >
            {t('changeTreatment')}
          </button>
        </div>
      )}

      {/* Дополнительные поля (показываются после проверки) */}
      {checkResults && (
        <>
          {/* План наблюдения и др. остаются как были */}
          <div className="form-section">
            <h3>{t('observationPlan')}</h3>
            <div className="form-group">
              <label>{t('controlVisit')}</label>
              <select
                value={observation.controlVisit}
                onChange={(e) => setObservation(prev => ({ ...prev, controlVisit: e.target.value }))}
              >
                <option value="3">3 {t('days')}</option>
                <option value="7">{t('week')}</option>
                <option value="14">{t('weeks')}</option>
                <option value="30">{t('month')}</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Ошибки */}
      {error && (
        <div className="error-banner">{error}</div>
      )}

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
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            {t('backToDiagnostics')}
          </button>
        )}
        {checkResults && (
          <button 
            className="btn-primary"
            onClick={handleComplete}
            disabled={!diagnosis.main}
          >
            {t('completeReception')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Phase3Treatment;
