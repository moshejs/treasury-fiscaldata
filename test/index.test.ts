import { describe, expect, it, vi } from "vitest";
import {
  FiscalDataError,
  avgInterestRates,
  debtToPenny,
  exchangeRates,
  latestDebt,
  num,
  query,
  queryAll,
} from "../src/index.js";
import { avgRatesTop20, debt2005 } from "./fixtures.js";

const res = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
});

function mockFetch(body: unknown, status = 200) {
  return vi.fn(async () => res(body, status)) as unknown as typeof fetch;
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
    const f = mockFetch(page([{ record_date: "2026-09-30" }]));
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
      .mockResolvedValueOnce(res(page([{ i: 1 }, { i: 2 }], 3)))
      .mockResolvedValueOnce(res(page([{ i: 3 }, { i: 4 }], 3)))
      .mockResolvedValueOnce(res(page([{ i: 5 }], 3))) as unknown as typeof fetch;
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

describe("live-response fixtures", () => {
  it("avgInterestRates returns only the latest record date (old code mixed months)", async () => {
    const dates = new Set(avgRatesTop20.data.map((r) => r.record_date));
    expect(dates.size).toBeGreaterThan(1); // the naive "top N by date" query spans months
    const latest = avgRatesTop20.data[0]!.record_date;
    const f = vi
      .fn()
      .mockResolvedValueOnce(res({ ...avgRatesTop20, data: [{ record_date: latest }] }))
      .mockResolvedValueOnce(
        res({ ...avgRatesTop20, data: avgRatesTop20.data.filter((r) => r.record_date === latest) }),
      ) as unknown as typeof fetch;
    const out = await avgInterestRates({ fetch: f });
    expect(new Set(out.data.map((r) => r.record_date))).toEqual(new Set([latest]));
    expect(decodeURIComponent(calledUrl(f, 1))).toContain(`filter=record_date:eq:${latest}`);
  });

  it("avgInterestRates({ recordDate }) skips the lookup", async () => {
    const f = mockFetch(page([]));
    await avgInterestRates({ fetch: f, recordDate: "2001-01-31" });
    expect((f as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
    expect(decodeURIComponent(calledUrl(f))).toContain("filter=record_date:eq:2001-01-31");
    await expect(avgInterestRates({ fetch: f, recordDate: "2001-02-30" })).rejects.toThrow(RangeError);
  });

  it('num() maps FiscalData "null" strings to null', async () => {
    const out = await debtToPenny({ startDate: "2005-03-29", endDate: "2005-04-01" }, { fetch: mockFetch(debt2005) });
    const [mar29, , mar31] = out.data;
    expect(mar29!.record_date).toBe("2005-03-29");
    expect(mar29!.debt_held_public_amt).toBe("null");
    expect(num(mar29!.debt_held_public_amt)).toBeNull();
    expect(num(mar29!.tot_pub_debt_out_amt)).toBeTypeOf("number");
    expect(mar31!.record_date).toBe("2005-03-31");
    expect(num(mar31!.debt_held_public_amt)! + num(mar31!.intragov_hold_amt)!).toBeCloseTo(
      num(mar31!.tot_pub_debt_out_amt)!,
      2,
    );
    expect(num("3.870")).toBe(3.87);
    expect(num("")).toBeNull();
    expect(num(undefined)).toBeNull();
  });
});

describe("hardening", () => {
  it("debtToPenny fetches every page", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(res(page([{ record_date: "a" }], 2)))
      .mockResolvedValueOnce(res(page([{ record_date: "b" }], 2))) as unknown as typeof fetch;
    const out = await debtToPenny({ startDate: "1993-01-01", endDate: "2026-01-01" }, { fetch: f });
    expect(out.data.map((r) => r.record_date)).toEqual(["a", "b"]);
    expect(out.meta.count).toBe(2);
    expect(decodeURIComponent(calledUrl(f, 1))).toContain("page[number]=2");
  });

  it("array filter values become in:(...)", async () => {
    const f = mockFetch(page([]));
    await query("v1/accounting/od/rates_of_exchange", { filter: { country: ["Japan", "Mexico"] } }, { fetch: f });
    expect(decodeURIComponent(calledUrl(f))).toContain("filter=country:in:(Japan,Mexico)");
    await expect(query("x", { filter: { country: [] } }, { fetch: f })).rejects.toThrow(RangeError);
  });

  it("includes the API's error message; wraps non-JSON and wrong shapes", async () => {
    const f = mockFetch({ error: "Invalid Query Param", message: "Field 'bogus' does not exist." }, 400);
    await expect(query("x", {}, { fetch: f })).rejects.toThrow(/HTTP 400.*Field 'bogus' does not exist/);
    await expect(query("x", {}, { fetch: mockFetch("<!DOCTYPE html>", 404) })).rejects.toMatchObject({
      name: "FiscalDataError",
      status: 404,
    });
    await expect(query("x", {}, { fetch: mockFetch("<html>", 200) })).rejects.toThrow(/non-JSON/);
    await expect(query("x", {}, { fetch: mockFetch({ nope: 1 }) })).rejects.toThrow(/no data array/);
  });

  it("rejects impossible dates and reversed ranges", async () => {
    const f = mockFetch(page([]));
    await expect(debtToPenny({ startDate: "2026-02-30", endDate: "2026-03-08" }, { fetch: f })).rejects.toThrow(
      RangeError,
    );
    await expect(debtToPenny({ startDate: "2026-07-08", endDate: "2026-07-01" }, { fetch: f })).rejects.toThrow(
      /after endDate/,
    );
  });

  it("honors timeoutMs and trims a trailing baseUrl slash", async () => {
    const f = mockFetch(page([]));
    await query("v1/x", {}, { fetch: f, baseUrl: "https://proxy.local/", timeoutMs: 1000 });
    expect(calledUrl(f)).toBe("https://proxy.local/services/api/fiscal_service/v1/x");
    const hang = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal!.addEventListener("abort", () => reject(init.signal!.reason));
        }),
    ) as unknown as typeof fetch;
    await expect(query("v1/x", {}, { fetch: hang, timeoutMs: 20 })).rejects.toMatchObject({ name: "TimeoutError" });
  });
});
