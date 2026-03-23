# PHASE 2 — SYSTEM ARCHITECTURE DESIGN

**Goal:** Transform the prototype into a production-ready contractor operating system.

---

## 1. Core Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | Existing codebase, good for SSR/SSG |
| **Backend** | Firebase Functions | Existing Firebase project, event-driven |
| **Database** | Firestore | Existing, real-time sync built-in |
| **Auth** | Firebase Auth | Native Google/Email providers |
| **Hosting** | Vercel | Existing deployment |
| **Automation** | Firebase Scheduled Functions | Kevin integration, cron jobs |

**Optional future considerations:**
- Node.js API layer (if Firebase Functions insufficient)
- Stripe (invoicing/payments)
- Twilio (SMS notifications)

---

## 2. Firestore Schema

### Collection: `jobs`

```javascript
{
  id: string,                    // auto-generated
  storeNumber: string,           // e.g., "Pilot #54"
  customerName: string,          // e.g., "Pilot Flying J"
  location: {
    address: string,
    city: string,
    state: string,
    zip: string,
    lat: number,
    lng: number
  },
  jobType: string,               // "network_install" | "fiber" | "maintenance" | "repair"
  status: string,                // "pending" | "active" | "scheduled" | "complete" | "blocked" | "cancelled"
  priority: string,              // "low" | "medium" | "high" | "urgent"
  assignedTechs: string[],       // array of technician IDs
  scheduledStart: timestamp,
  scheduledEnd: timestamp,
  actualStart: timestamp,
  actualEnd: timestamp,
  quotedRevenue: number,
  actualRevenue: number,
  estimatedCost: number,
  actualCost: number,
  profit: number,                // computed: actualRevenue - actualCost
  margin: number,                // computed: profit / actualRevenue
  materials: [{                  // material line items
    name: string,
    quantity: number,
    unitCost: number,
    totalCost: number
  }],
  labor: [{                      // labor line items
    techId: string,
    hours: number,
    hourlyRate: number,
    totalCost: number
  }],
  notes: string,
  documents: string[],           // URLs to photos/PDFs
  createdBy: string,             // user ID
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `leads`

```javascript
{
  id: string,
  source: string,                // "sam.gov" | "web" | "referral" | "cold_call" | "repeat"
  company: string,
  contactName: string,
  contactEmail: string,
  contactPhone: string,
  location: {
    address: string,
    city: string,
    state: string,
    zip: string
  },
  jobType: string,
  description: string,
  estimatedValue: number,
  probabilityScore: number,      // 0-100
  stage: string,                // "new" | "contacted" | "qualifying" | "proposing" | "negotiating" | "won" | "lost"
  assignedTo: string,           // user ID
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `technicians`

```javascript
{
  id: string,
  name: string,
  role: string,                 // "lead_tech" | "tech" | "helper"
  email: string,
  phone: string,
  hourlyRate: number,
  status: string,               // "available" | "assigned" | "off" | "vacation"
  currentJobId: string | null,
  skills: string[],             // ["network", "fiber", "security", "cabling"]
  avatarUrl: string,
  hireDate: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `financials`

```javascript
{
  id: string,
  type: string,                 // "revenue" | "expense" | "adjustment"
  category: string,             // "labor" | "materials" | "equipment" | "overhead" | "other"
  amount: number,
  description: string,
  relatedJobId: string | null,
  relatedLeadId: string | null,
  date: timestamp,
  createdBy: string,
  createdAt: timestamp
}
```

### Collection: `alerts`

```javascript
{
  id: string,
  type: string,                 // "financial" | "operational" | "risk" | "safety" | "schedule"
  severity: string,             // "low" | "medium" | "high" | "critical"
  title: string,
  message: string,
  relatedEntityType: string,    // "job" | "lead" | "technician"
  relatedEntityId: string,
  resolved: boolean,
  resolvedBy: string,
  resolvedAt: timestamp,
  createdAt: timestamp
}
```

### Collection: `insights` (Kevin AI)

```javascript
{
  id: string,
  type: string,                 // "opportunity" | "warning" | "recommendation" | "alert"
  priority: string,             // "low" | "medium" | "high"
  title: string,
  message: string,
  recommendation: string,
  confidence: number,           // 0-100
  relatedEntityType: string,
  relatedEntityId: string,
  generatedBy: string,         // "kevin" | "manual"
  metadata: object,             // arbitrary AI-generated context
  createdAt: timestamp
}
```

### Collection: `users` (for roles)

```javascript
{
  id: string,                   // matches Firebase Auth UID
  email: string,
  displayName: string,
  role: string,                // "admin" | "manager" | "technician"
  permissions: {
    canCreateJobs: boolean,
    canEditJobs: boolean,
    canDeleteJobs: boolean,
    canViewFinancials: boolean,
    canEditFinancials: boolean,
    canManageTechnicians: boolean,
    canManageUsers: boolean,
    canRunKevin: boolean
  },
  preferences: {
    notifications: boolean,
    theme: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 3. Authentication & Roles

### Role Definitions

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: all CRUD, financials, user management, Kevin |
| **Manager** | Jobs: CRUD, financials: view only, leads: CRUD, technicians: view/assign, Kevin: run |
| **Technician** | Jobs: view assigned, leads: view, financials: none, Kevin: view insights only |

### Auth Flow

1. User visits app → Firebase Auth check
2. If not authenticated → redirect to login
3. If authenticated → fetch user role from `users` collection
4. Store role in context, enforce UI permissions
5. Firestore security rules validate backend access

### Firestore Security Rules (Draft)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function hasRole(roles) {
      return isAuthenticated() && request.auth.token.email in roles;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users - own record only
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId;
    }
    
    // Jobs - role-based
    match /jobs/{jobId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canCreateJobs == true;
      allow update, delete: if isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canEditJobs == true;
    }
    
    // Leads - role-based
    match /leads/{leadId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canCreateJobs == true;
    }
    
    // Technicians - restricted
    match /technicians/{techId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageTechnicians == true;
    }
    
    // Financials - admin/manager only
    match /financials/{finId} {
      allow read: if isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canViewFinancials == true;
      allow write: if isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canEditFinancials == true;
    }
    
    // Insights & Alerts - authenticated read, Kevin/system write
    match /insights/{insightId} {
      allow read: if isAuthenticated();
      allow create: if true; // Kevin/system
    }
    match /alerts/{alertId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

---

## 4. Kevin Integration Points

Kevin (this AI) needs write access to these collections:

| Collection | Kevin Action | Trigger |
|------------|--------------|---------|
| `leads` | Insert new leads from research | Manual or scheduled |
| `insights` | Generate AI recommendations | Cron job or manual |
| `alerts` | Create operational alerts | Cron job or event-triggered |

### Kevin Service Account

- Create dedicated Firebase service account for Kevin
- Grant elevated permissions to write `leads`, `insights`, `alerts`
- Use Firebase Admin SDK for server-side operations

### Scheduled Kevin Jobs (Future)

```javascript
// Example: Daily insight generation
exports.generateDailyInsights = functions.pubsub
  .schedule('0 8 * * 1-5')  // 8am weekdays
  .onRun(async (context) => {
    // Query jobs, leads, financials
    // Generate insights
    // Write to insights collection
  });
```

---

## 5. API Structure (Next.js + Firebase Functions)

### Client-Side API (useSWR / TanStack Query)

```
/api/jobs          - GET (list), POST (create)
/api/jobs/:id      - GET, PUT, DELETE
/api/leads         - GET, POST
/api/leads/:id     - GET, PUT, DELETE
/api/technicians   - GET
/api/financials    - GET (with role check)
/api/kevin         - POST (natural language query)
```

### Server-Side (Firebase Functions)

```
/functions/jobs/create
/functions/jobs/update
/functions/leads/convertToJob
/functions/kevin/generateInsights
/functions/kevin/analyzeLead
/functions/alerts/create
```

---

## 6. Frontend Architecture

### Pages

```
/                    → Dashboard (requires auth)
/login               → Login page
/jobs                → Jobs list
/jobs/new            → Create job
/jobs/:id            → Job detail
/jobs/:id/edit       → Edit job
/leads               → Leads list
/leads/new           → Create lead
/leads/:id           → Lead detail
/technicians         → Tech management (admin/manager)
/financials          → Financial overview (admin/manager)
/settings            → User settings
```

### State Management

- **React Context** for auth/user state
- **TanStack Query** (React Query) for Firestore data fetching + caching
- **Zustand** (optional) for complex UI state

### Components to Build

| Category | Components |
|----------|------------|
| Layout | Sidebar, Header, AuthGuard |
| Common | Button, Input, Select, Modal, Card, Badge, Loader |
| Jobs | JobList, JobCard, JobForm, JobTimeline |
| Leads | LeadList, LeadCard, LeadForm, LeadStage |
| Techs | TechList, TechCard, TechForm, TechAssign |
| Financials | RevenueChart, ExpenseBreakdown, ProfitSummary |
| Kevin | CommandBar, InsightCard, AskKevinModal |

---

## 7. Implementation Roadmap

### Phase 2A: Foundation (Week 1)

| Task | Effort | Priority |
|------|--------|----------|
| Set up Firebase project (if needed) | 2h | P0 |
| Configure Firebase Auth | 4h | P0 |
| Create Firestore security rules | 4h | P0 |
| Build login page | 4h | P0 |
| Implement auth context + protected routes | 4h | P0 |
| Remove hardcoded fallback data | 2h | P0 |

### Phase 2B: Core Data (Week 2)

| Task | Effort | Priority |
|------|--------|----------|
| Create jobs CRUD UI | 8h | P0 |
| Create leads CRUD UI | 6h | P1 |
| Create technicians management | 6h | P1 |
| Implement real-time listeners | 4h | P0 |
| Add loading/error states | 2h | P0 |

### Phase 2C: Business Logic (Week 3)

| Task | Effort | Priority |
|------|--------|----------|
| Financial tracking UI | 6h | P1 |
| Role-based UI permissions | 4h | P0 |
| Job assignment workflow | 4h | P1 |
| Lead → Job conversion | 2h | P1 |

### Phase 2D: Kevin Integration (Week 4)

| Task | Effort | Priority |
|------|--------|----------|
| Kevin command bar UI | 4h | P1 |
| Kevin API endpoint | 6h | P1 |
| Scheduled insight generation | 4h | P2 |
| Lead analysis automation | 6h | P2 |

---

## 8. Risks & Blockers

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase rate limits | Medium | Batch writes, caching |
| Kevin API costs | Medium | Budget limits, cache insights |
| Firestore cost scaling | Medium | Index optimization, pagination |
| Auth complexity | Low | Start simple, expand later |
| No Firebase Console access | High | Need credentials to configure rules |

---

## 9. Files to Modify/Create

### Modify

- `app/page.js` → Dashboard with real data
- `app/firebase-client.js` → Add auth + proper exports
- `app/layout.js` → Add auth provider

### Create

```
app/login/page.js
app/jobs/page.js
app/jobs/new/page.js
app/jobs/[id]/page.js
app/leads/page.js
app/technicians/page.js
app/financials/page.js
app/settings/page.js
components/ (many)
lib/auth.js
lib/queries.js
context/AuthContext.js
```

---

## Next Step

**Phase 3 — Implementation** can begin once:
1. Firebase Console access is available (to configure security rules)
2. Auth credentials confirmed
3. This architecture is approved
