# Security

## Secret Handling
- Stripe secret key: server-side environment variable only (never in client code)
- Supabase service role key: server-side API routes only
- User tokens: httpOnly cookies or Supabase client SDK (auto-managed)

## Permission Model
**Pre-lock-down (v1 demo-first)**:  
- RLS enabled on all tables  
- Permissive policies: `for select using (true)`, `for all using (true)`  
- Anyone can read/write (safe for demo with seed data, no real user PII yet)

**Post-lock-down**:  
- **users**: read all (public profiles); write if `auth.uid() = user_id`  
- **visits**: read all (discovery); write if owner  
- **connection_requests**: read if sender OR recipient; insert if sender; update status if recipient  
- **payments**: read/write if owner  
- **activity_logs**: read if owner; insert via service role only  

## Approved Tools Rule
- No `eval()`, no dynamic SQL from user input  
- All agent actions use named functions with validated parameters  
- Payment webhooks verify Stripe signature  

## Audit Principle
- Log every state change (visit created, connection sent/accepted, payment completed)  
- Store actor (user_id), action, target, timestamp  
- Retention: 90 days for free users, indefinite for paid