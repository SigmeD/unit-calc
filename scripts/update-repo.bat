@echo off
echo Обновление удаленного репозитория...

REM Проверяем текущую ветку
echo Текущая ветка:
git branch --show-current

REM Добавляем все изменения
echo Добавляем изменения...
git add .

REM Проверяем статус
echo Статус:
git status --porcelain

REM Создаем коммит
set /p commit_msg="Введите сообщение коммита (по умолчанию 'Update project'): "
if "%commit_msg%"=="" set commit_msg=Update project
git commit -m "%commit_msg%"

REM Настраиваем удаленный репозиторий (если нужно)
git remote remove origin 2>nul
git remote add origin https://github.com/SigmeD/unit-calc.git

REM Пушим все ветки
echo Отправляем изменения в GitHub...
git push -u origin --all

echo Готово!
pause


