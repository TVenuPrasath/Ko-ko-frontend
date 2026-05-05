# கோ-கோ செயலி — Poultry App (Frontend)

A mobile-first poultry management app for farmers and CRP (Community Resource Person) built with React + Vite + Tailwind CSS.

> **Note:** This is the frontend only. The `Backend/` folder is not needed — all data runs on mock data locally in the browser.

---

## What's Inside

- **Farmer Dashboard** — Weekly bird updates, vaccination history, loan requests, service requests (feed, equipment, vaccination), market prices, notifications
- **CRP Dashboard** — View all farmers, manage service demands (approve/reject), send disease alerts, farming tips, market price updates, weekly reminders, reports & CSV export
- **Buyer Dashboard** — Buyer-facing view
- **Tamil language support** with English fallback
- **Mock data** — No backend or internet connection needed

---

## Requirements

Make sure you have **Node.js** installed (v18 or above recommended).

Check by running:
```
node -v
```

If not installed, download from: https://nodejs.org

---

## How to Run

**Step 1 — Extract the zip folder**

**Step 2 — Open terminal inside the project folder**
```
cd Poultry-app
```

**Step 3 — Install dependencies**
```
npm install
```

**Step 4 — Start the app**
```
npm run dev
```

**Step 5 — Open in browser**
```
http://localhost:5173
```

---

## Login Credentials (Mock)

| Role    | Phone        | OTP   |
|---------|-------------|-------|
| Farmer  | 9842100001  | any 4 digits |
| CRP     | 9876500000  | any 4 digits |

---

## Folder Structure

```
Poultry-app/
├── src/
│   ├── components/
│   │   ├── auth/          # Login, OTP, Registration screens
│   │   ├── dashboard/     # Farmer tabs (Home, Weekly, Loan, Requests...)
│   │   ├── crp/           # CRP tabs (Farmers, Services, Alerts, Reports...)
│   │   └── buyer/         # Buyer dashboard
│   ├── lib/
│   │   ├── api.ts         # All mock API + data (no backend needed)
│   │   └── crpMockData.ts # CRP-specific mock data
│   └── i18n/              # Tamil / English translations
├── public/
├── package.json
└── README.md
```

> The `Backend/` folder can be ignored completely.

---

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Lucide icons
- Sonner (toasts)
