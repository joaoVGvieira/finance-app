"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "../../store/useFinanceStore";
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";

export function SummaryCards() {
  const { transactions } = useFinanceStore();

  // Cálculos automáticos
  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const total = income - expense;

  // Formatador de moeda BRL
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card: Saldo Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatter.format(total)}
          </div>
        </CardContent>
      </Card>

      {/* Card: Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatter.format(income)}
          </div>
        </CardContent>
      </Card>

      {/* Card: Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatter.format(expense)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}