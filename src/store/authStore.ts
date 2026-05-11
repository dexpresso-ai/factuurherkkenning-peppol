import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, AuthUser } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  expiresAt: string | null;
  isAuthenticating: boolean;
  error: string | null;

  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  hydrateFromSession: (session: AuthSession) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      expiresAt: null,
      isAuthenticating: false,
      error: null,

      signIn: async () => {
        set({ isAuthenticating: true, error: null });
        try {
          const session = await authService.signInWithMicrosoft();
          set({
            user: session.user,
            accessToken: session.accessToken,
            expiresAt: session.expiresAt,
            isAuthenticating: false,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Inloggen mislukt';
          set({ isAuthenticating: false, error: msg });
          throw e;
        }
      },

      signOut: async () => {
        await authService.signOut();
        set({ user: null, accessToken: null, expiresAt: null });
      },

      hydrateFromSession: (session: AuthSession) => {
        set({
          user: session.user,
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
        });
      },
    }),
    {
      name: 'peppol-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        expiresAt: s.expiresAt,
      }),
    },
  ),
);

export const selectIsAuthenticated = (s: AuthState) => Boolean(s.user && s.accessToken);
