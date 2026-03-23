# PHASE 2.5 — IMPLEMENTATION SPECIFICATION

**Status:** In Progress
**Goal:** Define precise implementation details for Phase 3 rebuild.

**Status:** The current app is a partially wired prototype whose deployed runtime behaves like a mock/demo, not a trusted operational system.

---

## Deployment Status

| URL | Status | Evidence |
|-----|--------|----------|
| `data-dogs-mission-control.vercel.app` | ❌ 404 Not Found | runtime-tested |
| `data-dogs-mission-control.web.app` | ❌ Site Not Found | runtime-tested |
| `data-dogs-tracker.vercel.app` | ✅ Live | runtime-tested |

---

## 1. Firestore Integration

| Check | Result | Evidence |
|-------|--------|----------|
| Firebase client setup code exists | ✅ Yes | code-inspected |
| onSnapshot/addDoc functions exist | ✅ Yes | code-inspected |
| Runtime connection confirmed | ❌ No | runtime-tested — no Firestore network calls observed |
| Data in Firestore verified | ❌ Unverified | unverified |
| Real-time updates working | ❌ No | runtime-tested — data appears static |

**Finding:** While Firebase SDK integration code is present, runtime testing shows no evidence of Firestore connectivity. The deployed app displays static data arrays compiled into the JavaScript bundle.

---

## 2. File-Level Inventory: Fallback / Static / Demo Data Sources

| File | Line(s) | Data Type | Value(s) | Evidence |
|------|---------|-----------|----------|----------|
| `app/page.js` | 475-477 | Financial fallback | `revenue \|\| 284500`, `expenses \|\| 142300`, `profit \|\| 142200` | code-inspected |
| `app/page.js` | 482 | Financial fallback | `cashPosition \|\| 89200` | code-inspected |
| `app/page.js` | 524-525 | Technician fallback | `Dalton`, `Tech #1`, `Tech #2` | code-inspected |
| `app/page.js` | 546 | Insight fallback | `"Add jobs to see AI insights"` | code-inspected |
| `out/.../page-*.js` | (compiled) | Jobs array | 5 hardcoded jobs (Pilot Renew, Knoxville Metro, etc.) | runtime-tested |
| `out/.../page-*.js` | (compiled) | Technicians array | 3 hardcoded techs with status/location/ETA | runtime-tested |
| `out/.../page-*.js` | (compiled) | Insights array | 3 hardcoded AI insights | runtime-tested |
| `out/.../page-*.js` | (compiled) | Stat values | `12` (active), `47` (completed), `284500` (revenue), `142200` (profit) | runtime-tested |

---

## 3. Runtime Evidence Labels

| Feature | Present in Code | Runtime Verified | Production-Ready |
|---------|-----------------|------------------|------------------|
| Firebase client init | ✅ | ❌ | ❌ |
| onSnapshot (jobs) | ✅ | ❌ | ❌ |
| onSnapshot (technicians) | ✅ | ❌ | ❌ |
| onSnapshot (financials) | ✅ | ❌ | ❌ |
| onSnapshot (insights) | ✅ | ❌ | ❌ |
| Add Job modal + form | ✅ | ❌ | ❌ |
| handleAddJob → addDoc | ✅ | ❌ | ❌ |
| handleCommand (Kevin) | ✅ | ❌ (simulated) | ❌ |
| Sidebar navigation | ✅ | ❌ (non-functional) | ❌ |
| Quick Actions buttons | ✅ | ❌ (non-functional) | ❌ |
| Static fallback data | ✅ | ✅ | ❌ |
| Hardcoded job/tech/insight arrays | ✅ | ✅ | ❌ |
| Firebase Auth | ❌ | ❌ | ❌ |
| Role-based access | ❌ | ❌ | ❌ |
| Firestore security rules | ❌ (not reviewed) | ❌ | ❌ |

---

## 4. Add Job Flow End-to-End

| Step | Expected | Actual | Evidence |
|------|----------|--------|----------|
| Click "New Job" | Modal opens | ❌ Nothing happens | runtime-tested |
| Form fills | User enters data | N/A (modal didn't open) | runtime-tested |
| Submit | Writes to Firestore `jobs` | N/A | unverified |

---

## 5. Interactive Elements: Cosmetic vs Functional

| Element | Status | Evidence |
|---------|--------|----------|
| Active Jobs counter (12) | **Cosmetic** — hardcoded | runtime-tested |
| Completed counter (47) | **Cosmetic** — hardcoded | runtime-tested |
| Revenue ($284,500) | **Cosmetic** — hardcoded | runtime-tested |
| Profit ($142,200) | **Cosmetic** — hardcoded | runtime-tested |
| "Last sync: Just now" | **Cosmetic** — no sync | code-inspected |
| "Kevin Active" badge | **Cosmetic** — no backend | code-inspected |
| Operations Command list | **Cosmetic** — hardcoded jobs array | runtime-tested |
| Financial Command bars | **Cosmetic** — hardcoded values | runtime-tested |
| Contract Pipeline | **Cosmetic** — hardcoded jobs | runtime-tested |
| Technician Status | **Cosmetic** — hardcoded 3 techs | runtime-tested |
| Kevin Insights | **Cosmetic** — hardcoded 3 insights | runtime-tested |
| Sidebar nav buttons | ❌ **Non-functional** | runtime-tested |
| Quick Actions: New Job | ❌ **Non-functional** | runtime-tested |
| Quick Actions: Create Invoice | ❌ **Non-functional** | runtime-tested |
| Quick Actions: Add Contract | ❌ **Non-functional** | runtime-tested |
| Quick Actions: Schedule Tech | ❌ **Non-functional** | runtime-tested |
| Quick Actions: Generate Report | ❌ **Non-functional** | runtime-tested |
| Command bar input | ❌ **Non-functional** | runtime-tested |
| "Ask Kevin →" button | ❌ **Non-functional** | code-inspected |

---

## 6. Ask Kevin / AI Features

| Check | Result | Evidence |
|-------|--------|----------|
| Endpoint exists | ❌ No API route | code-inspected |
| Code exists | ✅ `handleCommand` function | code-inspected |
| Actual behavior | ❌ **Simulated** — 2-second timeout, static response | code-inspected |

---

## 7. Empty-State Behavior

| Scenario | Current Behavior | Evidence |
|----------|-----------------|----------|
| No Firestore data | Displays hardcoded fallback values (NOT empty) | runtime-tested |
| No jobs | Shows 5 hardcoded demo jobs | runtime-tested |
| No technicians | Shows fallback: "Dalton", "Tech #1", "Tech #2" | code-inspected |
| No insights | Shows fallback: "Add jobs to see AI insights" | code-inspected |

---

## 8. Authentication & Security

| Check | Result | Evidence |
|-------|--------|----------|
| Client auth implemented | ❌ No | code-inspected |
| Firestore access policy | ❌ Unknown — cannot verify without Console access | unverified |
| API key in client code | ✅ Normal for Firebase web apps | code-inspected |
| Security concern | Firestore rules must be reviewed | unverified |

---

## Summary

The deployed Mission Control app at `data-dogs-tracker.vercel.app` is a **static prototype** with:

- ✅ Firebase SDK scaffolding in source code
- ❌ No runtime connection to Firestore
- ❌ All displayed data is hardcoded/demo values
- ❌ All tested interactive elements are non-functional
- ❌ No authentication layer
- ❌ "Ask Kevin" is a simulation, not an AI backend

**This app should NOT be treated as a trusted operational system.** It requires a complete rebuild: live data verification, CRUD implementation, auth, permissions, security rules, and removal of demo fallbacks.

---

## Next Step

**Proceed to Phase 2 — System Architecture Design** to plan the rebuild into a real operational system.
