# Скрипт для загрузки проекта на GitHub
Write-Host "🚀 Загрузка проекта на GitHub..." -ForegroundColor Green
Write-Host ""

# Проверка Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен! Установите Git: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Переход в папку проекта
Set-Location C:\Users\USER\Documents\medpractice

Write-Host "📁 Текущая папка: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Проверка, инициализирован ли Git
if (-not (Test-Path .git)) {
    Write-Host "🔧 Инициализация Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git инициализирован" -ForegroundColor Green
}

# Добавление всех файлов
Write-Host ""
Write-Host "📦 Добавление файлов..." -ForegroundColor Yellow
git add .

# Проверка статуса
Write-Host ""
Write-Host "📊 Статус изменений:" -ForegroundColor Cyan
git status

Write-Host ""
$commitMessage = Read-Host "Введите сообщение для коммита (или нажмите Enter для 'Initial commit')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Initial commit"
}

Write-Host ""
Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host ""
Write-Host "⚠️  ВАЖНО: Добавьте удаленный репозиторий вручную!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Выполните следующие команды (замените YOUR_USERNAME на ваш GitHub username):" -ForegroundColor Cyan
Write-Host ""
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/medpractice.git" -ForegroundColor White
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Или если репозиторий уже добавлен:" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor White
Write-Host ""

