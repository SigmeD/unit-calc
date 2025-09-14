# 🚀 Git Шпаргалка - Быстрые команды

## ⚡ Основные команды

### Проверка состояния
```bash
git status                    # Статус репозитория
git log --oneline -5         # Последние 5 коммитов
git remote -v                # Удаленные репозитории
```

### Добавление и коммит
```bash
git add .                    # Добавить все изменения
git add filename.txt         # Добавить конкретный файл
git commit -m "Сообщение"    # Создать коммит
```

### Отправка в GitHub
```bash
git push origin main         # Отправить в GitHub
git push -u origin main      # Первая отправка
```

## 🔧 Решение проблем

### "Your branch is ahead"
```bash
git push origin main
```

### "Updates were rejected"
```bash
git pull origin main
git push origin main
```

### "Authentication failed"
```bash
git config --global credential.helper store
```

## 📝 Примеры сообщений коммитов

```bash
git commit -m "Добавлен компонент DataInputForm"
git commit -m "Исправлена ошибка в расчете прибыли"
git commit -m "Обновлена документация"
git commit -m "Добавлены unit тесты"
git commit -m "Улучшен UI компонента"
```

## 🎯 Полная инструкция

- **[Ручное обновление](MANUAL_UPDATE_GUIDE.md)** - подробная инструкция
- **[Автоматическое обновление](GITHUB_UPDATE_GUIDE.md)** - все способы обновления

---

**💡 Совет:** Сохраните эту шпаргалку в закладки!
