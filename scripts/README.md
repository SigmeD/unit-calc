# 🛠️ Scripts Directory

Каталог содержит все скрипты автоматизации для проекта Unit Calc.

## 📁 Структура

### setup/
- `setup.ps1` - Основная установка проекта
- `git-setup.bat` - Настройка Git репозитория

### git/
- `merge-to-main.ps1` - Слияние в main ветку
- `quick-update.ps1` - Быстрое обновление репозитория
- `update-repo.ps1` - Полное обновление репозитория  
- `update-repo.bat` - Batch версия для обновления
- `git-commands.txt` - Справочник Git команд

### test/
- `run_tests.bat` - Запуск всех тестов
- `test-runner.ps1` - Расширенный test runner

## 🚀 Использование

### Быстрый старт
```bash
# Первоначальная настройка
./scripts/setup/setup.ps1

# Быстрое обновление кода
./scripts/git/quick-update.ps1

# Запуск тестов
./scripts/test/run_tests.bat
```

### Git операции
```bash
# Обновление репозитория
./scripts/git/update-repo.ps1

# Слияние в main
./scripts/git/merge-to-main.ps1
```

## 📝 Примечания

- Все PowerShell скрипты требуют разрешения на выполнение
- Batch файлы работают без дополнительных настроек
- Git команды документированы в `git/git-commands.txt`

---

*Последнее обновление: 14 сентября 2025*
