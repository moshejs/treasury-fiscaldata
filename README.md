# treasury-fiscaldata

Typed, zero-dependency client for the **US Treasury [FiscalData API](https://fiscaldata.treasury.gov/)** — Debt to the Penny, average interest rates on Treasury securities, exchange rates, and every other endpoint, with typed pagination, sorting, and filtering. **No API key required.**

```
npm install treasury-fiscaldata
```

## Why

FiscalData is the Treasury's clean, documented API for federal financial data — the national debt to the penny, what the government pays on its securities, official exchange rates, daily Treasury statements, and much more. It's free and keyless, but its filter/pagination syntax (`filter=record_date:gte:2020-01-01`, `page[size]=…`) is fiddly to hand-build. This wraps it with a typed query, convenience methods for the popular endpoints, and an async paginator.

This is the sibling of [`treasurydirect`](https://github.com/moshejs/treasurydirect) — a *different* Treasury API. TreasuryDirect is auctions and securities; FiscalData is accounting and debt.

```ts
import { latestDebt, debtToPenny, avgInterestRates, query } from "treasury-fiscaldata";

const debt = await latestDebt();
Number(debt.tot_pub_debt_out_amt);  // 39_414_179_016_130.09

// A date range, with the two-condition filter handled for you:
const history = await debtToPenny({ startDate: "2026-07-01", endDate: "2026-07-08" });

// Any endpoint, fully typed pagination/sort/filter:
const rates = await query("v2/accounting/od/avg_interest_rates", {
  filter: { security_type_desc: "Marketable", record_date: ">=2026-01-01" },
  sort: ["-record_date"],
  pageSize: 100,
});
```

## API

Every function takes an optional final `options`: `{ fetch?, baseUrl? }` (inject `fetch` for tests/proxies).

- **`query(endpoint, params?)`** — any endpoint (path after `/services/api/fiscal_service/`). `params`: `fields`, `filter`, `sort`, `pageNumber`, `pageSize`. Returns `{ data, meta, links }`.
- **`queryAll(endpoint, params?)`** — async generator that follows pagination and yields every row. Narrow with `filter` first — some endpoints have millions of rows.
- **`latestDebt()`** / **`debtToPenny({ startDate, endDate })`** — Debt to the Penny.
- **`avgInterestRates()`** — average interest rates on Treasury securities.
- **`exchangeRates(params?)`** — Treasury reporting rates of exchange.

**Filters** come in two forms: a record `{ field: ">=value" }` (leading operators `>= <= > < =` are translated; bare value means equality — one condition per field), or a raw string array `["record_date:gte:2020-01-01", "record_date:lte:2020-12-31"]` when you need two conditions on one field. Failures throw `FiscalDataError` with `status` and `url`.

The mocked test suite runs offline; `npm run smoke` exercises the live API.

## Related

Sibling to [`treasurydirect`](https://github.com/moshejs/treasurydirect). Part of a fixed-income toolkit: [`newyorkfed`](https://github.com/moshejs/newyorkfed) · [`tbill`](https://github.com/moshejs/tbill) · [`tips-index-ratio`](https://github.com/moshejs/tips-index-ratio) · [`compounded-sofr`](https://github.com/moshejs/compounded-sofr) · [`day-count`](https://github.com/moshejs/day-count) · [`accrued-interest`](https://github.com/moshejs/accrued-interest) · [`32nds`](https://github.com/moshejs/32nds) · [`sifma-holidays`](https://github.com/moshejs/sifma-holidays) · [`instrument-identifiers`](https://github.com/moshejs/instrument-identifiers).

## Author

Built by **[Moshe Malka](https://moshemalka.com)** — engineering leader in New York City. Studio work at [Quentin.Code](https://www.quentin.software/).

MIT © Moshe Malka
