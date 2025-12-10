"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, TrendingUp, Lightbulb, PartyPopper } from "lucide-react";
import { subMonths, isSameMonth, parseISO } from "date-fns";
import numeral from "numeral";

interface FinancialAssistantProps {
  currentDate: Date;
}

export function FinancialAssistant({ currentDate }: FinancialAssistantProps) {
  const { transactions } = useFinanceStore();

  // 1. Calcular Despesas do Mês Atual (Selecionado)
  const currentExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && isSameMonth(parseISO(t.date), currentDate))
    .reduce((acc, t) => acc + t.amount, 0);

  // 2. Calcular Despesas do Mês Passado (Anterior ao Selecionado)
  const lastMonthDate = subMonths(currentDate, 1);
  const lastMonthExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && isSameMonth(parseISO(t.date), lastMonthDate))
    .reduce((acc, t) => acc + t.amount, 0);

  // 3. Lógica de Comparação
  const difference = currentExpenses - lastMonthExpenses;
  let percentage = 0;
  
  if (lastMonthExpenses > 0) {
    percentage = (difference / lastMonthExpenses) * 100;
  } else if (currentExpenses > 0) {
    percentage = 100; // Se mês passado foi 0 e agora tem gasto, aumentou 100% (tecnicamente infinito, mas simplificamos)
  }

  // Não mostrar nada se não tiver dados suficientes
  if (currentExpenses === 0 && lastMonthExpenses === 0) return null;

  // 4. Banco de Dicas de Economia (Aparecem quando o gasto aumenta)
  const tips = [
    "💡 Dica: Que tal cozinhar em casa este fim de semana em vez de pedir delivery?",
    "💡 Dica: Revise suas assinaturas (streaming, academia). Tem alguma que você não usa?",
    "💡 Dica: A regra das 24h: espere um dia antes de comprar algo caro por impulso.",
    "💡 Dica: Tente substituir marcas famosas por genéricas no mercado. A economia é gigante!",
    "💡 Dica: Levar marmita para o trabalho pode economizar mais de R$ 300,00 por mês."
  ];
  // Pega uma dica aleatória baseada no dia atual (para não ficar mudando a cada clique)
  const tipIndex = new Date().getDate() % tips.length; 
  const currentTip = tips[tipIndex];

  // --- RENDERIZAÇÃO ---

  // CASO 1: GASTOU MAIS (ALERTA)
  if (difference > 0) {
    return (
      <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900 mb-6">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="bg-red-100 p-2 rounded-full dark:bg-red-800">
            <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <div>
            <h3 className="font-bold text-red-700 dark:text-red-400 text-lg">
              Atenção! Gasto subindo 🚨
            </h3>
            <p className="text-red-600/90 dark:text-red-300 text-sm mt-1">
              Você já gastou <strong>{numeral(difference).format('R$ 0,0.00')}</strong> a mais que no mês passado ({percentage.toFixed(0)}% de aumento).
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-black/20 p-2 rounded-md">
               {currentTip}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // CASO 2: GASTOU MENOS (PARABÉNS)
  if (difference < 0) {
    return (
      <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900 mb-6">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="bg-emerald-100 p-2 rounded-full dark:bg-emerald-800">
            <PartyPopper className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
              Excelente! Você está economizando 🤑
            </h3>
            <p className="text-emerald-600/90 dark:text-emerald-300 text-sm mt-1">
              Suas despesas caíram <strong>{Math.abs(percentage).toFixed(0)}%</strong> em relação ao mês anterior.
            </p>
            <p className="text-sm mt-2 font-medium text-emerald-800 dark:text-emerald-200">
              Continue assim! Sobrou <strong>{numeral(Math.abs(difference)).format('R$ 0,0.00')}</strong> a mais no bolso.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // CASO 3: EMPATE (MANTENHA O FOCO)
  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 mb-6">
      <CardContent className="p-4 flex items-center gap-4">
        <Lightbulb className="h-6 w-6 text-blue-600" />
        <div>
           <h3 className="font-bold text-blue-700 dark:text-blue-400">Tudo sob controle</h3>
           <p className="text-sm text-blue-600/80">Seus gastos estão iguais ao mês passado.</p>
        </div>
      </CardContent>
    </Card>
  );
}