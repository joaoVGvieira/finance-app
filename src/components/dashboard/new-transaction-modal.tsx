"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFinanceStore } from "../../store/useFinanceStore";
import { addMonths } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PlusCircle, CalendarClock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

// Schema
const formSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Categoria obrigatória"),
  isInstallment: z.boolean().default(false),
  installments: z.coerce.number().min(2).max(48).optional(),
  isRecurring: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface NewTransactionModalProps {
  variant?: "default" | "outline" | "gradient";
}

export function NewTransactionModal({ variant = "default" }: NewTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const { addTransaction } = useFinanceStore();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "EXPENSE",
      category: "",
      isInstallment: false,
      installments: 2,
      isRecurring: false,
    },
  });

  const type = form.watch("type" as any);
  const isInstallment = form.watch("isInstallment" as any);
  const isRecurring = form.watch("isRecurring" as any);

  function onSubmit(data: any) {
    const typedData = data as FormValues;
    const today = new Date();

    if (typedData.type === "EXPENSE" && typedData.isInstallment && typedData.installments) {
      const installmentValue = typedData.amount / typedData.installments;
      for (let i = 0; i < typedData.installments; i++) {
        addTransaction({
          description: `${typedData.description} (${i + 1}/${typedData.installments})`,
          amount: parseFloat(installmentValue.toFixed(2)),
          type: "EXPENSE",
          category: typedData.category,
          date: addMonths(today, i),
        });
      }
    } 
    else if (typedData.isRecurring) {
      for (let i = 0; i < 12; i++) {
        addTransaction({
          description: `${typedData.description} (Fixo)`,
          amount: typedData.amount,
          type: typedData.type,
          category: typedData.category,
          date: addMonths(today, i),
        });
      }
    } 
    else {
      addTransaction({
        description: typedData.description,
        amount: typedData.amount,
        type: typedData.type,
        category: typedData.category,
        date: today,
      });
    }

    form.reset();
    setOpen(false);
  }

  const getButtonStyle = () => {
    if (variant === "gradient") {
      return "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md border-none";
    }
    if (variant === "outline") {
      return "border-dashed border-2 border-gray-300 hover:border-purple-500 text-gray-500 hover:text-purple-600 bg-transparent w-full";
    }
    return "bg-blue-600 hover:bg-blue-700 text-white";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("gap-2 font-semibold", getButtonStyle())}>
          <PlusCircle className="h-4 w-4" />
          {variant === "outline" ? "Adicionar Primeira Transação" : "Nova Transação"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Movimentação</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* CORREÇÃO 1: Campo Description (Text) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: iPhone 15, Aluguel..." 
                      {...field} 
                      value={field.value as string} // Força string
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* CORREÇÃO 2: Campo Amount (Number) - O erro estava aqui */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        value={field.value as number} // Força number
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INCOME">Receita (+)</SelectItem>
                        <SelectItem value="EXPENSE">Despesa (-)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Housing">Moradia 🏠</SelectItem>
                      <SelectItem value="Food">Alimentação 🍔</SelectItem>
                      <SelectItem value="Transport">Transporte 🚗</SelectItem>
                      <SelectItem value="Salary">Salário 💰</SelectItem>
                      <SelectItem value="Investments">Investimentos 📈</SelectItem>
                      <SelectItem value="CreditCard">Cartão de Crédito 💳</SelectItem>
                      <SelectItem value="Education">Educação 📚</SelectItem>
                      <SelectItem value="Health">Saúde 💊</SelectItem>
                      <SelectItem value="Entertainment">Entretenimento 🎬</SelectItem>
                      <SelectItem value="Shopping">Compras 🛍️</SelectItem>
                      <SelectItem value="Other">Outros 📦</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-4 border">
               <p className="text-sm font-medium text-muted-foreground mb-2">Opções Avançadas</p>
               
               {type === "EXPENSE" && !isRecurring && (
                 <FormField
                    control={form.control}
                    name="isInstallment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white dark:bg-slate-950">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                             <CreditCard className="w-4 h-4 text-purple-500"/> Parcelar Compra?
                          </FormLabel>
                          <FormDescription>Divide o valor nos próximos meses</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                 />
               )}

               {isInstallment && (
                 <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          {/* CORREÇÃO 3: Campo Installments (Number) */}
                          <Input 
                            type="number" 
                            min={2} 
                            max={48} 
                            {...field}
                            value={field.value as number} // Força number
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-blue-600">
                           Serão criados lançamentos futuros automaticamente.
                        </FormDescription>
                      </FormItem>
                    )}
                 />
               )}

               {!isInstallment && (
                 <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white dark:bg-slate-950">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                             <CalendarClock className="w-4 h-4 text-orange-500"/> Despesa Fixa?
                          </FormLabel>
                          <FormDescription>Repete todo mês (Ex: Netflix)</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                 />
               )}
            </div>

            <Button type="submit" className="w-full font-bold">Salvar Transação</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}