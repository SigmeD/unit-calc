# Скрипт мониторинга покрытия тестов - Фаза 5
# Автоматический анализ и отчетность по покрытию тестов

param(
    [switch]$Detailed,     # Детальный отчет
    [switch]$CI,           # Режим CI/CD
    [switch]$Watch,        # Режим наблюдения за изменениями
    [string]$Threshold = "80"  # Минимальный порог покрытия
)

Write-Host "🧪 МОНИТОРИНГ ПОКРЫТИЯ ТЕСТОВ - ФАЗА 5" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan

# Проверяем наличие зависимостей
if (-not (Test-Path "node_modules")) {
    Write-Host "❌ Не найдены node_modules. Запустите npm install" -ForegroundColor Red
    exit 1
}

# Функция для запуска тестов с покрытием
function Run-CoverageTests {
    Write-Host "🚀 Запуск тестов с анализом покрытия..." -ForegroundColor Yellow
    
    # Запускаем тесты с coverage
    $testResult = npm run test:coverage
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -ne 0) {
        Write-Host "❌ Тесты завершились с ошибками" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Тесты выполнены успешно" -ForegroundColor Green
    return $true
}

# Функция для анализа coverage файлов
function Analyze-Coverage {
    if (-not (Test-Path "coverage/coverage-final.json")) {
        Write-Host "❌ Не найден файл coverage-final.json" -ForegroundColor Red
        return $null
    }
    
    $coverageData = Get-Content "coverage/coverage-final.json" | ConvertFrom-Json
    
    # Вычисляем общую статистику
    $totalLines = 0
    $coveredLines = 0
    $totalFunctions = 0
    $coveredFunctions = 0
    $totalBranches = 0
    $coveredBranches = 0
    $totalStatements = 0
    $coveredStatements = 0
    
    foreach ($file in $coverageData.PSObject.Properties) {
        $fileData = $file.Value
        
        if ($fileData.l) {
            $totalLines += $fileData.l.total
            $coveredLines += $fileData.l.covered
        }
        
        if ($fileData.f) {
            $totalFunctions += $fileData.f.total
            $coveredFunctions += $fileData.f.covered
        }
        
        if ($fileData.b) {
            $totalBranches += $fileData.b.total
            $coveredBranches += $fileData.b.covered
        }
        
        if ($fileData.s) {
            $totalStatements += $fileData.s.total
            $coveredStatements += $fileData.s.covered
        }
    }
    
    # Вычисляем проценты
    $linesCoverage = if ($totalLines -gt 0) { ($coveredLines / $totalLines) * 100 } else { 0 }
    $functionsCoverage = if ($totalFunctions -gt 0) { ($coveredFunctions / $totalFunctions) * 100 } else { 0 }
    $branchesCoverage = if ($totalBranches -gt 0) { ($coveredBranches / $totalBranches) * 100 } else { 0 }
    $statementsCoverage = if ($totalStatements -gt 0) { ($coveredStatements / $totalStatements) * 100 } else { 0 }
    
    return @{
        Lines = [math]::Round($linesCoverage, 2)
        Functions = [math]::Round($functionsCoverage, 2)
        Branches = [math]::Round($branchesCoverage, 2)
        Statements = [math]::Round($statementsCoverage, 2)
        TotalLines = $totalLines
        CoveredLines = $coveredLines
        TotalFunctions = $totalFunctions
        CoveredFunctions = $coveredFunctions
        TotalBranches = $totalBranches
        CoveredBranches = $coveredBranches
        TotalStatements = $totalStatements
        CoveredStatements = $coveredStatements
    }
}

# Функция для отображения прогресс-бара
function Show-ProgressBar {
    param($Current, $Target, $Label)
    
    $progress = [math]::Min($Current / $Target, 1.0)
    $barLength = 30
    $filledLength = [math]::Round($progress * $barLength)
    $emptyLength = $barLength - $filledLength
    
    $bar = "█" * $filledLength + "░" * $emptyLength
    
    $color = if ($Current -ge $Target) { "Green" } 
             elseif ($Current -ge $Target * 0.8) { "Yellow" } 
             else { "Red" }
    
    Write-Host "$Label [$bar] " -NoNewline
    Write-Host "$Current%" -ForegroundColor $color -NoNewline
    Write-Host "/$Target%"
}

# Функция для отображения отчета
function Show-Report {
    param($CoverageStats)
    
    $threshold = [int]$Threshold
    
    Write-Host ""
    Write-Host "📊 СТАТИСТИКА ПОКРЫТИЯ:" -ForegroundColor Cyan
    Write-Host "─" * 40
    
    Show-ProgressBar -Current $CoverageStats.Lines -Target $threshold -Label "Строки    "
    Show-ProgressBar -Current $CoverageStats.Functions -Target $threshold -Label "Функции   "
    Show-ProgressBar -Current $CoverageStats.Branches -Target $threshold -Label "Ветвления "
    Show-ProgressBar -Current $CoverageStats.Statements -Target $threshold -Label "Операторы "
    
    Write-Host ""
    
    # Общий статус
    $allMetTarget = $CoverageStats.Lines -ge $threshold -and 
                   $CoverageStats.Functions -ge $threshold -and 
                   $CoverageStats.Branches -ge $threshold -and 
                   $CoverageStats.Statements -ge $threshold
    
    if ($allMetTarget) {
        Write-Host "🎉 ВСЕ ЦЕЛИ ПОКРЫТИЯ ДОСТИГНУТЫ!" -ForegroundColor Green
        Write-Host "✅ Фаза 5 успешно завершена" -ForegroundColor Green
    } elseif ($CoverageStats.Lines -ge ($threshold * 0.9)) {
        Write-Host "⚠️  Близко к цели - добавьте еще несколько тестов" -ForegroundColor Yellow
    } else {
        Write-Host "🔴 Требуется больше тестов для достижения цели" -ForegroundColor Red
    }
    
    # Детальная информация
    if ($Detailed) {
        Write-Host ""
        Write-Host "📋 ДЕТАЛЬНАЯ ИНФОРМАЦИЯ:" -ForegroundColor Cyan
        Write-Host "─" * 40
        Write-Host "Покрыто строк: $($CoverageStats.CoveredLines) из $($CoverageStats.TotalLines)"
        Write-Host "Покрыто функций: $($CoverageStats.CoveredFunctions) из $($CoverageStats.TotalFunctions)"
        Write-Host "Покрыто ветвлений: $($CoverageStats.CoveredBranches) из $($CoverageStats.TotalBranches)"
        Write-Host "Покрыто операторов: $($CoverageStats.CoveredStatements) из $($CoverageStats.TotalStatements)"
    }
    
    return $allMetTarget
}

# Функция для сохранения истории покрытия
function Save-CoverageHistory {
    param($CoverageStats)
    
    $historyPath = "coverage-history.json"
    $historyEntry = @{
        Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        Lines = $CoverageStats.Lines
        Functions = $CoverageStats.Functions
        Branches = $CoverageStats.Branches
        Statements = $CoverageStats.Statements
    }
    
    $history = @()
    if (Test-Path $historyPath) {
        $history = Get-Content $historyPath | ConvertFrom-Json
    }
    
    $history += $historyEntry
    
    # Сохраняем последние 100 записей
    if ($history.Count -gt 100) {
        $history = $history[-100..-1]
    }
    
    $history | ConvertTo-Json | Set-Content $historyPath
    Write-Host "💾 История покрытия сохранена в $historyPath" -ForegroundColor Gray
}

# Основная логика скрипта
try {
    # Запускаем тесты
    $testsSuccessful = Run-CoverageTests
    
    if (-not $testsSuccessful) {
        exit 1
    }
    
    # Анализируем покрытие
    $coverageStats = Analyze-Coverage
    
    if (-not $coverageStats) {
        exit 1
    }
    
    # Показываем отчет
    $targetsMet = Show-Report -CoverageStats $coverageStats
    
    # Сохраняем историю
    Save-CoverageHistory -CoverageStats $coverageStats
    
    # Дополнительные действия для CI режима
    if ($CI) {
        if ($targetsMet) {
            Write-Host "CI: Coverage targets met ✅" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "CI: Coverage below threshold ❌" -ForegroundColor Red
            exit 1
        }
    }
    
    # Режим наблюдения за изменениями
    if ($Watch) {
        Write-Host ""
        Write-Host "👀 Режим наблюдения активен. Нажмите Ctrl+C для выхода." -ForegroundColor Blue
        
        while ($true) {
            Start-Sleep -Seconds 5
            
            # Проверяем изменения в src файлах
            $srcFiles = Get-ChildItem -Path "src" -Include "*.ts", "*.tsx" -Recurse
            $latestChange = ($srcFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
            
            if ($latestChange -gt (Get-Date).AddSeconds(-10)) {
                Write-Host "🔄 Обнаружены изменения, перезапуск анализа..." -ForegroundColor Yellow
                
                $testsSuccessful = Run-CoverageTests
                if ($testsSuccessful) {
                    $coverageStats = Analyze-Coverage
                    if ($coverageStats) {
                        Show-Report -CoverageStats $coverageStats
                        Save-CoverageHistory -CoverageStats $coverageStats
                    }
                }
            }
        }
    }
    
    Write-Host ""
    Write-Host "🎯 Мониторинг покрытия завершен" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Ошибка при выполнении мониторинга: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
