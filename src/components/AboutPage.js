// src/components/AboutPage.js
import React from 'react';
import { ArrowLeft, Heart, Mail, MessageCircle, Code, GraduationCap, Calendar, Rocket } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AboutPage = ({ onBack }) => {
  const { theme } = useTheme();
  
  // Theme-aware styles
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px',
      color: 'var(--text-primary)',
      lineHeight: '1.8',
      transition: 'color 0.3s ease'
    },
    backButton: {
      background: 'transparent',
      border: '1px solid var(--border-primary)',
      color: 'var(--text-primary)',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '24px',
      transition: 'all 0.2s'
    },
    section: {
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)'
        : 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
      border: '1px solid var(--border-primary)',
      transition: 'background 0.3s ease, border-color 0.3s ease'
    },
    heading: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '20px',
      color: 'var(--text-primary)'
    },
    text: {
      color: 'var(--text-primary)',
      marginBottom: '16px'
    },
    highlightBox: {
      background: 'rgba(102, 126, 234, 0.1)',
      borderLeft: '4px solid var(--accent-primary)',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    goldBox: {
      background: 'var(--gold-bg)',
      border: '1px solid var(--gold)',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px',
      fontSize: '18px',
      fontStyle: 'italic',
      color: 'var(--gold)'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={onBack}
          style={styles.backButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--bg-card)';
            e.target.style.borderColor = 'var(--border-secondary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = 'var(--border-primary)';
          }}
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        
        <h1 style={{
          fontSize: '36px',
          fontWeight: 800,
          margin: 0,
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          О проекте
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', margin: 0 }}>
          История, идея и будущее MedPractice
        </p>
      </div>

      {/* История */}
      <section style={styles.section}>
        <h2 style={styles.heading}>
          История MedPractice
        </h2>
        
        <div style={styles.highlightBox}>
          <p style={{ fontSize: '16px', margin: 0, fontStyle: 'italic', color: 'var(--text-primary)' }}>
            Представьте студента-медика или молодого врача.
          </p>
          <p style={{ fontSize: '16px', margin: '12px 0 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>
            Ночь. Усталость. Глаза режет от учебника.
          </p>
          <p style={{ fontSize: '16px', margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
            Перед экзаменом - паника. Перед первым дежурством - страх ошибиться.
          </p>
        </div>

        <p style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
          Учебники - толстые. Протоколы - сложные. Реальные пациенты - непредсказуемые.
        </p>

        <p style={{ 
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--accent-primary)'
        }}>
          И каждый раз один вопрос:
        </p>

        <p style={styles.goldBox}>
          "Как мне потренироваться по-настоящему, не рискуя ничьим здоровьем?"
        </p>

        <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>
          Так родилась MedPractice.
        </p>
      </section>

      {/* Идея */}
      <section style={styles.section}>
        <h2 style={styles.heading}>
          Идея
        </h2>
        
        <p style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
          Я начал с простой мысли: создать место, где можно <strong style={{ color: 'var(--accent-primary)' }}>безопасно учиться на реальных клинических ситуациях</strong>.
        </p>

        <p style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
          Место, где вы можете:
        </p>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          marginBottom: '20px'
        }}>
          {[
            'Задавать вопросы AI-пациенту',
            'Проводить осмотр',
            'Выбирать анализы',
            'Ставить диагноз',
            'Назначать лечение',
            'Получать мгновенную обратную связь'
          ].map((item, idx) => (
            <li key={idx} style={{
              display: 'flex',
              alignItems: 'start',
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: 'var(--success)',
                fontSize: '20px'
              }}>✓</span>
              <span style={{ color: 'var(--text-primary)' }}>{item}</span>
            </li>
          ))}
        </ul>

        <p style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--gold)',
          marginTop: '24px'
        }}>
          Не теория ради теории. А практика, которая готовит к реальной медицине.
        </p>
      </section>

      {/* Что такое MedPractice */}
      <section style={styles.section}>
        <h2 style={styles.heading}>
          Что такое MedPractice сегодня
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {[
            {
              title: 'Интерактивные AI-пациенты',
              desc: 'Разговаривайте с реалистичными симуляциями пациентов. Они отвечают, как настоящие люди - с эмоциями, страхами, особенностями.',
              icon: '💬'
            },
            {
              title: '20 модулей по специальностям',
              desc: 'От инфекционных болезней до кардиологии. 400+ клинических случаев, основанных на реальной практике.',
              icon: '📚'
            },
            {
              title: 'Разборы и обратная связь',
              desc: 'После каждого кейса - детальный анализ ваших действий. Что правильно, что нет, почему, и как надо было.',
              icon: '📊'
            },
            {
              title: 'Реальные протоколы МЗ РК',
              desc: 'Все кейсы основаны на клинических протоколах Минздрава Казахстана. Учитесь правильно с самого начала.',
              icon: '📋'
            }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--success)',
          textAlign: 'center',
          padding: '20px',
          background: 'var(--success-bg)',
          borderRadius: '12px',
          border: '1px solid var(--success)'
        }}>
          Это среда, где можно ошибаться и учиться. Без страха. Без последствий. Но с реалистичным опытом.
        </p>
      </section>

      {/* Методология */}
      <section style={styles.section}>
        <h2 style={styles.heading}>
          Уникальная методология: один кейс - множество пациентов
        </h2>

        <div style={{
          background: theme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)',
          border: '2px solid var(--accent-primary)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: 'var(--gold)' }}>
            1 КЕЙС = 1 КЛИНИЧЕСКАЯ КАРТИНА + 4-5 РАЗНЫХ ПАЦИЕНТОВ
          </h3>
        </div>

        <p style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
          В MedPractice 1 кейс ≠ 1 пациент. Я использую инновационный подход:
        </p>

        <div style={{
          background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid var(--border-primary)'
        }}>
          <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--accent-primary)' }}>
            Пример: Сальмонеллез
          </h4>
          <p style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
            <strong>Клиническая картина (одна):</strong> Симптомы, эпиданамнез, критерии диагностики, тактика лечения
          </p>
          <p style={{ margin: 0, color: 'var(--text-primary)' }}>
            <strong>Но пациенты - разные (4-5 вариантов):</strong> Азамат (программист), Гульнара (учительница), Ержан (бизнесмен), Асель (студентка) - у каждого свой характер, история, поведение.
          </p>
        </div>

        <p style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--success)',
          padding: '16px',
          background: 'var(--success-bg)',
          borderRadius: '8px'
        }}>
          Вы учитесь работать с людьми, а не с учебником. Развиваете клиническое мышление, а не заучиваете шаблоны.
        </p>
      </section>

      {/* Кто я */}
      <section style={styles.section}>
        <h2 style={styles.heading}>
          Кто я
        </h2>

        <div style={{
          background: 'rgba(102, 126, 234, 0.1)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          {/* Информация */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: 'var(--gold)' }}>
            Али Ерасыл Каныйбекович
            </h3>
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Основатель и разработчик MedPractice
            </p>
            <p style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
              <GraduationCap size={18} style={{ display: 'inline', marginRight: '8px' }} />
              Врач-интерн 7 курса общей медицины
            </p>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              ЗКМУ им. Марата Оспанова, г. Актобе
            </p>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)' }}>
              <p style={{ margin: '4px 0', color: 'var(--text-primary)' }}>
                <MessageCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Telegram: <a href="https://t.me/erasyl_medpractice" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>@erasyl_medpractice</a>
              </p>
              <p style={{ margin: '4px 0', color: 'var(--text-primary)' }}>
                <Mail size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Email: <a href="mailto:erasyl@medpractice.kz" style={{ color: 'var(--accent-primary)' }}>erasyl@medpractice.kz</a>
              </p>
            </div>
          </div>

          {/* Фото справа */}
          <div style={{
            flexShrink: 0,
            width: '180px',
            height: '220px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '3px solid var(--accent-primary)',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <img 
              src="/founder-photo.jpg" 
              alt="Али Ерасыл Каныйбекович"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center'
              }}
            />
          </div>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Как всё началось
        </h3>

        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          borderLeft: '4px solid #ffd700',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>
            <Calendar size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Сентябрь 2025 года
          </p>
          <p style={{ margin: 0 }}>
            Я готовлюсь к практике и понимаю огромную проблему студентов-медиков...
          </p>
        </div>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          marginBottom: '20px'
        }}>
          {[
            'Учебники дают теорию, но не учат разговаривать с пациентами',
            'Симуляционные центры дорогие и доступны 1-2 раза в семестр',
            'Реальные пациенты - это уже ответственность. Где практиковаться новичкам?',
            'Страх ошибиться на первом дежурстве/приеме',
            'Нет обратной связи - не понимаешь, правильно ли действуешь'
          ].map((item, idx) => (
            <li key={idx} style={{
              display: 'flex',
              alignItems: 'start',
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: 'var(--error)',
                fontSize: '20px'
              }}>•</span>
              <span style={{ color: 'var(--text-primary)' }}>{item}</span>
            </li>
          ))}
        </ul>

        <p style={{
          fontSize: '18px',
          fontStyle: 'italic',
          color: '#667eea',
          padding: '16px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px'
        }}>
          "А что если создать AI-симулятор, где можно безопасно ошибаться и учиться на своих ошибках?"
        </p>

        <h4 style={{ fontSize: '18px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#e0e0e0' }}>
          2 месяца разработки (Сентябрь-Ноябрь 2025)
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {[
            { month: 'Сентябрь', desc: 'Изучение AI-моделей, первые кейсы, консультации с преподавателями' },
            { month: 'Октябрь', desc: 'Система медкоинов, 10 модулей, архитектура "1 кейс = множество пациентов"' },
            { month: 'Ноябрь', desc: 'Еще 10 модулей, протоколы МЗ РК, система обратной связи, бета-версия' }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#667eea' }}>
                {item.month}
              </h5>
              <p style={{ fontSize: '13px', color: '#b0b0b0', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#ffd700',
          padding: '16px',
          background: 'rgba(255, 215, 0, 0.1)',
          borderRadius: '8px'
        }}>
          В соло, но не один. Помогли: Claude от Anthropic, Cursor AI, преподаватели ЗКМУ, однокурсники, и моя жена - верила в идею, поддерживала в моменты, когда опускались руки.
        </p>
      </section>

      {/* Моя цель */}
      <section style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid #333'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px', color: '#e0e0e0' }}>
          Моя цель
        </h2>

        <p style={{
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '24px',
          color: '#4CAF50'
        }}>
          Простая миссия: Сделать медицину понятнее. Обучение - живым. Подготовку - доступной каждому.
        </p>

        <div style={{
          display: 'grid',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {[
            { text: 'Каждый заслуживает практиковаться без страха ошибок', icon: '💪' },
            { text: 'AI - это инструмент честный, прозрачный, доступный', icon: '🤖' },
            { text: 'Образование не должно стоить как крыло самолета', icon: '💰' }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>{item.icon}</span>
              <p style={{ margin: 0, fontWeight: 600 }}>{item.text}</p>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#667eea',
          textAlign: 'center',
          padding: '20px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          MedPractice - это тренажёр, который готовит новое поколение врачей так, как это должно быть.
        </p>
      </section>

      {/* Что дальше */}
      <section style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid #333'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Rocket size={28} />
          Что дальше?
        </h2>

        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#ffd700' }}>
          2026 год:
        </h3>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          marginBottom: '24px'
        }}>
          {[
            'Партнерства с медвузами Казахстана',
            'AI-режимы обучения (анализ PDF, подготовка к экзаменам)',
            'Английская версия (для USMLE, PLAB)',
            'Командные тарифы для учебных групп',
            'Мобильное приложение'
          ].map((item, idx) => (
            <li key={idx} style={{
              display: 'flex',
              alignItems: 'start',
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: '#4CAF50',
                fontSize: '20px'
              }}>→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#ffd700' }}>
          Долгосрочно:
        </h3>

        <ul style={{
          listStyle: 'none',
          padding: 0
        }}>
          {[
            'Лучшая платформа для медицинского образования в СНГ',
            'Локализация на 5+ языков',
            'Интеграция с МИС клиник',
            'Big Data для улучшения обучения'
          ].map((item, idx) => (
            <li key={idx} style={{
              display: 'flex',
              alignItems: 'start',
              marginBottom: '12px',
              paddingLeft: '24px',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: '#667eea',
                fontSize: '20px'
              }}>⭐</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Присоединяйтесь */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        border: '2px solid #667eea'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
          Присоединяйтесь!
        </h2>
        <p style={{ fontSize: '18px', marginBottom: '24px', color: '#fff' }}>
          Станьте частью сообщества студентов-медиков, которые меняют подход к обучению.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <a
            href="/pricing"
            style={{
              background: '#fff',
              color: '#667eea',
              padding: '14px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Начать обучение
          </a>
        </div>

        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <p style={{ margin: '8px 0', color: '#fff' }}>
            <MessageCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Telegram: <a href="https://t.me/ЕrasylAli
" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>https://t.me/ЕrasylAli</a>
          </p>
          <p style={{ margin: '8px 0', color: '#fff' }}>
            <Heart size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Поддержка: <a href="yerasyl.ali@bk.ru" style={{ color: '#fff', textDecoration: 'underline' }}>yerasyl.ali@bk.ru</a>
          </p>
        </div>
      </section>

      {/* Подпись */}
      <div style={{
        textAlign: 'center',
        marginTop: '32px',
        padding: '24px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#e0e0e0' }}>
          С уважением,
        </p>
        <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#ffd700' }}>
          Ерасыл Али
        </p>
        <p style={{ fontSize: '16px', color: '#b0b0b0', fontStyle: 'italic', margin: 0 }}>
          "Я создал платформу, которую хотел бы иметь сам. Теперь она доступна вам."
        </p>
      </div>
    </div>
  );
};

export default AboutPage;

