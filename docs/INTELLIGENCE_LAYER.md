# Intelligence Layer

## Messy Inputs
- City name (free text → normalize to standard city, country)
- Activity preferences (checkboxes → stored as JSON array)
- LinkedIn URL (validate format, extract vanity name)

## Auto-Structure Schema (JSON)
```json
{
  "city_normalized": "San Francisco, CA, USA",
  "activity_match_score": 0.75,
  "mutual_connections_inferred": 2,
  "confidence": 0.8,
  "source": "linkedin_scrape_or_manual",
  "review_status": "unreviewed"
}
```

## Events to Track
- visit_created (city, dates)
- match_viewed (user A sees user B in city)
- connection_sent (sender, recipient)
- connection_accepted
- payment_completed

## Scoring Rules (v1: rule-based)
- **Activity match**: count shared activities / total unique activities (0..1)
- **Date overlap**: days overlapping / min(visit_duration_A, visit_duration_B)
- **Mutual connections**: manual field for now; later scrape LinkedIn
- **Overall match score**: 0.5×activity + 0.3×date_overlap + 0.2×(mutual_connections > 0 ? 1 : 0)

## What Gets Ranked
Match list sorted by:
1. Match score (desc)
2. Start date (asc, soonest first)

## v1 vs Later
**v1**: Rule-based scoring, manual mutual connections, no AI.  
**Later**: LLM extracts LinkedIn profile summary → semantic activity matching; auto-scrape mutual connections; predict likelihood of reply.