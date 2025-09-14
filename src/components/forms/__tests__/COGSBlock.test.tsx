import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import COGSBlock from '../COGSBlock'

describe('COGSBlock', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    values: {
      purchasePrice: 0,
      deliveryToWarehouse: 0,
      packaging: 0,
      otherCOGS: 0
    },
    onChange: mockOnChange,
    errors: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('должен рендериться без ошибок', () => {
    render(<COGSBlock {...defaultProps} />)
    expect(screen.getByText('Блок 1: Себестоимость (COGS)')).toBeInTheDocument()
  })

  it('должен отображать текущие значения', () => {
    const props = {
      ...defaultProps,
      values: {
        purchasePrice: 1500,
        deliveryToWarehouse: 100,
        packaging: 50,
        otherCOGS: 25
      }
    }
    render(<COGSBlock {...props} />)
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument()
    expect(screen.getByDisplayValue('100')).toBeInTheDocument()
  })

  it('должен отображать все поля формы', () => {
    render(<COGSBlock {...defaultProps} />)
    expect(screen.getByText('Закупочная цена')).toBeInTheDocument()
    expect(screen.getByText('Доставка до склада')).toBeInTheDocument()
    expect(screen.getByText('Упаковка и маркировка')).toBeInTheDocument()
    expect(screen.getByText('Прочие расходы COGS')).toBeInTheDocument()
  })
})
