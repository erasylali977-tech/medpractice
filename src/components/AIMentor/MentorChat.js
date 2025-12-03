import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Settings, ExternalLink } from 'lucide-react';
import './AIMentor.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const MentorChat = ({ mentor, onBack, userData }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/ai-mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          question: userMessage.content,
          mentorId: mentor.id,
          userId: userData?.id || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Обработка ошибок медкоинов
        if (errorData.error === 'Недостаточно медкоинов' || errorData.error === 'Дневной лимит исчерпан') {
          const errorMsg = errorData.error === 'Дневной лимит исчерпан' 
            ? `Дневной лимит исчерпан! Лимит: ${errorData.dailyLimit}, использовано: ${errorData.todayUsage}`
            : `Недостаточно медкоинов! Баланс: ${errorData.balance || 0}. Пополните баланс в настройках.`;
          
          setError(errorMsg);
          // Удаляем сообщение пользователя, если не хватило медкоинов
          setMessages(prev => prev.slice(0, -1));
          return;
        }
        
        throw new Error(errorData.error || 'Ошибка получения ответа');
      }

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Обновляем баланс медкоинов в интерфейсе, если пришел
      if (data.medcoins && window.updateMedcoinBalance) {
        window.updateMedcoinBalance(data.medcoins.balance);
      }
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      setError(err.message || 'Не удалось получить ответ. Попробуйте еще раз.');
      // Удаляем сообщение пользователя при ошибке
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mentor-chat">
      <header className="mentor-chat-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <div className="mentor-header-info">
          <div className="mentor-avatar-small">{mentor.avatar}</div>
          <div>
            <h2>{mentor.name}</h2>
            <p className="mentor-subtitle">{mentor.title}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="settings-button"
        >
          <Settings size={20} />
        </button>
      </header>

      <div className="mentor-disclaimer">
        ⚠️ <strong>Важно:</strong> AI-ментор не заменяет консультацию врача. Используйте информацию только в образовательных целях.
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-avatar">{mentor.avatar}</div>
            <h3>Привет! Я {mentor.name}</h3>
            <p>{mentor.description}</p>
            <p className="welcome-hint">Задай мне любой медицинский вопрос, и я помогу найти ответ на основе проверенных источников.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="message-avatar">{mentor.avatar}</div>
            )}
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="message-sources">
                  <strong>📚 Источники:</strong>
                  <ul>
                    {msg.sources.map((source, sourceIdx) => (
                      <li key={sourceIdx}>
                        {source.isPaid && <span className="paid-badge">Premium</span>}
                        {source.url ? (
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="source-link"
                          >
                            {source.title}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span>{source.title}</span>
                        )}
                        {source.excerpt && (
                          <span className="source-excerpt"> — {source.excerpt}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <span className="message-time">
                {msg.timestamp.toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">{mentor.avatar}</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Задайте вопрос по медицине..."
          className="chat-input"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          className="send-button"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MentorChat;

