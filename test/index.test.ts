import { describe, expect, it, vi } from "vitest";
import {
  FiscalDataError,
  avgInterestRates,
  debtToPenny,
  exchangeRates,
  latestDebt,
  query,
  queryAll,
} from "../src/index.js";

function mockFetch(body: unknown, status = 200) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
}

function calledUrl(f: unknown, call = 0): string {
  return (f as ReturnType<typeof vi.fn>).mock.calls[call]![0] as string;
}

const page = (data: unknown[], totalPages = 1) => ({
  data,
  meta: { count: data.length, "total-count": data.length, "total-pages": totalPages },
  links: { self: "", first: "", prev: null, next: null, last: "" },
});

describe("URL construction", () => {
  it("query builds the fiscal_service path", async () => {
    const f = mockFetch(page([]));
    await query("v2/accounting/od/debt_to_penny", { sort: ["-record_date"], pageSize: 1 }, { fetch: f });
    expect(calledUrl(f)).toBe(
      "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page%5Bsize%5D=1",
    );
  });

  it("translates a record filter's leading operators to FiscalData syntax", async () => {
    const f = mockFetch(page([]));
    await query(
      "v2/accounting/od/debt_to_penny",
      { filter: { record_date: ">=2020-01-01", record_calendar_year: "2020" }, fields: ["record_date", "tot_pub_debt_out_amt"] },
      { fetch: f },
    );
    const url = decodeURIComponent(calledUrl(f));
    expect(url).toContain("filter=record_date:gte:2020-01-01,record_calendar_year:eq:2020");
    expect(url).toContain("fields=record_date,tot_pub_debt_out_amt");
  });

  it("supports a raw string[] filter for two conditions on one field", async () => {
    const f = mockFetch(page([]));
    await debtToPenny({ startDate: "2026-07-01", endDate: "2026-07-08" }, { fetch: f });
    const url = decodeURIComponent(calledUrl(f));
    expect(url).toContain("filter=record_date:gte:2026-07-01,record_date:lte:2026-07-08");
  });

  it("honors a custom baseUrl and an absolute path", async () => {
    const f = mockFetch(page([]));
    await query("/services/api/fiscal_service/v1/x", {}, { fetch: f, baseUrl: "https://proxy.local" });
    expect(calledUrl(f)).toBe("https://proxy.local/services/api/fiscal_service/v1/x");
  });
});

describe("convenience wrappers", () => {
  it("latestDebt sorts descending, size 1, returns the row", async () => {
    const f = mockFetch(page([{ record_date: "2026-07-09", tot_pub_debt_out_amt: "39414179016130.09" }]));
    const debt = await latestDebt({ fetch: f });
    expect(debt.tot_pub_debt_out_amt).toBe("39414179016130.09");
    expect(decodeURIComponent(calledUrl(f))).toContain("sort=-record_date");
  });

  it("latestDebt throws on empty data", async () => {
    const f = mockFetch(page([]));
    await expect(latestDebt({ fetch: f })).rejects.toBeInstanceOf(FiscalDataError);
  });

  it("avgInterestRates and exchangeRates hit their endpoints", async () => {
    const f = mockFetch(page([]));
    await avgInterestRates({ fetch: f });
    expect(calledUrl(f)).toContain("/v2/accounting/od/avg_interest_rates");
    const g = mockFetch(page([]));
    await exchangeRates({}, { fetch: g });
    expect(calledUrl(g)).toContain("/v1/accounting/od/rates_of_exchange");
  });
});

describe("queryAll pagination", () => {
  it("walks every page via total-pages", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => page([{ i: 1 }, { i: 2 }], 3) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => page([{ i: 3 }, { i: 4 }], 3) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => page([{ i: 5 }], 3) }) as unknown as typeof fetch;
    const rows: unknown[] = [];
    for await (const r of queryAll("v2/accounting/od/debt_to_penny", { pageSize: 2 }, { fetch: f })) {
      rows.push(r);
    }
    expect(rows).toHaveLength(5);
    expect((f as ReturnType<typeof vi.fn>).mock.calls.length).toBe(3);
  });
});

describe("errors and validation", () => {
  it("throws FiscalDataError with status on non-2xx", async () => {
    const f = mockFetch("bad", 500);
    await expect(query("v2/accounting/od/debt_to_penny", {}, { fetch: f })).rejects.toMatchObject({
      name: "FiscalDataError",
      status: 500,
    });
  });

  it("rejects bad page params and dates", async () => {
    const f = mockFetch(page([]));
    await expect(query("x", { pageSize: 0 }, { fetch: f })).rejects.toThrow(RangeError);
    await expect(query("x", { pageSize: 20000 }, { fetch: f })).rejects.toThrow(RangeError);
    await expect(query("x", { pageNumber: -1 }, { fetch: f })).rejects.toThrow(RangeError);
    await expect(debtToPenny({ startDate: "bad", endDate: "2026-07-08" }, { fetch: f })).rejects.toThrow(
      RangeError,
    );
  });
});
