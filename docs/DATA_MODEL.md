# Data Model

## users
- id: uuid (PK)
- user_id: uuid (nullable in v1, FK to auth.uid after lock-down)
- linkedin_url: text (unique)
- name: text
- bio: text
- activity_preferences: jsonb (array: ["hiking", "coffee", "movie", "meal"])
- payment_status: text ("free" | "paid")
- created_at: timestamptz

**RLS**: v1 permissive read/write (demo-first); lock-down sprint enforces owner-only writes, public reads.

## visits
- id: uuid (PK)
- user_id: uuid (nullable in v1, references users.id)
- city: text
- start_date: date
- end_date: date
- activities: jsonb (array subset of user preferences)
- created_at: timestamptz

**RLS**: v1 permissive; lock-down: public read (so others discover you), write if auth.uid() = owner.

## connection_requests
- id: uuid (PK)
- sender_id: uuid (references users.id)
- recipient_id: uuid (references users.id)
- message: text
- status: text ("pending" | "accepted" | "declined")
- mutual_connections_count: integer (manual or heuristic)
- created_at: timestamptz
- updated_at: timestamptz

**RLS**: v1 permissive; lock-down: read if sender or recipient, write if sender (create) or recipient (update status).

## payments
- id: uuid (PK)
- user_id: uuid (references users.id)
- amount: numeric
- currency: text ("usd")
- stripe_session_id: text (unique)
- status: text ("pending" | "completed" | "failed")
- created_at: timestamptz

**RLS**: v1 permissive; lock-down: read/write if auth.uid() = user_id.

## activity_logs
- id: uuid (PK)
- user_id: uuid
- action: text ("visit_created", "connection_sent", "payment_completed")
- details: jsonb
- created_at: timestamptz

**RLS**: read if owner; insert by app (service role).