/**
 * Утилиты для мониторинга и анализа покрытия тестов - Фаза 5
 * Система мониторинга покрытия для достижения целей 80%+
 */

/**
 * Конфигурация целевых показателей покрытия
 * Соответствует целям из TESTING_COVERAGE_ROADMAP.md
 */
export const COVERAGE_TARGETS = {
  // Глобальные целевые показатели (Фаза 5)
  global: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80
  },
  
  // Целевые показатели по модулям
  modules: {
    // Критические модули - высокие требования
    critical: {
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90
    },
    
    // Важные модули - стандартные требования
    important: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    
    // Вспомогательные модули - пониженные требования
    utility: {
      lines: 70,
      functions: 75,
      branches: 70,
      statements: 70
    }
  }
} as const

/**
 * Классификация модулей по важности
 */
export const MODULE_CLASSIFICATION = {
  critical: [
    'src/hooks/',
    'src/calculations/',
    'src/utils/validation.ts',
    'src/utils/excelExport.ts'
  ],
  important: [
    'src/components/forms/',
    'src/components/results/',
    'src/utils/formatters.ts',
    'src/utils/marketplaceConfig.ts'
  ],
  utility: [
    'src/components/ui/',
    'src/components/layout/',
    'src/types/',
    'src/data/'
  ]
} as const

/**
 * Анализ покрытия модуля
 */
export interface CoverageAnalysis {
  module: string
  classification: keyof typeof MODULE_CLASSIFICATION
  targets: typeof COVERAGE_TARGETS.modules.critical
  current: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
  status: {
    lines: 'good' | 'warning' | 'critical'
    functions: 'good' | 'warning' | 'critical'
    branches: 'good' | 'warning' | 'critical'
    statements: 'good' | 'warning' | 'critical'
    overall: 'good' | 'warning' | 'critical'
  }
  recommendations: string[]
}

/**
 * Анализирует покрытие конкретного модуля
 */
export const analyzeCoverage = (
  module: string,
  coverage: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
): CoverageAnalysis => {
  // Определяем классификацию модуля
  let classification: keyof typeof MODULE_CLASSIFICATION = 'utility'
  
  for (const [category, modules] of Object.entries(MODULE_CLASSIFICATION)) {
    if (modules.some(m => module.includes(m))) {
      classification = category as keyof typeof MODULE_CLASSIFICATION
      break
    }
  }
  
  const targets = COVERAGE_TARGETS.modules[classification]
  
  // Анализируем статус каждой метрики
  const getStatus = (current: number, target: number) => {
    if (current >= target) return 'good'
    if (current >= target * 0.8) return 'warning'
    return 'critical'
  }
  
  const status = {
    lines: getStatus(coverage.lines, targets.lines),
    functions: getStatus(coverage.functions, targets.functions),
    branches: getStatus(coverage.branches, targets.branches),
    statements: getStatus(coverage.statements, targets.statements),
    overall: 'good' as 'good' | 'warning' | 'critical'
  }
  
  // Определяем общий статус
  const criticalCount = Object.values(status).filter(s => s === 'critical').length
  const warningCount = Object.values(status).filter(s => s === 'warning').length
  
  if (criticalCount > 0) {
    status.overall = 'critical'
  } else if (warningCount > 0) {
    status.overall = 'warning'
  }
  
  // Генерируем рекомендации
  const recommendations: string[] = []
  
  if (status.lines === 'critical') {
    recommendations.push('🔴 Критически низкое покрытие строк. Добавьте базовые unit тесты.')
  } else if (status.lines === 'warning') {
    recommendations.push('🟡 Недостаточное покрытие строк. Покройте оставшиеся ветки кода.')
  }
  
  if (status.functions === 'critical') {
    recommendations.push('🔴 Критически низкое покрытие функций. Протестируйте все экспортируемые функции.')
  } else if (status.functions === 'warning') {
    recommendations.push('🟡 Недостаточное покрытие функций. Добавьте тесты для вспомогательных функций.')
  }
  
  if (status.branches === 'critical') {
    recommendations.push('🔴 Критически низкое покрытие ветвлений. Протестируйте все if/else, switch случаи.')
  } else if (status.branches === 'warning') {
    recommendations.push('🟡 Недостаточное покрытие ветвлений. Добавьте edge case тесты.')
  }
  
  if (status.statements === 'critical') {
    recommendations.push('🔴 Критически низкое покрытие операторов. Добавьте комплексные тесты.')
  } else if (status.statements === 'warning') {
    recommendations.push('🟡 Недостаточное покрытие операторов. Оптимизируйте существующие тесты.')
  }
  
  if (status.overall === 'good') {
    recommendations.push('✅ Отличное покрытие! Поддерживайте текущий уровень.')
  }
  
  return {
    module,
    classification,
    targets,
    current: coverage,
    status,
    recommendations
  }
}

/**
 * Генерирует отчет о покрытии для всего проекта
 */
export const generateCoverageReport = (coverageData: Record<string, any>) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      },
      targets: COVERAGE_TARGETS.global,
      status: 'good' as 'good' | 'warning' | 'critical',
      progress: {
        phase1: false, // 100% прохождение тестов
        phase2: false, // 70% покрытие критических модулей
        phase3: false, // 75% покрытие UI компонентов
        phase4: false, // 80% общее покрытие
        phase5: false  // 80%+ с оптимизацией
      }
    },
    modules: [] as CoverageAnalysis[],
    recommendations: [] as string[],
    nextSteps: [] as string[]
  }
  
  // Анализируем каждый модуль (в реальности парсим coverage данные)
  // Это пример структуры - в реальности нужно парсить coverage.json
  
  // Определяем общий статус
  const { lines, functions, branches, statements } = report.summary.total
  const targets = report.summary.targets
  
  const meetsTarget = (current: number, target: number) => current >= target
  
  if (meetsTarget(lines, targets.lines) && 
      meetsTarget(functions, targets.functions) && 
      meetsTarget(branches, targets.branches) && 
      meetsTarget(statements, targets.statements)) {
    report.summary.status = 'good'
    report.summary.progress.phase5 = true
  } else if (lines >= targets.lines * 0.8 || functions >= targets.functions * 0.8) {
    report.summary.status = 'warning'
    report.summary.progress.phase4 = lines >= 80
  } else {
    report.summary.status = 'critical'
  }
  
  // Генерируем общие рекомендации
  if (report.summary.status === 'critical') {
    report.recommendations.push(
      '🚨 Критически низкое покрытие тестов',
      '📋 Следуйте TESTING_COVERAGE_ROADMAP.md для систематического улучшения',
      '🎯 Сосредоточьтесь на критических модулях (hooks, calculations)'
    )
  } else if (report.summary.status === 'warning') {
    report.recommendations.push(
      '⚠️ Покрытие близко к целевому, но требует улучшения',
      '🔍 Проанализируйте модули со статусом warning',
      '🧪 Добавьте интеграционные тесты для повышения branch coverage'
    )
  } else {
    report.recommendations.push(
      '🎉 Отличное покрытие тестов!',
      '📈 Поддерживайте текущий уровень при добавлении новых функций',
      '🔄 Регулярно запускайте coverage отчеты'
    )
  }
  
  return report
}

/**
 * Вспомогательные функции для мониторинга
 */
export const coverageHelpers = {
  /**
   * Форматирует процент покрытия с цветным индикатором
   */
  formatCoverage: (value: number, target: number): string => {
    const percentage = `${value.toFixed(1)}%`
    
    if (value >= target) {
      return `✅ ${percentage}`
    } else if (value >= target * 0.8) {
      return `⚠️ ${percentage}`
    } else {
      return `🔴 ${percentage}`
    }
  },
  
  /**
   * Создает прогресс-бар для покрытия
   */
  createProgressBar: (current: number, target: number, width = 20): string => {
    const progress = Math.min(current / target, 1)
    const filled = Math.round(progress * width)
    const empty = width - filled
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    return `[${bar}] ${current.toFixed(1)}%/${target}%`
  },
  
  /**
   * Вычисляет недостающее покрытие до цели
   */
  calculateGap: (current: number, target: number): {
    gap: number
    isMetTarget: boolean
    recommendation: string
  } => {
    const gap = Math.max(0, target - current)
    const isMetTarget = current >= target
    
    let recommendation = ''
    if (isMetTarget) {
      recommendation = 'Цель достигнута!'
    } else if (gap <= 5) {
      recommendation = 'Близко к цели - добавьте несколько тестов'
    } else if (gap <= 15) {
      recommendation = 'Требуется систематическое добавление тестов'
    } else {
      recommendation = 'Критический разрыв - нужен комплексный план'
    }
    
    return { gap, isMetTarget, recommendation }
  }
}

/**
 * Экспорт для консольного вывода красивых отчетов
 */
export const reportFormatters = {
  /**
   * Форматирует полный отчет для консоли
   */
  consoleReport: (report: ReturnType<typeof generateCoverageReport>): void => {
    console.log('\n🧪 ОТЧЕТ О ПОКРЫТИИ ТЕСТОВ - ФАЗА 5')
    console.log('═'.repeat(50))
    console.log(`📅 Время создания: ${new Date(report.timestamp).toLocaleString('ru-RU')}`)
    console.log('')
    
    console.log('📊 ОБЩАЯ СТАТИСТИКА:')
    const { total, targets, status } = report.summary
    
    const statusEmoji = status === 'good' ? '✅' : status === 'warning' ? '⚠️' : '🔴'
    console.log(`${statusEmoji} Общий статус: ${status.toUpperCase()}`)
    console.log('')
    
    console.log(`Lines:      ${coverageHelpers.formatCoverage(total.lines, targets.lines)}`)
    console.log(`Functions:  ${coverageHelpers.formatCoverage(total.functions, targets.functions)}`)
    console.log(`Branches:   ${coverageHelpers.formatCoverage(total.branches, targets.branches)}`)
    console.log(`Statements: ${coverageHelpers.formatCoverage(total.statements, targets.statements)}`)
    console.log('')
    
    console.log('🎯 ПРОГРЕСС ПО ФАЗАМ:')
    const phases = report.summary.progress
    console.log(`Фаза 1: ${phases.phase1 ? '✅' : '❌'} 100% прохождение тестов`)
    console.log(`Фаза 2: ${phases.phase2 ? '✅' : '❌'} 70% покрытие критических модулей`)
    console.log(`Фаза 3: ${phases.phase3 ? '✅' : '❌'} 75% покрытие UI компонентов`)
    console.log(`Фаза 4: ${phases.phase4 ? '✅' : '❌'} 80% общее покрытие`)
    console.log(`Фаза 5: ${phases.phase5 ? '✅' : '❌'} 80%+ с оптимизацией`)
    console.log('')
    
    if (report.recommendations.length > 0) {
      console.log('💡 РЕКОМЕНДАЦИИ:')
      report.recommendations.forEach(rec => console.log(`  ${rec}`))
      console.log('')
    }
    
    console.log('═'.repeat(50))
  },
  
  /**
   * Генерирует краткий статус для CI/CD
   */
  cicdStatus: (report: ReturnType<typeof generateCoverageReport>): {
    passed: boolean
    message: string
    details: Record<string, number>
  } => {
    const { total, targets, status } = report.summary
    
    const passed = status === 'good'
    const message = passed 
      ? '✅ Coverage targets met' 
      : `❌ Coverage below targets (${status})`
    
    return {
      passed,
      message,
      details: {
        lines: total.lines,
        functions: total.functions,
        branches: total.branches,
        statements: total.statements,
        targetLines: targets.lines,
        targetFunctions: targets.functions,
        targetBranches: targets.branches,
        targetStatements: targets.statements
      }
    }
  }
}
