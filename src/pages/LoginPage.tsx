import * as React from 'react';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Cloud, Sparkles, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, selectIsAuthenticated } from '@/store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const signIn = useAuthStore((s) => s.signIn);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  const error = useAuthStore((s) => s.error);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSignIn = async () => {
    try {
      await signIn();
      navigate('/', { replace: true });
    } catch {
      /* error already in store */
    }
  };

  return (
    <div className="relative grid min-h-screen w-full overflow-hidden bg-background lg:grid-cols-[1fr_minmax(440px,520px)]">
      <div className="pointer-events-none absolute left-10 top-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-pulse-glow [animation-delay:1.4s]" />

      <div className="relative hidden overflow-hidden border-r border-white/10 bg-black/20 lg:block">
        <div className="absolute inset-0 soft-grid opacity-70" />
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-primary/25 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-12 h-72 w-72 rounded-full bg-accent/25 blur-3xl animate-float [animation-delay:1.5s]" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
              <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor">
                <path d="M9 9h7.5a4.5 4.5 0 0 1 0 9H13v5h-4V9Zm4 3v3h3.5a1.5 1.5 0 0 0 0-3H13Z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Peppol Invoice Agent</div>
              <div className="mt-0.5 text-xs text-white/55">AI-native invoice operations</div>
            </div>
          </div>

          <div className="max-w-2xl animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3 w-3" />
              Dark pilot experience
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
              Facturen verwerken met een interface die voelt als controlekamer.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/68">
              Van mailbox naar extractie, validatie, UBL en Peppol-status. Eén rustige dark cockpit voor finance teams die snelheid én grip willen.
            </p>

            <div className="mt-9 grid max-w-2xl gap-4 xl:grid-cols-3">
              <Feature
                Icon={Cloud}
                title="Azure-first"
                description="Opslag en verwerking in de eigen tenant."
              />
              <Feature
                Icon={ShieldCheck}
                title="Governance"
                description="Audit trail, validaties en statuslogging."
              />
              <Feature
                Icon={Activity}
                title="Realtime flow"
                description="Van intake tot verzending visueel inzichtelijk."
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/50">
            <span>© {new Date().getFullYear()} Acme Holding</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_16px_hsl(var(--success))]" />
              Secure pilot environment
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
              <svg viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor">
                <path d="M9 9h7.5a4.5 4.5 0 0 1 0 9H13v5h-4V9Zm4 3v3h3.5a1.5 1.5 0 0 0 0-3H13Z" />
              </svg>
            </div>
            <h2 className="gradient-text text-2xl font-semibold tracking-tight">Peppol Invoice Agent</h2>
          </div>

          <div className="glass-panel rounded-3xl p-8">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Welkom terug
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Log in met uw Microsoft werkaccount om de factuurstroom te beheren.
            </p>

            <Button
              size="lg"
              variant="outline"
              className="mt-7 w-full justify-between px-5"
              onClick={handleSignIn}
              disabled={isAuthenticating}
            >
              <span className="flex items-center gap-2">
                <MicrosoftLogo className="h-4 w-4" />
                {isAuthenticating
                  ? 'Doorverwijzen naar Microsoft…'
                  : 'Inloggen met Microsoft'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            {error && (
              <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mt-7 border-t border-white/10 pt-5 text-center text-xs leading-relaxed text-muted-foreground">
              Beveiligd met Microsoft Entra ID · Multi-tenant voorbereid
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            Door in te loggen accepteert u onze{' '}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href="#">
              voorwaarden
            </a>{' '}
            en{' '}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href="#">
              privacyverklaring
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  Icon,
  title,
  description,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-card backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/25">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-white/62">{description}</div>
    </div>
  );
}

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 23 23" className={className} aria-hidden>
      <rect width="10" height="10" x="1" y="1" fill="#F25022" />
      <rect width="10" height="10" x="12" y="1" fill="#7FBA00" />
      <rect width="10" height="10" x="1" y="12" fill="#00A4EF" />
      <rect width="10" height="10" x="12" y="12" fill="#FFB900" />
    </svg>
  );
}
