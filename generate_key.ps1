# Скрипт для генерации SSH ключа
Write-Host "Генерация нового SSH ключа..." -ForegroundColor Green

# Генерируем ключ
ssh-keygen -t ed25519 -C "medpractice-server" -f server_key -N '""'

Write-Host ""
Write-Host "✅ Ключ создан!" -ForegroundColor Green
Write-Host ""
Write-Host "Файлы созданы:" -ForegroundColor Yellow
Write-Host "  - server_key (приватный ключ) - используйте для подключения" -ForegroundColor Cyan
Write-Host "  - server_key.pub (публичный ключ) - добавьте на сервер" -ForegroundColor Cyan
Write-Host ""
Write-Host "Команда для подключения:" -ForegroundColor Yellow
Write-Host "  ssh -i server_key root@85.198.88.102" -ForegroundColor White
Write-Host ""
Write-Host "Публичный ключ (скопируйте и добавьте на сервер):" -ForegroundColor Yellow
Get-Content server_key.pub

