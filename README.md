# Auto Order Frontend

Standalone Next.js / React / TypeScript project. Includes seller dashboard, product/order UI, review queue and private buyer checkout.

```bash
npm ci
npm run setup
npm run dev
```

Node 22.12+ is supported. Open http://localhost:3000. Run the backend separately.

Set the server-only `API_URL` in .env.local to your NestJS API URL. The default is http://127.0.0.1:4000. Do not prefix it with NEXT_PUBLIC_. Banking/database/TikTok secrets belong only in the backend. The browser calls /api/backend/* on the frontend origin, preserving HttpOnly cookies and origin validation.

The backend WEB_URL must match the frontend browser origin. For production, configure API_URL through the hosting service's environment settings and use HTTPS for the browser origin. Do not expose API_URL or provider credentials to client components.

- `npm run dev`: frontend development server.
- `npm run build`: production build.
- `npm start`: production HTTP server after building.
- `npm run typecheck`: TypeScript check.

Deploy independently from the backend. The shipped dashboard is original; free replacement templates are listed in docs/UI-SOURCES.md. This project's .github workflow checks its build independently.
