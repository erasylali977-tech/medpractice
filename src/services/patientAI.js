// src/services/patientAI.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const patientAI = {
    // Получить ответ пациента на вопрос врача через API
    getResponse: async (doctorQuestion, caseData, conversationHistory) => {
      try {
        const url = `${API_BASE_URL}/api/chat`;
        console.log('🔍 Запрос ответа пациента:', url);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            caseId: caseData.id,
            question: doctorQuestion,
            conversationHistory: conversationHistory.map(msg => ({
              sender: msg.sender,
              text: msg.text
            }))
          })
        });

        console.log('📡 Ответ сервера:', response.status, response.statusText);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Ошибка API:', errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Ответ получен:', data.reply);
        return data.reply;
      } catch (error) {
        console.error('❌ Ошибка получения ответа пациента:', error);
        console.error('URL был:', `${API_BASE_URL}/api/chat`);
        // Fallback на локальную логику при ошибке API
        return 'Извините, произошла ошибка. Попробуйте еще раз.';
      }
    },
  
    // Проверка диагноза
    checkDiagnosis: (userDiagnosis, correctDiagnosis) => {
      const user = userDiagnosis.toLowerCase().trim();
      const correct = correctDiagnosis.toLowerCase().trim();
  
      // Точное совпадение
      if (user === correct) {
        return {
          isCorrect: true,
          accuracy: 100,
          feedback: 'Отличная работа! Диагноз поставлен абсолютно верно!'
        };
      }
  
      // Частичное совпадение (содержит ключевые слова)
      const correctWords = correct.split(' ');
      const userWords = user.split(' ');
      
      let matchCount = 0;
      correctWords.forEach(word => {
        if (word.length > 3 && userWords.some(uw => uw.includes(word) || word.includes(uw))) {
          matchCount++;
        }
      });
  
      const accuracy = Math.round((matchCount / correctWords.length) * 100);
  
      if (accuracy >= 70) {
        return {
          isCorrect: true,
          accuracy,
          feedback: 'Хорошо! Диагноз верный, хотя формулировка могла быть точнее.'
        };
      } else if (accuracy >= 40) {
        return {
          isCorrect: false,
          accuracy,
          feedback: `Близко, но не совсем верно. Правильный диагноз: ${correctDiagnosis}.`
        };
      } else {
        return {
          isCorrect: false,
          accuracy,
          feedback: `К сожалению, диагноз неверный. Правильный диагноз: ${correctDiagnosis}.`
        };
      }
    }
  };