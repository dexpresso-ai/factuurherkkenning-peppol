import * as React from 'react';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  FileDigit,
  Lock,
  Network,
  Sparkles,
} from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
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
    <div className="relative grid min-h-screen w-full overflow-hidden bg-background lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
      <div className="pointer-events-none absolute left-[-8rem] top-16 h-[32rem] w-[32rem] rounded-full bg-primary/14 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-10 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl animate-pulse-glow [animation-delay:1.4s]" />

      <div className="relative hidden overflow-hidden border-r border-white/10 bg-black/20 lg:block">
        <div className="absolute inset-0 soft-grid opacity-60" />
        <div className="absolute right-[-16rem] top-20 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.22),transparent_68%)] opacity-90 blur-sm" />
        <span className="brand-orbit left-[8%] top-[18%] h-[32rem] w-[32rem]" />
        <span className="brand-orbit brand-orbit--dashed left-[18%] top-[30%] h-[18rem] w-[18rem]" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12 text-white">
          <BrandMark markClassName="h-12 w-12" />

          <div className="max-w-3xl animate-fade-up">
            <div className="dx-eyebrow mb-4">Peppol Access Agent</div>
            <h1 className="gradient-text max-w-3xl text-[clamp(3rem,6vw,5.65rem)] font-extrabold leading-[0.92] tracking-[-0.07em]">
              Facturen die zichzelf klaarzetten. Met grip op elke stap.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground xl:text-lg">
              Van mailbox-chaos naar een gecontroleerde finance-flow: herkennen, valideren, verrijken en aanbieden richting Peppol. Donker, strak en gebouwd als een premium cockpit.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="dx-pill">Eigen Azure-omgeving</span>
              <span className="dx-pill">AI-herkenning</span>
              <span className="dx-pill">Audit-ready</span>
            </div>

            <div className="relative mt-10 min-h-[330px]">
              <div className="brand-panel absolute right-0 top-0 w-[min(430px,94%)] rounded-[26px] p-6">
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div>
                    <div className="dx-eyebrow text-[10px]">Live intake</div>
                    <div className="mt-3 text-4xl font-extrabold tracking-[-0.06em] text-primary">92%</div>
                    <div className="mt-1 text-sm text-muted-foreground">automatisch herkend</div>
                  </div>
                  <div className="grid h-24 w-24 place-items-center rounded-full border border-primary/35 bg-primary/10 shadow-glow">
                    <FileDigit className="h-9 w-9 text-primary" />
                  </div>
                </div>
                <div className="relative z-10 mt-6 grid gap-3">
                  <VisualRow icon={Cloud} title="Mailbox gekoppeld" detail="Microsoft 365 intake" />
                  <VisualRow icon={Sparkles} title="Azure AI leest mee" detail="Velden, validatie en confidence" />
                  <VisualRow icon={Network} title="Peppol-ready output" detail="UBL + routegegevens" />
                </div>
              </div>

              <div className="brand-panel absolute bottom-0 left-0 max-w-[280px] rounded-[22px] p-5 font-mono text-sm text-muted-foreground">
                <span className="text-primary">agent.flow</span>
                <br />
                mailbox → recognize
                <br />
                validate → peppol
                <strong className="mt-3 block text-primary">status: controlled</strong>
              </div>

              <div className="brand-panel absolute bottom-8 right-4 w-48 rounded-[22px] p-5">
                <small className="text-muted-foreground">Queue</small>
                <strong className="mt-1 block text-3xl tracking-[-0.05em] text-foreground">12</strong>
                <span className="text-xs text-muted-foreground">klaar voor controle</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/50">
            <span>© {new Date().getFullYear()} Peppol Access Agent</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_16px_hsl(var(--success))]" />
              Secure finance environment
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 text-center lg:hidden">
            <BrandMark className="justify-center" textClassName="text-left" />
          </div>

          <div className="brand-panel rounded-[30px] p-8">
            <div className="relative z-10 mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-glow">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="relative z-10 text-3xl font-extrabold tracking-[-0.05em] text-foreground">
              Welkom terug
            </h2>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground">
              Log in met je Microsoft werkaccount om de factuurflow te beheren.
            </p>

            <Button
              size="lg"
              variant="outline"
              className="relative z-10 mt-7 w-full justify-between px-5"
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
              <div className="relative z-10 mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="relative z-10 mt-7 border-t border-white/10 pt-5 text-center text-xs leading-relaxed text-muted-foreground">
              Beveiligd met Microsoft Entra ID · gebouwd voor gecontroleerde finance-processen
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

function VisualRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-foreground">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">{detail}</span>
        </span>
        <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-primary" />
      </div>
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
