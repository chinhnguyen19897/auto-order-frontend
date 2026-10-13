# Free dashboard source options

Checked against the original repositories on 12 October 2026. The app ships original CSS/components; these are replacement UI options, not copied dependencies in this project.

| Template | Stack | Fit | Source | Demo |
|---|---|---|---|---|
| Studio Admin | Next.js 16, shadcn/ui, TypeScript | Recommended visual reference: ecommerce, CRM, chat, invoices, flexible themes | https://github.com/arhamkhnz/next-shadcn-admin-dashboard | https://studio-admin.arhamkhnz.com |
| Kiranism Dashboard Starter | Next.js 16, shadcn/ui, TypeScript | Working table, filtering, form and mutation patterns | https://github.com/Kiranism/next-shadcn-dashboard-starter | https://shadcn-dashboard.kiranism.dev |
| TailAdmin Free | Next.js, Tailwind CSS, TypeScript | Ready-made dashboard shell, basic charts, tables and forms | https://github.com/TailAdmin/free-nextjs-admin-dashboard | https://nextjs-demo.tailadmin.com |
| Shadcn Admin | React, Vite, TanStack Router | Good for a separate SPA frontend with NestJS | https://github.com/satnaing/shadcn-admin | https://shadcn-admin.netlify.app |

All four repositories declare MIT for their open-source UI code. Retain each repository's license/copyright notices when copying. TailAdmin has a paid edition with additional screens; the free source is a smaller subset. Optional services such as auth/billing providers may have separate costs. A free UI does not supply TikTok, Zalo or bank integration logic.

For this project, keep `components/api.ts` and the checkout API contracts. Replace `dashboard.tsx`, its shell and styles with the chosen template, and connect tables/forms to the real endpoints. Avoid importing the template's fake data or unrelated billing/auth flow as if it were this app's backend.
