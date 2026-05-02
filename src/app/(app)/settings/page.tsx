'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Calendar, RefreshCw, Unlink, Check } from 'lucide-react';

interface CalendarInfo {
  id: string;
  summary: string;
  primary: boolean;
  backgroundColor?: string;
  selected: boolean;
}

export default function SettingsPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCalendars();
  }, []);

  async function fetchCalendars() {
    try {
      setLoading(true);
      const res = await fetch('/api/calendar/calendars');
      if (res.ok) {
        const data = await res.json();
        setCalendars(data.calendars);
        setSelectedIds(data.calendars.filter((c: CalendarInfo) => c.selected).map((c: CalendarInfo) => c.id));
        setIsConnected(true);
      } else if (res.status === 401) {
        setIsConnected(false);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }

  const handleConnect = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' });
      if (res.ok) {
        toast.success('Google Calendar desconectado');
        setIsConnected(false);
        setCalendars([]);
      }
    } catch {
      toast.error('Erro ao desconectar');
    }
  };

  const handleCalendarToggle = (calendarId: string) => {
    setSelectedIds(prev => 
      prev.includes(calendarId) 
        ? prev.filter((id: string) => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  const saveCalendarSelection = async () => {
    try {
      const res = await fetch('/api/calendar/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedCalendarIds: selectedIds }),
      });
      if (res.ok) {
        toast.success('Preferências salvas');
      }
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Configurações</h1>
        <p className="text-zinc-400 mt-1">
          Gerencie integrações e preferências do sistema
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Google Calendar
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-1">
                Sincronize seus eventos e janelas de horário
              </CardDescription>
            </div>
            {isConnected === true && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Check className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-zinc-500 text-sm">Carregando...</p>
          ) : isConnected === false ? (
            <div>
              <p className="text-zinc-400 text-sm mb-4">
                Conecte seu Google Calendar para visualizar as janelas de horário no sistema.
              </p>
              <Button onClick={handleConnect} className="bg-indigo-600 hover:bg-indigo-700">
                <Calendar className="mr-2 h-4 w-4" />
                Conectar Google Calendar
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleDisconnect} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  <Unlink className="mr-2 h-4 w-4" />
                  Desconectar
                </Button>
                <Button variant="outline" onClick={fetchCalendars} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              </div>

              <Separator className="bg-zinc-800" />

              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Calendários</h3>
                <div className="space-y-2">
                  {calendars.map((calendar) => (
                    <div key={calendar.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50">
                      <Checkbox
                        id={`cal-${calendar.id}`}
                        checked={selectedIds.includes(calendar.id)}
                        onCheckedChange={() => handleCalendarToggle(calendar.id)}
                      />
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: calendar.backgroundColor || '#4285f4' }}
                        />
                        <label htmlFor={`cal-${calendar.id}`} className="text-sm text-zinc-300 cursor-pointer">
                          {calendar.summary}
                          {calendar.primary && (
                            <span className="ml-2 text-xs text-zinc-500">(Principal)</span>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={saveCalendarSelection} 
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                  disabled={selectedIds.length === 0}
                >
                  Salvar seleção
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Mapeamento de Janelas</CardTitle>
          <CardDescription className="text-zinc-400">
            Configure a relação entre calendário e projetos (Fase 3 em progresso)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-500 text-sm">API do Todoist configurada. UI de mapeamentos será implementada em breve.</p>
        </CardContent>
      </Card>
    </div>
  );
}
