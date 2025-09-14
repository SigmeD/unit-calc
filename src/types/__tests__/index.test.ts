import { describe, it, expect } from 'vitest'
import type { 
  MarketplaceId, 
  CalculationInput, 
  CalculationResult, 
  Scenario,
  Marketplace,
  SimpleMarketplace
} from '../index'

describe('Types', () => {
  describe('MarketplaceId', () => {
    it('должен принимать правильные значения', () => {
      const validIds: MarketplaceId[] = ['wildberries', 'ozon']
      expect(validIds).toHaveLength(2)
    })
  })

  describe('CalculationInput', () => {
    it('должен иметь все необходимые поля', () => {
      const input: CalculationInput = {
        productName: 'Тестовый товар',
        costPrice: 1000,
        retailPrice: 2000,
        marketplace: 'wildberries',
        commission: 5,
        logistics: 100,
        additionalCosts: 50,
        taxRate: 20,
        discount: 0
      }

      expect(input.productName).toBe('Тестовый товар')
      expect(input.costPrice).toBe(1000)
      expect(input.retailPrice).toBe(2000)
      expect(input.marketplace).toBe('wildberries')
      expect(input.commission).toBe(5)
      expect(input.logistics).toBe(100)
      expect(input.additionalCosts).toBe(50)
      expect(input.taxRate).toBe(20)
      expect(input.discount).toBe(0)
    })
  })

  describe('CalculationResult', () => {
    it('должен иметь все необходимые поля', () => {
      const result: CalculationResult = {
        totalCosts: 1150,
        netProfit: 650,
        profitability: 32.5,
        breakevenPrice: 1150,
        status: 'profitable'
      }

      expect(result.totalCosts).toBe(1150)
      expect(result.netProfit).toBe(650)
      expect(result.profitability).toBe(32.5)
      expect(result.breakevenPrice).toBe(1150)
      expect(result.status).toBe('profitable')
    })
  })

  describe('Scenario', () => {
    it('должен иметь все необходимые поля', () => {
      const scenario: Scenario = {
        id: 'test-scenario',
        name: 'Тестовый сценарий',
        input: {
          productName: 'Тестовый товар',
          costPrice: 1000,
          retailPrice: 2000,
          marketplace: 'wildberries',
          commission: 5,
          logistics: 100,
          additionalCosts: 50,
          taxRate: 20,
          discount: 0
        },
        result: {
          totalCosts: 1150,
          netProfit: 650,
          profitability: 32.5,
          breakevenPrice: 1150,
          status: 'profitable'
        },
        createdAt: new Date()
      }

      expect(scenario.id).toBe('test-scenario')
      expect(scenario.name).toBe('Тестовый сценарий')
      expect(scenario.input).toBeDefined()
      expect(scenario.result).toBeDefined()
      expect(scenario.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('Marketplace', () => {
    it('должен иметь все необходимые поля', () => {
      const marketplace: Marketplace = {
        id: 'wildberries',
        name: 'Wildberries',
        commission: 5,
        logistics: 100,
        additionalCosts: 0,
        features: ['commission', 'logistics']
      }

      expect(marketplace.id).toBe('wildberries')
      expect(marketplace.name).toBe('Wildberries')
      expect(marketplace.commission).toBe(5)
      expect(marketplace.logistics).toBe(100)
      expect(marketplace.additionalCosts).toBe(0)
      expect(marketplace.features).toEqual(['commission', 'logistics'])
    })
  })

  describe('SimpleMarketplace', () => {
    it('должен иметь все необходимые поля', () => {
      const simpleMarketplace: SimpleMarketplace = {
        id: 'wildberries',
        name: 'Wildberries',
        commission: 5,
        logistics: 100,
        additionalCosts: 0
      }

      expect(simpleMarketplace.id).toBe('wildberries')
      expect(simpleMarketplace.name).toBe('Wildberries')
      expect(simpleMarketplace.commission).toBe(5)
      expect(simpleMarketplace.logistics).toBe(100)
      expect(simpleMarketplace.additionalCosts).toBe(0)
    })
  })
})
