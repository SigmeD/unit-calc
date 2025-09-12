# 📝 Инструкция по настройке GitHub репозитория

## 🎯 Параметры репозитория

**Название:** `unit-calc`  
**Описание:** `🧮 Калькулятор юнит-экономики для маркетплейсов Wildberries и Ozon. React + TypeScript + Tailwind CSS`  
**Видимость:** Public  
**Владелец:** SigmeD

## 🚀 Шаги настройки

### 1. Создание репозитория на GitHub

1. Перейдите на https://github.com/new
2. Заполните поля:
   - **Repository name:** `unit-calc`
   - **Description:** `🧮 Калькулятор юнит-экономики для маркетплейсов Wildberries и Ozon. React + TypeScript + Tailwind CSS`
   - **Visibility:** Public ✅
   - **Initialize with README:** ❌ НЕ отмечать (у нас уже есть README.md)
   - **Add .gitignore:** ❌ НЕ отмечать (у нас уже есть .gitignore)
   - **Choose a license:** ❌ НЕ отмечать (добавим позже)

3. Нажмите **Create repository**

### 2. Локальная настройка Git

Выполните в терминале в папке проекта:

```bash
# Инициализация git (если еще не сделано)
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "🎉 Initial commit: MVP Этапы 1-3 завершены

✅ Этап 1: Инфраструктура - React + TypeScript + Tailwind
✅ Этап 2: Выбор маркетплейса - WB/Ozon селектор
✅ Этап 3: Модуль ввода данных - 5 блоков с валидацией

Готовность MVP: ~40%"

# Добавление удаленного репозитория
git remote add origin https://github.com/SigmeD/unit-calc.git

# Установка основной ветки
git branch -M main

# Первый push
git push -u origin main
```

### 3. Настройка GitHub репозитория

После создания репозитория настройте:

#### Topics (теги)
Добавьте topics в настройках репозитория:
- `react`
- `typescript`  
- `tailwindcss`
- `vite`
- `unit-economics`
- `marketplace`
- `wildberries`
- `ozon`
- `calculator`
- `mvp`

#### Branch Protection
В Settings → Branches добавьте protection rule для `main`:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

#### GitHub Pages (опционально)
В Settings → Pages настройте деплой из GitHub Actions

## 📊 Статистика проекта

- **Языки:** TypeScript (85%), CSS (10%), HTML (5%)
- **Размер:** ~2MB (без node_modules)
- **Файлов:** 50+ исходных файлов
- **Компонентов:** 15+ React компонентов
- **Тестов:** 5+ unit тестов

## 🔗 Полезные ссылки

- **Локальная разработка:** http://localhost:3009
- **MVP Roadmap:** [`MVP_ROADMAP.md`](./MVP_ROADMAP.md)
- **Техническая спецификация:** [`TECH_SPEC.md`](./TECH_SPEC.md)
- **История рефакторинга:** [`REFACTORING_SUMMARY.md`](./REFACTORING_SUMMARY.md)

## 📝 Следующие шаги

После создания репозитория:

1. ✅ Добавить topics и описание
2. 🔄 Настроить GitHub Actions для CI/CD
3. 🔄 Добавить badge статуса сборки в README
4. 🔄 Настроить автоматические релизы
5. 🔄 Создать issues для Этапа 4

---

**Создано:** 12 сентября 2025  
**Автор:** AI Assistant (Claude)
