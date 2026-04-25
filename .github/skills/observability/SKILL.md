---
name: Observability
description: >
  Production observability — structured logging, metrics, distributed tracing,
  error tracking, alerting, and SLOs. Use when instrumenting new features,
  diagnosing production issues, or building dashboards for system health.
agents: ["engineering.implementation", "reliability.srre", "architecture.engineer"]
tags: [observability, logging, metrics, tracing, monitoring, alerting, sre]
---

# Observability

You cannot operate what you cannot observe. Logs tell you what happened, metrics tell you how much/often, traces tell you where time was spent. Each answers a different question.

## Core Principles

1. **Instrument at the boundary** — Every inbound request and every outbound call gets a log, a metric, and a trace span.
2. **Structured, not stringly** — Logs are JSON with consistent field names, not printf strings. Greppable, queryable, indexable.
3. **High cardinality for context, low cardinality for metrics** — Logs/traces can have user IDs. Metric labels cannot — they explode the time-series database.
4. **Alert on symptoms, not causes** — Users care about "is the site slow?", not "is CPU high?". Alert on SLO burn, not resource usage.
5. **Every alert is actionable** — If an alert fires and the on-call can't do anything about it, delete the alert.

## The Three Pillars

### Logs

**Structured JSON logs, one event per line.**

```typescript
logger.info('order.created', {
  orderId: 'ord_123',
  userId: 'usr_456',
  totalCents: 4999,
  currency: 'USD',
  requestId: req.requestId,
  durationMs: 42,
});
```

**Standard fields on every log:**
- `timestamp` — ISO 8601 with timezone (usually added by the logger)
- `level` — `debug | info | warn | error | fatal`
- `message` or `event` — short stable identifier (`order.created`, not "Order number ord_123 was created at 10:42")
- `requestId` — trace correlation ID, propagated from inbound request
- `userId` — if authenticated
- `service` — which service emitted this (`api`, `worker`, `cron`)
- `env` — `production | staging | dev`

**Never log:**
- Passwords, tokens, session cookies, API keys
- Full credit card numbers, SSNs, other regulated PII
- Request/response bodies without redaction
- Stack traces for expected errors (validation failures, 404s)

**Log levels:**
- `error` — something is broken that needs attention
- `warn` — degraded but functional (retrying, fallback used)
- `info` — significant business events (order created, user signed up)
- `debug` — developer-facing detail, off in production

### Metrics

**Time-series numbers answering "how many?" and "how fast?".**

Four metric types:
- **Counter**: monotonically increasing (`http_requests_total`)
- **Gauge**: point-in-time value (`active_connections`)
- **Histogram**: distribution (`http_request_duration_seconds`)
- **Summary**: quantiles computed client-side (rarely needed with modern TSDBs)

**The RED method for services:**
- **Rate**: requests per second
- **Errors**: error rate (errors / total)
- **Duration**: p50, p95, p99 latency

**The USE method for resources:**
- **Utilization**: percent busy
- **Saturation**: queue depth / wait time
- **Errors**: error count

**Label cardinality:**
- OK labels: HTTP method, status code, endpoint (bounded), region
- NOT OK labels: user ID, request ID, full URL with IDs, timestamps
- Rule of thumb: each label combination is a separate time series. >100k series per metric = trouble.

### Traces

**Distributed traces show the path of a request through your system.**

```
┌─ POST /api/orders (120ms) ──────────────────────────┐
│  ├─ auth.verify (8ms)                               │
│  ├─ db.users.get (12ms)                             │
│  ├─ payment.charge (82ms) ◄── slow                  │
│  │   └─ stripe.api (78ms)                           │
│  └─ db.orders.insert (15ms)                         │
└──────────────────────────────────────────────────────┘
```

**Use OpenTelemetry (OTel) — the vendor-neutral standard.**

- Instrument inbound HTTP, outbound HTTP, DB queries, external APIs
- Propagate `traceparent` header on all outbound requests
- Add span attributes for business context (`user.id`, `order.id`) — these have high cardinality and that's fine for traces (unlike metrics)
- Sample traces at 1-10% in production. Always sample traces with errors.

## Alerting

### Alert on SLOs, not resources

Define SLOs with the product owner:
- "99.9% of API requests succeed"
- "95% of page loads complete in under 2 seconds"

**Burn rate alerting** — Alert when you're burning the error budget faster than allowed.

| Severity | Burn rate | Time window | Meaning |
|----------|-----------|-------------|---------|
| Page | 14.4x | 1h | Will exhaust 30-day budget in ~2 days |
| Ticket | 3x | 6h | Will exhaust 30-day budget in ~10 days |

### Alert hygiene

- **Every alert has a runbook** linked in the alert description
- **Every alert has an owner** (a team, not a person)
- **Alerts that fire without action get deleted** — alert fatigue is real and dangerous
- **Don't alert on CPU/memory directly** — alert on the user-visible symptom it causes
- **Maintenance windows silence alerts** — don't rely on humans ignoring them

## Error Tracking

Use Sentry, Rollbar, or similar for exception aggregation:
- Groups identical errors, shows frequency
- Captures stack trace, request context, user context
- De-duplicates noise (one bug = one alert, not 10,000)
- Integrates with issue tracker

**Rules:**
- Send every unhandled exception
- Send handled exceptions that represent "this shouldn't happen" (not validation errors)
- Redact PII in breadcrumbs and request context
- Set `environment` tag (`production`, `staging`)
- Link to the commit SHA so you can find the code fast

## Correlation

The magic is making logs, metrics, and traces correlate.

- Every inbound request gets a `requestId` (UUID). Propagate it through all logs, downstream calls, and DB queries (as a comment `/* requestId=abc123 */`).
- Every log for a request includes that `requestId`.
- The trace ID goes in the log too — so you can jump from a log line to the full trace.

## Dashboards

Every service has a health dashboard with:
1. **RED panels**: request rate, error rate, p50/p95/p99 latency by endpoint
2. **Saturation**: queue depth, active connections, memory/CPU
3. **Business metrics**: signups/hour, orders/hour, revenue/hour
4. **Deploy markers**: vertical lines showing when deploys happened

A dashboard answers ONE question. If yours answers ten, split it into ten dashboards.

## Review checklist

- [ ] All services emit structured JSON logs with standard fields
- [ ] No secrets/PII in logs (audited via log sampling or automated scan)
- [ ] RED metrics instrumented on every service
- [ ] Traces propagated across all service boundaries
- [ ] `requestId` correlates logs ↔ traces ↔ error reports
- [ ] SLOs defined with product owner, burn-rate alerts configured
- [ ] Every alert has a runbook and an owner
- [ ] Error tracking configured with source maps / symbols
- [ ] Deploy markers on dashboards
- [ ] Retention policies set (logs: 30-90d, metrics: 13-15mo, traces: 7-14d)
