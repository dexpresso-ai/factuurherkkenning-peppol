import type { AuthSession } from '@/types';
import { apiCall } from './api/apiClient';

/**
 * Auth service.
 *
 * In productie wordt dit vervangen door MSAL.js (Entra ID).
 * De public surface (`signIn`, `signOut`, `getSession`) blijft hetzelfde.
 */
export const authService = {
  async signInWithMicrosoft(): Promise<AuthSession> {
    return apiCall(
      '/api/auth/microsoft',
      () => ({
        user: {
          id: 'usr-001',
          email: 'janneke.devries@acme-holding.nl',
          displayName: 'Janneke de Vries',
          tenantId: '00000000-1111-2222-3333-444444444444',
          roles: ['admin', 'invoice_manager'],
        },
        accessToken: 'mock-token-' + Math.random().toString(36).slice(2),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      }),
      { method: 'POST' },
      { delay: [600, 1000] },
    );
  },

  async signOut(): Promise<void> {
    return apiCall('/api/auth/signout', () => undefined, { method: 'POST' });
  },
};
