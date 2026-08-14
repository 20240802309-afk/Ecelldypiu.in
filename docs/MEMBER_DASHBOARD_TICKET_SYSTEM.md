# Member Dashboard and Ticket System

## Document status

| Field | Value |
| --- | --- |
| Status | Proposed |
| Audience | Product, frontend, backend, and QA contributors |
| Scope | Registration metadata, participation history, participant tickets, and admin-only attendee IDs |
| Last updated | 2 August 2026 |

## 1. Purpose

This document defines the requirements and implementation approach for extending the E-Cell DYPIU member and certificate experience. The work adds registration dates and event participation history to the admin experience, introduces a participant-facing event ticket, and restricts internal attendee identifiers to authenticated administrators.

Certificate generation and download already work and must continue to work after these changes.

## 2. Goals

The implementation must:

1. Show when each newsletter member registered.
2. Let an administrator load the events associated with a member's email address.
3. Show a clear event ticket after a participant is successfully found.
4. Keep internal attendee IDs and storage locations out of participant-facing responses and interfaces.
5. Show attendee IDs, with a copy action, in the authenticated certificate administration interface.

## 3. Non-goals

- Replacing the existing certificate designer or download flow.
- Building a new authentication system.
- Adding QR codes, ticket transfer, payment, or check-in scanning.
- Migrating legacy attendee collections into a new Firestore schema.
- Automatically loading participation history for every subscriber in the list.

## 4. Current state

| Capability | Current behavior | Required change |
| --- | --- | --- |
| Certificate download | Working | Preserve existing behavior |
| Participant lookup | Finds an attendee by name or email | Preserve lookup; return ticket metadata and remove internal data |
| Participant attendee ID | Returned by the public lookup API and stored in client state | Remove from the public response and participant UI |
| Admin attendee list | Available in the certificate manager | Add an ID column and copy action |
| Subscriber timestamp | Written under different field names; not reliably returned or displayed | Normalize in the API and display in the admin interface |
| Member participation history | Not implemented | Add an authenticated, on-demand API action and admin detail UI |

## 5. Data model and compatibility

### 5.1 Subscriber timestamps

Records in `SUBSCRIPTION_REQUESTS` can contain timestamps under several field names:

| Source | Existing field |
| --- | --- |
| Public newsletter form | `submittedAt` |
| Admin-created subscriber | `subscribedAt` |
| Legacy records | `createdAt` or `timestamp` |

The subscriber API must return one normalized field named `subscribedAt`, using the first available value in this order:

```text
subscribedAt -> submittedAt -> createdAt -> timestamp -> null
```

The server should serialize a valid value to an ISO 8601 string. Firestore `Timestamp`, JavaScript `Date`, `{ _seconds }` values, and existing ISO strings must be handled defensively. Invalid or missing values display as `Not available` without breaking the list.

> The current API checks only `createdAt` and `timestamp`. It therefore omits timestamps written by both active subscriber creation paths. Updating `api/subscriber.js` is required before the UI can display reliable registration dates.

### 5.2 Attendee records

Attendees may exist in either of these locations:

```text
events/{eventId}/{subcollection}/{documentId}
{legacyRootCollection}/{documentId}
```

A record can represent one attendee directly or contain a `members` array for a team. Existing extraction and event-collection matching behavior must be reused so lookup, participation history, and the admin list interpret the data consistently.

### 5.3 Participation counting rules

- Normalize the requested email with `trim().toLowerCase()`.
- Use exact, case-insensitive email equality; do not use partial matching.
- Count an event at most once, even if the email occurs more than once in that event.
- Include a team member when the normalized email appears in a record's `members` array.
- Ignore records that have no matching email.
- Return stable event identifiers and user-facing event names when available.
- Load the result on demand for one member instead of scanning for every list row.

The initial version may scan event collections because data is distributed across modern and legacy locations. If this becomes slow at production scale, add a denormalized participation index in a separate change.

## 6. Functional requirements

### 6.1 Registration date in the admin subscriber list

The Manage Subscribers view must display a `Registered on` value for every subscriber.

- Use the browser locale for display, including date and time when available.
- Preserve the existing responsive card layout; a table conversion is not required.
- Show `Not available` for records without a usable timestamp.
- Refresh and search behavior must continue to work.

### 6.2 Participation history in the admin subscriber view

Each subscriber entry must provide a `View events` or equivalent action. The request starts only when an administrator uses this action. The expanded state must show:

- A loading indicator.
- The number of distinct events found.
- Each event's user-facing name, with its identifier as a fallback.
- A clear empty state when no events are found.
- A retryable error message when the lookup fails.

Cache results in component state by normalized email for the current page session so reopening the same subscriber does not repeat the scan unnecessarily.

### 6.3 Participant ticket

After an eligible participant lookup succeeds, display a `My Ticket` card before the certificate canvas. It must show:

- E-Cell DYPIU branding.
- Participant name.
- Event name.
- Event date, or `Date not available` when no date exists.
- A status derived from actual data.

Do not label every lookup result as `Attended` unless the attendee record contains a trusted attendance field.

| Data | Ticket status |
| --- | --- |
| Explicit attended/check-in value is true | `Attended` |
| Record exists and is certificate-eligible, but attendance is absent | `Verified participant` |
| Explicit attended/check-in value is false | `Registered`, if the product flow permits access |

The ticket must be responsive, keyboard-accessible, and readable without relying on color alone. Decorative perforations or dashed separators are optional and must not reduce legibility.

### 6.4 Admin-only attendee ID

The attendee table in the certificate administration interface must add an `Attendee ID` column.

- Display the `id` returned by the authenticated `list-attendees` action.
- Provide a copy-to-clipboard button with an accessible label.
- Show brief success feedback after copying.
- Use an em dash when an ID is unavailable.
- Keep the existing name, email, source, and eligibility controls unchanged.

The attendee table is rendered by `src/components/CertificateManager.jsx`, which is mounted from `AdminPortal.jsx`. The new column belongs in `CertificateManager.jsx`.

## 7. API contracts

### 7.1 Normalize subscriber timestamps

`GET /api/subscriber` remains protected by `Authorization: Bearer <ADMIN_API_KEY>`.

Relevant response shape:

```json
{
  "success": true,
  "subscribers": [
    {
      "id": "subscriber-document-id",
      "name": "Member Name",
      "email": "member@example.com",
      "phone": "+91 9000000000",
      "college": "DYPIU",
      "subscribedAt": "2026-08-02T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### 7.2 Member events action

Add an authenticated event API action:

```http
POST /api/event
Authorization: Bearer <ADMIN_API_KEY>
Content-Type: application/json
```

Request:

```json
{
  "action": "member-events",
  "email": "member@example.com"
}
```

Success response:

```json
{
  "success": true,
  "email": "member@example.com",
  "count": 3,
  "events": [
    { "id": "finbiz", "name": "FinBiz '25" },
    { "id": "inceptio", "name": "Inceptio '25" },
    { "id": "innovate-for-impact", "name": "Innovate for Impact" }
  ]
}
```

| Condition | Status |
| --- | --- |
| Missing or invalid admin authorization | `401` |
| Missing or invalid email | `400` |
| Database unavailable | `503` |
| Unexpected scan failure | `500` |

This action must be admin-only because it reveals a person's participation history.

### 7.3 Participant lookup response

`lookup-attendee` is public and must return only participant-safe data:

```json
{
  "success": true,
  "eligible": true,
  "attendee": {
    "name": "Member Name",
    "email": "member@example.com",
    "team": "Team Name",
    "college": "DYPIU",
    "role": "Participant",
    "attended": true
  },
  "event": {
    "id": "finbiz",
    "name": "FinBiz '25",
    "date": "15 November 2025"
  }
}
```

The public response must not include:

- `attendeeId`
- Firestore document IDs
- `foundIn`
- Collection paths
- Other internal storage metadata

Removing an ID from the rendered page is not sufficient if the browser can still read it in the network response. Event name can fall back to the certificate configuration, and event date can come from `events/{eventId}`. If no date is stored, return `null` and use the UI fallback.

## 8. Privacy and security requirements

- Require the existing admin bearer token for participation history and attendee-list requests.
- Never send internal attendee IDs or collection paths from a participant-facing endpoint.
- Do not log full participation results or bearer tokens.
- Keep participant errors generic; do not reveal database details.
- Remove the attendee-ID copy handler, state, imports, and UI from `GetCertificate.jsx`.
- Omit the LinkedIn `certId` query parameter when there is no public credential ID. Do not substitute a Firestore document ID.

If a public, verifiable credential ID is needed later, define it separately from the Firestore document ID and document its lifecycle.

## 9. User flows

### Participant

```text
Open event certificate page
  -> Enter name or email
  -> Public attendee lookup and eligibility check
  -> View participant-safe ticket
  -> Generate and download certificate
  -> Optionally add the certificate to LinkedIn
```

### Administrator: subscriber details

```text
Authenticate in Admin Portal
  -> Open Manage Subscribers
  -> View normalized registration date
  -> Expand a subscriber
  -> Load distinct participation history on demand
```

### Administrator: attendee IDs

```text
Authenticate in Admin Portal
  -> Open Certificate Manager
  -> Select an event and fetch attendees
  -> View or copy an internal attendee ID
```

## 10. Files to change

| File | Responsibility |
| --- | --- |
| `api/subscriber.js` | Normalize and serialize subscriber timestamp fields |
| `api/event.js` | Add member-events lookup; return ticket metadata; redact public internal data |
| `src/pages/AdminPortal.jsx` | Display registration dates and on-demand participation history |
| `src/pages/GetCertificate.jsx` | Render the ticket; remove ID handling; omit LinkedIn `certId` |
| `src/components/CertificateManager.jsx` | Add the admin-only attendee ID column and copy feedback |

## 11. Recommended implementation sequence

1. Normalize subscriber timestamps in the API.
2. Add the authenticated member-events action and test its matching helpers where practical.
3. Remove internal fields from public attendee lookup and add event metadata.
4. Update the Admin Portal subscriber experience.
5. Add the participant ticket and remove ID-dependent client code.
6. Add the attendee ID column to the Certificate Manager.
7. Run lint and a production build, then complete manual verification.

## 12. Acceptance criteria

### Registration date

- [ ] Public records display their `submittedAt` timestamp.
- [ ] Admin-created records display their `subscribedAt` timestamp.
- [ ] Legacy `createdAt` and `timestamp` values remain supported.
- [ ] Missing or malformed dates display `Not available` without a crash.

### Participation history

- [ ] Only an authenticated administrator can request a member's events.
- [ ] Email matching is exact after case and whitespace normalization.
- [ ] Team-member records are included.
- [ ] Duplicate records within one event produce one event result.
- [ ] The UI shows loading, success, empty, and error states.
- [ ] Results load on demand and are cached for the page session.

### Participant ticket and privacy

- [ ] An eligible lookup displays name, event, date fallback, and evidence-based status.
- [ ] The ticket works on mobile and desktop.
- [ ] No attendee ID, document ID, collection path, or `foundIn` value appears in the page or public network response.
- [ ] The LinkedIn link works without an internal `certId`.
- [ ] Certificate generation and download still work.

### Admin attendee ID

- [ ] The authenticated attendee table shows IDs for direct and team-member entries.
- [ ] Copying an ID gives accessible success feedback.
- [ ] Existing attendee search and eligibility controls still work.

## 13. Verification plan

Run automated project checks:

```bash
npm run lint
npm run build
```

Where test infrastructure is available, cover timestamp normalization, email and team-member matching, event deduplication, authorization failures, and public-response redaction.

### Manual test matrix

| Scenario | Expected result |
| --- | --- |
| Public subscriber with `submittedAt` | Correct registration date appears |
| Admin-created subscriber with `subscribedAt` | Correct registration date appears |
| Subscriber without a timestamp | `Not available` appears |
| Email present in three distinct events | Count is 3 and all events are listed |
| Same email duplicated within one event | Event is counted once |
| Team member email | Team member's event is included |
| Unauthenticated member-events request | Request returns `401` |
| Eligible participant lookup | Ticket and certificate appear |
| Public response inspected in browser tools | No internal ID or collection path is present |
| Event without a date | Ticket shows `Date not available` |
| Admin fetches event attendees | ID column and copy action are available |
| Certificate download and LinkedIn action | Both work without an internal ID |

## 14. Risks and follow-up work

| Risk | Mitigation |
| --- | --- |
| Full collection scans become slow | Keep lookup on demand; later add a member-to-events index |
| Legacy collections match an event incorrectly | Reuse and then harden existing collection matching rules |
| Ticket says `Attended` without evidence | Use the status mapping in section 6.3 |
| Firestore IDs are treated as credential IDs | Keep them admin-only; create a separate public ID if required |
| Date formats vary | Normalize on the server and keep a defensive UI formatter |
