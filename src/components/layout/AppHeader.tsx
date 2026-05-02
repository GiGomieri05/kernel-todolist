'use client';

import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Terminal, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const today = new Date();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const formattedDate = format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div 
          onClick={() => router.push('/')} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <Terminal className="h-6 w-6 text-indigo-500" />
          <span className="font-mono font-bold text-lg text-zinc-100 tracking-tight">
            K.E.R.N.E.L.
          </span>
        </div>
        <span className="text-zinc-500 text-sm hidden md:inline">
          {capitalizedDate}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="h-9 w-9 bg-indigo-600 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all">
              <AvatarFallback className="bg-indigo-600 text-white text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm text-zinc-100">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem 
              onClick={() => router.push('/settings')}
              className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
