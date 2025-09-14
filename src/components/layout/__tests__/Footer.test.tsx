import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Footer from '../Footer'

describe('Footer', () => {
  it('должен рендериться без ошибок', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('должен отображать копирайт', () => {
    render(<Footer />)
    expect(screen.getByText('© 2024 Unit Calc. Калькулятор юнит-экономики для маркетплейсов.')).toBeInTheDocument()
  })

  it('должен иметь правильную структуру', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('bg-white', 'border-t', 'border-gray-200', 'mt-12')
  })
})
