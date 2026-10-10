// Live smoke test against the real API (not run in CI — see `npm test`).
// Usage: npm run smoke
import { avgInterestRates, debtToPenny, exchangeRates, latestDebt, query } from "../dist/index.js";

const debt = await latestDebt();
console.log(`latest debt (${debt.record_date}): $${(Number(debt.tot_pub_debt_out_amt) / 1e12).toFixed(2)}T`);

const range = await debtToPenny({ startDate: "2026-07-01", endDate: "2026-07-08" });
console.log(`debt range 07-01→07-08: ${range.data.length} records`);

const rates = await avgInterestRates();
console.log(`avg interest rates (latest ${rates.data[0]?.record_date}): ${rates.data.length} rows, ${new Set(rates.data.map((r) => r.record_date)).size} date(s)`);

const fx = await exchangeRates({ pageSize: 1 });
console.log(`exchange rates: ${fx.data[0]?.country_currency_desc} = ${fx.data[0]?.exchange_rate}`);

const raw = await query("v2/accounting/od/debt_to_penny", { sort: ["-record_date"], pageSize: 3 });
console.log(`generic query: ${raw.data.length} rows, ${raw.meta["total-count"]} total available`);
console.log("SMOKE OK");
