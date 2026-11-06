# Expense & Budget Tracker

A responsive student-level expense tracker built with React, TypeScript and Vite. It stores expenses, budget and theme preference in the browser using `localStorage`.

## Features

- Dashboard with total spent, monthly budget, remaining budget and transaction count
- Add, edit, view and delete expenses
- Food, Travel, Bills, Entertainment and Shopping categories
- Monthly budget settings (default: ₹1,000)
- 70%, 90% and 100% budget alerts
- Category spending chart and monthly summary
- Light/dark theme with saved preference
- Responsive desktop sidebar and mobile bottom navigation
- FamPay connection information without requesting sensitive credentials

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The production website is generated in `dist/`.

## Deploy

### Vercel
1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy.

### Netlify
1. Import the GitHub repository.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Deploy.

## Data storage and privacy

This starter uses browser `localStorage`; data stays in the current browser profile and is not automatically synchronized between devices. Clearing browser site data can remove locally stored records. For multi-device accounts, add a secure backend and authentication.

## FamPay integration

The app provides an informational FamPay connection section only. No official authorized API integration is configured here. Do not enter passwords, OTPs, PINs or card credentials. Add manual expenses until a supported, authorized integration is available.

## Project structure

```text
expense-budget-tracker-web/
├── public/
├── src/
│   ├── components/
│   │   ├── ExpenseForm.tsx
│   │   └── TransactionList.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── types.ts
├── index.html
├── package.json
└── README.md
```

## Notes

- No sample transactions are inserted. The dashboard starts in a genuine empty state.
- The default budget is ₹1,000.
- Currency formatting uses `en-IN` and INR.
- Test the production build before publishing.
