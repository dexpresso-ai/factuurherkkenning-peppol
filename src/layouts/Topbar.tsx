import { LogOut, Search, Bell, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

export function Topbar() {
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
    <header className="relative z-20 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-background/45 px-5 backdrop-blur-2xl lg:px-8">
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Zoek facturen, leveranciers, factuurnummers…"
          className="h-11 rounded-2xl pl-11 pr-20"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-muted-foreground sm:flex">
          <Command className="h-3 w-3" /> K
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notificaties" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary))]" />
        </Button>

        <div className="ml-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 shadow-card backdrop-blur">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold leading-tight text-foreground">
              {user?.displayName ?? 'Gast'}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {user?.email ?? ''}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-soft">
            {initials}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            aria-label="Uitloggen"
            title="Uitloggen"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
