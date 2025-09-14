# 🚀 Быстрое обновление GitHub репозитория

## ⚡ Самый быстрый способ

```bash
# 1. Запустите PowerShell скрипт
.\quick-update.ps1

# 2. Или одну команду
git add . && git commit -m "Update project" && git push origin main
```

## 📋 Пошаговая инструкция

### 1. Проверьте изменения
```bash
git status
```

### 2. Добавьте все изменения
```bash
git add .
```

### 3. Создайте коммит
```bash
git commit -m "Описание ваших изменений"
```

### 4. Отправьте в GitHub
```bash
git push origin main
```

## 🔧 Если что-то пошло не так

### Проблема: "Your branch is ahead"
```bash
git push origin main
```

### Проблема: "Updates were rejected"
```bash
git pull origin main
git push origin main
```

### Проблема: "Remote origin already exists"
```bash
git remote set-url origin https://github.com/SigmeD/unit-calc.git
```

## 📚 Подробная инструкция

См. файл [`GITHUB_UPDATE_GUIDE.md`](./GITHUB_UPDATE_GUIDE.md) для полной документации.

---

**💡 Совет:** Используйте `.\quick-update.ps1` для автоматического обновления!
