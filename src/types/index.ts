export type TransactionType = 'INCOME' | 'EXPENSE';
export type Category = 'Housing' | 'Food' | 'Transport' | 'Salary' | 'Investments';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: Date;
  status: 'PAID' | 'PENDING';
}

export interface FinanceState {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  // Aqui depois adicionaremos lógica de cartões
}