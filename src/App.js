import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle, Zap, TrendingUp, BookOpen, User, Lock, ArrowLeft } from 'lucide-react';
import { storage } from './utils/storage';
import { patientAI } from './services/patientAI';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import Settings from './components/Settings';
import ModuleSelection from './components/ModuleSelection';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ProfileMenu from './components/ProfileMenu';
import AdminPayments from './components/AdminPayments';
import AdminDashboard from './components/AdminDashboard';
import CaseFlow from './components/CaseFlow/CaseFlow';
import PricingPage from './components/PricingPage';
import AboutPage from './components/AboutPage';
import AIMentor from './components/AIMentor/AIMentor';
import GenTest from './components/GenTest';
import { isAuthenticated, getCurrentUser, getUser } from './services/authService';
import { checkCaseAccess, spendToken } from './services/subscriptionService';
import { setLanguage, getLanguage, t } from './utils/i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Диагностика при загрузке
console.log('🚀 MedPractice App загружается...');
console.log('📡 API URL:', API_BASE_URL);

// Компонент чата с пациентом
const ChatSimulation = ({ caseData, onBack, onComplete }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const userMessagesCount = messages.filter(m => m.sender === 'user').length;
  const canFinish = messages.length >= 10;

  useEffect(() => {
    // Первое сообщение от пациента
    const initialMessage = {
      id: Date.now(),
      sender: 'patient',
      text: caseData.initialMessage || 'Здравствуйте, доктор...',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [caseData]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Получаем ответ от AI
      const response = await patientAI.getResponse(userMsg.text, caseData, messages);
      
      setTimeout(() => {
        const patientMsg = {
          id: Date.now() + 1,
          sender: 'patient',
          text: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, patientMsg]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    } catch (error) {
      console.error('Ошибка получения ответа:', error);
      setIsTyping(false);
    }
  };

  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleFinish = () => {
    setDiagnosisInput('');
    setDiagnosisResult(null);
    setAiAnalysis(null);
    setShowDiagnosisForm(true);
  };

  const handleSubmitDiagnosis = async () => {
    if (!diagnosisInput.trim()) return;

    const result = patientAI.checkDiagnosis(diagnosisInput, caseData.correctDiagnosis);
    setDiagnosisResult(result);

    // Запрашиваем AI анализ
    setIsAnalyzing(true);
    try {
      const analysisResponse = await fetch(`${API_BASE_URL}/api/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: caseData.id,
          conversationHistory: messages,
          userDiagnosis: diagnosisInput
        })
      });

      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();
        setAiAnalysis(analysis);
      }
    } catch (error) {
      console.error('Ошибка получения анализа:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompleteDiagnosis = () => {
    if (!diagnosisResult) return;
    onComplete({
      caseId: caseData.id,
      messagesCount: messages.length,
      userMessagesCount,
      diagnosis: diagnosisInput,
      isCorrect: diagnosisResult.isCorrect,
      accuracy: diagnosisResult.accuracy,
      aiAnalysis: aiAnalysis
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <div className="chat-header-info">
          <h2>{t('patient')}</h2>
          <p className="patient-info">{caseData.gender}</p>
        </div>
        <div className="chat-stats">
          <span className="message-count">{userMessagesCount} {t('questions')}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-content">
              <p>{msg.text}</p>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message patient">
            <div className="message-content typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDiagnosisForm && (
        <div className="diagnosis-panel">
          <h3>{t('preliminaryDiagnosis')}</h3>
          <textarea
            value={diagnosisInput}
            onChange={(e) => setDiagnosisInput(e.target.value)}
            placeholder={t('describeDiagnosis')}
            className="diagnosis-input"
            rows={3}
          />
          <div className="diagnosis-actions">
            <button 
              onClick={handleSubmitDiagnosis}
              disabled={!diagnosisInput.trim()}
              className="primary-action-button"
            >
              {t('check')}
            </button>
            <button 
              onClick={() => setShowDiagnosisForm(false)}
              className="secondary-action-button"
            >
              {t('cancel')}
            </button>
          </div>
          {diagnosisResult && (
            <div className={`diagnosis-result ${diagnosisResult.isCorrect ? 'success' : 'error'}`}>
              <p>{diagnosisResult.feedback}</p>
              <p>{t('accuracy')}: {diagnosisResult.accuracy}%</p>
              
              {isAnalyzing && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
                  <p>🤖 AI анализирует вашу работу...</p>
                </div>
              )}

              {aiAnalysis && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  background: '#f9f9f9', 
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  <h4 style={{ marginBottom: '12px', color: '#333' }}>📊 AI Анализ вашей работы:</h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '12px' }}>
                      {aiAnalysis.feedback || 'Анализ завершен'}
                    </p>
                  </div>

                  {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#e8f5e9', borderRadius: '6px' }}>
                      <h5 style={{ marginBottom: '8px', color: '#2e7d32' }}>✅ Сильные стороны:</h5>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
                        {aiAnalysis.strengths.map((strength, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.improvements && aiAnalysis.improvements.length > 0 && (
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#fff3e0', borderRadius: '6px' }}>
                      <h5 style={{ marginBottom: '8px', color: '#e65100' }}>💡 Что можно улучшить:</h5>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
                        {aiAnalysis.improvements.map((improvement, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.protocolRecommendations && (
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '6px' }}>
                      <h5 style={{ marginBottom: '8px', color: '#1565c0' }}>📋 Рекомендации по протоколам МЗ РК:</h5>
                      
                      {aiAnalysis.protocolRecommendations.diagnostic && aiAnalysis.protocolRecommendations.diagnostic.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#333' }}>Диагностика:</strong>
                          <ul style={{ margin: '4px 0 0 20px', padding: 0, color: '#555' }}>
                            {aiAnalysis.protocolRecommendations.diagnostic.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiAnalysis.protocolRecommendations.treatment && aiAnalysis.protocolRecommendations.treatment.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#333' }}>Лечение:</strong>
                          <ul style={{ margin: '4px 0 0 20px', padding: 0, color: '#555' }}>
                            {aiAnalysis.protocolRecommendations.treatment.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiAnalysis.protocolRecommendations.followUp && aiAnalysis.protocolRecommendations.followUp.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#333' }}>Наблюдение:</strong>
                          <ul style={{ margin: '4px 0 0 20px', padding: 0, color: '#555' }}>
                            {aiAnalysis.protocolRecommendations.followUp.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiAnalysis.protocolRecommendations.hospitalization && (
                        <div style={{ marginTop: '8px', padding: '8px', background: '#ffebee', borderRadius: '4px' }}>
                          <strong style={{ color: '#c62828' }}>⚠️ Госпитализация:</strong>
                          <p style={{ margin: '4px 0 0', color: '#555' }}>{aiAnalysis.protocolRecommendations.hospitalization}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {aiAnalysis.missedQuestions && aiAnalysis.missedQuestions.length > 0 && (
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#fce4ec', borderRadius: '6px' }}>
                      <h5 style={{ marginBottom: '8px', color: '#880e4f' }}>❓ Важные вопросы, которые не были заданы:</h5>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
                        {aiAnalysis.missedQuestions.map((question, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleCompleteDiagnosis} className="finish-button" style={{ marginTop: '16px' }}>
                {t('finishCase')}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="chat-input-container">
        {canFinish && (
          <button onClick={handleFinish} className="finish-button">
            <CheckCircle size={18} />
            {t('finishReception')}
          </button>
        )}
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('askQuestion')}
            className="chat-input"
            disabled={isTyping}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={isTyping || !inputText.trim()}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Экран выбора кейса
const CaseSelection = ({ userData, onSelectCase, onBack, cases }) => {
  if (!cases || cases.length === 0) {
    return (
      <div className="case-selection">
        <div className="selection-header">
          <button onClick={onBack} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <h2>{t('selectCase')}</h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>{t('loadingCases')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="case-selection">
      <div className="selection-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('selectCase')}</h2>
      </div>

      <div className="cases-grid">
        {cases.map((caseItem) => (
          <div key={caseItem.id} className="case-card">
            <div className="case-card-header">
              <span className={`difficulty-badge ${caseItem.difficulty}`}>
                {caseItem.difficulty === 'easy' ? t('easy') : 
                 caseItem.difficulty === 'medium' ? t('medium') : 
                 caseItem.difficulty === 'hard' ? t('hard') : caseItem.difficulty}
              </span>
              <span className="case-specialty">{caseItem.specialty || ''}</span>
            </div>
            <h3>Кейс {cases.indexOf(caseItem) + 1}</h3>
            <div className="case-footer">
              <button 
                onClick={() => onSelectCase(caseItem)}
                className="select-case-button"
              >
                {t('start')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Главный экран
const MainScreen = ({ userData, onStartCase, onOpenShop, onOpenProfile, onOpenSettings }) => {
  return (
    <div className="main-screen" style={{
      backgroundImage: 'url(/clinic-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      minHeight: 'calc(100vh - 48px)'
    }}>
      {/* Мягкий оверлей для читаемости - сохраняет цвета фото */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.35) 100%)',
        zIndex: 0
      }} />
      
      {/* Контент */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="main-header">
          <div className="user-info">
            <h1 style={{ 
              fontSize: '38px', 
              fontWeight: 700, 
              textShadow: '0 2px 15px rgba(0,0,0,0.5)',
              color: '#fff'
            }}>
              {t('hello')}, {userData.name}! 👋
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 8px rgba(0,0,0,0.4)'
            }}>
              {t('readyForCases')}
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <CheckCircle size={28} color="#4CAF50" />
            <div>
              <h3 style={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 700 }}>
                {userData.casesCompleted || userData.stats?.casesCompleted || 0}
              </h3>
              <p style={{ color: '#555' }}>{t('casesCompleted')}</p>
            </div>
          </div>
          <div className="stat-card" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <TrendingUp size={28} color="#667eea" />
            <div>
              <h3 style={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 700 }}>{userData.streak || 0}</h3>
              <p style={{ color: '#555' }}>{t('daysStreak')}</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={onStartCase} className="primary-action-button" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: '14px',
            padding: '12px 24px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600
          }}>
            <MessageCircle size={18} />
            {t('startReception')}
          </button>
        </div>

        <div className="recent-cases" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}>
          <h2 style={{ color: '#1a1a1a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="#667eea" />
            {t('recentCases')}
          </h2>
          {userData.history && userData.history.length > 0 ? (
            <div className="history-list">
              {userData.history.slice(-3).reverse().map((item, idx) => (
                <div key={idx} className="history-item" style={{
                  background: 'rgba(102, 126, 234, 0.08)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '10px'
                }}>
                  <CheckCircle size={18} color="#4CAF50" />
                  <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{item.caseName || t('selectCase')}</span>
                  <span className="history-date" style={{ color: '#888' }}>
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-history" style={{ color: '#888', textAlign: 'center', padding: '20px' }}>{t('noHistory')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Основное приложение
function App() {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [userData, setUserData] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [cases, setCases] = useState([]);
  const [authScreen, setAuthScreen] = useState('login'); // login или register
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState(getLanguage()); // ru, kk, en
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [, forceUpdate] = useState(0);

  // Load language preference on mount
  useEffect(() => {
    const savedLanguage = getLanguage();
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
    
    // Listen for language changes
    const handleLanguageChanged = (event) => {
      setLanguageState(event.detail);
      forceUpdate(prev => prev + 1); // Force re-render
    };
    
    window.addEventListener('languageChanged', handleLanguageChanged);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, []);

  // Отслеживание посещений
  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = isAuthenticated() ? (userData?.id || 'authenticated') : 'anonymous';
        const page = window.location.pathname || '/';
        
        await fetch(`${API_BASE_URL}/api/analytics/visit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            page,
            referrer: document.referrer || null
          })
        });
      } catch (error) {
        console.error('Ошибка отслеживания посещения:', error);
      }
    };

    // Отслеживаем при изменении экрана
    if (currentScreen) {
      trackPageVisit();
    }
  }, [currentScreen, userData]);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const user = await getCurrentUser();
          if (user) {
            setUserData(user);
          } else {
            // Токен недействителен, очищаем
            setUserData(null);
          }
        } catch (error) {
          console.error('Ошибка проверки авторизации:', error);
          setUserData(null);
        }
      } else {
        // Новая система: если не авторизован, не используем старые данные
        // Показываем экран входа
        setUserData(null);
        
        // Опционально: можно использовать старую систему для совместимости
        // Раскомментируйте следующие строки, если хотите сохранить старую систему:
        // const localData = storage.getUserData();
        // if (localData && localData.name) {
        //   setUserData(localData);
        // }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Загружаем модули с API (только один раз после загрузки)
  const [modulesLoaded, setModulesLoaded] = useState(false);
  useEffect(() => {
    if (loading || modulesLoaded) return;
    
    const fetchModules = async () => {
      try {
        const url = `${API_BASE_URL}/api/modules`;
        const headers = {};
        
        // Добавляем токен если авторизован
        if (isAuthenticated()) {
          const token = localStorage.getItem('authToken');
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('🔍 Запрос модулей:', url);
        const response = await fetch(url, { headers });
        console.log('📡 Ответ сервера:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`Failed to fetch modules: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('✅ Модули загружены:', data.length);
        setModules(data);
        setModulesLoaded(true);
      } catch (error) {
        console.error('❌ Ошибка загрузки модулей:', error);
        console.error('URL был:', `${API_BASE_URL}/api/modules`);
        setModules([]);
        setModulesLoaded(true); // Помечаем как загруженные даже при ошибке
      }
    };

    fetchModules();
  }, [loading, modulesLoaded]);

  // Загружаем кейсы с API (только один раз после загрузки)
  const [casesLoaded, setCasesLoaded] = useState(false);
  useEffect(() => {
    if (loading || casesLoaded) return;
    
    const fetchCases = async () => {
      try {
        const url = `${API_BASE_URL}/api/cases`;
        const headers = {};
        
        // Добавляем токен если авторизован
        if (isAuthenticated()) {
          const token = localStorage.getItem('authToken');
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('🔍 Запрос кейсов:', url);
        const response = await fetch(url, { headers });
        console.log('📡 Ответ сервера:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`Failed to fetch cases: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('✅ Кейсы загружены:', data.length);
        setCases(data);
        setCasesLoaded(true);
      } catch (error) {
        console.error('❌ Ошибка загрузки кейсов:', error);
        console.error('URL был:', `${API_BASE_URL}/api/cases`);
        setCases([]);
        setCasesLoaded(true); // Помечаем как загруженные даже при ошибке, чтобы не повторять запросы
      }
    };

    fetchCases();
  }, [loading, casesLoaded]);

  const handleStartCase = () => {
    setCurrentScreen('moduleSelection');
  };

  const handleQuickStart = async () => {
    // Получаем все кейсы из всех модулей
    try {
      const response = await fetch(`${API_BASE_URL}/api/cases`, {
        headers: isAuthenticated() ? {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        } : {}
      });
      if (!response.ok) throw new Error('Failed to fetch cases');
      const allCases = await response.json();
      
      if (allCases.length === 0) {
        alert('Нет доступных кейсов. Пожалуйста, выберите модуль вручную.');
        setCurrentScreen('moduleSelection');
        return;
      }

      // Выбираем случайный кейс
      const randomCase = allCases[Math.floor(Math.random() * allCases.length)];
      
      setSelectedCase(randomCase);
      setCurrentScreen('chat');
    } catch (error) {
      console.error('Ошибка быстрого старта:', error);
      alert('Ошибка при загрузке кейсов. Попробуйте выбрать модуль вручную.');
      setCurrentScreen('moduleSelection');
    }
  };

  const handleSelectModule = (module) => {
    setSelectedModule(module);
    setCurrentScreen('caseSelection');
  };

  const handleSelectCase = async (caseData) => {
    // Все кейсы доступны - сразу начинаем
    setSelectedCase(caseData);
    setCurrentScreen('chat');
  };

  const handleCompleteCase = async (result) => {
    if (isAuthenticated()) {
      // Обновляем через API
      try {
        const { getCurrentUser, updateProfile } = await import('./services/authService');
        const currentUser = await getCurrentUser();
        
        const updatedUser = await updateProfile({
          stats: {
            ...currentUser.stats,
            casesCompleted: (currentUser.stats?.casesCompleted || 0) + 1
          },
          history: [
            ...(currentUser.history || []),
            {
              caseId: result.caseId,
              caseName: selectedCase.description || 'Клинический случай',
              date: new Date().toISOString(),
              diagnosis: result.diagnosis,
              isCorrect: result.isCorrect
            }
          ]
        });
        
        // Обновление завершено
        if (false) {
          const { addTokens } = await import('./services/subscriptionService');
          await addTokens(selectedCase.reward);
          const refreshedUser = await getCurrentUser();
          setUserData(refreshedUser);
        } else {
          setUserData(updatedUser);
        }
      } catch (error) {
        console.error('Ошибка обновления данных:', error);
        // Fallback на локальное обновление
        const newUserData = {
          ...userData,
          tokens: (userData.subscription?.tokens || userData.tokens || 0) + selectedCase.reward,
          casesCompleted: (userData.stats?.casesCompleted || userData.casesCompleted || 0) + 1,
          history: [
            ...(userData.history || []),
            {
              caseId: result.caseId,
              caseName: selectedCase.description || 'Клинический случай',
              date: new Date().toISOString(),
              diagnosis: result.diagnosis,
              isCorrect: result.isCorrect
            }
          ]
        };
        setUserData(newUserData);
        storage.saveUserData(newUserData);
      }
    } else {
      // Старая система для неавторизованных
      const newUserData = {
        ...userData,
        tokens: userData.tokens + selectedCase.reward,
        casesCompleted: userData.casesCompleted + 1,
        history: [
          ...(userData.history || []),
          {
            caseId: result.caseId,
            caseName: selectedCase.title,
            date: new Date().toISOString(),
            diagnosis: result.diagnosis,
            isCorrect: result.isCorrect
          }
        ]
      };
      setUserData(newUserData);
      storage.saveUserData(newUserData);
    }
    
    setCurrentScreen('main');
    setSelectedCase(null);
  };

  const handleBack = () => {
    setCurrentScreen('main');
    setSelectedCase(null);
  };

const handleOpenProfile = () => {
    setCurrentScreen('profile');
  };

  const handleOpenSettings = () => {
    setCurrentScreen('settings');
  };

  const handleLogin = async () => {
    const user = await getCurrentUser();
    setUserData(user);
    setCurrentScreen('main');
  };

  const handleLogout = async () => {
    // Очищаем токен и данные
    const { logout } = await import('./services/authService');
    logout();
    setUserData(null);
    setCurrentScreen('main');
    // Очищаем старые данные из localStorage
    storage.clearData();
  };

  const handleUpdateUser = (updatedUser) => {
    setUserData(updatedUser);
  };


  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  // Если не авторизован, показываем экран входа/регистрации
  if (!isAuthenticated()) {
    return (
      <div className="App">
        {authScreen === 'login' ? (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthScreen('register')}
          />
        ) : (
          <Register 
            onRegister={handleLogin}
            onSwitchToLogin={() => setAuthScreen('login')}
          />
        )}
      </div>
    );
  }

  // Если авторизован, но нет данных - показываем загрузку
  if (!userData) {
    return <div className="loading">Загрузка данных пользователя...</div>;
  }

  // Используем данные пользователя
  const displayUserData = userData;

  return (
    <ThemeProvider>
      <div className="App">
      {isAuthenticated() && userData && (
        <>
          <Sidebar 
            onModulesClick={() => setCurrentScreen('moduleSelection')}
            onMainScreenClick={() => setCurrentScreen('main')}
            onQuickStart={handleQuickStart}
            userData={userData}
            modules={modules}
            currentScreen={currentScreen}
            cases={cases}
            onOpenAbout={() => setCurrentScreen('about')}
            onOpenAIMentor={() => setCurrentScreen('ai-mentor')}
            onOpenGenTest={() => setCurrentScreen('gentest')}
          />
          <TopBar 
            onProfileClick={() => setShowProfileMenu(true)}
            user={userData}
            modules={modules}
            userData={userData}
            onMainScreenClick={() => setCurrentScreen('main')}
          />
          <ProfileMenu
            user={userData}
            userData={userData}
            onOpenSettings={handleOpenSettings}
            onLogout={handleLogout}
            onOpenPricing={() => setCurrentScreen('pricing')}
            onOpenAdminPayments={() => setCurrentScreen('admin-payments')}
            onOpenAdminDashboard={() => setCurrentScreen('admin-dashboard')}
            isOpen={showProfileMenu}
            onClose={() => setShowProfileMenu(false)}
          />
        </>
      )}
      
      <div className={`main-content ${isAuthenticated() && userData ? 'with-sidebar' : ''}`}>
        {currentScreen === 'main' && (
          <MainScreen 
            userData={displayUserData}
            onStartCase={handleStartCase}
            onOpenProfile={handleOpenProfile}
            onOpenSettings={isAuthenticated() ? handleOpenSettings : undefined}
          />
        )}
        
        {currentScreen === 'moduleSelection' && (
              <ModuleSelection 
                modules={modules} 
                onSelectModule={handleSelectModule}
                onBack={() => setCurrentScreen('main')}
                userData={userData}
                allCases={cases}
              />
        )}
        
        {currentScreen === 'caseSelection' && selectedModule && (() => {
          const filteredCases = cases.filter(c => c.moduleId === selectedModule.id);
          console.log('🔍 Фильтрация кейсов:', {
            selectedModule: selectedModule.id,
            totalCases: cases.length,
            filteredCases: filteredCases.length,
            sample: filteredCases.slice(0, 3).map(c => ({ id: c.id, moduleId: c.moduleId }))
          });
          return (
            <CaseSelection 
              userData={userData}
              onSelectCase={handleSelectCase}
              onBack={() => {
                setSelectedModule(null);
                setCurrentScreen('moduleSelection');
              }}
              cases={filteredCases}
            />
          );
        })()}
        
        {currentScreen === 'chat' && selectedCase && (
          <CaseFlow 
            caseId={selectedCase.id}
            onComplete={(results) => {
              handleCompleteCase({
                caseId: selectedCase.id,
                diagnosis: results?.protocol?.diagnosis || 'Не указан',
                isCorrect: results?.score >= 70,
                results: results
              });
            }}
            onExit={handleBack}
            onBalanceUpdate={async (newBalance) => {
              // Обновляем баланс медкоинов в userData
              const updatedUser = await getCurrentUser();
              if (updatedUser) {
                setUserData(updatedUser);
              }
            }}
          />
        )}

        {currentScreen === 'profile' && (
          <Profile 
            userData={displayUserData}
            onBack={handleBack}
          />
        )}

        {currentScreen === 'settings' && isAuthenticated() && (
          <Settings 
            user={displayUserData}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {currentScreen === 'pricing' && (
          <PricingPage 
            onBack={() => setCurrentScreen('main')}
            userData={userData}
            onPurchase={async (planId) => {
              try {
                // Обновляем данные пользователя после любой операции
                const updatedUser = await getCurrentUser();
                setUserData(updatedUser);
              } catch (error) {
                console.error('Ошибка обновления данных:', error);
              }
            }}
          />
        )}

        {currentScreen === 'admin-payments' && isAuthenticated() && (
          <AdminPayments 
            userData={userData}
            onBack={() => setCurrentScreen('main')}
          />
        )}

        {currentScreen === 'admin-dashboard' && isAuthenticated() && (
          <AdminDashboard 
            userData={userData}
            onBack={() => setCurrentScreen('main')}
          />
        )}

        {currentScreen === 'about' && (
          <AboutPage 
            onBack={() => setCurrentScreen('main')}
          />
        )}

        {currentScreen === 'ai-mentor' && (
          <AIMentor userData={userData} />
        )}

        {currentScreen === 'gentest' && (
          <GenTest onBack={() => setCurrentScreen('main')} />
        )}
      </div>
      </div>
    </ThemeProvider>
  );
}

export default App;