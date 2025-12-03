// Скрипт для тестирования Claude API ключа
import 'dotenv/config';

const API_KEY = process.env.CLAUDE_API_KEY;

if (!API_KEY) {
  console.error('❌ CLAUDE_API_KEY не найден в .env файле');
  console.log('\n📝 Создайте файл server/.env и добавьте:');
  console.log('CLAUDE_API_KEY=ваш_ключ_здесь\n');
  process.exit(1);
}

console.log('🔑 API ключ найден:', API_KEY.substring(0, 10) + '...');
console.log('🧪 Тестирую подключение к Claude API...\n');

try {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Скажи "Привет" одним словом'
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Ошибка API:', error);
    console.error('\n💡 Проверьте:');
    console.error('   - Правильность API ключа');
    console.error('   - Доступность интернета');
    console.error('   - Статус сервиса Anthropic');
    process.exit(1);
  }

  const data = await response.json();
  const reply = data.content[0].text;
  
  console.log('✅ API ключ работает!');
  console.log('📨 Ответ Claude:', reply);
  console.log('\n🎉 Всё готово! Теперь можно использовать Claude в приложении.');
  console.log('\n📝 Не забудьте в .env файле установить:');
  console.log('   AI_PROVIDER=claude');
  
} catch (error) {
  console.error('❌ Ошибка подключения:', error.message);
  process.exit(1);
}



