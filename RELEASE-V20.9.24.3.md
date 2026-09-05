# NEWSREAL V20.9.24.3 — D1 Final Hot-path Optimization

Scope: backend/D1 efficiency only. No UI, template layout, payment contract, trial contract, routing, or customer data model changes.

## Changes

- Removes remaining runtime schema `ensure*()` calls from normal publisher, cron, renewal, payment, Master CRM, activation, handover and password-reset request paths. The schema is already owned by migrations 0001–0049.
- Publisher health/check/import no longer attempts DDL before doing normal work.
- Cron endpoints authenticate first and go directly to business queries instead of running compatibility DDL.
- Master customer/finance/leads/service-document/renewal screens no longer execute compatibility schema builders on each request.
- Payment status/webhook and renewal response routes no longer run runtime table builders.
- `/api/site` no longer scans all published posts twice. Normal production responses use SQL window aggregates on the same scan that returns homepage posts; trial/no-sample mode reuses the loaded rows and queries only today's pageview count.
- Adds an expression index for the existing normalized publisher-domain lookup.

## Migration

Apply `0050_d1_final_hotpath_indexes.sql` remotely before deploying the code.

## Contract safety

No frontend files changed. No template/demo/customer rendering rules changed. No payment/trial state transitions changed.
