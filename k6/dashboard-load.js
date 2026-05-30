/**
 * Load test: hubs + rooms via PostgREST (Supabase local).
 *
 * Pré-requisitos:
 * - k6 instalado no sistema (`winget install k6`)
 * - `supabase start` (API em http://127.0.0.1:54321)
 * - Preencher TEST_EMAIL / TEST_PASSWORD (mesmos valores de VITE_TEST_* no .env)
 * - Correr apenas contra Supabase local, nunca produção
 *
 * Execução: npm run test:load (ou k6 run com flags -e)
 */
/// <reference types="k6" />
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],
};

function requireEnv(name) {
  const value = __ENV[name];
  if (!value?.trim()) {
    throw new Error(`Defina ${name} via -e ${name}=... ao correr o k6.`);
  }
  return value.trim();
}

export function setup() {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const anonKey = requireEnv('SUPABASE_ANON_KEY');
  const email = requireEnv('TEST_EMAIL');
  const password = requireEnv('TEST_PASSWORD');

  const authRes = http.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email, password }),
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (authRes.status !== 200) {
    throw new Error(
      `Auth falhou (${authRes.status}): ${authRes.body}`,
    );
  }

  const body = authRes.json();
  if (!body.access_token) {
    throw new Error('Resposta de auth sem access_token.');
  }

  return { token: body.access_token };
}

export default function (data) {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const anonKey = requireEnv('SUPABASE_ANON_KEY');

  const headers = {
    Authorization: `Bearer ${data.token}`,
    apikey: anonKey,
    Accept: 'application/json',
  };

  const hubsRes = http.get(`${supabaseUrl}/rest/v1/hubs?select=*`, { headers });
  check(hubsRes, {
    'hubs status is 200': (r) => r.status === 200,
  });

  const roomsRes = http.get(`${supabaseUrl}/rest/v1/rooms?select=*`, { headers });
  check(roomsRes, {
    'rooms status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
