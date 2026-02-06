
export interface Person {
  id: string;
  name: string;
  hasPaid: boolean;
  datePaid?: string;
  note?: string;
  satisfaction?: string;
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
  paidCount: number;
  unpaidCount: number;
}