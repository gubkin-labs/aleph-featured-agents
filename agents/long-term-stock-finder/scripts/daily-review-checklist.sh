#!/usr/bin/env bash
# Long-Term Stock Finder — daily material-change checklist.
# Run after reading memory (research-ledger, company-records, watchlist).
# For each covered company, answer every row and record date+source before
# deciding BUY / WATCH / PASS. BUY requires a complete rubric, dated price/
# valuation basis, visible margin of safety, and no unresolved thesis breaker.
set -u

companies=("$@")
if [ ${#companies[@]} -eq 0 ]; then
  echo "Usage: $0 <ticker|company> ..."
  echo "Reads covered companies from memory files when arguments are omitted."
  companies=("$(grep -oE '^## [A-Za-z .]+ \(' ../../memory/company-records.md 2>/dev/null | sed -E 's/^## //; s/ \($//' | sort -u)")"
fi

for c in "${companies[@]}"; do
  echo "=== Material-change checklist: $c (date: $(date +%F)) ==="
  for item in \
    "1. Price movement since last review (note touch of 52-wk high/low as margin-of-safety signal; cross-check >=2 independent sources)" \
    "2. SEC filings (8-K, 10-Q/K, proxy)" \
    "3. Earnings releases, guidance changes, investor day" \
    "4. Regulatory/legal developments (legislation, suits, settlements)" \
    "5. Leadership changes (C-suite, board)" \
    "6. Capital allocation (buybacks, dividends, M&A, debt, issuance)" \
    "7. Competitive landscape (entrants, launches, partnership shifts)" \
    "8. Macro/industry conditions (rates, rotation, geopolitics)"; do
    printf '   - %s: ' "$item"
    read -r answer
    [ -z "$answer" ] && answer="no material change found"
    printf '%s' "$answer" >> /tmp/ltsf_checklist_$(date +%F).md
  done
  echo "" >> /tmp/ltsf_checklist_$(date +%F).md
  echo "   Verdict (BUY requires full rubric + dated valuation + margin of safety): "
  read -r verdict
  echo "   Verdict: $verdict" >> /tmp/ltsf_checklist_$(date +%F).md
  echo "Logged to /tmp/ltsf_checklist_$(date +%F).md (transcribe sources into memory)."
done
