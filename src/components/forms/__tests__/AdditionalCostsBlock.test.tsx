import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdditionalCostsBlock from '../AdditionalCostsBlock'

describe('AdditionalCostsBlock', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    values: {
      advertising: 0,
      otherVariableCosts: 0,
      fixedCostsPerMonth: 0,
      expectedSalesPerMonth: 0
    },
    onChange: mockOnChange,
    errors: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('должен рендериться без ошибок', () => {
    render(<AdditionalCostsBlock {...defaultProps} />)
    expect(screen.getByText('Блок 3: Дополнительные расходы')).toBeInTheDocument()
  })

  it('должен отображать текущие значения', () => {
    const props = {
      ...defaultProps,
      values: {
        advertising: 150,
        otherVariableCosts: 100,
        fixedCostsPerMonth: 5000,
        expectedSalesPerMonth: 100
      }
    }
    render(<AdditionalCostsBlock {...props} />)
    expect(screen.getByDisplayValue('150')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument()
  })

  it('должен вызывать onChange при изменении значения', () => {
    render(<AdditionalCostsBlock {...defaultProps} />)
    const inputs = screen.getAllByDisplayValue('0')
    const firstInput = inputs[0] // Первый input для рекламы
    
    // Input компонент вызывает onChange на blur, а не на change
    fireEvent.change(firstInput, { target: { value: '200' } })
    fireEvent.blur(firstInput)
    
    // Проверяем что onChange был вызван с правильными параметрами
    expect(mockOnChange).toHaveBeenCalledWith('advertising', 200)
  })

  it('должен отображать ошибки если они переданы', () => {
    const props = {
      ...defaultProps,
      errors: {
        advertising: 'Ошибка валидации'
      }
    }
    render(<AdditionalCostsBlock {...props} />)
    expect(screen.getByText('Ошибка валидации')).toBeInTheDocument()
  })

  it('должен отображать все поля формы', () => {
    render(<AdditionalCostsBlock {...defaultProps} />)
    expect(screen.getByText('Реклама на 1 продажу')).toBeInTheDocument()
    expect(screen.getByText('Прочие переменные расходы')).toBeInTheDocument()
  })
})
