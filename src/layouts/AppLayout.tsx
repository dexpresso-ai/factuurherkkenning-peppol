import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-28 top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -right-32 bottom-16 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-pulse-glow [animation-delay:1.2s]" />
      <Sidebar />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1480px] px-5 py-7 lg:px-10 lg:py-9">
            <div className="page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
