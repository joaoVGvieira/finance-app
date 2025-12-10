import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
}

interface FinanceStore {
  transactions: Transaction[];
  user: any | null; // Guarda o usuário logado
  isLoading: boolean;
  
  // Ações de Auth
  login: (email: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;

  // Ações de Dados
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id" | "date"> & { date?: Date }) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  user: null,
  isLoading: true,

  // --- AUTENTICAÇÃO ---
  checkUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null, isLoading: false });
    if (session?.user) get().fetchTransactions();
  },

  login: async (email) => {
    // Vamos usar Magic Link (link por email) ou Senha. 
    // Para simplificar aqui, vou assumir login com Magic Link (sem senha, só clica no email)
    // OU se você já criou usuário com senha no painel:
    // const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    // Vamos usar o Magic Link que é mais fácil de implementar agora:
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, transactions: [] });
  },

  // --- BANCO DE DADOS ---
  fetchTransactions: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      set({ transactions: data });
    }
  },

  addTransaction: async (newTx) => {
    const user = get().user;
    if (!user) return;

    const transactionData = {
      description: newTx.description,
      amount: newTx.amount,
      type: newTx.type,
      category: newTx.category,
      date: newTx.date ? newTx.date.toISOString() : new Date().toISOString(),
      user_id: user.id // Importante para o RLS
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (!error && data) {
      set((state) => ({ transactions: [data, ...state.transactions] }));
    }
  },

  removeTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
    }
  },
}));