import React, { useState, useEffect } from 'react';
import Phase1Interview from './Phase1Interview';
import Phase2Diagnostics from './Phase2Diagnostics';
import Phase3Treatment from './Phase3Treatment';
import CaseResults from './CaseResults';
import './CaseFlow.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Главный компонент для прохождения кейса
 * Управляет переключением между 3 фазами
 */
const CaseFlow = ({ caseId, onComplete, onExit, onBalanceUpdate }) => {
  const [currentPhase, setCurrentPhase] = useState(1); // 1, 2, 3, или 'results'
  const [caseInfo, setCaseInfo] = useState(null);
  const [conversationLanguage, setConversationLanguage] = useState(null); // Язык разговора
  const [interviewProgress, setInterviewProgress] = useState({
    questionsCount: 0,
    collected: {
      complaints: false,
      anamnesis: false,
      epidemiology: false,
      allergies: false,
      chronicDiseases: false
    }
  });
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [diagnosticMethods, setDiagnosticMethods] = useState(null);
  const [treatmentData, setTreatmentData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaseData();
    loadDiagnosticMethods();
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, { headers });
      if (!response.ok) throw new Error('Failed to load case');
      const data = await response.json();
      setCaseInfo(data);
      
      // НЕ загружаем начальное сообщение - диалог инициирует доктор
    } catch (error) {
      console.error('Error loading case:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiagnosticMethods = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnostics/methods`);
      if (!response.ok) throw new Error('Failed to load diagnostic methods');
      const data = await response.json();
      setDiagnosticMethods(data);
    } catch (error) {
      console.error('Error loading diagnostic methods:', error);
    }
  };

  // Загружаем сохраненную историю разговора из localStorage
  const loadSavedConversation = () => {
    try {
      const saved = localStorage.getItem(`conversation_${caseId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Восстанавливаем даты
        return parsed.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
      }
    } catch (error) {
      console.error('Ошибка загрузки сохраненного чата:', error);
    }
    return [];
  };

  const [conversationHistory, setConversationHistory] = useState(loadSavedConversation);

  // Сохраняем историю разговора в localStorage при каждом изменении
  useEffect(() => {
    if (conversationHistory.length > 0) {
      localStorage.setItem(`conversation_${caseId}`, JSON.stringify(conversationHistory));
    }
  }, [conversationHistory, caseId]);

  // Определение языка по тексту
  const detectLanguage = (text) => {
    // Казахские специфические буквы: ғ, қ, ң, ө, ү, һ, і
    const hasKazakh = /[ғқңөүһіҒҚҢӨҮҺІ]/.test(text);
    if (hasKazakh) return 'kk'; // Казахский
    
    // Русские буквы (кириллица)
    const hasCyrillic = /[а-яА-ЯёЁ]/.test(text);
    if (hasCyrillic) return 'ru'; // Русский
    
    // По умолчанию английский
    return 'en';
  };

  const handleSendMessage = async (message, language = null) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Списываем 1 медкоин за каждый запрос к AI
      if (token) {
        try {
          const spendResponse = await fetch(`${API_BASE_URL}/api/medcoins/spend`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ 
              amount: 1,
              caseId: caseId,
              description: `Вопрос пациенту: "${message.substring(0, 50)}..."`
            })
          });
          
          if (!spendResponse.ok) {
            const errorData = await spendResponse.json();
            if (errorData.error === 'Недостаточно медкоинов' || errorData.error === 'Дневной лимит исчерпан') {
              alert(`Недостаточно медкоинов! Баланс: ${errorData.balance || 0}. ${errorData.error === 'Дневной лимит исчерпан' ? `Дневной лимит: ${errorData.dailyLimit}, использовано: ${errorData.todayUsage}` : 'Пополните баланс в настройках.'}`);
              return null;
            }
          } else {
            // Обновляем баланс в интерфейсе
            const spendData = await spendResponse.json();
            if (onBalanceUpdate) {
              onBalanceUpdate(spendData.balance);
            }
          }
        } catch (spendError) {
          console.error('Ошибка списания медкоинов:', spendError);
          // Продолжаем выполнение, если ошибка не критична
        }
      }

      // Определяем язык из первого сообщения, если еще не определен
      let currentLanguage = language;
      if (!currentLanguage && conversationHistory.length === 0) {
        currentLanguage = detectLanguage(message);
        setConversationLanguage(currentLanguage);
      } else if (conversationLanguage) {
        currentLanguage = conversationLanguage;
      } else {
        currentLanguage = detectLanguage(message);
      }

      // Формируем историю разговора для отправки
      const historyForAPI = conversationHistory.map(msg => ({
        sender: msg.type === 'doctor' ? 'user' : 'patient',
        text: msg.text
      }));

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          caseId: caseId,
          question: message,
          conversationHistory: historyForAPI,
          language: currentLanguage // Передаем язык в API
        })
      });
      
      // Проверяем Content-Type перед парсингом
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Сервер вернул не JSON при отправке сообщения:', text.substring(0, 200));
        throw new Error('Сервер вернул неверный формат ответа');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка отправки сообщения' }));
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data = await response.json();

      // Обновляем историю разговора
      setConversationHistory(prev => [
        ...prev,
        { type: 'doctor', text: message, timestamp: new Date() },
        { type: 'patient', text: data.reply, timestamp: new Date() }
      ]);

      // Обновляем прогресс опроса
      updateInterviewProgress(message, data.reply);

      return data.reply;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const updateInterviewProgress = (question, answer) => {
    setInterviewProgress(prev => {
      const newProgress = {
        ...prev,
        questionsCount: prev.questionsCount + 1
      };

      const questionLower = question.toLowerCase();
      const answerLower = answer.toLowerCase();

      // Простая эвристика для определения собранной информации
      if (questionLower.includes('беспокоит') || questionLower.includes('жалоб')) {
        newProgress.collected.complaints = true;
      }
      if (questionLower.includes('начал') || questionLower.includes('когда')) {
        newProgress.collected.anamnesis = true;
      }
      if (questionLower.includes('ел') || questionLower.includes('пил') || questionLower.includes('еда')) {
        newProgress.collected.epidemiology = true;
      }
      if (questionLower.includes('аллерг') || questionLower.includes('непереносим')) {
        newProgress.collected.allergies = true;
      }
      if (questionLower.includes('хроническ') || questionLower.includes('болеет')) {
        newProgress.collected.chronicDiseases = true;
      }

      return newProgress;
    });
  };

  const handleCompletePhase1 = () => {
    setCurrentPhase(2);
  };

  const handleSelectMethod = (methodId) => {
    setSelectedMethods(prev => [...prev, methodId]);
  };

  const handleDeselectMethod = (methodId) => {
    setSelectedMethods(prev => prev.filter(id => id !== methodId));
  };

  const [diagnosticResults, setDiagnosticResults] = useState(null);

  const handleCompletePhase2 = (diagnosticData) => {
    // Сохраняем результаты диагностики для передачи в Phase3Treatment
    setDiagnosticResults(diagnosticData);
    setCurrentPhase(3);
  };

  const handleSaveDraft = async () => {
    // Сохранение черновика
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/api/cases/${caseId}/draft`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phase: currentPhase,
          treatmentData,
          selectedMethods
        })
      });
      alert('Черновик сохранен!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Ошибка сохранения черновика');
    }
  };

  const handleCompleteCase = async (treatmentData) => {
    setTreatmentData(treatmentData);
    
    // Отправляем данные на сервер для оценки
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Сначала получаем базовую оценку
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          interviewProgress,
          selectedMethods,
          treatmentData
        })
      });
      if (!response.ok) throw new Error('Failed to complete case');
      const evaluation = await response.json();

      // Затем получаем AI анализ лечения
      try {
        const analysisResponse = await fetch(`${API_BASE_URL}/api/analysis`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            caseId: caseId,
            conversationHistory: conversationHistory.map(msg => ({
              sender: msg.type === 'doctor' ? 'user' : 'patient',
              text: msg.text
            })),
            userDiagnosis: treatmentData?.diagnosis?.main || evaluation.userDiagnosis || '',
            interviewProgress,
            selectedMethods,
            treatmentData
          })
        });

        if (analysisResponse.ok) {
          const aiAnalysis = await analysisResponse.json();
          // Объединяем базовую оценку с AI анализом
          setResults({
            ...evaluation,
            aiAnalysis: aiAnalysis
          });
        } else {
          // Если AI анализ не удался, используем только базовую оценку
          setResults(evaluation);
        }
      } catch (analysisError) {
        console.error('Error getting AI analysis:', analysisError);
        // Продолжаем с базовой оценкой
        setResults(evaluation);
      }

      setCurrentPhase('results');
    } catch (error) {
      console.error('Error completing case:', error);
      // Fallback - показываем базовые результаты
      setResults({
        score: 0,
        maxScore: 100,
        feedback: 'Ошибка при оценке кейса',
        correctActions: [],
        improvements: [],
        criticalErrors: [],
        protocol: null,
        economics: null,
        aiAnalysis: null
      });
      setCurrentPhase('results');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка кейса...</p>
      </div>
    );
  }

  if (!caseInfo) {
    return (
      <div className="error-container">
        <p>Ошибка загрузки кейса</p>
        <button onClick={onExit}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="case-flow-container">
      {currentPhase === 1 && (
        <Phase1Interview
          caseInfo={caseInfo}
          onSendMessage={handleSendMessage}
          onCompletePhase={handleCompletePhase1}
          interviewProgress={interviewProgress}
          conversationHistory={conversationHistory}
          onConversationHistoryChange={setConversationHistory}
        />
      )}

      {currentPhase === 2 && (
        <Phase2Diagnostics
          caseInfo={caseInfo}
          conversationHistory={conversationHistory}
          onCompletePhase={handleCompletePhase2}
          onBack={() => setCurrentPhase(1)}
          onBackToInterview={() => setCurrentPhase(1)}
        />
      )}

      {currentPhase === 3 && (
        <Phase3Treatment
          caseInfo={caseInfo}
          diagnosticResults={diagnosticResults}
          onCompleteCase={handleCompleteCase}
          onSaveDraft={handleSaveDraft}
          onBack={() => setCurrentPhase(2)}
          onBackToInterview={() => setCurrentPhase(1)}
        />
      )}

      {currentPhase === 'results' && results && (
        <CaseResults
          results={results}
          caseInfo={caseInfo}
          onRetry={() => setCurrentPhase(1)}
          onNextCase={() => onComplete && onComplete()}
          onExit={onExit}
        />
      )}
    </div>
  );
};

export default CaseFlow;

