# Template: Dashboard

Admin dashboard with sidebar, stats, and data tables

## Style and feature targets

This is a working admin dashboard scaffold with a live mock API. Build on top of it — don't replace the wiring.

Existing structure:
- server.js — Express + JSON body parsing + /api routes mounted.
- lib/mock-data.js — seeded-random data generators for stats, 30-day activity series, and a 47-row user list. Deterministic per day (today's bucket = same seed), so the data looks alive but reproducible within a day.
- routes/api.js — GET /api/stats (4 metric cards w/ % change), /api/activity (30-day revenue + signups series), /api/users (paginated, sortable).
- public/index.html — sidebar + topbar layout with stat grid, Chart.js area chart, sortable users table with pagination.
- public/app.js — fetches the /api/* endpoints, renders into the page, handles sort clicks + pagination + filter input.
- public/styles.css — dark-mode design system; one accent color (--accent: #6366f1).

Chart.js is pulled from CDN (zero install cost). Don't add npm-installed chart libs.

To wire real data: replace functions in routes/api.js with queries against the user's actual data source. The frontend is data-agnostic — it just needs the same JSON shapes back.

When the user asks for changes, edit the existing files instead of starting over. Examples: add a 5th stat card → push another object into mock.stats() AND add a card slot in public/index.html. Add a date filter → update /api/activity to accept ?from=&to= and edit public/app.js to send those params.

Style: dark theme by default. Sidebar fixed-width, content area scrolls. Customize freely but keep the grid layout.

User's specific requirements follow.

## Suggested features

- Collapsible sidebar
- Stats cards
- Sortable data table
- Charts
- Activity feed
- Search

---

This file describes the kind of app the user picked. Use it as a starting reference when they ask you to build or customize anything. The placeholder `index.html` / `server.js` / `package.json` are friendly defaults — replace them on the user's first real edit request.

Do NOT deploy. The user reviews your workspace edits and taps the Deploy button (play icon in the chat header) to ship. Your job ends at file write + commit. Final reply should be: "Changes saved. Tap the play button to review the diff and deploy."
