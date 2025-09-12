import { validateCalculationInput, validateBusinessLogic, validateSingleField } from '../validation';
import type { CalculationInput, Marketplace } from '../../types';

describe('Validation Utils', () => {
  const mockInput: CalculationInput = {
    purchasePrice: 100,
    deliveryToWarehouse: 10,
    packaging: 5,
    otherCOGS: 0,
    commission: 15,
    logistics: 30,
    storage: 0,
    returnProcessing: 10,
    pickupRate: 70,
    returnRate: 15,
    advertising: 50,
    otherVariableCosts: 0,
    fixedCostsPerMonth: 0,
    expectedSalesPerMonth: 100,
    taxRegime: 'USN_6',
    retailPrice: 500,
    sellerDiscount: 10,
    additionalPromo: 5,
    specificData: {}
  };

  const mockMarketplace: Marketplace = {
    id: 'wildberries',
    name: 'Wildberries',
    config: {
      defaultCommission: 17,
      logisticOptions: [],
      specificFields: [],
      taxRegimes: ['USN_6', 'USN_15'],
      commissionRanges: {}
    },
    defaultValues: {
      commission: 17,
      logistics: 0,
      pickupRate: 70,
      returnRate: 15
    }
  };

  describe('validateCalculationInput', () => {
    it('should validate correct input without errors', () => {
      const result = validateCalculationInput(mockInput, mockMarketplace);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should detect negative purchase price', () => {
      const invalidInput = { ...mockInput, purchasePrice: -10 };
      const result = validateCalculationInput(invalidInput, mockMarketplace);
      expect(result.isValid).toBe(false);
      expect(result.errors.purchasePrice).toBeDefined();
    });

    it('should detect commission over 100%', () => {
      const invalidInput = { ...mockInput, commission: 150 };
      const result = validateCalculationInput(invalidInput, mockMarketplace);
      expect(result.isValid).toBe(false);
      expect(result.errors.commission).toBeDefined();
    });
  });

  describe('validateBusinessLogic', () => {
    it('should detect pickup rate + return rate > 100%', () => {
      const invalidInput = { ...mockInput, pickupRate: 70, returnRate: 40 };
      const errors = validateBusinessLogic(invalidInput);
      expect(errors.businessLogic).toBeDefined();
    });

    it('should detect total discounts > 100%', () => {
      const invalidInput = { ...mockInput, sellerDiscount: 60, additionalPromo: 50 };
      const errors = validateBusinessLogic(invalidInput);
      expect(errors.discountLogic).toBeDefined();
    });

    it('should detect effective price <= 0', () => {
      const invalidInput = { ...mockInput, retailPrice: 100, sellerDiscount: 100 };
      const errors = validateBusinessLogic(invalidInput);
      expect(errors.priceLogic).toBeDefined();
    });
  });

  describe('validateSingleField', () => {
    it('should validate pickup rate in real time', () => {
      const error = validateSingleField('pickupRate', 150, mockInput, mockMarketplace);
      expect(error).toBeDefined();
    });

    it('should validate business logic for related fields', () => {
      const error = validateSingleField('returnRate', 40, 
        { ...mockInput, pickupRate: 70 }, mockMarketplace);
      expect(error).toBeDefined();
    });

    it('should pass valid single field validation', () => {
      const error = validateSingleField('purchasePrice', 100, mockInput, mockMarketplace);
      expect(error).toBeNull();
    });
  });
});
