/**
 * Centrale API client.
 *
 * In de demo doet `apiCall` niets meer dan een delay simuleren rond een
 * mock-functie. Wanneer een echte backend gekoppeld wordt, is deze module
 * de enige plek die hoeft te wijzigen:
 *
 *   1. Zet USE_MOCK = false (of via VITE_USE_MOCK env var).
 *   2. Implementeer `httpRequest` met fetch/axios tegen de echte .NET API.
 *   3. De services blijven hetzelfde — zij roepen alleen `apiCall` aan.
 *
 * Voordelen:
 *   - Eén plek voor auth headers, error mapping, retries.
 *   - Services hoeven niet te weten of er mock of echt is.
 *   - Type-safety blijft 1-op-1 gelijk.
 */

import type { ApiError } from '@/types';
import { getAccessToken } from '@/services/authToken';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.peppol.local';

export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? 'true').toString() === 'true';

/** Custom error class voor consistente foutafhandeling. */
export class PeppolApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(error: ApiError, status = 500) {
    super(error.message);
    this.name = 'PeppolApiError';
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}

/* ------------------------------------------------------------------ */
/*  Mock helper — simuleert netwerk-latency en foutkans                */
/* ------------------------------------------------------------------ */

interface MockOptions {
  /** Latency-range in ms */
  delay?: [number, number];
  /** Kans op simulated error (0..1) */
  errorRate?: number;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateNetwork(opts: MockOptions = {}) {
  const [min, max] = opts.delay ?? [180, 480];
  await new Promise((r) => setTimeout(r, randomBetween(min, max)));
  if (opts.errorRate && Math.random() < opts.errorRate) {
    throw new PeppolApiError(
      { code: 'MOCK_NETWORK_ERROR', message: 'Gesimuleerde netwerkfout.' },
      503,
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Public — alle services gebruiken deze                              */
/* ------------------------------------------------------------------ */

export async function apiCall<T>(
  /** Logische endpoint (alleen voor logging in mock-modus) */
  endpoint: string,
  /** Functie die een mock-resultaat oplevert (in mock-modus). */
  mockFn: () => T | Promise<T>,
  /** Pad/HTTP-config voor echte backend. */
  realConfig?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: Record<string, string | number | boolean | null | undefined>;
  },
  mockOptions?: MockOptions,
): Promise<T> {
  if (USE_MOCK) {
    if (import.meta.env.DEV) {
      console.debug(`[mock-api] ${realConfig?.method ?? 'GET'} ${endpoint}`);
    }
    await simulateNetwork(mockOptions);
    return mockFn();
  }

  // TODO: Real backend implementation.
  return httpRequest<T>(endpoint, realConfig);
}

/**
 * Echte HTTP-implementatie. Wordt pas gebruikt zodra USE_MOCK = false.
 * Auth-token wordt opgehaald uit de auth store.
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): string {
  const base = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (!params) return base;

  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function httpRequest<T>(
  endpoint: string,
  config: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | number | boolean | null | undefined>;
  } = {},
): Promise<T> {
  const url = buildUrl(endpoint, config.params);

  const token = await getAccessToken();

  const res = await fetch(url, {
    method: config.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
  });

  if (!res.ok) {
    let payload: ApiError = {
      code: `HTTP_${res.status}`,
      message: res.statusText,
    };
    try {
      payload = (await res.json()) as ApiError;
    } catch {
      /* keep default */
    }
    throw new PeppolApiError(payload, res.status);
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}
