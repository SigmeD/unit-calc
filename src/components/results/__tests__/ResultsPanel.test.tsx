import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ResultsPanel from '../ResultsPanel'

const mockCalculations = {
  totalCosts: 1150,
  netProfit: 650,
  profitability: 32.5,
  breakevenPrice: 1150,
  status: 'profitable' as const
}

const defaultProps = {
  calculations: mockCalculations,
  isLoading: false,
  error: null
}

describe('ResultsPanel', () => {
  it('должен рендериться без ошибок', () => {
    render(<ResultsPanel {...defaultProps} />)
    expect(screen.getByText('Результаты расчета')).toBeInTheDocument()
  })

  it('должен отображать сообщение о заполнении данных', () => {
    render(<ResultsPanel {...defaultProps} />)
    expect(screen.getByText('Заполните данные для начала расчета')).toBeInTheDocument()
  })
})
