# Скрипт для обновления удаленного репозитория
Write-Host "Обновление удаленного репозитория..." -ForegroundColor Green

# Проверяем текущую ветку
Write-Host "Текущая ветка:" -ForegroundColor Yellow
git rev-parse --abbrev-ref HEAD

# Добавляем все изменения
Write-Host "Добавляем изменения..." -ForegroundColor Yellow
git add .

# Проверяем статус
Write-Host "Статус:" -ForegroundColor Yellow
git status --short

# Создаем коммит
$commitMsg = Read-Host "Введите сообщение коммита (Enter для 'Update project')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update project"
}
git commit -m $commitMsg

# Настраиваем удаленный репозиторий
Write-Host "Настраиваем удаленный репозиторий..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/SigmeD/unit-calc.git

# Пушим все ветки
Write-Host "Отправляем изменения в GitHub..." -ForegroundColor Yellow
git push -u origin --all

Write-Host "Готово!" -ForegroundColor Green
Read-Host "Нажмите Enter для продолжения"
