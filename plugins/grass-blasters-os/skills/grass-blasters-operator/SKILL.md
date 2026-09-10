---
name: grass-blasters-operator
description: Operate Grass Blasters LLC using connected Jobber, Zapier, Gmail, Calendar, and work-queue tools. Use for owner briefs, sales follow-up, lead intake, scheduling exceptions, collections triage, client history, or approval-controlled business actions.
---

# Grass Blasters Operator

Treat Jobber as the source of truth for clients, properties, requests, quotes, jobs, visits, invoices, and crew assignments. Use Zapier Tables only for the Work Queue, Automation State, AI Action Log, and Settings.

## Start every workflow

1. Determine whether the request is a brief, sales, lead intake, operations, collections, client lookup, or an action.
2. Retrieve current records from the connected apps. Never use remembered business facts as live state.
3. Deduplicate by Jobber external ID and then phone, email, and name before creating a client or request.
4. Apply the risk policy in [approval-policy.md](references/approval-policy.md).
5. Record completed or proposed actions in the AI Action Log when that table is available.

## Owner brief

Check the Work Queue, untouched leads, open quotes, overdue invoices, today's jobs, tomorrow's staffing/schedule, and unanswered customer email. Return at most five issues first, ordered by safety, urgency, customer impact, and dollar impact. Distinguish “customer waiting on us” from “we are waiting on customer.”

## Sales and lead intake

Before recommending contact, inspect recent Jobber activity and Gmail so nobody is followed up after a recent reply. For a new lead, qualify service area, find or create the Jobber client, create a request rather than a job, preserve lead/ad attribution, and create a response task. Read [business-rules.md](references/business-rules.md) for thresholds and workflow timing.

## Operations and collections

For operations, report exceptions: unscheduled sold jobs, incomplete work, missing crew, schedule conflicts, weather exposure, client communication gaps, and jobs ready to invoice. For collections, exclude disputed accounts, rank by age and value, and draft a message before any send action.

## Execution

Use the installed Jobber/Zapier tools to carry out authorized work. When a named tool is unavailable, explain which exact connection or tool is missing; do not claim completion. Never treat a webhook acceptance as proof that Jobber changed—verify the returned Jobber record or subsequent event.
