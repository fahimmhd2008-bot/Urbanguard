# CivicAI — From Complaints to Action | AI for Civic Impact

> An AI-powered civic issue reporting and municipal management platform that transforms scattered citizen complaints into organized, prioritized, explainable, and trackable action.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — Hero, How It Works, Categories |
| `/submit` | Citizen complaint form with live AI assist & map picker |
| `/my-complaints` | All submitted complaints with search & filters |
| `/track/[id]` | Individual complaint tracking with timeline |
| `/admin` | Admin operations dashboard with metrics & charts |
| `/admin/complaints` | Full complaint management workbench |
| `/admin/map` | Geographic hotspot & spatial clustering map |
| `/admin/duplicates` | AI duplicate detection & merge workbench |
| `/api/complaints` | REST API — GET list / POST create |
| `/api/ai/analyze` | REST API — AI pipeline endpoint |

---

## 🏛️ Architecture

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout with Navbar & Footer
│   ├── page.tsx                # Landing page
│   ├── submit/page.tsx         # Complaint submission
│   ├── my-complaints/page.tsx  # Citizen portal
│   ├── track/[id]/page.tsx     # Live complaint tracking
│   ├── admin/
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── complaints/         # Management workbench
│   │   ├── map/                # Hotspot geo-analysis
│   │   └── duplicates/         # Duplicate review console
│   └── api/
│       ├── complaints/         # REST endpoint
│       └── ai/analyze/         # AI pipeline endpoint
│
├── components/
│   ├── common/                 # StatusBadge, PriorityBadge, Modal, CategoryIcon
│   ├── layout/                 # Navbar, Footer, NotificationDropdown
│   ├── citizen/                # ComplaintCard, ComplaintForm, TrackingTimeline
│   ├── admin/                  # MetricCard, ComplaintTable, ComplaintDetailModal,
│   │                           #   DashboardCharts, AIActionBriefModal
│   └── map/                    # CivicMap (Leaflet + OpenStreetMap)
│
├── lib/
│   ├── ai/
│   │   ├── classifier.ts       # Deterministic keyword-based category classification
│   │   ├── priorityScorer.ts   # Explainable 0-100 priority scoring (4 factors)
│   │   ├── summarizer.ts       # Factual 4-part incident summarization
│   │   ├── duplicateDetector.ts# Multi-factor duplicate detection (text+geo+time)
│   │   └── actionBrief.ts      # AI municipal executive action brief generator
│   ├── data/
│   │   ├── complaintService.ts # Main service layer (AI pipeline + storage)
│   │   └── mockComplaints.ts   # 42 realistic synthetic demonstration complaints
│   ├── supabase/
│   │   └── client.ts           # Supabase client with graceful fallback
│   └── utils/
│       ├── formatters.ts       # Date, priority, status formatting utilities
│       └── geo.ts              # Haversine distance + geographic clustering
│
└── types/
    └── civic.ts                # Full TypeScript type definitions
```

---

## 🗄️ Supabase Setup (Optional — App Works Without It)

The application runs fully with in-browser localStorage when Supabase is not configured.

To connect a real Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in your project's `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Run the SQL migration in the Supabase SQL editor:
   ```
   supabase/migrations/20261030_civicai_initial_schema.sql
   ```

The app automatically detects if Supabase is configured and uses it; otherwise it falls back to the in-memory store with demo data.

---

## 🤖 AI Engine — What's Real vs Algorithmic

| Capability | Implementation |
|-----------|----------------|
| **Category Classification** | Deterministic keyword-matching NLP (`classifier.ts`) |
| **4-Part Incident Summarization** | Rule-based structured text extraction (`summarizer.ts`) |
| **Priority Scoring (0–100)** | Transparent deterministic 4-factor backend math (`priorityScorer.ts`) |
| **Duplicate Detection** | Multi-factor: Jaccard text + Haversine geo + category + time (`duplicateDetector.ts`) |
| **Department Recommendation** | Keyword-to-department lookup with human-readable rationale |
| **Geographic Hotspot Detection** | Spatial radius clustering algorithm (`geo.ts`) |
| **AI Action Brief** | Data-driven template synthesis from real database records |

> **No LLM or external AI API is required.** All AI features work offline with the deterministic engine. The codebase is structured to plug in an LLM (OpenAI/Gemini) via `OPENAI_API_KEY` in `.env.local` if desired.

---

## 📊 Priority Scoring Formula

```
Total Score (0–100) =
  Safety Risk:        0–40 pts  (keywords: accident, electrocution, cave-in, sparking, ...)
+ Public Impact:      0–25 pts  (keywords: main road, metro, hospital, school, ...)
+ Urgency:            0–20 pts  (keywords: immediate, burst, rising, emergency, ...)
+ Related Frequency:  0–15 pts  (count of nearby duplicate candidate reports)

Priority Levels:
  Critical: 80–100
  High:      60–79
  Medium:    35–59
  Low:        0–34
```

Every score includes a human-readable explanation. Administrators can override scores only by providing a mandatory documented rationale (preserved in audit history).

---

## 🎯 Demo Dataset

42 pre-seeded realistic synthetic complaints organized into **5 geographic clusters**:

- **Cluster 1 — North Avenue Metro Corridor**: Road craters, dislodged drain grates, dead streetlights (5 complaints)
- **Cluster 2 — Riverside Sector**: Sewage flooding, contaminated water, missing manholes, submerged electrical (5 complaints)
- **Cluster 3 — Market District**: Commercial waste overflow, hazardous chemical dumping, buckled sidewalks (5 complaints)
- **Cluster 4 — Tech Corridor/Outer Ring**: Collapsed bus shelter, traffic signal failure, flyover bridge damage (5 complaints)
- **Cluster 5 — Old Town Heritage Precinct**: Retaining wall collapse, water supply outage, heritage lamppost damage (5 complaints)
- **Additional**: 22 spread across various categories and priorities

**Sample Tracking References:**
- `CIVIC-2026-1001` — Critical pothole, In Progress
- `CIVIC-2026-1006` — Critical sewage flooding, In Progress
- `CIVIC-2026-1009` — Resolved manhole (full history shown)

---

## 🔐 Security

- **RLS Policies**: Supabase Row Level Security on all tables
- **Role-based access**: Citizens only see/modify their own complaints; admins access all management functions
- **Input validation**: Client and server-side validation on all forms
- **No hardcoded secrets**: All credentials via environment variables only
- **Priority override audit**: Mandatory reason logged with timestamp and officer name

---

## ⚠️ Known Limitations

1. **Authentication**: The demo uses a quick role-switcher (Citizen/Admin button in navbar) rather than a full Supabase Auth session flow. Full auth integration is scaffolded and ready via `@supabase/supabase-js`.
2. **Image uploads**: Base64 preview works; for production, configure Supabase Storage and replace the base64 with upload URL.
3. **AI engine**: Uses deterministic NLP — connecting an external LLM will produce richer summaries. The code is structured to make that swap straightforward.
4. **Leaflet SSR**: The map uses `dynamic import` pattern — it renders client-side only. On first load there may be a brief skeleton.
5. **Data persistence**: Without Supabase configured, data persists in `localStorage` and resets if cleared. Use the "Reset Demo Dataset" button in the footer to restore the 42 seeded complaints.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Map | Leaflet + OpenStreetMap (free, no API key) |
| Charts | Recharts |
| Icons | Lucide React |
| Database | PostgreSQL via Supabase |
| Storage | Supabase Storage |
| Auth | Supabase Auth (scaffolded) |

---

*CivicAI — Transparent AI for Responsive Municipal Governance*
