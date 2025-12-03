#!/bin/bash

# Скрипт для первоначальной настройки сервера MedPractice

echo "🚀 Начало настройки сервера..."

# 1. Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# 2. Установка Node.js 18.x
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# 3. Проверка версий
echo "✅ Проверка установки:"
node --version
npm --version

# 4. Установка Nginx
echo "📦 Установка Nginx..."
apt install -y nginx

# 5. Установка PM2
echo "📦 Установка PM2..."
npm install -g pm2

# 6. Установка Git
echo "📦 Установка Git..."
apt install -y git

# 7. Установка дополнительных утилит
echo "📦 Установка утилит..."
apt install -y curl wget

# 8. Настройка firewall (опционально)
echo "🔥 Настройка firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Клонировать репозиторий: git clone <your-repo-url>"
echo "2. Настроить .env файлы"
echo "3. Установить зависимости: npm install"
echo "4. Собрать frontend: npm run build"
echo "5. Запустить backend через PM2: pm2 start server/src/index.js --name medpractice-api"

