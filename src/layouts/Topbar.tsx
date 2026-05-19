import { LogOut, Search, Bell, Command, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

interface TopbarProps {
  onOpenSidebar?: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??';

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b0b]/78 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Menu openen"
            onClick={onOpenSidebar}
            className="shrink-0 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <BrandMark compact className="sm:hidden" markClassName="h-9 w-9" />

          <div className="relative hidden max-w-lg flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Zoek facturen, leveranciers, factuurnummers…"
              className="h-10 rounded-full pl-10 pr-20 text-sm"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/[0.045] px-2 py-1 text-[10px] font-semibold text-muted-foreground md:flex">
              <Command className="h-3 w-3" /> K
            </div>
          </div>

          <div className="hidden min-w-0 sm:block">
            <div className="dx-eyebrow text-[10px]">Finance intake</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notificaties" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary))]" />
          </Button>

          <div className="ml-0 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5 shadow-card backdrop-blur sm:gap-3 sm:px-2.5">
            <div className="hidden text-right md:block">
              <div className="text-[13px] font-semibold leading-tight text-foreground">
                {user?.displayName ?? 'Gast'}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {user?.email ?? ''}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 bg-primary text-xs font-bold text-primary-foreground shadow-soft">
              {initials}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="Uitloggen"
              title="Uitloggen"
              className="hidden sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
