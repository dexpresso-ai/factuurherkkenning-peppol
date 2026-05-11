export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  tenantId: string;
  roles: string[];
}

export interface AuthSession {
  user: AuthUser;
  /** Mock token — in productie komt dit van MSAL / Entra ID. */
  accessToken: string;
  expiresAt: string;
}
