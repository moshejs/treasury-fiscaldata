/**
 * treasury-fiscaldata — typed, zero-dependency client for the US Treasury's
 * FiscalData API (api.fiscaldata.treasury.gov).
 *
 * Debt to the Penny, average interest rates on Treasury securities, exchange
 * rates, and any other FiscalData endpoint via a generic query with typed
 * pagination, sorting, and filtering. No API key required.
 *
 * Sibling to the `treasurydirect` package — a different Treasury API with
 * different data.
 */

export interface FiscalDataOptions {
  /** Custom fetch implementation (testing, proxies). Defaults to global fetch. */
  fetch?: typeof globalThis.fetch;
  /** Base URL. Defaults to "https://api.fiscaldata.treasury.gov". */
  baseUrl?: string;
  /** Abort each request after this many milliseconds (no timeout by default). */
  timeoutMs?: number;
  /** AbortSignal to cancel the request(s). */
  signal?: AbortSignal;
}

/** FiscalData pagination metadata (returned as `meta` on every response). */
export interface FiscalDataMeta {
  count: number;
  labels: Record<string, string>;
  dataTypes: Record<string, string>;
  dataFormats: Record<string, string>;
  "total-count": number;
  "total-pages": number;
}

export interface FiscalDataResponse<T> {
  data: T[];
  meta: FiscalDataMeta;
  /** Relative query fragments, e.g. "&page%5Bnumber%5D=2&page%5Bsize%5D=100". */
  links: { self: string; first: string; prev: string | null; next: string | null; last: string };
}

export interface QueryParams {
  /** Comma-free array of fields to return (maps to the `fields` param). */
  fields?: string[];
  /**
   * Filters. Two forms:
   * - a record `{ security_type_desc: "Marketable", record_date: ">=2020-01-01" }`
   *   — bare value means equality; a leading operator (`>=`, `<=`, `>`, `<`, `=`)
   *   is translated; an array value means "any of" (`in`). One condition per field.
   * - a string array of raw FiscalData conditions
   *   `["record_date:gte:2020-01-01", "record_date:lte:2020-12-31"]` — use this
   *   when you need two conditions on the same field (e.g. a date range).
   */
  filter?: Record<string, string | string[]> | string[];
  /** Sort fields; prefix with "-" for descending, e.g. ["-record_date"]. */
  sort?: string[];
  /** 1-based page number. */
  pageNumber?: number;
  /** Page size (FiscalData max 10000). */
  pageSize?: number;
}

/**
 * Thrown for non-2xx responses (with the API's own explanation appended when
 * it sends one, e.g. "Field 'bogus' does not exist") and for non-JSON bodies.
 */
export class FiscalDataError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string, message?: string) {
    super(message ?? `FiscalData request failed with HTTP ${status}: ${url}`);
    this.name = "FiscalDataError";
    this.status = status;
    this.url = url;
  }
}

/**
 * Convert a FiscalData value to a number. FiscalData returns every value as a
 * string and missing values as the string "null": `num("3.870")` → 3.87,
 * `num("null")` → null, `num("")` → null.
 */
export function num(value: string | null | undefined): number | null {
  if (value === undefined || value === null) return null;
  const v = value.trim();
  if (v === "" || v === "null") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const DEFAULT_BASE = "https://api.fiscaldata.treasury.gov";
const API_PREFIX = "/services/api/fiscal_service/";

function buildQuery(params: QueryParams): string {
  const sp = new URLSearchParams();
  if (params.fields && params.fields.length) sp.set("fields", params.fields.join(","));
  if (params.filter) {
    let parts: string[];
    if (Array.isArray(params.filter)) {
      parts = params.filter; // raw conditions, already field:op:value
    } else {
      parts = Object.entries(params.filter).map(([field, expr]) => {
        if (Array.isArray(expr)) {
          if (!expr.length) throw new RangeError(`filter for "${field}" is an empty array`);
          return `${field}:in:(${expr.join(",")})`;
        }
        const m = /^(>=|<=|>|<|=)(.*)$/.exec(expr);
        const opMap: Record<string, string> = {
          ">=": "gte",
          "<=": "lte",
          ">": "gt",
          "<": "lt",
          "=": "eq",
        };
        return m ? `${field}:${opMap[m[1]!]}:${m[2]}` : `${field}:eq:${expr}`;
      });
    }
    sp.set("filter", parts.join(","));
  }
  if (params.sort && params.sort.length) sp.set("sort", params.sort.join(","));
  if (params.pageSize !== undefined) {
    if (!Number.isInteger(params.pageSize) || params.pageSize <= 0 || params.pageSize > 10000) {
      throw new RangeError(`pageSize must be an integer in 1–10000, got ${params.pageSize}`);
    }
    sp.set("page[size]", String(params.pageSize));
  }
  if (params.pageNumber !== undefined) {
    if (!Number.isInteger(params.pageNumber) || params.pageNumber <= 0) {
      throw new RangeError(`pageNumber must be a positive integer, got ${params.pageNumber}`);
    }
    sp.set("page[number]", String(params.pageNumber));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function request<T>(
  endpoint: string,
  params: QueryParams,
  opts: FiscalDataOptions,
): Promise<FiscalDataResponse<T>> {
  const doFetch = opts.fetch ?? globalThis.fetch;
  const base = (opts.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : API_PREFIX + endpoint;
  const url = base + path + buildQuery(params);
  const res = await doFetch(url, {
    headers: { accept: "application/json" },
    signal: signalFor(opts),
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    if (!res.ok) throw new FiscalDataError(res.status, url);
    throw new FiscalDataError(
      res.status,
      url,
      `FiscalData returned a non-JSON response (HTTP ${res.status}): ${url}`,
    );
  }
  if (!res.ok) {
    const msg = (body as { message?: unknown } | null)?.message;
    throw new FiscalDataError(
      res.status,
      url,
      `FiscalData request failed with HTTP ${res.status}: ${url}` +
        (typeof msg === "string" ? ` — ${msg}` : ""),
    );
  }
  const data = (body as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) {
    throw new FiscalDataError(res.status, url, `Unexpected FiscalData response shape (no data array): ${url}`);
  }
  return body as FiscalDataResponse<T>;
}

function signalFor(opts: FiscalDataOptions): AbortSignal | undefined {
  const { signal, timeoutMs } = opts;
  if (timeoutMs === undefined) return signal;
  if (!(timeoutMs > 0)) throw new RangeError(`timeoutMs must be > 0, got ${timeoutMs}`);
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!signal) return timeout;
  // AbortSignal.any is Node 20+; combine by hand for Node 18.
  const ctrl = new AbortController();
  const abort = (s: AbortSignal) => () => ctrl.abort(s.reason);
  if (signal.aborted) ctrl.abort(signal.reason);
  signal.addEventListener("abort", abort(signal), { once: true });
  timeout.addEventListener("abort", abort(timeout), { once: true });
  return ctrl.signal;
}

/** Fetch every page of a query and concatenate the rows into one response. */
async function requestAllPages<T>(
  endpoint: string,
  params: QueryParams,
  opts: FiscalDataOptions,
): Promise<FiscalDataResponse<T>> {
  const first = await request<T>(endpoint, { ...params, pageNumber: 1 }, opts);
  const data = [...first.data];
  for (let page = 2; page <= first.meta["total-pages"]; page++) {
    const res = await request<T>(endpoint, { ...params, pageNumber: page }, opts);
    data.push(...res.data);
  }
  return { ...first, data, meta: { ...first.meta, count: data.length } };
}

/**
 * Query any FiscalData endpoint (path after
 * `/services/api/fiscal_service/`, e.g. `"v2/accounting/od/debt_to_penny"`).
 *
 * ```ts
 * const res = await query("v2/accounting/od/debt_to_penny", {
 *   sort: ["-record_date"],
 *   pageSize: 1,
 * });
 * res.data[0].tot_pub_debt_out_amt;
 * ```
 */
export function query<T = Record<string, string>>(
  endpoint: string,
  params: QueryParams = {},
  opts: FiscalDataOptions = {},
): Promise<FiscalDataResponse<T>> {
  return request<T>(endpoint, params, opts);
}

/**
 * Iterate every page of an endpoint, yielding rows. Follows `links.next`
 * until exhausted. Beware unbounded endpoints — narrow with `filter` first.
 */
export async function* queryAll<T = Record<string, string>>(
  endpoint: string,
  params: QueryParams = {},
  opts: FiscalDataOptions = {},
): AsyncGenerator<T, void, unknown> {
  let page = params.pageNumber ?? 1;
  const size = params.pageSize ?? 1000;
  for (;;) {
    const res = await request<T>(endpoint, { ...params, pageNumber: page, pageSize: size }, opts);
    for (const row of res.data) yield row;
    if (page >= res.meta["total-pages"] || res.data.length === 0) return;
    page++;
  }
}

// ---------------------------------------------------------------------------
// Convenience wrappers for popular endpoints
// ---------------------------------------------------------------------------

export interface DebtToPennyRow {
  record_date: string;
  debt_held_public_amt: string;
  intragov_hold_amt: string;
  tot_pub_debt_out_amt: string;
  [field: string]: string;
}

/** The latest Debt to the Penny record. */
export async function latestDebt(opts: FiscalDataOptions = {}): Promise<DebtToPennyRow> {
  const res = await request<DebtToPennyRow>(
    "v2/accounting/od/debt_to_penny",
    { sort: ["-record_date"], pageSize: 1 },
    opts,
  );
  if (!res.data.length) throw new FiscalDataError(204, "debt_to_penny (empty)");
  return res.data[0]!;
}

/**
 * Debt to the Penny over a date range (inclusive), oldest first. Every page
 * is fetched, so `data` holds the whole range. Before 2005-03-31 only the
 * total was published: `debt_held_public_amt` and `intragov_hold_amt` are
 * the string "null" (use {@link num}).
 */
export async function debtToPenny(
  range: { startDate: string; endDate: string },
  opts: FiscalDataOptions = {},
): Promise<FiscalDataResponse<DebtToPennyRow>> {
  checkDate(range.startDate, "startDate");
  checkDate(range.endDate, "endDate");
  if (range.startDate > range.endDate) {
    throw new RangeError(`startDate ${range.startDate} is after endDate ${range.endDate}`);
  }
  return requestAllPages<DebtToPennyRow>(
    "v2/accounting/od/debt_to_penny",
    {
      filter: [`record_date:gte:${range.startDate}`, `record_date:lte:${range.endDate}`],
      sort: ["record_date"],
      pageSize: 10000,
    },
    opts,
  );
}

export interface AvgInterestRateRow {
  record_date: string;
  security_type_desc: string;
  security_desc: string;
  avg_interest_rate_amt: string;
  [field: string]: string;
}

/**
 * Average interest rates on Treasury securities for the latest record date
 * (monthly; one row per security type, in source line order). Pass
 * `recordDate` ("YYYY-MM-DD", a month-end) for a specific month instead.
 */
export async function avgInterestRates(
  opts: FiscalDataOptions & { recordDate?: string } = {},
): Promise<FiscalDataResponse<AvgInterestRateRow>> {
  const endpoint = "v2/accounting/od/avg_interest_rates";
  let date = opts.recordDate;
  if (date !== undefined) {
    checkDate(date, "recordDate");
  } else {
    const latest = await request<AvgInterestRateRow>(
      endpoint,
      { fields: ["record_date"], sort: ["-record_date"], pageSize: 1 },
      opts,
    );
    if (!latest.data.length) throw new FiscalDataError(204, endpoint, "avg_interest_rates returned no rows");
    date = latest.data[0]!.record_date;
  }
  return request<AvgInterestRateRow>(
    endpoint,
    { filter: [`record_date:eq:${date}`], sort: ["src_line_nbr"], pageSize: 10000 },
    opts,
  );
}

export interface ExchangeRateRow {
  record_date: string;
  country: string;
  currency: string;
  country_currency_desc: string;
  exchange_rate: string;
  effective_date: string;
  [field: string]: string;
}

/**
 * Treasury reporting rates of exchange (quarterly, ~165 currencies per
 * quarter), most recent first. The default page of 100 is therefore a partial
 * quarter; filter on `record_date` or raise `pageSize` for a full set.
 */
export function exchangeRates(
  params: QueryParams = {},
  opts: FiscalDataOptions = {},
): Promise<FiscalDataResponse<ExchangeRateRow>> {
  return request<ExchangeRateRow>(
    "v1/accounting/od/rates_of_exchange",
    { sort: ["-record_date"], pageSize: 100, ...params },
    opts,
  );
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function checkDate(d: string, label: string): void {
  const ok =
    typeof d === "string" &&
    ISO_DATE_RE.test(d) &&
    new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
  if (!ok) throw new RangeError(`Invalid ${label}: "${d}" (expected a real YYYY-MM-DD date)`);
}
