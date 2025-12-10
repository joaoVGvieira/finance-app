"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthSelectorProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ currentDate, onMonthChange }: MonthSelectorProps) {
  
  function handlePrevious() {
    onMonthChange(subMonths(currentDate, 1));
  }

  function handleNext() {
    onMonthChange(addMonths(currentDate, 1));
  }

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-lg border shadow-sm">
      <Button variant="ghost" size="icon" onClick={handlePrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 min-w-[140px] justify-center">
        <CalendarIcon className="h-4 w-4 text-slate-500" />
        <span className="font-semibold capitalize text-lg">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </span>
      </div>

      <Button variant="ghost" size="icon" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}