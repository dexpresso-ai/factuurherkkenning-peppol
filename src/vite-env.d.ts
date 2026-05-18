/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_API_TENANT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
