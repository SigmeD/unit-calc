# Настройка Git репозитория для unit-calc
Write-Host "🚀 Инициализация Git репозитория для unit-calc..." -ForegroundColor Green

# Инициализация git
Write-Host "📝 Инициализация git..."
git init

# Добавление файлов
Write-Host "📦 Добавление файлов..."
git add .

# Создание первого коммита
Write-Host "💾 Создание первого коммита..."
git commit -m "🎉 Initial commit: MVP Этапы 1-3 завершены

✅ Этап 1: Инфраструктура - React + TypeScript + Tailwind
✅ Этап 2: Выбор маркетплейса - WB/Ozon селектор  
✅ Этап 3: Модуль ввода данных - 5 блоков с валидацией

Готовность MVP: ~40%"

# Добавление удаленного репозитория (нужно сначала создать на GitHub)
Write-Host "🌐 Добавление удаленного репозитория..."
Write-Host "⚠️  ВНИМАНИЕ: Сначала создайте репозиторий на GitHub!" -ForegroundColor Yellow
Write-Host "📍 https://github.com/new" -ForegroundColor Cyan
Write-Host "📝 Название: unit-calc" -ForegroundColor Cyan
Write-Host "📄 Описание: 🧮 Калькулятор юнит-экономики для маркетплейсов Wildberries и Ozon. React + TypeScript + Tailwind CSS" -ForegroundColor Cyan

# Команды для выполнения после создания репозитория
Write-Host ""
Write-Host "📋 После создания репозитория на GitHub выполните:"
Write-Host "git remote add origin https://github.com/SigmeD/unit-calc.git" -ForegroundColor Yellow
Write-Host "git branch -M main" -ForegroundColor Yellow
Write-Host "git push -u origin main" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Локальный git репозиторий настроен!" -ForegroundColor Green
