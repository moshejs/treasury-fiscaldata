// Responses from the live FiscalData API (api.fiscaldata.treasury.gov), fetched
// 2026-10-10. meta trimmed to count/total-count/total-pages; data verbatim.
//   avgRatesTop20 — v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=20
//                   (spans two record dates: what the old avgInterestRates() returned)
//   debt2005      — v2/accounting/od/debt_to_penny, 2005-03-29..2005-04-01
//                   ("null" split before 2005-03-31)
export const avgRatesTop20 = {
  "data": [
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Bills",
      "avg_interest_rate_amt": "3.870",
      "src_line_nbr": "1",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Notes",
      "avg_interest_rate_amt": "3.383",
      "src_line_nbr": "2",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Bonds",
      "avg_interest_rate_amt": "3.466",
      "src_line_nbr": "3",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Inflation-Protected Securities (TIPS)",
      "avg_interest_rate_amt": "1.149",
      "src_line_nbr": "4",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Floating Rate Notes (FRN)",
      "avg_interest_rate_amt": "4.141",
      "src_line_nbr": "5",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Marketable",
      "security_desc": "Federal Financing Bank",
      "avg_interest_rate_amt": "2.383",
      "src_line_nbr": "6",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Marketable",
      "security_desc": "Total Marketable",
      "avg_interest_rate_amt": "3.518",
      "src_line_nbr": "7",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Non-marketable",
      "security_desc": "Domestic Series",
      "avg_interest_rate_amt": "7.577",
      "src_line_nbr": "8",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Non-marketable",
      "security_desc": "Special Purpose Vehicle",
      "avg_interest_rate_amt": "3.189",
      "src_line_nbr": "9",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Non-marketable",
      "security_desc": "State and Local Government Series",
      "avg_interest_rate_amt": "3.459",
      "src_line_nbr": "10",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Non-marketable",
      "security_desc": "United States Savings Securities",
      "avg_interest_rate_amt": "3.138",
      "src_line_nbr": "11",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Non-marketable",
      "security_desc": "United States Savings Inflation Securities",
      "avg_interest_rate_amt": "4.527",
      "src_line_nbr": "12",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Non-marketable",
      "security_desc": "Government Account Series",
      "avg_interest_rate_amt": "3.590",
      "src_line_nbr": "13",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Non-marketable",
      "security_desc": "Government Account Series Inflation Securities",
      "avg_interest_rate_amt": "1.392",
      "src_line_nbr": "14",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Non-marketable",
      "security_desc": "Total Non-marketable",
      "avg_interest_rate_amt": "3.592",
      "src_line_nbr": "15",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-09-30",
      "security_type_desc": "Interest-bearing Debt",
      "security_desc": "Total Interest-bearing Debt",
      "avg_interest_rate_amt": "3.531",
      "src_line_nbr": "16",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "09",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2026-08-31",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Bills",
      "avg_interest_rate_amt": "3.788",
      "src_line_nbr": "1",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "08",
      "record_calendar_day": "31"
    },
    {
      "record_date": "2026-08-31",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Notes",
      "avg_interest_rate_amt": "3.345",
      "src_line_nbr": "2",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "08",
      "record_calendar_day": "31"
    },
    {
      "record_date": "2026-08-31",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Bonds",
      "avg_interest_rate_amt": "3.453",
      "src_line_nbr": "3",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "08",
      "record_calendar_day": "31"
    },
    {
      "record_date": "2026-08-31",
      "security_type_desc": "Marketable",
      "security_desc": "Treasury Inflation-Protected Securities (TIPS)",
      "avg_interest_rate_amt": "1.134",
      "src_line_nbr": "4",
      "record_fiscal_year": "2026",
      "record_fiscal_quarter": "4",
      "record_calendar_year": "2026",
      "record_calendar_quarter": "3",
      "record_calendar_month": "08",
      "record_calendar_day": "31"
    }
  ],
  "meta": {
    "count": 20,
    "total-count": 5025,
    "total-pages": 252
  },
  "links": {
    "self": "&page%5Bnumber%5D=1&page%5Bsize%5D=20",
    "first": "&page%5Bnumber%5D=1&page%5Bsize%5D=20",
    "prev": null,
    "next": "&page%5Bnumber%5D=2&page%5Bsize%5D=20",
    "last": "&page%5Bnumber%5D=252&page%5Bsize%5D=20"
  }
};

export const debt2005 = {
  "data": [
    {
      "record_date": "2005-03-29",
      "debt_held_public_amt": "null",
      "intragov_hold_amt": "null",
      "tot_pub_debt_out_amt": "7790295209638.08",
      "src_line_nbr": "1",
      "record_fiscal_year": "2005",
      "record_fiscal_quarter": "2",
      "record_calendar_year": "2005",
      "record_calendar_quarter": "1",
      "record_calendar_month": "03",
      "record_calendar_day": "29"
    },
    {
      "record_date": "2005-03-30",
      "debt_held_public_amt": "null",
      "intragov_hold_amt": "null",
      "tot_pub_debt_out_amt": "7786606686259.96",
      "src_line_nbr": "1",
      "record_fiscal_year": "2005",
      "record_fiscal_quarter": "2",
      "record_calendar_year": "2005",
      "record_calendar_quarter": "1",
      "record_calendar_month": "03",
      "record_calendar_day": "30"
    },
    {
      "record_date": "2005-03-31",
      "debt_held_public_amt": "4572715640119.20",
      "intragov_hold_amt": "3204223407550.94",
      "tot_pub_debt_out_amt": "7776939047670.14",
      "src_line_nbr": "1",
      "record_fiscal_year": "2005",
      "record_fiscal_quarter": "2",
      "record_calendar_year": "2005",
      "record_calendar_quarter": "1",
      "record_calendar_month": "03",
      "record_calendar_day": "31"
    }
  ],
  "meta": {
    "count": 3,
    "total-count": 3,
    "total-pages": 1
  },
  "links": {
    "self": "&page%5Bnumber%5D=1&page%5Bsize%5D=100",
    "first": "&page%5Bnumber%5D=1&page%5Bsize%5D=100",
    "prev": null,
    "next": null,
    "last": "&page%5Bnumber%5D=1&page%5Bsize%5D=100"
  }
};
