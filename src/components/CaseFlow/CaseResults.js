import React from 'react';
import './CaseFlow.css';
import { useTranslation } from '../../utils/i18n';

/**
 * Компонент результатов прохождения кейса
 * Показывает детальную обратную связь от AI
 */
const CaseResults = ({ results, caseInfo, onRetry, onNextCase, onExit }) => {
  const { t } = useTranslation();
  // Безопасная деструктуризация с значениями по умолчанию
  const { 
    score = 0, 
    maxScore = 100,
    stars = null,
    starsReasoning = '',
    summary = null,
    feedback = '', 
    correctActions = [], 
    improvements = [], 
    criticalErrors = [], 
    protocol = null, 
    economics = null, 
    statistics = null,
    aiAnalysis = null
  } = results || {};
  
  // Вычисляем звезды из score, если stars не указаны
  const finalStars = stars !== null && stars !== undefined 
    ? Math.max(1, Math.min(5, stars))
    : Math.max(1, Math.min(5, Math.round((score / maxScore) * 5)));
  
  // Получаем аргументацию из summary или из starsReasoning
  const finalReasoning = starsReasoning || summary?.starsReasoning || '';

  const getStarsColor = () => {
    if (finalStars >= 4.5) return '#28a745';
    if (finalStars >= 3.5) return '#ffc107';
    if (finalStars >= 2.5) return '#fd7e14';
    return '#dc3545';
  };

  const getStarsDisplay = () => {
    const filled = Math.floor(finalStars);
    const half = finalStars % 1 >= 0.5;
    return '⭐'.repeat(filled) + (half ? '⭐' : '') + '☆'.repeat(5 - filled - (half ? 1 : 0));
  };

  const getStarsStatus = () => {
    if (finalStars >= 4.5) return t('excellent');
    if (finalStars >= 3.5) return t('good');
    if (finalStars >= 2.5) return t('satisfactory');
    if (finalStars >= 1.5) return t('needsRetry');
    return t('unsatisfactory');
  };

  // Защита от отсутствия данных
  if (!results) {
    return (
      <div className="results-container">
        <div className="results-header">
          <h1>{t('caseResultsTitle')}</h1>
        </div>
        <div className="feedback-section error">
          <p>{t('errorLoadingResults')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>{t('caseResultsTitle')}</h1>
      </div>

      {/* ИТОГОВАЯ ОЦЕНКА */}
      {(finalStars !== null && finalStars !== undefined) && (
        <div className="score-card" style={{ borderColor: getStarsColor() }}>
          <div className="score-main">
            <div className="score-stars-large" style={{ color: getStarsColor(), fontSize: '48px', marginBottom: '12px' }}>
              {getStarsDisplay()}
            </div>
            <div className="score-status" style={{ color: getStarsColor(), fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
              {getStarsStatus()}
            </div>
            {finalReasoning && (
              <div className="score-reasoning" style={{ 
                marginTop: '16px', 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '15px',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: getStarsColor(), display: 'block', marginBottom: '8px' }}>{t('ratingReasoning')}</strong>
                {finalReasoning}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ЧТО СДЕЛАНО ПРАВИЛЬНО */}
      {correctActions && correctActions.length > 0 && (
        <div className="feedback-section success">
          <h2>{t('whatWasCorrect')}</h2>
          <ul>
            {correctActions.map((action, idx) => (
              <li key={idx}>
                <strong>{action.category} (+{action.points || 0} {t('points')}):</strong>
                {action.items && Array.isArray(action.items) && action.items.length > 0 ? (
                  <ul>
                    {action.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        {typeof item === 'string' ? item : typeof item === 'object' && item !== null ? (item.name || item.title || JSON.stringify(item)) : String(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{action.description || t('noDetails')}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ЧТО МОЖНО УЛУЧШИТЬ */}
      {improvements && improvements.length > 0 && (
        <div className="feedback-section warning">
          <h2>{t('whatCanBeImproved')}</h2>
          <ul>
            {improvements.map((improvement, idx) => {
              const category = typeof improvement.category === 'string' ? improvement.category : (improvement.category ? String(improvement.category) : t('improvement'));
              const description = typeof improvement.description === 'string' ? improvement.description : (improvement.description ? String(improvement.description) : '');
              const reason = improvement.reason ? (typeof improvement.reason === 'string' ? improvement.reason : String(improvement.reason)) : null;
              return (
                <li key={idx}>
                  <strong>{category} (-{improvement.points || 0} {t('points')}):</strong>
                  <p>{description}</p>
                  {reason && (
                    <p className="improvement-reason">→ {reason}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* КРИТИЧЕСКИЕ ОШИБКИ */}
      {criticalErrors && criticalErrors.length > 0 ? (
        <div className="feedback-section error">
          <h2>{t('criticalErrorsTitle')}</h2>
          <ul>
            {criticalErrors.map((error, idx) => {
              const errorType = typeof error.type === 'string' ? error.type : (error.type ? String(error.type) : t('error'));
              const errorMessage = typeof error.message === 'string' ? error.message : (error.message ? String(error.message) : '');
              const consequence = error.consequence ? (typeof error.consequence === 'string' ? error.consequence : String(error.consequence)) : null;
              return (
                <li key={idx}>
                  <strong>{errorType}:</strong> {errorMessage}
                  {consequence && (
                    <p className="error-consequence">{t('consequence')} {consequence}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="feedback-section success">
          <h2>{t('criticalErrorsTitle')}</h2>
          <p>{t('noCriticalErrors')}</p>
        </div>
      )}

      {/* ПРАВИЛЬНЫЙ ПОДХОД */}
      {protocol && (
        <div className="feedback-section protocol">
          <h2>{t('correctApproach')}</h2>
          <div className="protocol-content">
            {protocol.diagnosis && (
              <div className="protocol-diagnosis">
                {typeof protocol.diagnosis === 'string' ? (
                  <>
                    <strong>{t('diagnosisLabel')}</strong> {protocol.diagnosis}
                  </>
                ) : typeof protocol.diagnosis === 'object' && protocol.diagnosis !== null ? (
                  <>
                    {protocol.diagnosis.title && (
                      <>
                        <strong>{t('diagnosisLabel')}</strong> {typeof protocol.diagnosis.title === 'string' ? protocol.diagnosis.title : String(protocol.diagnosis.title)}
                      </>
                    )}
                    {protocol.diagnosis.clinical_criteria && Array.isArray(protocol.diagnosis.clinical_criteria) && protocol.diagnosis.clinical_criteria.length > 0 && (
                      <div className="protocol-clinical-criteria" style={{ marginTop: '12px' }}>
                        <strong>{t('clinicalCriteria')}</strong>
                        <ul>
                          {protocol.diagnosis.clinical_criteria.map((criterion, idx) => (
                            <li key={idx}>{typeof criterion === 'string' ? criterion : String(criterion)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {protocol.diagnosis.laboratory && Array.isArray(protocol.diagnosis.laboratory) && protocol.diagnosis.laboratory.length > 0 && (
                      <div className="protocol-laboratory" style={{ marginTop: '12px' }}>
                        <strong>{t('laboratoryTests')}</strong>
                        <ul>
                          {protocol.diagnosis.laboratory.map((lab, idx) => (
                            <li key={idx}>{typeof lab === 'string' ? lab : String(lab)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <strong>Диагноз:</strong> {String(protocol.diagnosis)}
                  </>
                )}
              </div>
            )}
            {protocol.tactics && Array.isArray(protocol.tactics) && protocol.tactics.length > 0 && (
              <div className="protocol-tactics">
                <strong>{t('tactics')}</strong>
                <ol>
                  {protocol.tactics.map((tactic, idx) => {
                    const title = typeof tactic === 'object' && tactic !== null 
                      ? (tactic.title || tactic.name || t('item')) 
                      : String(tactic);
                    const description = typeof tactic === 'object' && tactic !== null
                      ? (tactic.description || tactic.desc || '')
                      : '';
                    return (
                      <li key={idx}>
                        <strong>{title}:</strong> {description}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
              {protocol.redFlags && Array.isArray(protocol.redFlags) && protocol.redFlags.length > 0 && (
              <div className="protocol-red-flags">
                <strong>{t('redFlags')}</strong>
                <ul>
                  {protocol.redFlags.map((flag, idx) => (
                    <li key={idx}>
                      {typeof flag === 'string' ? flag : typeof flag === 'object' ? JSON.stringify(flag) : String(flag)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {protocol.link && (
              <div className="protocol-link">
                <a href={protocol.link} target="_blank" rel="noopener noreferrer">
                  {t('protocolLink')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ЭКОНОМИКА */}
      {economics && (
        <div className="feedback-section economics">
          <h2>{t('economics')}</h2>
          <div className="economics-content">
            {economics.examination && Array.isArray(economics.examination) && economics.examination.length > 0 && (
              <div className="economics-exam">
                <strong>{t('examination')}</strong>
                <ul>
                  {economics.examination.map((item, idx) => (
                    <li key={idx}>
                      • {item.name || t('method')}: {item.cost ? item.cost.toLocaleString() : 0}₸ {item.necessary ? t('needed') : t('unnecessary')}
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>{t('total')}</strong> {(economics.totalExamination || 0).toLocaleString()}₸
                  {economics.optimalExamination && (
                    <span> ({t('optimal')}: {economics.optimalExamination.toLocaleString()}₸)</span>
                  )}
                </p>
              </div>
            )}
            {economics.treatment && economics.treatment.items && Array.isArray(economics.treatment.items) && economics.treatment.items.length > 0 && (
              <div className="economics-treatment">
                <strong>{t('treatmentDays').replace('{days}', economics.treatment.days || 7)}</strong>
                <ul>
                  {economics.treatment.items.map((item, idx) => (
                    <li key={idx}>
                      • {item.name || t('medication')}: {(item.cost || 0).toLocaleString()}₸
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>{t('total')}</strong> {(economics.totalTreatment || 0).toLocaleString()}₸
                </p>
              </div>
            )}
            <div className="economics-total">
              <strong>{t('totalCost')} {(economics.totalCost || 0).toLocaleString()}₸ (~{Math.round((economics.totalCost || 0) / 450)} USD)</strong>
              <p>{t('forPatient')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ОБУЧАЮЩИЕ МАТЕРИАЛЫ */}
      {results.learningMaterials && results.learningMaterials.length > 0 && (
        <div className="feedback-section learning">
          <h2>{t('learningMaterials')}</h2>
          <p>{t('wantToLearnMore')}</p>
          <ul>
            {results.learningMaterials.map((material, idx) => (
              <li key={idx}>
                <a href={material.link} target="_blank" rel="noopener noreferrer">
                  {material.icon} {material.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* СТАТИСТИКА */}
      {statistics && (
        <div className="feedback-section statistics">
          <h2>{t('yourStatistics')}</h2>
          <div className="statistics-content">
            <p>
              <strong>{t('module')}</strong> {typeof statistics.module === 'string' ? statistics.module : (statistics.module ? String(statistics.module) : t('notSpecifiedModule'))} - {statistics.completedCases || 0} {t('casesCompletedOutOf').replace('{total}', statistics.totalCases || 0)}
            </p>
            <p>
              <strong>{t('averageScore')}</strong> {statistics.averageScore || 0}/100
            </p>
            {statistics.bestResult && (
              <p>
                <strong>{t('bestResult')}</strong> {statistics.bestResult.score || 0}/100 ({typeof statistics.bestResult.case === 'string' ? statistics.bestResult.case : (statistics.bestResult.case ? String(statistics.bestResult.case) : t('case'))})
              </p>
            )}
            {statistics.strengths && statistics.strengths.length > 0 && (
              <div className="statistics-strengths">
                <strong>{t('strengths')}</strong>
                <ul>
                  {statistics.strengths.map((strength, idx) => {
                    const name = typeof strength === 'object' && strength !== null ? (strength.name || strength.title || t('strength')) : String(strength);
                    const percentage = typeof strength === 'object' && strength !== null ? (strength.percentage || '') : '';
                    return (
                      <li key={idx}>✅ {name}{percentage ? ` (${percentage}%)` : ''}</li>
                    );
                  })}
                </ul>
              </div>
            )}
            {statistics.weaknesses && statistics.weaknesses.length > 0 && (
              <div className="statistics-weaknesses">
                <strong>{t('requiresAttention')}</strong>
                <ul>
                  {statistics.weaknesses.map((weakness, idx) => {
                    const name = typeof weakness === 'object' && weakness !== null ? (weakness.name || weakness.title || t('requiresAttentionItem')) : String(weakness);
                    const percentage = typeof weakness === 'object' && weakness !== null ? (weakness.percentage || '') : '';
                    return (
                      <li key={idx}>⚠️ {name}{percentage ? ` (${percentage}%)` : ''}</li>
                    );
                  })}
                </ul>
              </div>
            )}
            {statistics.recommendation && (
              <div className="statistics-recommendation">
                <strong>{t('recommendation')}</strong> {typeof statistics.recommendation === 'string' ? statistics.recommendation : String(statistics.recommendation)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI АНАЛИЗ ЛЕЧЕНИЯ */}
      {aiAnalysis && (
        <div className="feedback-section ai-analysis" style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '20px',
            color: '#667eea'
          }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            AI Анализ лечения
          </h2>
          
          {aiAnalysis.treatmentAnalysis && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e0e0e0', marginBottom: '12px', fontSize: '18px' }}>Анализ назначенного лечения:</h3>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '16px', 
                borderRadius: '8px',
                lineHeight: '1.8',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {typeof aiAnalysis.treatmentAnalysis === 'string' 
                  ? aiAnalysis.treatmentAnalysis 
                  : JSON.stringify(aiAnalysis.treatmentAnalysis, null, 2)}
              </div>
            </div>
          )}

          {aiAnalysis.treatmentStrengths && aiAnalysis.treatmentStrengths.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#4CAF50', marginBottom: '12px', fontSize: '18px' }}>✅ Сильные стороны лечения:</h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                margin: 0
              }}>
                {aiAnalysis.treatmentStrengths.map((strength, idx) => (
                  <li key={idx} style={{ 
                    padding: '8px 0',
                    borderBottom: idx < aiAnalysis.treatmentStrengths.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                  }}>
                    ✓ {typeof strength === 'string' ? strength : JSON.stringify(strength)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiAnalysis.treatmentIssues && aiAnalysis.treatmentIssues.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ff9800', marginBottom: '12px', fontSize: '18px' }}>⚠️ Проблемы в лечении:</h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                margin: 0
              }}>
                {aiAnalysis.treatmentIssues.map((issue, idx) => (
                  <li key={idx} style={{ 
                    padding: '8px 0',
                    borderBottom: idx < aiAnalysis.treatmentIssues.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>
                    ⚠ {typeof issue === 'string' ? issue : JSON.stringify(issue)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiAnalysis.treatmentRecommendations && aiAnalysis.treatmentRecommendations.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#667eea', marginBottom: '12px', fontSize: '18px' }}>💡 Рекомендации по улучшению:</h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                margin: 0
              }}>
                {aiAnalysis.treatmentRecommendations.map((rec, idx) => (
                  <li key={idx} style={{ 
                    padding: '8px 0',
                    borderBottom: idx < aiAnalysis.treatmentRecommendations.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>
                    💡 {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiAnalysis.summary && (
            <div style={{ 
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(102, 126, 234, 0.2)',
              borderRadius: '8px',
              border: '1px solid rgba(102, 126, 234, 0.4)'
            }}>
              <h3 style={{ color: '#667eea', marginBottom: '12px', fontSize: '18px' }}>📋 Итоговый вывод:</h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: '1.8',
                margin: 0
              }}>
                {typeof aiAnalysis.summary === 'string' 
                  ? aiAnalysis.summary 
                  : JSON.stringify(aiAnalysis.summary, null, 2)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ДЕЙСТВИЯ */}
      <div className="results-actions">
        <button className="btn-secondary" onClick={onRetry}>
          {t('retryCase')}
        </button>
        <button className="btn-primary" onClick={onNextCase}>
          {t('nextCase')}
        </button>
        <button className="btn-secondary" onClick={onExit}>
          {t('toMenu')}
        </button>
      </div>
    </div>
  );
};

export default CaseResults;

