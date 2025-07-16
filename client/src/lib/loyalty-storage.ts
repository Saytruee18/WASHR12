// Local storage utilities for loyalty/bonus system (no authentication required)
export interface LoyaltyTier {
  level: number;
  bookingsRequired: number;
  reward: string;
  description: string;
  icon: string;
}

export interface UserProgress {
  currentBookings: number;
  currentTier: number;
  earnedRewards: string[];
  availableRewards: string[];
}

const LOYALTY_STORAGE_KEY = 'washr_loyalty';

export const loyaltyTiers: LoyaltyTier[] = [
  {
    level: 1,
    bookingsRequired: 3,
    reward: 'Gratis Duftbaum "Fresh Drive 🌿"',
    description: 'Noch %d Buchungen bis zu deinem kostenlosen Duftbaum!',
    icon: '🌿'
  },
  {
    level: 2,
    bookingsRequired: 10,
    reward: 'Gratis Innenreinigung',
    description: '%d/%d Buchungen bis zu deiner Gratis-Innenreinigung!',
    icon: '🧼'
  },
  {
    level: 3,
    bookingsRequired: 20,
    reward: 'Upgrade auf Premium Shampoo',
    description: '%d/%d Buchungen bis zum Premium Shampoo Upgrade!',
    icon: '✨'
  },
  {
    level: 4,
    bookingsRequired: 30,
    reward: '50% Rabatt auf nächste Buchung',
    description: '%d/%d Buchungen bis zu 50% Rabatt!',
    icon: '🎁'
  }
];

export const loyaltyStorage = {
  getProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(LOYALTY_STORAGE_KEY);
      if (!stored) {
        return {
          currentBookings: 0, // Start with 0 - no fake progress
          currentTier: 0,
          earnedRewards: [],
          availableRewards: []
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading loyalty progress:', error);
      return {
        currentBookings: 0, // Start with 0 - no fake progress
        currentTier: 0,
        earnedRewards: [],
        availableRewards: []
      };
    }
  },

  getGuestBookings(): number {
    try {
      return parseInt(localStorage.getItem("guestBookings") || "0");
    } catch (error) {
      console.error('Error loading guest bookings:', error);
      return 0;
    }
  },

  setGuestBookings(count: number): void {
    localStorage.setItem("guestBookings", count.toString());
  },

  clearGuestBookings(): void {
    localStorage.removeItem("guestBookings");
  },

  updateProgress(bookings: number): UserProgress {
    const progress = this.getProgress();
    progress.currentBookings = bookings;
    
    // Check for new rewards
    for (let i = 0; i < loyaltyTiers.length; i++) {
      const tier = loyaltyTiers[i];
      if (bookings >= tier.bookingsRequired && !progress.earnedRewards.includes(tier.reward)) {
        progress.earnedRewards.push(tier.reward);
        progress.availableRewards.push(tier.reward);
        progress.currentTier = i + 1;
      }
    }
    
    localStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(progress));
    return progress;
  },

  claimReward(reward: string): boolean {
    const progress = this.getProgress();
    const index = progress.availableRewards.indexOf(reward);
    if (index !== -1) {
      progress.availableRewards.splice(index, 1);
      localStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(progress));
      return true;
    }
    return false;
  },

  getCurrentTier(): LoyaltyTier | null {
    const progress = this.getProgress();
    return loyaltyTiers.find(tier => progress.currentBookings < tier.bookingsRequired) || null;
  },

  getProgressPercentage(): number {
    const progress = this.getProgress();
    const currentTier = this.getCurrentTier();
    if (!currentTier) return 100;
    
    const previousTier = loyaltyTiers[loyaltyTiers.indexOf(currentTier) - 1];
    const startBookings = previousTier ? previousTier.bookingsRequired : 0;
    const targetBookings = currentTier.bookingsRequired;
    const currentBookings = progress.currentBookings;
    
    return Math.min(100, Math.max(0, 
      ((currentBookings - startBookings) / (targetBookings - startBookings)) * 100
    ));
  }
};