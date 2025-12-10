"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Importamos Zod aqui direto para facilitar
import { useFinanceStore } from "../../store/useFinanceStore";
import { addMonths } from "date-fns"; // Necessário instalar date-fns

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // Vamos precisar do Switch
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

// Schema expandido para suportar parcelas
const formSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Categoria obrigatória"),
  // Novos campos
  isInstallment: z.boolean().default(false),
  installments: z.coerce.number().min(2).max(48).optional(), // De 2 a 48x
  isRecurring: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function NewTransactionModal() {
  const [open, setOpen] = useState(false);
  const { addTransaction } = useFinanceStore();

  const form = useForm<FormValues>({
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

  // Monitorar campos para mostrar/esconder opções
  const type = form.watch("type");
  const isInstallment = form.watch("isInstallment");
  const isRecurring = form.watch("isRecurring");

  function onSubmit(data: FormValues) {
    const today = new Date();

    // LÓGICA DE PARCELAMENTO OU RECORRÊNCIA
    if (data.type === "EXPENSE" && data.isInstallment && data.installments) {
      // Cria X transações futuras
      const installmentValue = data.amount / data.installments; // Divide o valor total? Ou o valor é por parcela?
      // GERALMENTE o usuário digita o valor TOTAL da compra. Vamos dividir.
      
      for (let i = 0; i < data.installments; i++) {
        addTransaction({
          description: `${data.description} (${i + 1}/${data.installments})`,
          amount: parseFloat(installmentValue.toFixed(2)), // Arredonda
          type: "EXPENSE",
          category: data.category,
          date: addMonths(today, i), // Adiciona 1 mês a cada loop
        });
      }
    } 
    else if (data.isRecurring) {
      // Se for fixo, vamos gerar para os próximos 12 meses por conveniência
      for (let i = 0; i < 12; i++) {
        addTransaction({
          description: `${data.description} (Fixo)`,
          amount: data.amount,
          type: data.type,
          category: data.category,
          date: addMonths(today, i),
        });
      }
    } 
    else {
      // Transação normal (única)
      addTransaction({
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: today,
      });
    }

    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          <PlusCircle className="h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Movimentação</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: iPhone 15, Aluguel..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Tipo */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <SelectItem value="Other">Outros 📦</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- SEÇÃO AVANÇADA DE PARCELAS/FIXO --- */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-4 border">
               <p className="text-sm font-medium text-muted-foreground mb-2">Opções Avançadas</p>
               
               {/* Switch: Parcelado (Só aparece se for Despesa e não for Fixo) */}
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
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                 />
               )}

               {/* Input: Qtd Parcelas (Só aparece se Switch Parcelado estiver ON) */}
               {isInstallment && (
                 <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input type="number" min={2} max={48} {...field} />
                        </FormControl>
                        <FormDescription className="text-xs text-blue-600">
                           Serão criados lançamentos futuros automaticamente.
                        </FormDescription>
                      </FormItem>
                    )}
                 />
               )}

               {/* Switch: Fixo (Só aparece se não for parcelado) */}
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
                          <FormDescription>Repete todo mês (Ex: Netflix, Aluguel)</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
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