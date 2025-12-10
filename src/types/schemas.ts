import { z } from "zod";

export const transactionSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória"),
  // O segredo está aqui: z.coerce.number() converte a string do input para number
  amount: z.coerce.number().min(0.01, "O valor deve ser maior que 0"), 
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Selecione uma categoria"),
});

// Extraia o tipo diretamente do schema para garantir compatibilidade 100%
export type TransactionFormValues = z.infer<typeof transactionSchema>;