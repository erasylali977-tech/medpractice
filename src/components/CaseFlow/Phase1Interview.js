import React, { useState, useEffect, useRef } from 'react';
import './CaseFlow.css';
import { useTranslation } from '../../utils/i18n';

/**
 * ФАЗА 1: ОПРОС (Анамнез + Жалобы)
 * Студент задает вопросы AI-пациенту в чате
 */
const Phase1Interview = ({ 
  caseInfo, 
  onSendMessage, 
  onCompletePhase,
  interviewProgress,
  conversationHistory = [],
  onConversationHistoryChange
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(conversationHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null); // Определенный язык
  const messagesEndRef = useRef(null);

  // Синхронизируем messages с conversationHistory
  useEffect(() => {
    if (conversationHistory.length > 0) {
      setMessages(conversationHistory);
    }
  }, [conversationHistory]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    // Определяем язык из первого сообщения доктора
    if (!detectedLanguage && messages.length === 0) {
      const lang = detectLanguage(message);
      setDetectedLanguage(lang);
    }

    const userMessage = {
      type: 'doctor',
      text: message,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    // Обновляем историю в родителе
    if (onConversationHistoryChange) {
      onConversationHistoryChange(newMessages);
    }
    
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(currentMessage, detectedLanguage || detectLanguage(currentMessage));
      const updatedMessages = [...newMessages, {
        type: 'patient',
        text: response,
        timestamp: new Date()
      }];
      setMessages(updatedMessages);
      // Обновляем историю в родителе
      if (onConversationHistoryChange) {
        onConversationHistoryChange(updatedMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessages = [...newMessages, {
        type: 'error',
        text: t('errorSendingMessage'),
        timestamp: new Date()
      }];
      setMessages(errorMessages);
      if (onConversationHistoryChange) {
        onConversationHistoryChange(errorMessages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canCompletePhase = interviewProgress?.questionsCount >= 8;
  const showExaminationHint = interviewProgress?.questionsCount >= 5;

  return (
    <div className="phase-container">
      <div className="phase-header-compact">
        <h2>{t('phase1Title')}</h2>
      </div>

      {showExaminationHint && (
        <div className="examination-hint-banner">
          <div className="examination-hint-content">
            <span className="examination-hint-icon">💡</span>
            <span className="examination-hint-text">
              {t('questionsAsked').replace('{count}', interviewProgress?.questionsCount || 0)}
            </span>
            <button 
              className="examination-hint-button"
              onClick={onCompletePhase}
            >
              {t('goToExamination')}
            </button>
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>{t('patientEnters')}</p>
              <p>{t('startInterview')}</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'doctor' ? '👨‍⚕️' : msg.type === 'error' ? '⚠️' : '👤'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message patient">
              <div className="message-avatar">👤</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('askQuestion')}
            disabled={isLoading}
          />
          <div className="chat-input-actions">
            <button 
              className="voice-button"
              onClick={() => {
                // Заглушка для голосового ввода
                alert(t('voiceInputComingSoon'));
              }}
              title={t('voiceInput')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            <button 
              className="send-button"
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              title={t('send')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase1Interview;

