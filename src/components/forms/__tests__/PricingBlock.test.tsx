import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PricingBlock from '../PricingBlock'

describe('PricingBlock', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    values: {
      retailPrice: 0,
      sellerDiscount: 0,
      additionalPromo: 0
    },
    onChange: mockOnChange,
    errors: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('должен рендериться без ошибок', () => {
    render(<PricingBlock {...defaultProps} />)
    expect(screen.getByText('Блок 5: Ценообразование и скидки')).toBeInTheDocument()
  })

  it('должен отображать поля для цены и скидок', () => {
    render(<PricingBlock {...defaultProps} />)
    expect(screen.getByText('Розничная цена')).toBeInTheDocument()
    expect(screen.getByText('Скидка продавца')).toBeInTheDocument()
    expect(screen.getByText('Дополнительные промо (акции)')).toBeInTheDocument()
  })
})
