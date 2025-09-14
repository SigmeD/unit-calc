# 🚀 Инструкция по обновлению GitHub репозитория

## 📋 Быстрый старт

### Вариант 1: Автоматический (рекомендуется)
```bash
# Запустите PowerShell скрипт
.\update-repo.ps1

# Или bat файл для CMD
update-repo.bat
```

### Вариант 2: Ручной
```bash
# 1. Добавить все изменения
git add .

# 2. Создать коммит
git commit -m "Описание изменений"

# 3. Отправить в GitHub
git push origin main
```

## 🔍 Проверка состояния

### Перед обновлением
```bash
# Проверить статус
git status

# Проверить удаленный репозиторий
git remote -v

# Проверить ветки
git branch -a
```

### После обновления
```bash
# Проверить, что все отправлено
git status

# Посмотреть последние коммиты
git log --oneline -5
```

## 📝 Детальная инструкция

### 1. Подготовка к обновлению

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

#### Базовая отправка
```bash
# Отправить текущую ветку
git push origin main

# Отправить все ветки
git push origin --all

# Отправить с установкой upstream
git push -u origin main
```

#### Принудительная отправка (осторожно!)
```bash
# Только если уверены, что это безопасно
git push --force origin main
```

### 4. Работа с ветками

#### Создание новой ветки
```bash
# Создать и переключиться на ветку
git checkout -b feature/new-feature

# Создать ветку из удаленной
git checkout -b feature/new-feature origin/develop
```

#### Отправка ветки
```bash
# Отправить новую ветку
git push -u origin feature/new-feature

# Отправить все ветки
git push origin --all
```

## 🛠️ Решение проблем

### Проблема: "Your branch is ahead of origin/main"
```bash
# Просто отправьте изменения
git push origin main
```

### Проблема: "Updates were rejected"
```bash
# Получить изменения с сервера
git pull origin main

# Если есть конфликты, разрешить их и повторить
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Проблема: "Remote origin already exists"
```bash
# Удалить старый remote
git remote remove origin

# Добавить новый
git remote add origin https://github.com/SigmeD/unit-calc.git
```

### Проблема: "Authentication failed"
```bash
# Настроить токен доступа
git config --global credential.helper store

# Или использовать SSH
git remote set-url origin git@github.com:SigmeD/unit-calc.git
```

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

## 🔧 Настройка Git

### Базовая настройка
```bash
# Настроить имя и email
git config --global user.name "Ваше Имя"
git config --global user.email "your.email@example.com"

# Настроить редактор
git config --global core.editor "code --wait"

# Настроить кодировку
git config --global core.autocrlf true
```

### Настройка репозитория
```bash
# Добавить remote
git remote add origin https://github.com/SigmeD/unit-calc.git

# Изменить URL
git remote set-url origin https://github.com/SigmeD/unit-calc.git

# Проверить remotes
git remote -v
```

## 📋 Чек-лист перед обновлением

- [ ] ✅ Все тесты проходят (`npm test`)
- [ ] ✅ Линтер не показывает ошибок (`npm run lint`)
- [ ] ✅ Проект собирается (`npm run build`)
- [ ] ✅ Изменения добавлены в staging (`git add .`)
- [ ] ✅ Создан осмысленный коммит (`git commit -m "..."`)
- [ ] ✅ Проверен статус (`git status`)
- [ ] ✅ Удаленный репозиторий настроен (`git remote -v`)

## 🚨 Важные замечания

1. **Никогда не используйте `git push --force`** без крайней необходимости
2. **Всегда проверяйте статус** перед отправкой
3. **Создавайте осмысленные сообщения коммитов**
4. **Тестируйте изменения** перед отправкой
5. **Делайте резервные копии** важных изменений

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте статус: `git status`
2. Посмотрите логи: `git log --oneline -5`
3. Проверьте remote: `git remote -v`
4. Обратитесь к документации Git или GitHub

---

**Создано:** $(Get-Date -Format "dd.MM.yyyy")  
**Версия:** 1.0  
**Автор:** AI Assistant
