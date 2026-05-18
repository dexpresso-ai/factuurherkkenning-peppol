/**
 * Centrale API client.
 *
 * De frontend is API-ready:
 * - Mockmodus blijft beschikbaar voor demo's (`VITE_USE_MOCK=true`).
 * - Realmodus gebruikt fetch tegen de Azure/.NET API (`VITE_USE_MOCK=false`).
 * - Auth, correlation-id, timeout, tenant header en foutmapping zitten op één plek.
 * - Services hoeven niet te weten of de data uit mocks of uit Azure komt.
 */

import type { ApiError } from '@/types';
import { getAccessToken } from '@/services/authToken';

const DEFAULT_API_BASE_URL = 'https://api.peppol.local';
const DEFAULT_TIMEOUT_MS = 30_000;

function readEnvString(key: string, fallback = ''): string {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

function readEnvBoolean(key: string, fallback: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).trim().toLowerCase() === 'true';
}

function readEnvNumber(key: string, fallback: number): number {
  const parsed = Number.parseInt(String(import.meta.env[key] ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const API_BASE_URL = readEnvString('VITE_API_BASE_URL', DEFAULT_API_BASE_URL);
export const USE_MOCK = readEnvBoolean('VITE_USE_MOCK', true);
export const API_TIMEOUT_MS = readEnvNumber('VITE_API_TIMEOUT_MS', DEFAULT_TIMEOUT_MS);
export const API_TENANT_ID = readEnvString('VITE_API_TENANT_ID');

/** Custom error class voor consistente foutafhandeling. */
export class PeppolApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;
  correlationId?: string;

  constructor(error: ApiError, status = 500, correlationId?: string | null) {
    super(error.message);
    this.name = 'PeppolApiError';
    this.status = status;
    this.code = error.code;
    this.details = error.details;
    this.correlationId = correlationId ?? undefined;
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

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  /** Override per endpoint, bijv. voor grotere PDF/UBL acties. */
  timeoutMs?: number;
}

export async function apiCall<T>(
  /** Logische endpoint (alleen voor logging in mock-modus) */
  endpoint: string,
  /** Functie die een mock-resultaat oplevert (in mock-modus). */
  mockFn: () => T | Promise<T>,
  /** Pad/HTTP-config voor echte backend. */
  realConfig?: ApiRequestConfig,
  mockOptions?: MockOptions,
): Promise<T> {
  if (USE_MOCK) {
    if (import.meta.env.DEV) {
      console.debug(`[mock-api] ${realConfig?.method ?? 'GET'} ${endpoint}`);
    }
    await simulateNetwork(mockOptions);
    return mockFn();
  }

  return httpRequest<T>(endpoint, realConfig);
}

/**
 * Echte HTTP-implementatie. Wordt gebruikt zodra USE_MOCK = false.
 * Auth-token wordt opgehaald uit de auth store; later te vervangen door MSAL.
 */
function getRuntimeOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost';
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): string {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = endpoint.startsWith('http') ? endpoint : `${normalizedBase}${normalizedEndpoint}`;

  const url = new URL(base, getRuntimeOrigin());
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function createCorrelationId(): string {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getResponseCorrelationId(res: Response, fallback: string): string {
  return (
    res.headers.get('x-correlation-id') ||
    res.headers.get('x-request-id') ||
    res.headers.get('traceparent') ||
    fallback
  );
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

async function parseApiError(res: Response): Promise<ApiError> {
  try {
    const payload = asRecord(await res.json()) ?? {};
    const details: Record<string, unknown> = {};

    if (asRecord(payload.details)) {
      Object.assign(details, payload.details);
    }
    if (payload.errors !== undefined) details.errors = payload.errors;
    if (payload.traceId !== undefined) details.traceId = payload.traceId;
    if (payload.type !== undefined) details.type = payload.type;

    const message =
      typeof payload.message === 'string'
        ? payload.message
        : typeof payload.detail === 'string'
          ? payload.detail
          : typeof payload.title === 'string'
            ? payload.title
            : res.statusText || 'Onbekende API-fout';

    return {
      code: typeof payload.code === 'string' ? payload.code : `HTTP_${res.status}`,
      message,
      details: Object.keys(details).length > 0 ? details : undefined,
    };
  } catch {
    return {
      code: `HTTP_${res.status}`,
      message: res.statusText || 'Onbekende API-fout',
    };
  }
}

async function httpRequest<T>(
  endpoint: string,
  config: ApiRequestConfig = {},
): Promise<T> {
  const url = buildUrl(endpoint, config.params);
  const token = await getAccessToken();
  const correlationId = createCorrelationId();
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    config.timeoutMs ?? API_TIMEOUT_MS,
  );

  const hasJsonBody = config.body !== undefined;

  try {
    const res = await fetch(url, {
      method: config.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
        'X-Correlation-ID': correlationId,
        ...(API_TENANT_ID ? { 'X-Tenant-ID': API_TENANT_ID } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(config.headers ?? {}),
      },
      body: hasJsonBody ? JSON.stringify(config.body) : undefined,
      signal: controller.signal,
    });

    const responseCorrelationId = getResponseCorrelationId(res, correlationId);

    if (!res.ok) {
      throw new PeppolApiError(
        await parseApiError(res),
        res.status,
        responseCorrelationId,
      );
    }

    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof PeppolApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new PeppolApiError(
        {
          code: 'API_TIMEOUT',
          message: 'De API-aanroep duurde te lang en is afgebroken.',
        },
        408,
        correlationId,
      );
    }
    throw new PeppolApiError(
      {
        code: 'API_NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Netwerkfout richting API.',
      },
      0,
      correlationId,
    );
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
