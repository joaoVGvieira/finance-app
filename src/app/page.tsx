"use client";

import { useEffect, useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Trash2, CalendarDays, TrendingDown, MoreVertical, ExternalLink, Sparkles, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import numeral from "numeral";
import { format, isSameMonth, parseISO, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- IMPORTAÇÕES DE COMPONENTES ---
import { NewTransactionModal } from "@/components/dashboard/new-transaction-modal";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { FinancialAssistant } from "@/components/dashboard/financial-assistant"; 
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; 
import { LoginScreen } from "@/components/dashboard/login-screen";

// Configurações
import "numeral/locales/pt-br";
numeral.locale('pt-br');
const COLORS = ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];
const NUBANK_PURPLE = '#7C3AED';
const NUBANK_PURPLE_LIGHT = '#8B5CF6';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { transactions, removeTransaction, user, checkUser, logout, isLoading } = useFinanceStore();

  useEffect(() => {
    setIsMounted(true);
    checkUser();
  }, []);

  // Tela de loading
  if (!isMounted || isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Tela de login se não tiver usuário
  if (!user) {
    return <LoginScreen />;
  }

  // --- LÓGICA DE DADOS ---

  // 1. Filtros
  const monthlyTransactions = transactions.filter((t) => 
    isSameMonth(parseISO(t.date), currentDate)
  );

  // 2. Previsão Futura
  const nextMonthDate = addMonths(currentDate, 1);
  const nextMonthExpenses = transactions
    .filter(t => isSameMonth(parseISO(t.date), nextMonthDate) && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  // 3. Totais
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // 4. Dados para Gráfico de Pizza
  const chartData = [
    { name: 'Receitas', value: totalIncome },
    { name: 'Despesas', value: totalExpense },
  ];
  const hasData = totalIncome > 0 || totalExpense > 0;

  // 5. Agrupamento por Categoria
  const expensesByCategory = monthlyTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/10 transition-colors">
      <div className="container mx-auto p-4 md:p-8 space-y-8 pb-20">
        
        {/* --- CABEÇALHO --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Olá, {user.email?.split('@')[0]}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <CalendarDays className="h-4 w-4"/>
                  <span className="font-medium text-gray-900 dark:text-gray-200 capitalize">
                    {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800">
            <MonthSelector 
              currentDate={currentDate} 
              onMonthChange={setCurrentDate} 
              className="bg-transparent border-none"
            />
            
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-700 hidden sm:block"></div>
            
            <NewTransactionModal variant="gradient" />
            
            {/* Botão de logout */}
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-700 hidden sm:block"></div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-10 w-10 hover:bg-rose-50 dark:hover:bg-rose-950/30 group transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5 text-rose-500 group-hover:text-rose-600 transition-colors" />
            </Button>
          </div>
        </motion.div>

        {/* --- CARDS DE RESUMO (KPIs) --- */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard 
            title="Entradas" 
            value={totalIncome} 
            icon={ArrowUpCircle} 
            color="text-emerald-500"
            gradient="from-emerald-400 to-emerald-500"
            delay={0.1}
          />
          <StatsCard 
            title="Saídas" 
            value={totalExpense} 
            icon={ArrowDownCircle} 
            color="text-rose-500"
            gradient="from-rose-400 to-rose-500"
            delay={0.2}
          />
          <StatsCard 
            title="Saldo do Mês" 
            value={balance} 
            icon={Wallet} 
            color={balance >= 0 ? "text-purple-600" : "text-rose-600"}
            gradient={balance >= 0 ? "from-purple-500 to-pink-500" : "from-rose-500 to-orange-500"}
            delay={0.3}
          />
          
          {/* CARD PREVISÃO FUTURA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 border-l-4 border-l-orange-400 shadow-lg hover:shadow-xl transition-all duration-300 h-full group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  Próximo Mês
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {numeral(nextMonthExpenses).format('R$ 0,0.00')}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Previsão de despesas para {format(nextMonthDate, "MMM", { locale: ptBR })}
                </p>
                <div className="mt-3 w-full bg-orange-100 dark:bg-orange-900/30 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-amber-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((nextMonthExpenses / (totalExpense || 1)) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* --- SEÇÃO PRINCIPAL --- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 h-full">
          
          {/* COLUNA ESQUERDA: GRÁFICO + CATEGORIAS */}
          <div className="col-span-4 lg:col-span-3 space-y-6">
            
            {/* Gráfico Circular */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-none shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Balanço Financeiro
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Distribuição de receitas e despesas
                      </CardDescription>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="min-h-[250px] flex flex-col items-center justify-center">
                  {hasData ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie 
                            data={chartData} 
                            innerRadius={60} 
                            outerRadius={90} 
                            paddingAngle={2} 
                            dataKey="value"
                            stroke="none"
                            cornerRadius={10}
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index === 0 ? NUBANK_PURPLE : "#EF4444"} 
                                className="hover:opacity-80 transition-opacity"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [
                              numeral(value).format('R$ 0,0.00'),
                              'Valor'
                            ]}
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: 'none', 
                              background: 'rgba(255, 255, 255, 0.9)',
                              backdropFilter: 'blur(10px)',
                              boxShadow: '0 10px 25px rgba(124, 58, 237, 0.15)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex gap-6 mt-6">
                        {chartData.map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                backgroundColor: index === 0 ? NUBANK_PURPLE : "#EF4444" 
                              }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.name}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {numeral(item.value).format('R$0,0')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="relative mx-auto mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                          <Wallet className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Adicione transações para visualizar o gráfico
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Ranking de Categorias */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-none shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Gastos por Categoria
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Top categorias do mês
                      </CardDescription>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sortedCategories.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                        <TrendingDown className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa registrada ainda</p>
                    </div>
                  ) : (
                    sortedCategories.slice(0, 5).map((item, index) => (
                      <div key={item.category} className="space-y-2 group">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              index === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                              index === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                              index === 2 ? 'bg-gradient-to-br from-emerald-500 to-green-500' :
                              'bg-gradient-to-br from-gray-500 to-gray-600'
                            }`}>
                              <span className="text-lg">{getCategoryIcon(item.category)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {translateCategory(item.category)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.percentage.toFixed(1)}% do total
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {numeral(item.amount).format('R$ 0,0.00')}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                index === 2 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                'bg-gradient-to-r from-gray-500 to-gray-600'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* COLUNA DIREITA: EXTRATO DETALHADO */}
          <div className="col-span-4 h-full">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-none shadow-xl h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Extrato do Mês
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {monthlyTransactions.length} transações registradas
                    </CardDescription>
                  </div>
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {monthlyTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Wallet className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                      Nenhuma transação ainda
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      Adicione sua primeira transação para começar a acompanhar suas finanças
                    </p>
                    <NewTransactionModal variant="outline" />
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {monthlyTransactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((t, index) => (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-300" />
                            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                    t.type === 'INCOME' 
                                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-500' 
                                      : 'bg-gradient-to-br from-rose-400 to-rose-500'
                                  }`}>
                                    <span className="text-xl">
                                      {getCategoryIcon(t.category)}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                      {t.description}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {translateCategory(t.category)}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(parseISO(t.date), "dd MMM, HH:mm", { locale: ptBR })}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className={`text-lg font-bold ${
                                      t.type === 'INCOME' 
                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {t.type === 'INCOME' ? '+' : '-'} {numeral(t.amount).format('R$ 0,0.00')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                      {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                                    </p>
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => removeTransaction(t.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE DE CARD DE ESTATÍSTICAS ---
function StatsCard({ title, value, icon: Icon, color, gradient, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-900/50 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <Card className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent dark:from-gray-800/50 rounded-full -translate-y-16 translate-x-16" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
          <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {numeral(value).format('R$ 0,0.00')}
          </div>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((Math.abs(value) / 10000) * 100, 100)}%` }}
              transition={{ duration: 1, delay: delay + 0.2 }}
              className={`h-2 rounded-full bg-gradient-to-r ${gradient}`}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- HELPERS ---
function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    'Food': '🍔',
    'Transport': '🚗',
    'Housing': '🏠',
    'Salary': '💰',
    'Investments': '📈',
    'CreditCard': '💳',
    'Education': '📚',
    'Health': '💊',
    'Entertainment': '🎬',
    'Shopping': '🛍️'
  };
  return icons[category] || '📦';
}

function translateCategory(category: string) {
  const map: Record<string, string> = {
    'Food': 'Alimentação',
    'Transport': 'Transporte',
    'Housing': 'Moradia',
    'Salary': 'Salário',
    'Investments': 'Investimentos',
    'CreditCard': 'Cartão de Crédito',
    'Education': 'Educação',
    'Health': 'Saúde',
    'Entertainment': 'Entretenimento',
    'Shopping': 'Compras',
    'Other': 'Outros'
  };
  return map[category] || category;
}