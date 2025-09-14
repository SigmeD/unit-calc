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

## 🔄 Обновление репозитория

### Быстрое обновление
```bash
# Автоматический скрипт
.\update-repo.ps1

# Или ручная команда
git add . && git commit -m "Update project" && git push origin main
```

### Подробная инструкция
См. файл [`GITHUB_UPDATE_GUIDE.md`](./GITHUB_UPDATE_GUIDE.md) для полной инструкции по обновлению репозитория.

## 📝 Следующие шаги

После создания репозитория выполните следующие настройки:

### 1. ✅ Добавить topics и описание
**Статус:** Выполнено при создании репозитория

### 2. 🔄 Настроить GitHub Actions для CI/CD

#### 2.1 Создать файл `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Run linting
      run: npm run lint
    
    - name: Build project
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for production
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### 2.2 Включить GitHub Pages
1. Перейдите в **Settings** → **Pages**
2. Выберите **Source:** `GitHub Actions`
3. Сохранить настройки

### 3. 🔄 Добавить badge статуса сборки в README

Добавить в начало файла `README.md`:

```markdown
# 🧮 Unit Calculator

[![CI/CD Pipeline](https://github.com/SigmeD/unit-calc/actions/workflows/ci.yml/badge.svg)](https://github.com/SigmeD/unit-calc/actions/workflows/ci.yml)
[![GitHub Pages](https://img.shields.io/badge/demo-live-green)](https://sigmed.github.io/unit-calc/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB)](https://reactjs.org/)
```

### 4. 🔄 Настроить автоматические релизы

#### 4.1 Создать файл `.github/workflows/release.yml`
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
    
    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        files: |
          dist/**/*
        generate_release_notes: true
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 4.2 Создание релиза
```bash
# Создать тег версии
git tag -a v1.0.0 -m "Release v1.0.0: MVP Этапы 1-3"

# Отправить тег в репозиторий
git push origin v1.0.0
```

### 5. 🔄 Создать issues для Этапа 4

Создайте следующие issues в репозитории:

#### Issue #1: Модуль расчетов
```markdown
## 📊 Модуль расчетов (Этап 4.1)

### Описание
Реализовать основные расчеты юнит-экономики

### Задачи
- [ ] Расчет себестоимости с учетом всех затрат
- [ ] Расчет прибыли и маржинальности
- [ ] Расчет точки безубыточности
- [ ] Учет комиссий маркетплейсов
- [ ] Валидация результатов

### Критерии готовности
- [ ] Все расчеты работают корректно
- [ ] Добавлены unit тесты
- [ ] Результаты отображаются в UI

**Labels:** `enhancement`, `stage-4`, `calculations`
**Milestone:** MVP v1.0
```

#### Issue #2: Панель результатов
```markdown
## 📈 Панель результатов (Этап 4.2)

### Описание
Создать панель для отображения результатов расчетов

### Задачи
- [ ] Компонент для отображения ключевых метрик
- [ ] Визуализация данных (графики, диаграммы)
- [ ] Экспорт результатов в Excel
- [ ] Адаптивный дизайн

### Критерии готовности
- [ ] Все метрики отображаются корректно
- [ ] Работает экспорт в Excel
- [ ] UI адаптивен для разных экранов

**Labels:** `enhancement`, `stage-4`, `ui`
**Milestone:** MVP v1.0
```

#### Issue #3: Тестирование и оптимизация
```markdown
## ✅ Тестирование и оптимизация (Этап 4.3)

### Описание
Комплексное тестирование и оптимизация производительности

### Задачи
- [ ] Добавить end-to-end тесты
- [ ] Провести тестирование производительности
- [ ] Оптимизировать загрузку компонентов
- [ ] Добавить обработку ошибок

### Критерии готовности
- [ ] Покрытие тестами > 90%
- [ ] Время загрузки < 3 сек
- [ ] Нет критических ошибок

**Labels:** `testing`, `stage-4`, `performance`
**Milestone:** MVP v1.0
```

### 6. 🔄 Дополнительные настройки

#### 6.1 Защита главной ветки
В **Settings** → **Branches** настройте protection rules для `main`:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require linear history
- ✅ Include administrators

#### 6.2 Настройка уведомлений
В **Settings** → **Notifications** настройте:
- ✅ Issues and pull requests
- ✅ Actions workflows
- ✅ Releases

#### 6.3 Добавление лицензии
Создайте файл `LICENSE`:
```
MIT License

Copyright (c) 2025 SigmeD

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

---

**Создано:** 12 сентября 2025  
**Обновлено:** $(Get-Date -Format "dd.MM.yyyy")  
**Автор:** AI Assistant (Claude)
