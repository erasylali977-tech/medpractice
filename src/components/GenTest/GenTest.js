/**
 * GENTEST - Симулятор тестирования по готовым файлам
 * Поддержка .docx и .txt файлов
 * Формат: Вопрос, варианты A-E, правильный отмечен +
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import mammoth from 'mammoth';
import './GenTest.css';

const GenTest = ({ onBack }) => {
  // States
  const [screen, setScreen] = useState('upload'); // upload, settings, test, results
  const [questions, setQuestions] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Test settings
  const [mode, setMode] = useState('training'); // training, exam
  const [timeLimit, setTimeLimit] = useState(90); // minutes for exam mode
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  
  // Test state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);
  const [showNavigator, setShowNavigator] = useState(false);
  
  // Results
  const [testResults, setTestResults] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  // Load test history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gentest_history');
    if (saved) {
      setTestHistory(JSON.parse(saved));
    }
  }, []);

  // Timer for exam mode
  useEffect(() => {
    if (screen === 'test' && mode === 'exam' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [screen, mode]);

  // Parse question text - Universal parser for Kazakh/Russian tests
  const parseQuestions = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const questions = [];
    let currentQuestion = null;
    let collectingQuestionText = false;
    
    console.log('📄 Парсинг файла, строк:', lines.length);
    
    // Generate letters for options
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    // Check if line is a new question (starts with number like "1." or "2.")
    const isNewQuestion = (line) => {
      return /^\d+\s*[.)]\s*.{10,}/.test(line);
    };
    
    // Check if line looks like an answer option
    const isAnswerOption = (line) => {
      // Starts with + or is a short line (likely an option)
      // Or matches code pattern or standard A) B) pattern
      const startsWithPlus = /^[+＋✓✔]/.test(line);
      const isCode = /^[+＋✓✔]?\s*\d{2,}[-/\d]*[/]?[\wа-яёәғқңөұүһіА-ЯӘҒҚҢӨҰҮҺІ]?$/i.test(line);
      const isStandardOption = /^[+＋✓✔]?\s*[A-EА-Дa-eа-д]\s*[).:\-]/i.test(line);
      
      return startsWithPlus || isCode || isStandardOption;
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a new question
      const questionMatch = line.match(/^(\d+)\s*[.)]\s*(.+)/);
      
      if (questionMatch && questionMatch[2].length > 10) {
        // Save previous question if exists
        if (currentQuestion && currentQuestion.options.length > 0) {
          questions.push(currentQuestion);
        }
        
        currentQuestion = {
          id: questions.length + 1,
          text: questionMatch[2],
          options: []
        };
        collectingQuestionText = true;
        console.log(`📝 Вопрос ${currentQuestion.id}: ${questionMatch[2].substring(0, 50)}...`);
        continue;
      }
      
      // If we have a current question
      if (currentQuestion) {
        // Check if this line is an answer option
        const hasPlus = /^[+＋✓✔]/.test(line);
        
        // Try to match as standard A) B) format
        const standardMatch = line.match(/^([+＋✓✔])?\s*([A-EА-Дa-eа-д])\s*[).:\-]\s*(.+)$/i);
        
        // Try to match as code format (003-5/у, +021/ү, etc)
        // Extended to support Kazakh letters: ә, ғ, қ, ң, ө, ұ, ү, һ, і
        const codeMatch = line.match(/^([+＋✓✔])?\s*(\d{2,}[-/\d]*[/]?[\wа-яёәғқңөұүһіА-ЯӘҒҚҢӨҰҮҺІ]?)$/i);
        
        if (standardMatch) {
          // Standard A, B, C format
          const isCorrect = !!standardMatch[1];
          const letter = standardMatch[2].toUpperCase();
          const answerText = standardMatch[3];
          
          currentQuestion.options.push({
            letter,
            text: answerText,
            isCorrect,
            originalIndex: currentQuestion.options.length
          });
          collectingQuestionText = false;
          console.log(`  ✓ Вариант ${letter}: ${answerText.substring(0, 40)}... ${isCorrect ? '✅ ПРАВИЛЬНЫЙ' : ''}`);
        } else if (codeMatch) {
          // Code format
          const isCorrect = !!codeMatch[1];
          const codeText = codeMatch[2];
          const letter = letters[currentQuestion.options.length] || String(currentQuestion.options.length + 1);
          
          currentQuestion.options.push({
            letter,
            text: codeText,
            isCorrect,
            originalIndex: currentQuestion.options.length
          });
          collectingQuestionText = false;
          console.log(`  ✓ Вариант ${letter}: ${codeText} ${isCorrect ? '✅ ПРАВИЛЬНЫЙ' : ''}`);
        } else if (hasPlus && line.length > 3) {
          // Line starts with + but doesn't match code - it's a text answer
          const answerText = line.replace(/^[+＋✓✔]\s*/, '');
          const letter = letters[currentQuestion.options.length] || String(currentQuestion.options.length + 1);
          
          currentQuestion.options.push({
            letter,
            text: answerText,
            isCorrect: true,
            originalIndex: currentQuestion.options.length
          });
          collectingQuestionText = false;
          console.log(`  ✓ Вариант ${letter}: ${answerText.substring(0, 40)}... ✅ ПРАВИЛЬНЫЙ`);
        } else if (collectingQuestionText && line.length > 5 && !isAnswerOption(line)) {
          // Continuation of question text
          currentQuestion.text += ' ' + line;
        } else if (!collectingQuestionText && currentQuestion.options.length > 0 && line.length > 5 && line.length < 100) {
          // This might be a text answer option (not starting with +)
          const letter = letters[currentQuestion.options.length] || String(currentQuestion.options.length + 1);
          
          currentQuestion.options.push({
            letter,
            text: line,
            isCorrect: false,
            originalIndex: currentQuestion.options.length
          });
          console.log(`  ✓ Вариант ${letter}: ${line.substring(0, 40)}...`);
        } else if (line.length > 5 && currentQuestion.options.length === 0) {
          // Still collecting question text
          currentQuestion.text += ' ' + line;
        }
      }
    }
    
    // Don't forget the last question
    if (currentQuestion && currentQuestion.options.length > 0) {
      questions.push(currentQuestion);
    }
    
    console.log(`✅ Найдено вопросов: ${questions.length}`);
    questions.forEach((q, i) => {
      const correct = q.options.find(o => o.isCorrect);
      console.log(`  Q${i+1}: ${q.options.length} вариантов, правильный: ${correct ? correct.text.substring(0, 20) : '❌ НЕТ'}`);
    });
    
    return questions;
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      let text = '';
      
      if (file.name.endsWith('.docx')) {
        // Parse DOCX using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (file.name.endsWith('.txt')) {
        // Parse TXT
        text = await file.text();
      } else {
        throw new Error('Поддерживаются только .docx и .txt файлы');
      }

      const parsed = parseQuestions(text);
      
      if (parsed.length === 0) {
        throw new Error('Не удалось найти вопросы в файле. Проверьте формат.');
      }

      // Validate that each question has a correct answer
      const invalidQuestions = parsed.filter(q => !q.options.some(o => o.isCorrect));
      if (invalidQuestions.length > 0) {
        throw new Error(`Вопросы без правильного ответа: ${invalidQuestions.map(q => q.id).join(', ')}`);
      }

      setQuestions(parsed);
      setScreen('settings');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start test
  const startTest = () => {
    let preparedQuestions = [...questions];
    
    if (shuffleQuestions) {
      preparedQuestions = shuffleArray(preparedQuestions);
    }
    
    if (shuffleAnswers) {
      preparedQuestions = preparedQuestions.map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
    }

    // Re-assign IDs after shuffle
    preparedQuestions = preparedQuestions.map((q, idx) => ({
      ...q,
      displayId: idx + 1
    }));

    setQuestions(preparedQuestions);
    setAnswers({});
    setMarkedForReview(new Set());
    setCurrentQuestion(0);
    setTestStartTime(Date.now());
    
    if (mode === 'exam') {
      setTimeRemaining(timeLimit * 60);
    }
    
    setScreen('test');
  };

  // Select answer
  const selectAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Toggle mark for review
  const toggleMarkForReview = () => {
    const qId = questions[currentQuestion].displayId;
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(qId)) {
        newSet.delete(qId);
      } else {
        newSet.add(qId);
      }
      return newSet;
    });
  };

  // Navigate questions
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    setShowNavigator(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Finish test
  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const endTime = Date.now();
    const timeTaken = Math.round((endTime - testStartTime) / 1000);
    
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    const questionResults = questions.map(q => {
      const userAnswer = answers[q.displayId];
      const correctOption = q.options.find(o => o.isCorrect);
      const isCorrect = userAnswer !== undefined && q.options[userAnswer]?.isCorrect;
      
      if (userAnswer === undefined) {
        unanswered++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      return {
        question: q.text,
        userAnswer: userAnswer !== undefined ? q.options[userAnswer]?.text : null,
        correctAnswer: correctOption?.text,
        isCorrect,
        isUnanswered: userAnswer === undefined
      };
    });

    const results = {
      fileName,
      date: new Date().toISOString(),
      mode,
      totalQuestions: questions.length,
      correct,
      incorrect,
      unanswered,
      percentage: Math.round((correct / questions.length) * 100),
      timeTaken,
      questionResults
    };

    setTestResults(results);

    // Save to history
    const newHistory = [results, ...testHistory].slice(0, 50); // Keep last 50
    setTestHistory(newHistory);
    localStorage.setItem('gentest_history', JSON.stringify(newHistory));

    setScreen('results');
  }, [questions, answers, testStartTime, fileName, mode, testHistory]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Upload Screen
  const renderUploadScreen = () => (
    <div className="gentest-upload-screen">
      <div className="gentest-upload-header">
        <h1>📝 ТестКрафт</h1>
        <p>Загрузите файл с тестовыми вопросами</p>
      </div>

      <div className="gentest-upload-area" onClick={() => fileInputRef.current?.click()}>
        <div className="upload-icon">📄</div>
        <h3>Нажмите для загрузки файла</h3>
        <p>Поддерживаемые форматы: .docx, .txt</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.txt"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      {loading && (
        <div className="gentest-loading">
          <div className="spinner"></div>
          <p>Обработка файла...</p>
        </div>
      )}

      {error && (
        <div className="gentest-error">
          <span>❌</span> {error}
        </div>
      )}

      <div className="gentest-format-info">
        <h4>📋 Формат файла:</h4>
        <pre>{`Вопрос здесь
A) Вариант ответа
B) Вариант ответа
+C) Правильный ответ (отмечен +)
D) Вариант ответа
E) Вариант ответа`}</pre>
      </div>

      {testHistory.length > 0 && (
        <div className="gentest-history">
          <h4>📊 История тестов</h4>
          <div className="history-list">
            {testHistory.slice(0, 5).map((h, idx) => (
              <div key={idx} className="history-item">
                <span className="history-name">{h.fileName}</span>
                <span className="history-score">{h.percentage}%</span>
                <span className="history-date">
                  {new Date(h.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onBack && (
        <button className="gentest-back-btn" onClick={onBack}>
          ← Назад
        </button>
      )}
    </div>
  );

  // Render Settings Screen
  const renderSettingsScreen = () => (
    <div className="gentest-settings-screen">
      <div className="gentest-settings-header">
        <h2>⚙️ Настройки теста</h2>
        <p>Файл: {fileName} • {questions.length} вопросов</p>
      </div>

      <div className="gentest-settings-form">
        <div className="setting-group">
          <label>Режим тестирования</label>
          <div className="mode-buttons">
            <button
              className={`mode-btn ${mode === 'training' ? 'active' : ''}`}
              onClick={() => setMode('training')}
            >
              📚 Тренировка
              <span>Без таймера, с подсказками</span>
            </button>
            <button
              className={`mode-btn ${mode === 'exam' ? 'active' : ''}`}
              onClick={() => setMode('exam')}
            >
              🎯 Экзамен
              <span>С таймером, как в тест-центре</span>
            </button>
          </div>
        </div>

        {mode === 'exam' && (
          <div className="setting-group">
            <label>Время на тест (минуты)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="300"
            />
          </div>
        )}

        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
            />
            Перемешать вопросы
          </label>
        </div>

        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={shuffleAnswers}
              onChange={(e) => setShuffleAnswers(e.target.checked)}
            />
            Перемешать варианты ответов
          </label>
        </div>
      </div>

      <div className="gentest-settings-actions">
        <button className="secondary-btn" onClick={() => setScreen('upload')}>
          ← Другой файл
        </button>
        <button className="primary-btn" onClick={startTest}>
          🚀 Начать тест
        </button>
      </div>
    </div>
  );

  // Render Test Screen
  const renderTestScreen = () => {
    const question = questions[currentQuestion];
    const isMarked = markedForReview.has(question.displayId);
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="gentest-test-screen">
        {/* Header */}
        <div className="test-header">
          <div className="test-info">
            <span className="question-counter">
              Вопрос {currentQuestion + 1} из {questions.length}
            </span>
            <span className="answered-counter">
              ✓ {answeredCount}/{questions.length}
            </span>
          </div>
          
          {mode === 'exam' && (
            <div className={`test-timer ${timeRemaining < 300 ? 'warning' : ''}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}

          <button 
            className="navigator-btn"
            onClick={() => setShowNavigator(!showNavigator)}
          >
            ☰ Навигатор
          </button>
        </div>

        {/* Navigator Panel */}
        {showNavigator && (
          <div className="navigator-panel">
            <div className="navigator-grid">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.displayId] !== undefined;
                const isCurrent = idx === currentQuestion;
                const isMarked = markedForReview.has(q.displayId);
                
                return (
                  <button
                    key={idx}
                    className={`nav-item ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''} ${isMarked ? 'marked' : ''}`}
                    onClick={() => goToQuestion(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="navigator-legend">
              <span><span className="dot current"></span> Текущий</span>
              <span><span className="dot answered"></span> Отвечен</span>
              <span><span className="dot marked"></span> На проверку</span>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="question-card">
          <div className="question-text">
            {question.text}
          </div>

          <div className="options-list">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`option-btn ${answers[question.displayId] === idx ? 'selected' : ''}`}
                onClick={() => selectAnswer(question.displayId, idx)}
              >
                <span className="option-letter">{option.letter}</span>
                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="test-actions">
          <button
            className={`mark-btn ${isMarked ? 'marked' : ''}`}
            onClick={toggleMarkForReview}
          >
            {isMarked ? '🚩 Отмечен' : '🏳️ Отметить'}
          </button>

          <div className="nav-buttons">
            <button
              className="nav-btn"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              ← Назад
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button className="nav-btn primary" onClick={nextQuestion}>
                Далее →
              </button>
            ) : (
              <button className="nav-btn finish" onClick={finishTest}>
                ✓ Завершить
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="test-progress">
          <div 
            className="progress-fill" 
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Render Results Screen
  const renderResultsScreen = () => {
    if (!testResults) return null;

    const { percentage, correct, incorrect, unanswered, timeTaken, questionResults } = testResults;
    
    return (
      <div className="gentest-results-screen">
        <div className="results-header">
          <h2>📊 Результаты теста</h2>
          <p>{fileName}</p>
        </div>

        <div className="results-score">
          <div className={`score-circle ${percentage >= 70 ? 'pass' : 'fail'}`}>
            <span className="score-value">{percentage}%</span>
            <span className="score-label">{percentage >= 70 ? 'Сдано' : 'Не сдано'}</span>
          </div>
        </div>

        <div className="results-stats">
          <div className="stat correct">
            <span className="stat-value">{correct}</span>
            <span className="stat-label">Правильно</span>
          </div>
          <div className="stat incorrect">
            <span className="stat-value">{incorrect}</span>
            <span className="stat-label">Неправильно</span>
          </div>
          <div className="stat unanswered">
            <span className="stat-value">{unanswered}</span>
            <span className="stat-label">Пропущено</span>
          </div>
          <div className="stat time">
            <span className="stat-value">{formatTime(timeTaken)}</span>
            <span className="stat-label">Время</span>
          </div>
        </div>

        <div className="results-details">
          <h3>📝 Детали по вопросам</h3>
          <div className="details-list">
            {questionResults.map((r, idx) => (
              <div key={idx} className={`detail-item ${r.isCorrect ? 'correct' : r.isUnanswered ? 'unanswered' : 'incorrect'}`}>
                <div className="detail-header">
                  <span className="detail-num">#{idx + 1}</span>
                  <span className="detail-status">
                    {r.isCorrect ? '✓' : r.isUnanswered ? '—' : '✗'}
                  </span>
                </div>
                <div className="detail-question">{r.question.substring(0, 100)}...</div>
                {!r.isCorrect && (
                  <div className="detail-answer">
                    {r.userAnswer && <div className="user-answer">Ваш ответ: {r.userAnswer}</div>}
                    <div className="correct-answer">Правильно: {r.correctAnswer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button className="secondary-btn" onClick={() => {
            setScreen('upload');
            setQuestions([]);
            setTestResults(null);
          }}>
            📄 Новый тест
          </button>
          <button className="primary-btn" onClick={() => {
            setTestResults(null);
            setScreen('settings');
          }}>
            🔄 Пройти снова
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="gentest-container">
      {screen === 'upload' && renderUploadScreen()}
      {screen === 'settings' && renderSettingsScreen()}
      {screen === 'test' && renderTestScreen()}
      {screen === 'results' && renderResultsScreen()}
    </div>
  );
};

export default GenTest;

