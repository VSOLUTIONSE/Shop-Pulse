# SalesPulse

Point of Sale & Inventory Management System for Nigerian retail shops. Built with Next.js, Convex, and Tailwind CSS.

## Features

- **POS Terminal** — Process sales with cash, transfer, card, or credit payments
- **Inventory Management** — Track stock levels, restock, corrections, low-stock alerts
- **Customer Management** — Track credit balances, payment history, and ledger entries
- **Sales Logs** — View, search, and void sales
- **Expense Tracking** — Log and categorize business expenses
- **Dashboard** — Revenue trends, profit, debt overview, recent sales
- **AI Business Reports** — Generate intelligent performance reports with Google Gemini
- **AI Business Chat** — Floating chat widget to ask questions about sales, inventory, customers, and finances

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_SITE_URL=your_convex_site_url
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### Convex

```bash
npx convex dev       # Run local dev backend
npx convex deploy    # Deploy to production
npx convex run seed  # Seed sample data
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Backend:** Convex (database, queries, mutations, actions)
- **AI:** Google Gemini via Vercel AI SDK
- **UI:** Tailwind CSS v4, shadcn/ui components, Lucide icons
- **Charts:** Recharts
