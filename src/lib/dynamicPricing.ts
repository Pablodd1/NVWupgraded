export interface DynamicPricingRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    capacityThreshold?: number; // 0-1, e.g., 0.8 for 80% full
    excessGuestCount?: number; // Number of excess guests
    dayOfWeek?: number[]; // 0=Sunday, 6=Saturday
    timeOfDay?: { start: string; end: string };
    season?: string[]; // ['summer', 'winter', etc.]
    specialEvents?: boolean;
  };
  pricing: {
    multiplier: number; // e.g., 1.5 for 50% increase
    fixedFee?: number;
    perGuestFee?: number;
  };
  priority: number; // Higher number = higher priority
  active: boolean;
}

export interface PricingCalculationResult {
  basePrice: number;
  dynamicAdjustments: {
    ruleName: string;
    adjustment: number;
    amount: number;
  }[];
  totalPrice: number;
  breakdown: {
    baseFee: number;
    guestFees: number;
    excessPremium: number;
    dynamicMultiplier: number;
  };
  appliedRules: string[];
}

class DynamicPricingService {
  private pricingRules: DynamicPricingRule[] = [
    // Default excess guest rule
    {
      id: 'excess-guest-base',
      name: 'Excess Guest Base Premium',
      description: 'Base premium for bookings exceeding maximum guests',
      conditions: {
        excessGuestCount: 1
      },
      pricing: {
        multiplier: 1.2, // 20% increase
        perGuestFee: 25
      },
      priority: 1,
      active: true
    },
    // High capacity pressure rule
    {
      id: 'high-capacity-pressure',
      name: 'High Capacity Pressure',
      description: 'Premium pricing when slot is nearly full',
      conditions: {
        capacityThreshold: 0.8
      },
      pricing: {
        multiplier: 1.3 // 30% increase
      },
      priority: 2,
      active: true
    },
    // Weekend premium
    {
      id: 'weekend-premium',
      name: 'Weekend Premium',
      description: 'Higher pricing on weekends',
      conditions: {
        dayOfWeek: [0, 6] // Sunday, Saturday
      },
      pricing: {
        multiplier: 1.25 // 25% increase
      },
      priority: 1,
      active: true
    },
    // Peak time rule
    {
      id: 'peak-time-premium',
      name: 'Peak Time Premium',
      description: 'Higher pricing during peak hours',
      conditions: {
        timeOfDay: { start: '11:00', end: '16:00' }
      },
      pricing: {
        multiplier: 1.15 // 15% increase
      },
      priority: 1,
      active: true
    },
    // High excess guest count rule
    {
      id: 'high-excess-guests',
      name: 'High Excess Guest Count',
      description: 'Significant premium for many excess guests',
      conditions: {
        excessGuestCount: 3
      },
      pricing: {
        multiplier: 1.5, // 50% increase
        perGuestFee: 50
      },
      priority: 3,
      active: true
    },
    // Special events rule
    {
      id: 'special-events',
      name: 'Special Event Premium',
      description: 'Premium pricing during special events',
      conditions: {
        specialEvents: true
      },
      pricing: {
        multiplier: 2.0 // 100% increase
      },
      priority: 4,
      active: true
    }
  ];

  /**
   * Calculate dynamic pricing for a booking
   */
  async calculateDynamicPrice(
    baseBookingFee: number,
    additionalGuestFee: number,
    totalGuests: number,
    excessGuests: number,
    capacityUtilization: number,
    bookingDate: Date,
    bookingTime: string,
    isSpecialEvent: boolean = false,
    customMultiplier?: number
  ): Promise<PricingCalculationResult> {
    try {
      // Start with base calculation
      const baseFee = baseBookingFee;
      const guestFees = totalGuests > 1 ? additionalGuestFee * (totalGuests - 1) : 0;
      let currentPrice = baseFee + guestFees;

      const appliedRules: string[] = [];
      const dynamicAdjustments: { ruleName: string; adjustment: number; amount: number }[] = [];

      if (excessGuests > 0 && customMultiplier && customMultiplier > 1) {
        const excessAdjustment = currentPrice * (customMultiplier - 1);
        currentPrice += excessAdjustment;

        dynamicAdjustments.push({
          ruleName: "Winery Excess Guest Premium",
          adjustment: customMultiplier,
          amount: excessAdjustment
        });
        appliedRules.push("Winery Excess Guest Premium");
      }

      // Sort rules by priority (higher first)
      const activeRules = this.pricingRules
        .filter(rule => rule.active)
        .sort((a, b) => b.priority - a.priority);

      // Apply matching rules
      for (const rule of activeRules) {
        if (this.evaluateRuleConditions(rule.conditions, {
          excessGuests,
          capacityUtilization,
          bookingDate,
          bookingTime,
          isSpecialEvent
        })) {
          const adjustment = this.calculateRuleAdjustment(rule, currentPrice, excessGuests);
          currentPrice += adjustment.amount;

          appliedRules.push(rule.name);
          dynamicAdjustments.push({
            ruleName: rule.name,
            adjustment: rule.pricing.multiplier,
            amount: adjustment.amount
          });
        }
      }

      // Calculate final breakdown
      const breakdown = {
        baseFee,
        guestFees,
        excessPremium: dynamicAdjustments.reduce((sum, adj) => sum + adj.amount, 0),
        dynamicMultiplier: currentPrice / (baseFee + guestFees)
      };

      return {
        basePrice: baseFee + guestFees,
        dynamicAdjustments,
        totalPrice: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
        breakdown,
        appliedRules
      };
    } catch (error) {
      console.error('Error calculating dynamic price:', error);
      throw error;
    }
  }

  /**
   * Evaluate if rule conditions are met
   */
  private evaluateRuleConditions(
    conditions: DynamicPricingRule['conditions'],
    context: {
      excessGuests: number;
      capacityUtilization: number;
      bookingDate: Date;
      bookingTime: string;
      isSpecialEvent: boolean;
    }
  ): boolean {
    const { excessGuests, capacityUtilization, bookingDate, bookingTime, isSpecialEvent } = context;

    // Check each condition
    if (conditions.capacityThreshold !== undefined) {
      if (capacityUtilization < conditions.capacityThreshold) return false;
    }

    if (conditions.excessGuestCount !== undefined) {
      if (excessGuests < conditions.excessGuestCount) return false;
    }

    if (conditions.dayOfWeek !== undefined) {
      const dayOfWeek = bookingDate.getDay();
      if (!conditions.dayOfWeek.includes(dayOfWeek)) return false;
    }

    if (conditions.timeOfDay !== undefined) {
      const bookingHour = this.parseTimeToHours(bookingTime);
      const startHour = this.parseTimeToHours(conditions.timeOfDay.start);
      const endHour = this.parseTimeToHours(conditions.timeOfDay.end);

      if (bookingHour < startHour || bookingHour > endHour) return false;
    }

    if (conditions.specialEvents !== undefined) {
      if (isSpecialEvent !== conditions.specialEvents) return false;
    }

    return true;
  }

  /**
   * Calculate price adjustment for a specific rule
   */
  private calculateRuleAdjustment(
    rule: DynamicPricingRule,
    currentPrice: number,
    excessGuests: number
  ): { amount: number } {
    let adjustment = 0;

    if (rule.pricing.multiplier > 1) {
      adjustment = currentPrice * (rule.pricing.multiplier - 1);
    }

    if (rule.pricing.fixedFee) {
      adjustment += rule.pricing.fixedFee;
    }

    if (rule.pricing.perGuestFee && excessGuests > 0) {
      adjustment += rule.pricing.perGuestFee * excessGuests;
    }

    return { amount: adjustment };
  }

  /**
   * Parse time string to hours (e.g., "14:30" -> 14.5)
   */
  private parseTimeToHours(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  }

  /**
   * Add or update a pricing rule
   */
  async addPricingRule(rule: Omit<DynamicPricingRule, 'id'>): Promise<DynamicPricingRule> {
    const newRule: DynamicPricingRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.pricingRules.push(newRule);
    return newRule;
  }

  /**
   * Update an existing pricing rule
   */
  async updatePricingRule(ruleId: string, updates: Partial<DynamicPricingRule>): Promise<DynamicPricingRule | null> {
    const ruleIndex = this.pricingRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return null;

    this.pricingRules[ruleIndex] = { ...this.pricingRules[ruleIndex], ...updates };
    return this.pricingRules[ruleIndex];
  }

  /**
   * Remove a pricing rule
   */
  async removePricingRule(ruleId: string): Promise<boolean> {
    const initialLength = this.pricingRules.length;
    this.pricingRules = this.pricingRules.filter(rule => rule.id !== ruleId);
    return this.pricingRules.length < initialLength;
  }

  /**
   * Get all pricing rules
   */
  getAllRules(): DynamicPricingRule[] {
    return [...this.pricingRules];
  }

  /**
   * Get active pricing rules
   */
  getActiveRules(): DynamicPricingRule[] {
    return this.pricingRules.filter(rule => rule.active);
  }

  /**
   * Get pricing history for a specific winery (for analytics)
   */
  async getPricingHistory(wineryId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // This would integrate with a booking history collection
    // For now, return a placeholder implementation
    return [
      {
        date: new Date(),
        basePrice: 100,
        finalPrice: 150,
        appliedRules: ['weekend-premium', 'excess-guest-base'],
        excessGuests: 2,
        capacityUtilization: 0.85
      }
    ];
  }

  /**
   * Simulate pricing for different scenarios
   */
  async simulatePricing(
    baseBookingFee: number,
    additionalGuestFee: number,
    scenarios: {
      guestCount: number;
      excessGuests: number;
      capacityUtilization: number;
      bookingDate: Date;
      bookingTime: string;
    }[]
  ): Promise<PricingCalculationResult[]> {
    const results: PricingCalculationResult[] = [];

    for (const scenario of scenarios) {
      const result = await this.calculateDynamicPrice(
        baseBookingFee,
        additionalGuestFee,
        scenario.guestCount,
        scenario.excessGuests,
        scenario.capacityUtilization,
        scenario.bookingDate,
        scenario.bookingTime,
        false
      );
      results.push(result);
    }

    return results;
  }
}

export default new DynamicPricingService();