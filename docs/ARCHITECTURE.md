# Architecture

## Stack
- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Supabase (Postgres + Auth + RLS)
- **Payments**: Stripe Checkout (one-time payment)
- **Hosting**: Vercel

## Build Now vs Later
**Now (v1)**  
- Visit CRUD (add/edit/delete)  
- City + date overlap query  
- Connection request send/accept/decline  
- Payment checkout + webhook  
- Activity preference tags  

**Later**  
- Real-time messaging  
- Email notifications  
- Recurring billing  
- AI activity recommendations  

## Key User Flow: Find & Connect
1. User adds visit: "London, Feb 1-5, [coffee, hiking]"
2. App stores visit row (user_id, city, dates, activities JSON)
3. User navigates to "London" city page, picks Feb 1-5
4. App queries visits WHERE city='London' AND date ranges overlap
5. UI renders match cards (name, activities, mutual connections)
6. User clicks "Send Request" → if free tier, check count < 3; if paid, allow
7. App inserts connection_request row (sender_id, recipient_id, message, status='pending')
8. Recipient sees inbox, clicks Accept → update status='accepted'
9. Both users see each other's LinkedIn URLs

## Layer Plan
1. **Data first**: Define schema, seed demo visits, ensure queries return correct overlaps
2. **App logic**: CRUD for visits, connection state machine, payment gate checks
3. **Smart features** (later): AI match scoring, activity recommendations, trust scores

## Why Core Runs Without AI
Matching is pure SQL (date range overlap, city match). Activity filtering is JSON array intersection. Payment gating is a boolean check. No AI required for v1.