type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

const serverUserAgent = "BagsSignal-server/1.0";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  return url.replace(/\/$/, "");
}

function getSupabaseSecretKey() {
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not configured");
  return key;
}

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SECRET_KEY?.trim());
}

export async function supabaseRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const key = getSupabaseSecretKey();
  const response = await fetch(`${getSupabaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      "user-agent": serverUserAgent,
      ...(options.headers ?? {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase request failed (${response.status}): ${body || response.statusText}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function supabaseSelect<T>(table: string, query: string) {
  return supabaseRequest<T[]>(`/rest/v1/${table}?${query}`);
}

export async function supabaseInsert<T extends object>(table: string, rows: T | T[]) {
  return supabaseRequest(`/rest/v1/${table}`, {
    method: "POST",
    body: rows,
    headers: {
      Prefer: "return=minimal"
    }
  });
}

export async function supabaseUpsert<T extends object>(table: string, rows: T[], onConflict: string) {
  if (rows.length === 0) return;

  for (const chunk of chunkRows(rows, 100)) {
    await supabaseRequest(`/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
      method: "POST",
      body: chunk,
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal"
      }
    });
  }
}

export async function supabaseDeleteWhere(table: string, filter: string) {
  await supabaseRequest(`/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal"
    }
  });
}

export async function supabaseCount(table: string) {
  const key = getSupabaseSecretKey();
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}?select=*&limit=1`, {
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "user-agent": serverUserAgent,
      Prefer: "count=exact"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase count failed (${response.status}): ${body || response.statusText}`);
  }

  const range = response.headers.get("content-range");
  const total = range?.split("/")[1];
  return total ? Number(total) : 0;
}

function chunkRows<T>(rows: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}
