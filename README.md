# THEE onset Enterprise — Version 2

Luxury-themed, mobile-first, offline-capable Progressive Web App for personal and business finance management.

## Version 2 features
- Personal, business or consolidated financial views
- Multiple business profiles
- Income and expense transaction register with categories, account/channel, descriptions and references
- M-Pesa statement CSV import (generic CSV column detection; review imported transactions)
- Asset register with purchase cost and current estimated value
- Investment tracking using asset records and cost/current valuation
- Debt register with balances, interest rate, expected instalment and due date
- Debt repayment logging that reduces the recorded debt balance and adds an expense transaction
- Monthly cash-flow summary, category breakdown and business comparison
- JSON backup/restore and CSV exports
- KES default; currency display selection
- PWA install support for Android Chrome and offline cache

## Important limitations
1. **Google Sheets is a prepared backend template, not a live synchronisation service in this build.** App records remain in browser local storage on the device. Export a JSON backup regularly.
2. The included Apps Script creates the spreadsheet tabs and headers. It deliberately does not publish a public API because an unauthenticated endpoint would expose private financial records. Live sync requires Google sign-in and server-side authorization checks.
3. The M-Pesa importer is a generic CSV parser, not an official Safaricom integration. CSV exports may have different headings or layouts. Check all imported amounts and transaction types.
4. Investment values are user-entered estimates; there are no live market prices or broker connections.
5. “Net cash flow” in the monthly report subtracts expenses and separately logged debt repayments. Repayment logging also creates an expense entry marked “Debt repayment”; the report excludes that category from ordinary expenses to avoid double counting.
6. Currency selection changes display formatting only. It does not convert historical amounts.

## Publish with GitHub Pages
1. Create a GitHub repository, e.g. `thee-onset-enterprise`.
2. Upload the contents of this folder to the repository root.
3. Open repository Settings → Pages.
4. Choose Deploy from a branch, select `main` and `/ (root)`, then Save.
5. Wait for the HTTPS GitHub Pages URL.
6. Open it in Chrome on Android and select Install app / Add to Home screen.

## Prepare Google Sheets
1. Upload `THEE_onset_Enterprise_V2_Backend.xlsx` to Google Drive and open it as Google Sheets, or create a blank Sheet.
2. Open Extensions → Apps Script.
3. Paste `backend/Code.gs` into the editor.
4. Run `setupSheets()` once and approve permissions.
5. Keep the Sheet private. Do not deploy an unrestricted “Anyone” API.

## Data safety
- Local storage can be erased if browser/site data is cleared or the device is lost.
- Export JSON backups frequently and store them securely.
- Never enter M-Pesa PINs, bank passwords, full card numbers, one-time passcodes or other credentials.
- Do not put real financial data in a public GitHub repository.
