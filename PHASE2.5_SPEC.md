# PHASE 2.5 — IMPLEMENTATION SPECIFICATION

**Goal:** Define precise implementation details for Phase 3 rebuild.

---

## 1. COLLECTION-BY-COLLECTION FIELD SPEC

### `jobs`

| Field | Type | Required | Enum/Range | Default | Example | Source | Indexes |
|-------|------|----------|------------|---------|---------|--------|---------|
| id | string | auto | - | auto | j-abc123 | app | yes |
| storeNumber | string | yes | - | "" | "Pilot #54" | human | yes |
| customerName | string | yes | - | "" | "Pilot Flying J" | human | yes |
| location | map | yes | - | {} | {address, city, state, zip} | human | yes |
| jobType | string | yes | network_install, fiber, maintenance, repair | install | network_install | yes |
| status | string | yes | pending, active, scheduled, complete, blocked, cancelled | pending | active | yes |
| priority | string | no | low, medium, high, urgent | medium | high | yes |
| assignedTechs | array | no | technicians.id | [] | ["tech-1"] | human/app | yes |
| scheduledStart | timestamp | no | - | null | ts | human | yes |
| scheduledEnd | timestamp | no | - | null | ts | human | yes |
| actualStart | timestamp | no | - | null | ts | app | yes |
| actualEnd | timestamp | no | - | null | ts | app | yes |
| quotedRevenue | number | no | >= 0 | 0 | 25000 | human | yes |
| actualRevenue | number | no | >= 0 | 0 | 27500 | human | yes |
| estimatedCost | number | no | >= 0 | 0 | 15000 | human | yes |
| actualCost | number | no | >= 0 | 0 | 16500 | app | yes |
| profit | number | no | - | computed | 11000 | computed | yes |
| margin | number | no | 0-1 | computed | 0.4 | computed | yes |
| materials | array | no | - | [] | [{name, qty, unitCost, totalCost}] | human | - |
| labor | array | no | - | [] | [{techId, hours, rate, totalCost}] | app | - |
| notes | string | no | - | "" | "Client requested..." | human | - |
| documents | array | no | URLs | [] | ["https://..."] | human | - |
| createdBy | string | yes | users.id | null | user-admin-xyz | app | - |
| createdAt | timestamp | yes | - | server | ts | app | - |
| updatedAt | timestamp | yes | - | server | ts | app | - |

### `leads`

| Field | Type | Required | Enum/Range | Default | Example | Source | Indexes |
|-------|------|----------|------------|---------|---------|--------|---------|
| id | string | auto | - | auto | l-abc123 | app | yes |
| source | string | yes | sam.gov, web, referral, cold_call, repeat | web | sam.gov | human | yes |
| company | string | yes | - | "" | "US Govt" | human | yes |
| contactName | string | no | - | "" | "Jane Doe" | human | - |
| contactEmail | string | no | email | "" | jane@gov | human | - |
| contactPhone | string | no | - | "" | "+15551234567" | human | - |
| location | map | no | - | {} | {city, state...} | human | - |
| jobType | string | no | - | "" | network_upgrade | human | - |
| description | string | no | - | "" | "Scope..." | human | - |
| estimatedValue | number | no | >= 0 | 0 | 500000 | human | yes |
| probabilityScore | number | no | 0-100 | 50 | 75 | human | yes |
| stage | string | yes | new, contacted, qualifying, proposing, negotiating, won, lost | new | proposing | yes |
| assignedTo | string | no | users.id | null | user-mgr-xyz | human | yes |
| notes | string | no | - | "" | "Follow up..." | human | - |
| createdAt | timestamp | yes | - | server | ts | app | - |
| updatedAt | timestamp | yes | - | server | ts | app | - |

### `technicians`

| Field | Type | Required | Enum/Range | Default | Example | Source | Indexes |
|-------|------|----------|------------|---------|---------|--------|---------|
| id | string | auto | - | auto | tech-1 | app | yes |
| name | string | yes | - | "" | Dalton | human | yes |
| role | string | yes | lead_tech, tech, helper | tech | lead_tech | human | - |
| email | string | yes | email | "" | d@dd.com | human | yes |
| phone | string | yes | - | "" | +1555... | human | - |
| hourlyRate | number | yes | >= 0 | 50 | 75 | human | - |
| status | string | yes | available, assigned, off, vacation | available | assigned | yes |
| currentJobId | string | no | jobs.id | null | j-abc | app | yes |
| skills | array | no | - | [] | [network, fiber] | human | - |
| avatarUrl | string | no | URL | null | https://... | human | - |
| hireDate | timestamp | no | - | null | ts | human | - |
| createdAt | timestamp | yes | - | server | ts | app | - |
| updatedAt | timestamp | yes | - | server | ts | app | - |

### `financials`

| Field | Type | Required | Enum/Range | Default | Example | Source | Indexes |
|-------|------|----------|------------|---------|---------|--------|---------|
| id | string | auto | - | auto | f-abc | app | yes |
| type | string | yes | revenue, expense, adjustment | revenue | expense | human | yes |
| category | string | yes | labor, materials, equipment, overhead, other | other | materials | human | yes |
| amount | number | yes | >= 0 | 0 | 500 | human | yes |
| description | string | yes | - | "" | Cable purchase | human | - |
| relatedJobId | string | no | jobs.id | null | j-abc | human | yes |
| relatedLeadId | string | no | leads.id | null | l-def | human | yes |
| date | timestamp | yes | - | server | ts | human | yes |
| createdBy | string | yes | users.id | null | user-admin | app | - |
| createdAt | timestamp | yes | - | server | ts | app | - |

### `alerts`

| Field | Type | Required | Enum/Range | Default | Example | Source | Indexes |
|-------|------|----------|------------|---------|---------|--------|---------|
| id | string | auto | - | auto | a-abc | app | yes |
| type | string | yes | financial, operational, risk, safety, schedule | operational | financial | app/kevin | yes |
| severity | string | yes | low, medium, high, critical | medium | critical | app/kevin | yes |
| title | string | yes | - | "" | Over budget | app/kevin | - |
| message | string | yes | - | "" | Job exceeds... | app/kevin | - |
| relatedEntityType | string | no | job, lead, technician | null | job | app/kevin | - |
| relatedEntityId | string | no | entity id | null | j-abc | app/kevin | - |
| resolved | boolean | yes | - | false | true | human | yes |
| resolvedBy | string | no | users.id | null | user-mgr | human | - |
| resolvedAt | timestamp | no | - | null | ts | human | - |
| createdAt | timestamp | yes | - | server | ts | app | - |

### `insights`

| Field | Type | Required | Enum/Range | Default | Example | Source | Indexes |
|-------|------|----------|------------|---------|---------|--------|---------|
| id | string | auto | - | auto | i-abc | app | yes |
| type | string | yes | opportunity, warning, recommendation | warning | opportunity | kevin | yes |
| priority | string | yes | low, medium, high | medium | high | kevin | yes |
| title | string | yes | - | "" | High profit opp | kevin | - |
| message | string | yes | - | "" | Bid on X... | kevin | - |
| recommendation | string | no | - | null | Submit bid... | kevin | - |
| confidence | number | no | 0-100 | null | 85 | kevin | - |
| relatedEntityType | string | no | job, lead | null | lead | kevin | - |
| relatedEntityId | string | no | id | null | l-abc | kevin | - |
| generatedBy | string | yes | kevin, manual | kevin | kevin | app | - |
| metadata | object | no | - | {} | {} | kevin | - |
| createdAt | timestamp | yes | - | server | ts | app | - |

### `users`

| Field | Type | Required | Enum/Range | Default | Example | Source | Indexes |
|-------|------|----------|------------|---------|---------|--------|---------|
| id | string | yes | auth uid | auth uid | user-admin | app | yes |
| email | string | yes | email | "" | admin@dd.com | app | yes |
| displayName | string | yes | - | "" | Admin | app | - |
| role | string | yes | admin, manager, technician | technician | admin | human | yes |
| permissions | object | yes | (see CRUD matrix) | {} | {canCreateJobs: true...} | app | - |
| preferences | object | no | - | {} | {theme: dark} | human | - |
| createdAt | timestamp | yes | - | server | ts | app | - |
| updatedAt | timestamp | yes | - | server | ts | app | - |

---

## 2. SOURCE OF TRUTH RULES

| Value | Storage | Computation Logic |
|-------|---------|-------------------|
| jobs.profit | STORED (denormalized for read perf) | actualRevenue - actualCost |
| jobs.margin | STORED (denormalized) | profit / actualRevenue (if revenue > 0) |
| jobs.actualCost | COMPUTED | SUM(materials.totalCost) + SUM(labor.totalCost) |
| Total Revenue (YTD) | COMPUTED | SUM(jobs.actualRevenue) WHERE status=complete AND year=current |
| Total Expenses (YTD) | COMPUTED | SUM(financials.amount) WHERE type=expense AND year=current |
| Profit (YTD) | COMPUTED | Revenue - Expenses |
| Cash Position | COMPUTED | Cumulative (Revenue - Expenses) |
| Tech Utilization | COMPUTED | (Assigned Hours / Available Hours) * 100 |

**Rule:** Store denormalized `profit`/`margin` on jobs to avoid expensive aggregations on list views, but update via Cloud Function or client-side transaction on job completion.

---

## 3. STATUS / WORKFLOW DEFINITIONS

### Jobs Workflow
- **pending** -> **scheduled** -> **active** -> **complete** -> (optional: **closed**)
- **pending/active/scheduled** -> **blocked** -> back to active
- Any active status -> **cancelled**

**Transitions:**
- pending -> scheduled: Admin/Manager sets dates
- scheduled -> active: Auto on start date OR Tech logs in
- active -> complete: Tech/Admin logs completion + actuals
- active -> blocked: Tech/Admin adds note

**Actions generating alerts:**
- Job status = blocked for > 48h
- Job cost > estimatedCost * 1.2
- Job incomplete after scheduledEnd + 24h

### Leads Workflow
- **new** -> **contacted** -> **qualifying** -> **proposing** -> **negotiating** -> **won** OR **lost**

**Conversion:**
- Lead stage = won -> Admin/Manager clicks "Convert to Job" -> creates job from lead data

**Actions generating alerts:**
- Lead stage = lost (high volume triggers risk alert)
- Lead probability drops > 20% in one update
- Lead age > 30 days in stage new/contacted

### Alerts Workflow
- Generated with resolved = false
- User reviews -> sets resolved = true + resolvedBy + resolvedAt

---

## 4. SCREEN / FEATURE MAP

| Screen | Collections | Read Ops | Write Ops | Roles | Build Status |
|--------|-------------|----------|-----------|-------|--------------|
| **Dashboard Stats** | jobs, financials | Aggregate queries | None | Admin, Manager | NEW BUILD |
| **Jobs List** | jobs, technicians | getDocs + onSnapshot | updateJobStatus, assignTechs | Admin, Manager, Tech (own) | NEW BUILD |
| **Job Detail** | jobs, financials, alerts | getDoc | updateJob, addNote | Admin, Manager, Tech (assigned) | NEW BUILD |
| **Leads Pipeline** | leads, users | getDocs | createLead, updateLeadStage, convertToJob | Admin, Manager | NEW BUILD |
| **Technician Panel** | technicians, jobs | getDocs | updateTechStatus, assignJob | Admin, Manager, Tech (self) | NEW BUILD |
| **Financials View** | financials | Aggregate | createFinancialEntry | Admin, Manager | NEW BUILD |
| **Alerts** | alerts | getDocs | resolveAlert | Admin, Manager | NEW BUILD |
| **Insights** | insights | getDocs | None | Admin, Manager | NEW BUILD |
| **Quick Actions** | jobs, leads, financials | None | Trigger modals/forms | Admin, Manager | NEW BUILD |
| **Ask Kevin** | jobs, leads, financials | Query | Trigger Kevin API | Admin, Manager | NEW BUILD |

---

## 5. CRUD MATRIX

| Collection | Role | Create | Read | Update | Delete |
|------------|------|--------|------|--------|--------|
| users | Admin | Yes (all) | All | All | Yes |
| users | Manager | No | Own | Own (prefs) | No |
| users | Technician | No | Own | Own (prefs) | No |
| jobs | Admin | Yes | All | All | Yes |
| jobs | Manager | Yes | All | All | Yes |
| jobs | Technician | No | Assigned/Own | Status/Notes/Actuals | No |
| leads | Admin | Yes | All | All | Yes |
| leads | Manager | Yes | All | All | Yes |
| leads | Technician | No | None | None | No |
| technicians | Admin | Yes | All | All | Yes |
| technicians | Manager | Yes | All | Status/Assign | No |
| technicians | Technician | No | All | Own Status | No |
| financials | Admin | Yes | All | All | Yes |
| financials | Manager | Yes | View Only | No | No |
| financials | Technician | No | None | No | No |
| alerts | Admin | Yes | All | Resolve | Yes |
| alerts | Manager | Yes | All | Resolve | No |
| alerts | Technician | No | Assigned Job | No | No |
| insights | Admin | No | All | No | No |
| insights | Manager | No | All | No | No |
| insights | Technician | No | All (read only) | No | No |

---

## 6. FIRESTORE RULES PLAN

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() { return request.auth != null; }
    function isAdmin() { 
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    function isManager() {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
    function isTechnician() {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'technician';
    }
    function canCreateJobs() {
      return isAuthenticated() && (isAdmin() || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canCreateJobs == true);
    }
    function canEditJobs() {
      return isAuthenticated() && (isAdmin() || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canEditJobs == true);
    }
    function canManageTechnicians() {
      return isAuthenticated() && (isAdmin() || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageTechnicians == true);
    }
    function canViewFinancials() {
      return isAuthenticated() && (isAdmin() || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canViewFinancials == true);
    }
    function canEditFinancials() {
      return isAuthenticated() && (isAdmin() || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canEditFinancials == true);
    }
    function isAssignedTech(jobData) {
      return isAuthenticated() && request.auth.uid in jobData.assignedTechs;
    }

    // USERS
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }

    // JOBS
    match /jobs/{jobId} {
      allow read: if isAuthenticated();
      allow create: if canCreateJobs();
      allow update: if canEditJobs() || (isTechnician() && isAssignedTech(resource.data));
      allow delete: if isAdmin();
    }

    // LEADS
    match /leads/{leadId} {
      allow read: if isAuthenticated();
      allow write: if canCreateJobs();
      allow delete: if isAdmin();
    }

    // TECHNICIANS
    match /technicians/{techId} {
      allow read: if isAuthenticated();
      allow write: if canManageTechnicians() || (isTechnician() && request.auth.uid == resource.data.id);
      allow delete: if isAdmin();
    }

    // FINANCIALS
    match /financials/{finId} {
      allow read: if canViewFinancials();
      allow write: if canEditFinancials();
      allow delete: if isAdmin();
    }

    // ALERTS
    match /alerts/{alertId} {
      allow read: if isAuthenticated();
      allow write: if isManager() || (isTechnician() && resource.data.relatedEntityType == 'job' && isAssignedTech(get(/databases/$(database)/documents/jobs/(resource.data.relatedEntityId)).data));
      allow delete: if isAdmin();
    }

    // INSIGHTS (Read only for all, write for system/Kevin)
    match /insights/{insightId} {
      allow read: if isAuthenticated();
      allow create: if true; // Kevin/system account only in prod - use service account auth
    }
  }
}
```

---

## 7. VALIDATION PLAN

| Form | Field | Rule |
|------|-------|------|
| Job Create/Edit | storeNumber | Required, max 50 chars |
| Job Create/Edit | customerName | Required, max 100 chars |
| Job Create/Edit | quotedRevenue | >= 0, number |
| Job Create/Edit | estimatedCost | >= 0, number |
| Job Create/Edit | jobType | Required, enum |
| Job Create/Edit | status | Required, enum |
| Lead Create/Edit | company | Required, max 100 chars |
| Lead Create/Edit | contactEmail | Email format if present |
| Lead Create/Edit | estimatedValue | >= 0, number |
| Lead Create/Edit | probabilityScore | 0-100, integer |
| Lead Create/Edit | stage | Required, enum |
| Technician Create/Edit | name | Required, max 50 chars |
| Technician Create/Edit | email | Required, valid email |
| Technician Create/Edit | hourlyRate | >= 0, number |
| Financial Create | amount | Required, > 0 |
| Financial Create | type | Required, enum |
| Financial Create | category | Required, enum |

**Validation Implementation:**
- Client-side: React Hook Form + Zod
- Server-side: Firestore validate() rules (see above)
- Backend: Firebase Functions (if needed for complex logic)

---

## 8. RUNTIME DATA STRATEGY

| Screen | Fetch Strategy | Loading State | Empty State | Error State |
|--------|---------------|---------------|-------------|-------------|
| Dashboard | onSnapshot (jobs, financials) | Skeleton loader | "No data yet. Add your first job." | Toast error + retry button |
| Jobs List | onSnapshot (jobs) | Spinner | "No jobs found. Create your first job." | Toast error |
| Job Detail | getDoc + onSnapshot (job) | Skeleton | 404 / Not Found | Error page |
| Leads | onSnapshot (leads) | Spinner | "No leads yet. Add your first lead." | Toast error |
| Techs | onSnapshot (technicians) | Spinner | "No technicians added." | Toast error |
| Financials | onSnapshot (financials) | Skeleton | "No transactions recorded." | Toast error |

**Optimistic Updates:**
- Use for status changes (e.g., job complete)
- Update local state immediately, revert on Firestore error

---

## 9. FALLBACK / DEMO DATA REMOVAL PLAN

| Current Hardcoded Value | Location (Line) | Replacement |
|-------------------------|-----------------|-------------|
| Active Jobs: 12 | page.js stat card | Remove fallback, show 0 or fetch real count |
| Completed: 47 | page.js stat card | Remove fallback |
| Revenue: 284500 | page.js stat card | Remove fallback |
| Profit: 142200 | page.js stat card | Remove fallback |
| Cash: 89200 | page.js financials | Remove fallback |
| Demo jobs array (5 items) | Compiled JS | Remove entirely, query real jobs |
| Demo techs (Dalton, Tech #1, #2) | page.js fallback | Remove fallback, show empty state if none |
| Demo insights (3 items) | Compiled JS | Remove, query real insights |
| Financial fallback: revenue \|\| 284500 | page.js:475 | Remove `\|\| 284500` |
| Financial fallback: expenses \|\| 142300 | page.js:476 | Remove `\|\| 142300` |
| Financial fallback: profit \|\| 142200 | page.js:477 | Remove `\|\| 142200` |
| Financial fallback: cashPosition \|\| 89200 | page.js:482 | Remove `\|\| 89200` |

**Verification:**
- Build must fail if hardcoded demo values remain (optional: lint rule)
- Manual test: Clear Firestore, reload app -> should show empty states

---

## 10. PHASE 3 IMPLEMENTATION PLAN

### Task 1: Project Setup & Cleanup
- **Files:** `app/page.js`, `app/layout.js`, `app/globals.css`
- **Actions:** Remove all hardcoded demo data, set up clean state structure
- **Dependencies:** None
- **Risk:** Low
- **Verify:** Empty dashboard renders without demo values

### Task 2: Firebase Auth Integration
- **Files:** `lib/auth.js`, `context/AuthContext.js`, `app/layout.js`
- **Actions:** Implement Firebase Auth, Auth Context, Login page
- **Dependencies:** Task 1
- **Risk:** Medium (Security)
- **Verify:** User can sign in, unauthorized users redirected to login

### Task 3: Firestore Setup & Security Rules
- **Files:** `firestore.rules` (deploy)
- **Actions:** Define rules (see Section 6), deploy to Firebase
- **Dependencies:** Task 2
- **Risk:** High (Security)
- **Verify:** Test each role's permissions via UI and Firebase Console

### Task 4: Jobs CRUD - Read
- **Files:** `app/jobs/page.js`, components/JobCard.js, components/JobList.js
- **Actions:** Query jobs collection, display list, add filters
- **Dependencies:** Task 2
- **Risk:** Low
- **Verify:** Jobs appear in list, sorting/filtering works

### Task 5: Jobs CRUD - Create/Update
- **Files:** `app/jobs/new/page.js`, `app/jobs/[id]/page.js`, components/JobForm.js
- **Actions:** Forms for creating/editing jobs, validation (Zod)
- **Dependencies:** Task 4
- **Risk:** Medium
- **Verify:** Create job -> appears in list; Edit job -> changes persist

### Task 6: Leads CRUD
- **Files:** `app/leads/page.js`, `app/leads/new/page.js`, `app/leads/[id]/page.js`
- **Actions:** Similar to Jobs, plus pipeline view and stage transitions
- **Dependencies:** Task 2
- **Risk:** Low
- **Verify:** Create lead -> appears in pipeline -> can convert to job

### Task 7: Technicians Management
- **Files:** `app/technicians/page.js`, components/TechCard.js
- **Actions:** List technicians, manage status, view current job
- **Dependencies:** Task 2
- **Risk:** Low
- **Verify:** Techs list renders, status updates reflect immediately

### Task 8: Financials Tracking
- **Files:** `app/financials/page.js`, components/FinancialForm.js
- **Actions:** Add income/expense entries, view summary
- **Dependencies:** Task 2, Task 7
- **Risk:** Medium
- **Verify:** Adding expense updates totals correctly

### Task 9: Dashboard Aggregation
- **Files:** `app/page.js` (Dashboard)
- **Actions:** Query aggregates (revenue, profit, counts), replace static stats
- **Dependencies:** Tasks 4, 5, 8
- **Risk:** Medium
- **Verify:** Stats match actual data in collections

### Task 10: Alerts & Insights UI
- **Files:** `app/alerts/page.js`, `app/insights/page.js`
- **Actions:** Display alerts (resolvable) and insights (read-only)
- **Dependencies:** Task 2
- **Risk:** Low
- **Verify:** Alerts can be resolved, insights display from Firestore

### Task 11: Kevin Integration (Basic)
- **Files:** `components/CommandBar.js`, `app/api/kevin/route.js`
- **Actions:** Connect command bar to API, send queries, display responses
- **Dependencies:** Task 9
- **Risk:** Medium (API cost)
- **Verify:** Query returns relevant data/response

### Task 12: Role-Based UI & Testing
- **Files:** All pages/components
- **Actions:** Enforce permissions in UI (hide buttons), run test plan
- **Dependencies:** Tasks 1-11
- **Risk:** Medium
- **Verify:** Test plan (Section 11) passes

---

## 11. TEST PLAN

| Feature | Test | Expected Result |
|---------|------|-----------------|
| **Auth** | Login with valid credentials | Redirect to dashboard |
| **Auth** | Login with invalid credentials | Error message shown |
| **Auth** | Access dashboard without login | Redirect to login |
| **Jobs - Create** | Submit valid job form | Job appears in list |
| **Jobs - Create** | Submit incomplete form | Validation errors shown |
| **Jobs - Edit** | Change job status to complete | Status updates, actuals calculate |
| **Jobs - Edit** | Assign tech to job | Tech sees job in "Assigned Jobs" |
| **Leads - Convert** | Convert won lead to job | New job created with lead data |
| **Leads - Convert** | Convert lost lead | Stage updates, no job created |
| **Tech - Status** | Tech marks self "off" | Status updates in panel |
| **Tech - Assignment** | Manager assigns tech to job | Tech sees job, status = assigned |
| **Financials - Add** | Add expense entry | Expense appears, totals update |
| **Financials - Add** | Add revenue entry | Revenue appears, totals update |
| **Metrics - Calc** | Complete 2 jobs with revenue | Dashboard shows sum |
| **Metrics - Calc** | Add expenses | Profit = Revenue - Expenses |
| **Alerts - Resolve** | Manager resolves alert | Alert marked resolved |
| **Alerts - Trigger** | Job cost exceeds budget | New alert auto-generated (if implemented) |
| **Insights - Display** | Create insight manually | Insight appears in list |
| **Permissions - Role** | Tech tries to access Financials | Access denied / hidden |
| **Permissions - Role** | Manager tries to delete user | Access denied (if restricted) |

---

## 12. MIGRATION / SALVAGE PLAN

### REUSE (Safe)
| Component | Reason |
|-----------|--------|
| `app/layout.js` (structure) | Basic HTML/body setup |
| `app/globals.css` | Tailwind config + custom CSS vars (glass panels, colors) |
| `tailwind.config.js` | Design system (colors, fonts) |
| `lib/firebase.js` | Basic Firebase init (needs auth added) |
| Icon components (Lucide) | Already installed |
| Framer Motion | Already installed |

### REPLACE (Unsafe/Prototype)
| Component | Reason |
|-----------|--------|
| `app/page.js` | All data is hardcoded, needs full rebuild |
| `app/firebase-client.js` | Needs proper auth + exports |
| All mock data arrays | Must be removed |
| Fallback logic (`\|\| value`) | Must be removed |

### NEW (To Build)
- Auth context + login page
- Jobs CRUD pages
- Leads CRUD pages
- Technicians page
- Financials page
- Alerts page
- Insights page
- Command bar + Kevin API

---

## END OF SPEC

**Next Step:** Phase 3 Implementation