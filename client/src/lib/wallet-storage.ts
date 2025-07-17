// Local storage utilities for wallet balance (no authentication)
export interface WalletTransaction {
  id: string;
  type: 'topup' | 'payment' | 'bonus';
  amount: number; // in cents
  description: string;
  date: Date;
  stripePaymentIntentId?: string;
}

const STORAGE_KEY = 'washk_wallet';

export const walletStorage = {
  getTransactions(): WalletTransaction[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const transactions = JSON.parse(stored);
      return transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
      }));
    } catch (error) {
      console.error('Error loading wallet transactions:', error);
      return [];
    }
  },

  addTransaction(transaction: Omit<WalletTransaction, 'id' | 'date'>): WalletTransaction {
    const transactions = this.getTransactions();
    const newTransaction: WalletTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date(),
    };
    
    transactions.push(newTransaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    
    return newTransaction;
  },

  getBalance(): number {
    const transactions = this.getTransactions();
    return transactions.reduce((balance, transaction) => {
      return balance + transaction.amount;
    }, 0);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
