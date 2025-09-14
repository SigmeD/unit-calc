# 📝 Ручное обновление GitHub репозитория

## 🎯 Пошаговая инструкция

### Шаг 1: Проверка текущего состояния

Откройте терминал (PowerShell или CMD) в папке проекта и выполните:

```bash
# Проверить статус репозитория
git status
```

**Что вы увидите:**
- `On branch main` - текущая ветка
- `Your branch is up to date with 'origin/main'` - синхронизация с GitHub
- `nothing to commit, working tree clean` - нет изменений
- Или список измененных файлов, если есть изменения

### Шаг 2: Проверка изменений

Если есть изменения, посмотрите что именно изменилось:

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
# Проверить настройки удаленного репозитория
git remote -v
```

**Должно показать:**
```
origin  https://github.com/SigmeD/unit-calc.git (fetch)
origin  https://github.com/SigmeD/unit-calc.git (push)
```

**Если не настроено, добавьте:**
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

## 🔧 Решение проблем

### Проблема: "Your branch is ahead of origin/main by 1 commit"

**Решение:**
```bash
git push origin main
```

### Проблема: "Updates were rejected because the remote contains work"

**Решение:**
```bash
# Получить изменения с сервера
git pull origin main

# Если есть конфликты, разрешить их, затем:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Проблема: "Authentication failed"

**Решение:**
```bash
# Настроить токен доступа
git config --global credential.helper store

# Или использовать SSH
git remote set-url origin git@github.com:SigmeD/unit-calc.git
```

### Проблема: "Remote origin already exists"

**Решение:**
```bash
# Удалить старый remote
git remote remove origin

# Добавить новый
git remote add origin https://github.com/SigmeD/unit-calc.git
```

## 📋 Чек-лист перед отправкой

- [ ] ✅ Все изменения добавлены (`git add .`)
- [ ] ✅ Создан осмысленный коммит (`git commit -m "..."`)
- [ ] ✅ Удаленный репозиторий настроен (`git remote -v`)
- [ ] ✅ Проект собирается (`npm run build`)
- [ ] ✅ Тесты проходят (`npm test`)

## 🎯 Примеры сообщений коммитов

### Хорошие сообщения:
```bash
git commit -m "Добавлен компонент DataInputForm"
git commit -m "Исправлена ошибка в расчете прибыли"
git commit -m "Обновлена документация"
git commit -m "Добавлены unit тесты для калькулятора"
git commit -m "Улучшен UI компонента PricingBlock"
```

### Плохие сообщения:
```bash
git commit -m "fix"           # Слишком короткое
git commit -m "changes"       # Неинформативное
git commit -m "asdf"          # Бессмысленное
git commit -m "update"        # Слишком общее
```

## 🔍 Полезные команды для проверки

### Просмотр истории:
```bash
# Краткая история
git log --oneline -10

# Подробная история
git log --graph --oneline --all

# История конкретного файла
git log --follow src/components/App.tsx
```

### Отмена изменений:
```bash
# Отменить изменения в файле (до git add)
git checkout -- src/components/App.tsx

# Отменить добавление файла (после git add)
git reset HEAD src/components/App.tsx

# Отменить последний коммит (сохранить изменения)
git reset --soft HEAD~1

# Отменить последний коммит (удалить изменения)
git reset --hard HEAD~1
```

### Синхронизация:
```bash
# Получить все изменения
git fetch --all

# Объединить изменения
git pull origin main

# Принудительная синхронизация (осторожно!)
git fetch origin
git reset --hard origin/main
```

## 🚨 Важные замечания

1. **Всегда проверяйте статус** перед отправкой: `git status`
2. **Создавайте осмысленные сообщения коммитов**
3. **Не используйте `git push --force`** без крайней необходимости
4. **Делайте резервные копии** важных изменений
5. **Тестируйте изменения** перед отправкой

## 📞 Если что-то пошло не так

1. **Проверьте статус:** `git status`
2. **Посмотрите логи:** `git log --oneline -5`
3. **Проверьте remote:** `git remote -v`
4. **Обратитесь к документации Git или GitHub**

---

**💡 Совет:** Сохраните эту инструкцию в закладки для быстрого доступа!

**📚 Дополнительно:** См. файл `GITHUB_UPDATE_GUIDE.md` для более подробной документации.
