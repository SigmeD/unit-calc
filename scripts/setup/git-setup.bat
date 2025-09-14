@echo off
echo 🚀 Инициализация Git репозитория для unit-calc...
echo.

echo 📝 Инициализация git...
git init

echo 📦 Добавление файлов...
git add .

echo 💾 Создание первого коммита...
git commit -m "🎉 Initial commit: MVP Этапы 1-3 завершены

✅ Этап 1: Инфраструктура - React + TypeScript + Tailwind
✅ Этап 2: Выбор маркетплейса - WB/Ozon селектор  
✅ Этап 3: Модуль ввода данных - 5 блоков с валидацией

Готовность MVP: ~40%"

echo 🌐 Добавление удаленного репозитория...
git remote add origin https://github.com/SigmeD/unit-calc.git

echo 🔄 Установка основной ветки...
git branch -M main

echo ⬆️ Первый push...
git push -u origin main

echo.
echo ✅ Git репозиторий настроен!
echo 📍 URL: https://github.com/SigmeD/unit-calc
echo.
pause
