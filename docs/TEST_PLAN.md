# Test Plan

## v1 Success Scenario (End-to-End)

### Setup
1. Deploy app to Vercel preview
2. Run migration.sql on Supabase test project
3. Verify seed data: 6 users, 10+ visits, 3 connection requests

### Test Steps

**Pre-Auth (Demo Mode)**
1. Visit homepage (not logged in)
2. ✅ See list of cities with upcoming visits (SF, NYC, London)
3. Click "San Francisco" card
4. ✅ See 3 users visiting SF in Jan 2025
5. Select date range "Jan 10-15"
6. ✅ List filters to 2 users whose visits overlap
7. Click "Add Visit" (in demo mode, pre-fill a demo user_id)
8. Fill: city="Austin", start="Feb 1", end="Feb 5", activities=[coffee, hiking]
9. Submit
10. ✅ New visit appears in homepage list

**Connection Request (Demo Mode)**
11. On SF match card, click "Send Request"
12. ✅ Modal opens with message textarea
13. Type "Hey, let's grab coffee!"
14. Click Send (in demo, pre-fill sender_id)
15. ✅ Request created, success toast
16. Navigate to /inbox (demo user)
17. ✅ See pending request from step 13
18. Click Accept
19. ✅ Status changes to "accepted", LinkedIn URL now visible

**Payment Gate**
20. Attempt to send 4 requests (if free tier limit = 3)
21. ✅ Paywall modal appears: "Upgrade for $9.99"
22. Click Upgrade → redirected to Stripe Checkout
23. Enter test card 4242 4242 4242 4242
24. ✅ Payment succeeds, redirected to /success
25. ✅ users.payment_status = 'paid', payments row created
26. Try sending request again
27. ✅ No paywall, request sent

**Post-Auth (Lock Down)**
28. Sign up new user via /signup (magic link)
29. ✅ Email received, click link, logged in
30. Add visit "Berlin, Mar 1-5"
31. ✅ Only this user's visits visible in /my-visits
32. View Berlin city page
33. ✅ See ALL users' Berlin visits (public read), but can only edit own
34. Send connection request to another user
35. ✅ Connection scoped: sender=auth.uid(), recipient sees it
36. Log out
37. ✅ Homepage still shows demo data (public reads), but /my-visits redirects to /login

---

## Edge Cases

**Empty States**
- No visits in selected city + date range → "No matches found, try different dates"
- User has no visits yet → "Add your first visit to start connecting"
- No connection requests → "Your inbox is empty"

**Errors**
- Invalid date range (end before start) → client validation error
- Stripe payment fails → webhook not called, payment_status remains 'free', user sees error page
- Duplicate connection request (same sender+recipient) → server returns 409, toast "Request already sent"

**Loading**
- City page data fetch → skeleton cards while loading
- Connection request send → button disabled, spinner shown

**Permissions (Post-Lock-Down)**
- User A tries to edit User B's visit → 403 Forbidden (RLS blocks)
- User A tries to accept connection request sent by User B to User C → 403 (not recipient)

---

## Acceptance Criteria (Definition of Done)
- [ ] All test steps pass without errors
- [ ] No dead buttons (every button persists to DB or navigates)
- [ ] Empty/error/loading states render correctly
- [ ] RLS policies enforced (post-lock-down)
- [ ] Payment webhook creates payment row and updates user status
- [ ] No secrets in client bundle (check Network tab)
- [ ] UI copy is clear (no Lorem Ipsum)
- [ ] Mobile responsive (test on 375px width)