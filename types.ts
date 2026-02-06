
export interface Person {
  id: string;
  name: string;
  totalPaid: number; // Changed from hasPaid boolean to cumulative amount
  lastPaymentDate?: string;
  note?: string;
  satisfaction?: string;
  // Legacy support for migration (optional)
  hasPaid?: boolean;
  datePaid?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Stats {
  totalCollected: number;
  totalSpent: number;
  remainingBalance: number;
  totalPeople: number;
  contributorsCount: number; // People who paid at least something
  zeroContributionCount: number; // People who paid nothing
}