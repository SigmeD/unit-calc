import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Layout from '../Layout'

// Мокаем дочерние компоненты
vi.mock('../Header', () => ({
  default: () => <div data-testid="header">Header</div>
}))

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

describe('Layout', () => {
  it('должен рендериться без ошибок', () => {
    render(<Layout><div>Test Content</div></Layout>)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('должен отображать дочерние компоненты', () => {
    render(<Layout><div data-testid="content">Test Content</div></Layout>)
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('должен иметь правильную структуру', () => {
    render(<Layout><div>Test Content</div></Layout>)
    const layout = screen.getByRole('main')
    expect(layout).toHaveClass('flex-1', 'container', 'py-6')
  })
})
