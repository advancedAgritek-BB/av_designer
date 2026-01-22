export type SupabaseEnvInfo = {
  url: string | null;
  host: string | null;
  isLocal: boolean;
  mailpitUrl: string | null;
};

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '0.0.0.0'
  );
}

export function getSupabaseEnvInfo(): SupabaseEnvInfo {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? null;
  const mailpitUrl =
    (import.meta.env.VITE_SUPABASE_MAILPIT_URL as string | undefined) ?? null;

  if (!url) {
    return { url: null, host: null, isLocal: false, mailpitUrl };
  }

  try {
    const parsed = new URL(url);
    return {
      url,
      host: parsed.host,
      isLocal: isLocalHostname(parsed.hostname),
      mailpitUrl,
    };
  } catch {
    return { url, host: null, isLocal: false, mailpitUrl };
  }
}
