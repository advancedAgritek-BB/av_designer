import { useEffect, useState, type ReactNode } from 'react';
import { Button, Card, CardBody, CardHeader } from '@/components/ui';
import { isSupabaseConfigured } from '@/lib/supabase';

type BackendGateState =
  | { status: 'checking' }
  | { status: 'ready' }
  | { status: 'error'; title: string; message: string; debug?: BackendGateDebug };

type BackendGateDebug = {
  supabaseUrl?: string;
  table?: string;
  httpStatus?: number;
  errorPayload?: unknown;
};

function isSupabaseMissingTableError(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const error = payload as { code?: string; message?: string };
  if (error.code === 'PGRST205') return true;
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  return message.includes('could not find the table') || message.includes('schema cache');
}

function isSupabaseRlsRecursionError(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const error = payload as { code?: string; message?: string };
  if (error.code === '42P17') return true;
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  return message.includes('infinite recursion') && message.includes('policy');
}

async function checkTable(
  supabaseUrl: string,
  anonKey: string,
  table: string
): Promise<{ ok: boolean; httpStatus?: number; errorPayload?: unknown }> {
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?select=*&limit=1`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (response.ok) {
    return { ok: true, httpStatus: response.status };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = await response.text().catch(() => null);
  }

  return { ok: false, httpStatus: response.status, errorPayload: payload };
}

function formatSupabaseHost(url: string | undefined) {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function BackendSetup({
  title,
  message,
  debug,
}: {
  title: string;
  message: string;
  debug?: BackendGateDebug;
}) {
  const supabaseHost = formatSupabaseHost(debug?.supabaseUrl);
  const shouldShowDebug = import.meta.env.DEV && (supabaseHost || debug?.errorPayload);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader title={title} description={message} />
        <CardBody className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              This app depends on the database schema in `supabase/migrations/`.
            </p>
            <div className="space-y-1 text-sm text-text-tertiary">
              <p className="font-medium text-text-secondary">
                Local development (recommended)
              </p>
              <pre className="bg-bg-tertiary border border-white/10 rounded-lg p-3 overflow-x-auto">
                <code>{`npm run dev`}</code>
              </pre>
              <p className="text-xs">
                `npm run dev` starts local Supabase (requires Docker Desktop) and writes
                `.env.development.local`. If Docker isn't running, it falls back to the
                remote Supabase credentials in `.env.local`.
              </p>
            </div>
            <div className="space-y-1 text-sm text-text-tertiary">
              <p className="font-medium text-text-secondary">Remote Supabase</p>
              <pre className="bg-bg-tertiary border border-white/10 rounded-lg p-3 overflow-x-auto">
                <code>{`./scripts/supabase-remote.sh\n# (prompts for DB password)\n# or:\nsupabase link --project-ref <your-project-ref> --password <db-password>\nsupabase db push --password <db-password>`}</code>
              </pre>
              <pre className="bg-bg-tertiary border border-white/10 rounded-lg p-3 overflow-x-auto">
                <code>{`npm run dev:remote\n# or:\nAV_DESIGNER_SUPABASE_MODE=remote npm run dev`}</code>
              </pre>
              <p className="text-xs">
                See `docs/SUPABASE_SETUP.md` for detailed steps and troubleshooting.
              </p>
            </div>
          </div>

          {shouldShowDebug ? (
            <div className="space-y-1 text-sm text-text-tertiary">
              <p className="font-medium text-text-secondary">Diagnostics</p>
              {supabaseHost ? (
                <p className="text-xs">
                  Supabase host:{' '}
                  <span className="text-text-secondary">{supabaseHost}</span>
                </p>
              ) : null}
              {debug?.table ? (
                <p className="text-xs">
                  Table check: <span className="text-text-secondary">{debug.table}</span>
                </p>
              ) : null}
              {typeof debug?.httpStatus === 'number' ? (
                <p className="text-xs">
                  HTTP status:{' '}
                  <span className="text-text-secondary">{debug.httpStatus}</span>
                </p>
              ) : null}
              {debug?.errorPayload ? (
                <pre className="bg-bg-tertiary border border-white/10 rounded-lg p-3 overflow-x-auto text-xs">
                  <code>{JSON.stringify(debug.errorPayload, null, 2)}</code>
                </pre>
              ) : null}
              <p className="text-xs">
                If you've already applied migrations, also confirm Supabase Dashboard →
                Settings → API → Exposed schemas includes <code>public</code>.
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Re-check backend
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export function BackendGate({ children }: { children: ReactNode }) {
  const isTestMode = import.meta.env.MODE === 'test';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const [state, setState] = useState<BackendGateState>(() =>
    isTestMode
      ? { status: 'ready' }
      : !isSupabaseConfigured
        ? {
            status: 'error',
            title: 'Supabase not configured',
            message: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue.',
          }
        : { status: 'checking' }
  );

  useEffect(() => {
    if (isTestMode) {
      return;
    }

    if (!isSupabaseConfigured) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        // Check a core table (clients) for schema existence.
        const clientsCheck = await checkTable(supabaseUrl!, anonKey!, 'clients');
        if (!clientsCheck.ok) {
          if (isSupabaseMissingTableError(clientsCheck.errorPayload)) {
            if (cancelled) return;
            setState({
              status: 'error',
              title: 'Database schema not deployed',
              message:
                'Your Supabase project is missing required tables (example: public.clients). Apply the migrations and restart.',
              debug: {
                supabaseUrl,
                table: 'clients',
                httpStatus: clientsCheck.httpStatus,
                errorPayload: clientsCheck.errorPayload,
              },
            });
            return;
          }
        }

        // Check organization_members specifically for the known RLS recursion issue.
        const orgMembersCheck = await checkTable(
          supabaseUrl!,
          anonKey!,
          'organization_members'
        );
        if (
          !orgMembersCheck.ok &&
          isSupabaseRlsRecursionError(orgMembersCheck.errorPayload)
        ) {
          if (cancelled) return;
          setState({
            status: 'error',
            title: 'Database policies misconfigured',
            message:
              'Supabase RLS policy recursion detected (organization_members). Apply the latest migrations to fix.',
            debug: {
              supabaseUrl,
              table: 'organization_members',
              httpStatus: orgMembersCheck.httpStatus,
              errorPayload: orgMembersCheck.errorPayload,
            },
          });
          return;
        }

        if (cancelled) return;
        setState({ status: 'ready' });
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : 'Unable to reach Supabase.';
        setState({
          status: 'error',
          title: 'Backend unreachable',
          message,
          debug: {
            supabaseUrl,
            errorPayload: error,
          },
        });
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [anonKey, isTestMode, supabaseUrl]);

  if (state.status === 'checking') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Checking backend...</div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <BackendSetup title={state.title} message={state.message} debug={state.debug} />
    );
  }

  return <>{children}</>;
}
