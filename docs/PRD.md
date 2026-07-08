# Product Requirements: HierLah

## Problem
LinkedIn users visiting a city have no private way to discover and coordinate meet-ups with others who'll be there. Posting publicly is awkward; not everyone wants to broadcast travel plans. Users often only find free time once they arrive.

## Target User
Active LinkedIn professionals who travel for work or leisure and value networking over coffee, meals, hikes, or casual activities.

## Core Objects
- **User**: LinkedIn URL, name, bio, activity preferences, payment status
- **Visit**: user, city, start_date, end_date, activities (hiking, coffee, movie, meal)
- **Connection Request**: sender, recipient, message, status (pending/accepted/declined), mutual_connections_count
- **Payment**: user, amount, stripe_session_id, status, created_at

## MVP (v1) Checklist
- [ ] User signs up with LinkedIn URL
- [ ] User adds a visit (city + date range + activities)
- [ ] User searches a city and sees who else will be there during overlapping dates
- [ ] User sends a connection request to another user
- [ ] Recipient accepts/declines request
- [ ] Payment gate: free tier (view 3 matches max), paid tier ($9.99 one-time unlock for unlimited)
- [ ] Stripe Checkout integration
- [ ] Show mutual connection count on profiles

## Non-Goals (v1)
- In-app messaging (connection requests have a one-time message only)
- Recurring subscriptions
- Calendar sync
- Group events
- Email notifications

## Success Criteria
A user signs up, adds a visit to "San Francisco, Jan 15-18", sees 4 other users also visiting, pays $9.99, sends two connection requests, and one is accepted—all within 5 minutes.