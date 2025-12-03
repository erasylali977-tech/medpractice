// Простая проверка, что все зависимости установлены
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nodeModulesPath = join(__dirname, 'node_modules');

if (!existsSync(nodeModulesPath)) {
  console.error('❌ node_modules не найден! Запустите: npm install');
  process.exit(1);
}

console.log('✅ node_modules найден');
console.log('✅ Зависимости установлены');





