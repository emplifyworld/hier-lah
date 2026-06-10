# Agentic Layer

## Risk Levels & Actions

### Low Risk (auto-execute, no approval)
- **summarize_profile**: generate one-line bio from LinkedIn URL (later)
- **tag_activities**: infer activity preferences from bio text (later)
- **score_match**: compute match score (rule-based, v1)

### Medium Risk (draft → user approval)
- **draft_connection_message**: suggest personalized intro based on shared activities (later)
- **suggest_meeting_time**: propose time slot based on overlapping dates (later)

### High Risk (always require approval)
- **send_connection_request**: user must click "Send" after reviewing message
- **accept_connection**: user must click "Accept"
- **initiate_payment**: user must confirm checkout

### Critical (human-only, no agent)
- **delete_account**
- **refund_payment**
- **report_abuse**

## Named Tools (v1)
- `create_visit(city, start_date, end_date, activities)`
- `find_matches(city, start_date, end_date) -> user[]`
- `send_connection_request(recipient_id, message)`
- `update_connection_status(request_id, status)`
- `check_payment_status(user_id) -> bool`

## Audit Log Fields
- user_id, action, target_id (e.g. request_id), old_value, new_value, ip_address, created_at

## v1 vs Later
**v1**: All actions user-initiated (manual button clicks). No autonomous agent.  
**Later**: Agent auto-drafts connection messages; suggests optimal meet-up times; flags low-quality profiles.