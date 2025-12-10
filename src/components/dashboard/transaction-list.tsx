"use client";

import { useFinanceStore } from "../../store/useFinanceStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function TransactionList() {
  const { transactions, removeTransaction } = useFinanceStore();

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Nenhuma transação cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.description}</TableCell>
              <TableCell>
                {/* Tradução simples das categorias */}
                {transaction.category === "Food" && "Alimentação"}
                {transaction.category === "Housing" && "Moradia"}
                {transaction.category === "Transport" && "Transporte"}
                {transaction.category === "Salary" && "Salário"}
                {transaction.category === "Investments" && "Investimentos"}
                {transaction.category === "Other" && "Outros"}
              </TableCell>
              <TableCell>
                {new Date(transaction.date).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell 
                className={`text-right font-bold ${
                  transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                }`}
              >
                {transaction.type === "EXPENSE" ? "- " : "+ "}
                {formatter.format(transaction.amount)}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeTransaction(transaction.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}