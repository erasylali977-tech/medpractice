export const storage = {
    getUserData: () => {
      try {
        const data = localStorage.getItem('userData');
        if (!data || data === 'undefined') {
          const defaultData = {
            name: "Айдар",
            tokens: 1,
            casesCompleted: 0,
            streak: 0,
            lastCaseDate: null,
            freeTokenUsedToday: false,
            history: []
          };
          // Сохраняем дефолтные данные
          localStorage.setItem('userData', JSON.stringify(defaultData));
          return defaultData;
        }
        const parsed = JSON.parse(data);
        // Если токенов 0 или undefined, устанавливаем 1
        if (!parsed.tokens || parsed.tokens === 0) {
          parsed.tokens = 1;
          localStorage.setItem('userData', JSON.stringify(parsed));
        }
        return parsed;
      } catch (error) {
        console.error('Ошибка чтения данных:', error);
        const defaultData = {
          name: "Айдар",
          tokens: 1,
          casesCompleted: 0,
          streak: 0,
          lastCaseDate: null,
          freeTokenUsedToday: false,
          history: []
        };
        localStorage.setItem('userData', JSON.stringify(defaultData));
        return defaultData;
      }
    },
  
    saveUserData: (data) => {
      try {
        localStorage.setItem('userData', JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Ошибка сохранения:', error);
        return false;
      }
    },
  
    clearData: () => {
      try {
        localStorage.removeItem('userData');
        return true;
      } catch (error) {
        console.error('Ошибка очистки:', error);
        return false;
      }
    }
  };