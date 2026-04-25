---
description: "Integrate a third-party API or external service with proper error handling"
agent: "conductor.powder"
---

# API Integration

You are integrating a third-party API or external service.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.context** — Research the API documentation
2. **@engineering.implementation** — Implement backend integration
3. **@security.application** — Security audit (API keys, data handling)
4. **@quality.code-review** — Code review

## Integration Standards

### Backend (Cloud Functions)

- API calls ONLY from Cloud Functions (never from client)
- Store API keys in Firebase environment config (never in code)
- Zod schemas for API request and response validation
- Proper error handling with retries and exponential backoff
- Circuit breaker pattern for unreliable APIs
- Structured logging for all API calls
- Rate limiting awareness

### Client Layer

- TypeScript interfaces for all API data types
- TanStack Query hooks for data fetching with:
  - Cache configuration appropriate to data freshness needs
  - Error handling with user-friendly messages
  - Loading states
  - Optimistic updates where applicable

### Security

- API keys stored as environment secrets
- Webhook endpoints verify signatures
- Input sanitization before sending to external APIs
- Response validation before trusting external data
- No PII sent to third-party APIs without user consent

## Instructions

1. Research the API documentation (architecture.context)
2. Design the integration architecture:
   - Cloud Functions endpoints
   - Data mapping (external format ↔ internal format)
   - Error handling strategy
   - Caching strategy
3. Write tests first (mock the external API)
4. Implement Cloud Functions with Zod validation
5. Implement client-side TanStack Query hooks
6. Security audit (security.application)
7. Code review (quality.code-review)
8. Document the integration

## User Input

The API/service to integrate: {{input}}
