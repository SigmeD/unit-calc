# 🚀 Быстрое обновление GitHub репозитория
param(
    [string]$Message = "Update project"
)

Write-Host "🚀 Быстрое обновление GitHub репозитория" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Проверяем, что мы в git репозитории
if (-not (Test-Path ".git")) {
    Write-Host "❌ Ошибка: Это не git репозиторий!" -ForegroundColor Red
    exit 1
}

# Проверяем статус
Write-Host "📊 Проверяем статус..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Найдены изменения:" -ForegroundColor Cyan
    Write-Host $status -ForegroundColor White
} else {
    Write-Host "✅ Нет изменений для коммита" -ForegroundColor Green
    exit 0
}

# Добавляем все изменения
Write-Host "📦 Добавляем изменения..." -ForegroundColor Yellow
git add .

# Создаем коммит
Write-Host "💾 Создаем коммит: '$Message'" -ForegroundColor Yellow
git commit -m $Message

# Проверяем удаленный репозиторий
Write-Host "🔗 Проверяем удаленный репозиторий..." -ForegroundColor Yellow
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "⚠️  Удаленный репозиторий не настроен. Настраиваем..." -ForegroundColor Yellow
    git remote add origin https://github.com/SigmeD/unit-calc.git
}

# Отправляем изменения
Write-Host "🚀 Отправляем изменения в GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Успешно обновлено!" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка при отправке: $_" -ForegroundColor Red
    Write-Host "💡 Попробуйте: git push -u origin main" -ForegroundColor Yellow
}

Write-Host "===============================================" -ForegroundColor Green
Write-Host "🎉 Готово! Репозиторий обновлен." -ForegroundColor Green
