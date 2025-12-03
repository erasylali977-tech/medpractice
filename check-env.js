// Скрипт для проверки и настройки .env файла
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

if (!existsSync(envPath)) {
  console.log('❌ Файл .env не найден!');
  console.log('📝 Создайте файл server/.env с содержимым:');
  console.log('AI_PROVIDER=claude');
  console.log('CLAUDE_API_KEY=ваш_ключ');
  process.exit(1);
}

let envContent = readFileSync(envPath, 'utf-8');
let needsUpdate = false;

// Проверяем AI_PROVIDER
if (!envContent.includes('AI_PROVIDER=claude')) {
  // Удаляем старую строку AI_PROVIDER если есть
  envContent = envContent.replace(/AI_PROVIDER\s*=\s*\w+/gi, '');
  
  // Добавляем AI_PROVIDER=claude в начало
  if (envContent.trim() && !envContent.endsWith('\n')) {
    envContent = 'AI_PROVIDER=claude\n' + envContent;
  } else {
    envContent = 'AI_PROVIDER=claude\n' + envContent;
  }
  
  needsUpdate = true;
}

if (needsUpdate) {
  writeFileSync(envPath, envContent, 'utf-8');
  console.log('✅ Обновлен файл .env: установлен AI_PROVIDER=claude');
} else {
  console.log('✅ Файл .env уже настроен правильно (AI_PROVIDER=claude)');
}

// Показываем текущие настройки
console.log('\n📋 Текущие настройки:');
const lines = envContent.split('\n');
lines.forEach(line => {
  if (line.trim() && !line.trim().startsWith('#')) {
    const [key] = line.split('=');
    if (key === 'AI_PROVIDER' || key === 'CLAUDE_API_KEY') {
      if (key === 'CLAUDE_API_KEY') {
        const value = line.split('=')[1] || '';
        console.log(`   ${key}=${value.substring(0, 10)}...`);
      } else {
        console.log(`   ${line.trim()}`);
      }
    }
  }
});

console.log('\n🎉 Всё готово! Перезапустите сервер: npm run dev');



