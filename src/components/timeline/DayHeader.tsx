'use client';

import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface DayHeaderProps {
  date: string;
  onDateChange: (date: string) => void;
}

export function DayHeader({ date, onDateChange }: DayHeaderProps) {
  const currentDate = new Date(date + 'T00:00:00');
  const today = new Date();
  const spToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const todayStr = spToday.toISOString().split('T')[0];
  
  const isToday = date === todayStr;

  const formattedDate = format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const handlePrevDay = () => {
    const prev = subDays(currentDate, 1);
    onDateChange(prev.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const next = addDays(currentDate, 1);
    onDateChange(next.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(todayStr);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-zinc-100">{capitalizedDate}</h1>
        {isToday && (
          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded">
            Hoje
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevDay}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          onClick={handleToday}
          disabled={isToday}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Hoje
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
