'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CalendarDays, Calendar, Settings, Menu, LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { name: 'Hoje', href: '/', icon: CalendarDays },
  { name: 'Próximos dias', href: '/upcoming', icon: Calendar },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  
  return (
    <Link href={item.href}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-3 px-3 py-2 h-10',
          isActive
            ? 'bg-zinc-800 text-zinc-100'
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{item.name}</span>
      </Button>
    </Link>
  );
}

function NavContent({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {navigation.map((item) => (
        <NavLink key={item.name} item={item} isActive={pathname === item.href} />
      ))}
    </nav>
  );
}

function Logo() {
  return (
    <div className="mb-6">
      <span className="font-mono font-bold text-lg text-zinc-100">K.E.R.N.E.L.</span>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <Sheet>
        <SheetTrigger className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-zinc-950 border-zinc-800 p-4">
          <div className="flex h-full flex-col">
            <Logo />
            <NavContent pathname={pathname} />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-4">
        <Logo />
        <NavContent pathname={pathname} />
      </aside>
    </>
  );
}
