import React from 'react';
import './AIMentor.css';

const MENTORS = [
  {
    id: 'practical',
    name: 'Dr. Practical',
    title: 'Практик',
    avatar: '👨‍⚕️',
    description: 'Краткие алгоритмы и протоколы для практики',
    bestFor: ['Интерны', 'Резиденты', 'Практикующие врачи'],
    style: 'practical'
  },
  {
    id: 'academic',
    name: 'Prof. Academic',
    title: 'Академик',
    avatar: '👨‍🏫',
    description: 'Научный подход с доказательствами и исследованиями',
    bestFor: ['Студенты старших курсов', 'Исследователи'],
    style: 'academic'
  },
  {
    id: 'friendly',
    name: 'Nurse Friendly',
    title: 'Добрый наставник',
    avatar: '👩‍⚕️',
    description: 'Простые объяснения и пошаговые инструкции',
    bestFor: ['Студенты младших курсов', 'Средний медперсонал'],
    style: 'friendly'
  },
  {
    id: 'evidence',
    name: 'Dr. Evidence',
    title: 'Доказательный',
    avatar: '📚',
    description: 'Строго по протоколам и клиническим рекомендациям',
    bestFor: ['Все уровни', 'Evidence-based подход'],
    style: 'evidence'
  }
];

const MentorSelection = ({ onSelectMentor }) => {
  return (
    <div className="mentor-selection">
      <header className="mentor-selection-header">
        <h1>🤖 AI Ассистент</h1>
        <p>Выбери своего ментора. Каждый специалист поможет найти ответы на медицинские вопросы в своем уникальном стиле.</p>
      </header>

      <div className="mentors-grid">
        {MENTORS.map(mentor => (
          <div
            key={mentor.id}
            className="mentor-card"
            onClick={() => onSelectMentor(mentor)}
          >
            <div className="mentor-avatar">{mentor.avatar}</div>
            <div className="mentor-info">
              <h3>{mentor.name}</h3>
              <p className="mentor-title">{mentor.title}</p>
              <p className="mentor-description">{mentor.description}</p>
              <div className="mentor-best-for">
                <span className="best-for-label">✓ Лучший для:</span>
                <span className="best-for-value">{mentor.bestFor.join(', ')}</span>
              </div>
            </div>
            <button className="select-mentor-btn">Выбрать</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorSelection;



