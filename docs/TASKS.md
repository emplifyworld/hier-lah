# Tasks

## Sprint 1: Database + Seed Data
**Goal**: Schema live, seeded with demo data, viewable without login.

- [ ] Write and test migration.sql locally
- [ ] Create users, visits, connection_requests, payments, activity_logs tables
- [ ] Seed 6-8 demo users (realistic names, LinkedIn URLs, bios, activity preferences)
- [ ] Seed 10-15 visits (mix of cities: SF, NYC, London, Tokyo; overlapping date ranges)
- [ ] Seed 3-4 connection requests (pending/accepted)
- [ ] Enable RLS with permissive v1 policies on all tables
- [ ] Apply migration to Supabase project
- [ ] Verify queries return expected overlaps

**Definition of Done**: `SELECT * FROM visits WHERE city='San Francisco'` returns 3+ rows; RLS allows anonymous reads.

---

## Sprint 2: Core Engine – Visit Matching
**Goal**: Users can browse and add visits; see who else will be in a city.

- [ ] Homepage: list all upcoming visits grouped by city (cards with city, date range, user count)
- [ ] City detail page `/city/[slug]`: show all users visiting, filterable by date range
- [ ] Date range picker component (start + end date)
- [ ] Query: find visits WHERE city = X AND date ranges overlap with selected range
- [ ] "Add Visit" form (city autocomplete, date pickers, activity checkboxes)
- [ ] POST /api/visits → insert row, return success
- [ ] Refresh visit list after add (optimistic UI or revalidate)
- [ ] Display activity tags (badges) per user on match cards

**Definition of Done**: Anonymous user can view SF visits, add a new visit "Jan 10-12", see it appear in the list; date filter works.

---

## Sprint 3: Connection Requests
**Goal**: Users can send/accept/decline connection requests.

- [ ] "Send Request" button on match card → modal with message textarea
- [ ] POST /api/connections → insert connection_request (sender_id from session/demo user, recipient_id, message, status='pending')
- [ ] Connection inbox page: list requests WHERE recipient_id = current_user OR sender_id = current_user
- [ ] Accept button → PATCH /api/connections/[id] status='accepted'
- [ ] Decline button → PATCH /api/connections/[id] status='declined'
- [ ] Show mutual_connections_count badge (hardcoded or prompt user to enter)
- [ ] Activity match indicator: count shared activities, show "2 shared interests" label

**Definition of Done**: User A sends request to User B with message; User B sees it in inbox, clicks Accept; status updates; both see accepted connection.

---

## Sprint 4: Payment Gate
**Goal**: Free tier limited; paid tier unlocks full access.

- [ ] Install Stripe SDK, add STRIPE_SECRET_KEY to env
- [ ] Free tier logic: check connection_requests count for user; if >= 3 and payment_status='free', block with "Upgrade" prompt
- [ ] "Upgrade" button → POST /api/checkout → create Stripe Checkout session (one-time $9.99)
- [ ] Redirect to Stripe hosted page
- [ ] Stripe webhook /api/webhooks/stripe: on checkout.session.completed, insert payment row, update users.payment_status='paid'
- [ ] Verify signature in webhook handler
- [ ] After payment, redirect to /success, show "You're all set!"
- [ ] Gate connection request send behind payment check (client + server)

**Definition of Done**: Free user tries to send 4th request → sees paywall; pays $9.99 → payment row created, user.payment_status='paid', can send unlimited requests.

---

## Sprint 5: Lock It Down
**Goal**: Move from demo-first (no auth) to real user auth + data isolation.

- [ ] Enable Supabase Auth (magic link email)
- [ ] Add /login and /signup pages (email input → magic link)
- [ ] Link users.user_id to auth.uid() (backfill demo rows or create new test users)
- [ ] Update RLS policies:
  - users: `for select using (true)`, `for update using (auth.uid() = user_id)`
  - visits: `for select using (true)`, `for insert/update/delete using (auth.uid() = user_id)`
  - connection_requests: `for select using (auth.uid() = sender_id OR auth.uid() = recipient_id)`, write policies per role
  - payments: `using (auth.uid() = user_id)`
- [ ] Middleware: redirect to /login if not authed on protected pages
- [ ] Test: sign up new user, add visit, send request, pay → all scoped correctly

**Definition of Done**: Anonymous visitors see demo data (read-only); logged-in users see only their own visits/requests; payments scoped to owner.

---

## Sprint 6: Profile & Polish
**Goal**: Editable profiles, empty states, responsive UI.

- [ ] /profile/[id] page: show user name, bio, LinkedIn URL, activity preferences
- [ ] /profile/edit: form to update name, bio, preferences → PATCH /api/users/[id]
- [ ] Empty state: "No visits yet" with CTA to add first visit
- [ ] Empty state: "No matches found" when date filter returns zero
- [ ] Loading spinners on data fetch (Suspense boundaries)
- [ ] Error toasts for failed API calls (react-hot-toast or similar)
- [ ] Responsive layout: mobile stack, desktop grid
- [ ] Onboarding tooltip on homepage: "Add your first visit to get started"

**Definition of Done**: New user signs up, sees tooltip, adds visit, edits profile, views on mobile → all works smoothly.

---

## Gantt (Sprint Timeline)
```
Sprint 1 (DB+Seed)         Week 1: ████████
Sprint 2 (Visit Matching)  Week 1: ████████
Sprint 3 (Connections)     Week 2: ████████
Sprint 4 (Payment)         Week 2: ████████
Sprint 5 (Lock Down)       Week 3: ████████
Sprint 6 (Polish)          Week 3: ████████
```

**v1 Functional Milestone**: End of Sprint 4 (user can sign up, add visit, find matches, send request, pay).

**Ship Target**: End of Sprint 5 (auth + RLS locked down, ready for real users).