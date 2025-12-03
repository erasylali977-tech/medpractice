// src/index.js — отладочный патч
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

function mountApp() {
  const container = document.getElementById('root');

  // Диагностические логи
  console.log('📌 document.readyState =', document.readyState);
  console.log('📌 document.getElementById("root") =', container);

  if (!container) {
    console.error('%c[Mount Error] %cRoot element "#root" not found. Сейчас попробуем дождаться DOMContentLoaded и повторить.', 'color:white;background:red;padding:2px;', '');
    return false;
  }

  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('%c[Mount OK] React mounted to #root', 'color:white;background:green;padding:2px;');
    return true;
  } catch (err) {
    console.error('[Mount Exception]', err);
    return false;
  }
}

// Попробуем монтировать сразу
if (!mountApp()) {
  // Если не получилось — ждём полной загрузки DOM и пробуем снова
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📌 DOMContentLoaded event — повторная попытка монтирования');
    if (!mountApp()) {
      console.error('%c[Mount Failed] После DOMContentLoaded root не найден. Проверьте, какой index.html реально отдается сервером.', 'color:white;background:darkred;padding:4px;');
    }
  });
}
