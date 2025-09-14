# 🚀 Полное руководство по GitHub Setup & Updates

> **Объединенный гайд** - настройка репозитория, обновления и ручные операции

---

## 📋 Содержание

1. [Первоначальная настройка GitHub репозитория](#-первоначальная-настройка)
2. [Быстрое обновление репозитория](#-быстрое-обновление)
3. [Подробная инструкция по обновлению](#-подробная-инструкция)
4. [Ручное пошаговое обновление](#-ручное-пошаговое-обновление)
5. [Решение проблем](#-решение-проблем)
6. [Полезные команды](#-полезные-команды)

---

## 🎯 Первоначальная настройка

### Параметры репозитория
- **Название:** `unit-calc`
- **Описание:** `🧮 Калькулятор юнит-экономики для маркетплейсов Wildberries и Ozon. React + TypeScript + Tailwind CSS`
- **Видимость:** Public
- **Владелец:** SigmeD

### Создание репозитория на GitHub

1. Перейдите на https://github.com/new
2. Заполните поля:
   - **Repository name:** `unit-calc`
   - **Description:** `🧮 Калькулятор юнит-экономики для маркетплейсов Wildberries и Ozon. React + TypeScript + Tailwind CSS`
   - **Visibility:** Public ✅
   - **Initialize with README:** ❌ НЕ отмечать
   - **Add .gitignore:** ❌ НЕ отмечать
   - **Choose a license:** ❌ НЕ отмечать
3. Нажмите **Create repository**

### Локальная настройка Git

```bash
# Инициализация git
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "🎉 Initial commit: MVP готов

✅ Этап 1-3: Базовая инфраструктура
✅ Компоненты UI с полной типизацией
✅ Формы ввода данных с валидацией
✅ Система тестирования

Готовность MVP: ~40%"

# Добавление удаленного репозитория
git remote add origin https://github.com/SigmeD/unit-calc.git

# Установка основной ветки
git branch -M main

# Первый push
git push -u origin main
```

---

## 🚀 Быстрое обновление

### Вариант 1: Автоматический (рекомендуется)
```bash
# Запустите PowerShell скрипт
.\scripts\git\update-repo.ps1

# Или bat файл для CMD
.\scripts\git\update-repo.bat
```

### Вариант 2: Быстрая команда
```bash
git add . && git commit -m "Update project" && git push origin main
```

---

## 📝 Подробная инструкция

### 1. Проверка состояния

#### Перед обновлением
```bash
# Проверить статус
git status

# Проверить удаленный репозиторий
git remote -v

# Проверить ветки
git branch -a
```

#### Проверка изменений
```bash
# Посмотреть, что изменилось
git diff

# Посмотреть только имена файлов
git diff --name-only

# Посмотреть статус
git status
```

#### Проверка ошибок
```bash
# Запустить тесты
npm test

# Проверить линтер
npm run lint

# Собрать проект
npm run build
```

### 2. Создание коммита

#### Добавление файлов
```bash
# Добавить все изменения
git add .

# Добавить конкретные файлы
git add src/components/NewComponent.tsx
git add README.md

# Добавить только отслеживаемые файлы
git add -u
```

#### Создание коммита
```bash
# Простой коммит
git commit -m "Добавлен новый компонент"

# Коммит с подробным описанием
git commit -m "feat: добавлен компонент DataInputForm

- Реализована форма ввода данных
- Добавлена валидация полей
- Созданы unit тесты
- Обновлена документация"
```

### 3. Отправка в GitHub

```bash
# Отправить текущую ветку
git push origin main

# Отправить все ветки
git push origin --all

# Отправить с установкой upstream
git push -u origin main
```

---

## 📋 Ручное пошаговое обновление

### Шаг 1: Проверка текущего состояния
```bash
git status
```

**Что вы увидите:**
- `On branch main` - текущая ветка
- `Your branch is up to date with 'origin/main'` - синхронизация с GitHub
- `nothing to commit, working tree clean` - нет изменений
- Или список измененных файлов

### Шаг 2: Проверка изменений
```bash
# Посмотреть все изменения
git diff

# Посмотреть только имена файлов
git diff --name-only

# Посмотреть изменения в конкретном файле
git diff src/components/App.tsx
```

### Шаг 3: Добавление изменений
```bash
# Добавить все изменения
git add .

# Или добавить конкретные файлы
git add src/components/NewComponent.tsx
git add README.md
git add package.json
```

**Проверьте что добавлено:**
```bash
git status
```

### Шаг 4: Создание коммита
```bash
# Простой коммит
git commit -m "Добавлен новый компонент"

# Коммит с подробным описанием
git commit -m "feat: добавлен компонент DataInputForm

- Реализована форма ввода данных
- Добавлена валидация полей  
- Созданы unit тесты
- Обновлена документация"
```

### Шаг 5: Проверка удаленного репозитория
```bash
git remote -v
```

**Должно показать:**
```
origin  https://github.com/SigmeD/unit-calc.git (fetch)
origin  https://github.com/SigmeD/unit-calc.git (push)
```

**Если не настроено:**
```bash
git remote add origin https://github.com/SigmeD/unit-calc.git
```

### Шаг 6: Отправка в GitHub
```bash
# Отправить изменения
git push origin main
```

**Если первый раз:**
```bash
git push -u origin main
```

### Шаг 7: Проверка результата
```bash
# Проверить статус
git status

# Посмотреть последние коммиты
git log --oneline -5
```

---

## 🛠️ Решение проблем

### "Your branch is ahead of origin/main"
```bash
git push origin main
```

### "Updates were rejected"
```bash
# Получить изменения с сервера
git pull origin main

# Если есть конфликты, разрешить их и повторить
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### "Remote origin already exists"
```bash
# Удалить старый remote
git remote remove origin

# Добавить новый
git remote add origin https://github.com/SigmeD/unit-calc.git
```

### "Authentication failed"
```bash
# Настроить токен доступа
git config --global credential.helper store

# Или использовать SSH
git remote set-url origin git@github.com:SigmeD/unit-calc.git
```

---

## 📊 Полезные команды

### Просмотр истории
```bash
# Краткая история
git log --oneline -10

# Подробная история
git log --graph --oneline --all

# История конкретного файла
git log --follow src/components/App.tsx
```

### Отмена изменений
```bash
# Отменить изменения в файле
git checkout -- src/components/App.tsx

# Отменить последний коммит (сохранить изменения)
git reset --soft HEAD~1

# Отменить последний коммит (удалить изменения)
git reset --hard HEAD~1
```

### Синхронизация
```bash
# Получить все изменения
git fetch --all

# Объединить изменения
git pull origin main

# Принудительная синхронизация
git fetch origin
git reset --hard origin/main
```

### Работа с ветками
```bash
# Создать и переключиться на ветку
git checkout -b feature/new-feature

# Отправить новую ветку
git push -u origin feature/new-feature

# Отправить все ветки
git push origin --all
```

---

## 🎯 Примеры сообщений коммитов

### ✅ Хорошие сообщения:
```bash
git commit -m "Добавлен компонент DataInputForm"
git commit -m "Исправлена ошибка в расчете прибыли"
git commit -m "Обновлена документация"
git commit -m "Добавлены unit тесты для калькулятора"
git commit -m "Улучшен UI компонента PricingBlock"
```

### ❌ Плохие сообщения:
```bash
git commit -m "fix"           # Слишком короткое
git commit -m "changes"       # Неинформативное
git commit -m "asdf"          # Бессмысленное
git commit -m "update"        # Слишком общее
```

---

## 📋 Чек-лист перед обновлением

- [ ] ✅ Все тесты проходят (`npm test`)
- [ ] ✅ Линтер не показывает ошибок (`npm run lint`)
- [ ] ✅ Проект собирается (`npm run build`)
- [ ] ✅ Изменения добавлены в staging (`git add .`)
- [ ] ✅ Создан осмысленный коммит (`git commit -m "..."`)
- [ ] ✅ Проверен статус (`git status`)
- [ ] ✅ Удаленный репозиторий настроен (`git remote -v`)

---

## 🚨 Важные замечания

1. **Никогда не используйте `git push --force`** без крайней необходимости
2. **Всегда проверяйте статус** перед отправкой
3. **Создавайте осмысленные сообщения коммитов**
4. **Тестируйте изменения** перед отправкой
5. **Делайте резервные копии** важных изменений

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте статус: `git status`
2. Посмотрите логи: `git log --oneline -5`
3. Проверьте remote: `git remote -v`
4. Обратитесь к документации Git или GitHub

---

**Создано:** 14 сентября 2025  
**Версия:** 2.0 (объединенный гайд)  
**Автор:** AI Assistant
