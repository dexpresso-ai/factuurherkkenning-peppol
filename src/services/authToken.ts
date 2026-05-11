/**
 * Central token accessor for backend API calls.
 *
 * Current demo reads the persisted Zustand mock token. In production this is the
 * single place to replace with MSAL's acquireTokenSilent() result for the API
 * scope, e.g. api://<api-client-id>/access_as_user.
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('peppol-auth');
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      state?: {
        accessToken?: string | null;
        expiresAt?: string | null;
      };
    };

    const token = parsed.state?.accessToken ?? null;
    const expiresAt = parsed.state?.expiresAt;

    if (!token) return null;
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return null;

    return token;
  } catch {
    return null;
  }
}
