# Keiretsu Radar

**AI-powered supplier intelligence platform that maps enterprise supply networks and monitors live public web data to detect financial, operational, compliance, and reputational risks before they disrupt the business.**

---

## What is Keiretsu Radar?

Keiretsu Radar is inspired by the Japanese concept of **keiretsu** (系列) — interconnected networks of companies operating through deep supplier, partner, and affiliate relationships. Modern enterprises depend on complex, multi-tier supply chains, but risk signals (regulatory changes, leadership turnover, financial distress, hiring freezes) appear on the public web long before they surface in internal procurement systems.

Keiretsu Radar bridges that gap. It uses **Bright Data** for live public web data collection and **AI** for structured risk analysis, producing actionable supplier intelligence dashboards and boardroom-ready risk briefs.

## Hackathon Track Fit

**Primary Track:** Finance & Market Intelligence
- Supplier and vendor risk monitoring
- Financial health signals, leadership changes, pricing trends
- Job posting analysis, regulatory tracking
- Live company signals at scale

**Secondary Track:** Security & Compliance
- Third-party risk monitoring
- Compliance and regulatory signal detection
- Cyber exposure monitoring

## Key Features

- **Supplier Network Graph** — Interactive visualization of supplier ecosystems with risk-coded nodes
- **Multi-Category Risk Scoring** — Transparent 0–100 scoring across 8 risk dimensions
- **Live Web Signal Collection** — Powered by Bright Data SERP API and Web Unlocker
- **AI-Generated Risk Briefs** — Executive summaries with evidence-backed recommendations
- **Signal Timeline** — Chronological evidence trail with sentiment analysis
- **Export & Print** — Copy or print boardroom-ready reports
- **Demo Mode** — Fully functional with realistic seeded data when API keys are not configured

## Bright Data Integration

Keiretsu Radar uses **Bright Data** as its core web data infrastructure:

| Product | Usage |
|---------|-------|
| **SERP API** | Search engine results for news, financial, regulatory, and hiring signals |
| **Web Unlocker** | Access public web pages for structured company data extraction |

The integration is implemented in [`src/lib/brightdata.ts`](src/lib/brightdata.ts) with these functions:

- `searchWebSignals(query)` — General topic search via SERP API
- `fetchCompanySignals(companyName, domain?)` — Multi-query company intelligence
- `fetchSupplierNews(companyName)` — News and press coverage
- `fetchHiringSignals(companyName)` — Job postings and workforce signals
- `fetchRegulatorySignals(companyName)` — Regulatory filings and compliance
- `fetchReputationSignals(companyName)` — Public sentiment and reviews

When Bright Data credentials are not present, the app transparently shows **"Demo Mode"** with a visible badge and uses realistic seeded data.

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── dashboard/page.tsx        # Main intelligence dashboard
│   ├── supplier/[id]/page.tsx    # Supplier detail view
│   ├── brief/page.tsx            # Executive risk brief
│   ├── settings/page.tsx         # Configuration guide
│   └── api/
│       ├── scan/route.ts         # POST - Run supplier intelligence scan
│       ├── suppliers/route.ts    # GET  - List all suppliers
│       ├── suppliers/[id]/route.ts # GET - Supplier detail + signals
│       ├── brief/route.ts        # POST - Generate AI risk brief
│       └── demo/route.ts         # GET  - Demo scan result
├── components/
│   ├── nav.tsx                   # Navigation bar
│   ├── risk-badge.tsx            # Risk level badges and scores
│   ├── mode-badge.tsx            # Live/Demo mode indicator
│   └── dashboard/
│       ├── network-graph.tsx     # React Flow supplier network
│       ├── risk-charts.tsx       # Risk distribution charts
│       ├── supplier-table.tsx    # Sortable supplier risk table
│       ├── signal-timeline.tsx   # Web signal evidence timeline
│       └── scan-input.tsx        # Search input component
└── lib/
    ├── types.ts                  # TypeScript data models
    ├── brightdata.ts             # Bright Data integration layer
    ├── demo-data.ts              # Seeded demo data (8 suppliers, 45 signals)
    ├── risk-scoring.ts           # Risk score calculation engine
    ├── ai-analysis.ts            # AI brief generation (OpenAI/Anthropic/fallback)
    └── utils.ts                  # Utility functions
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts
- **Graph:** React Flow
- **Data:** Bright Data SERP API & Web Unlocker
- **AI:** OpenAI GPT-4o-mini or Anthropic Claude (with deterministic fallback)

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Required for live mode
BRIGHT_DATA_API_KEY=your_api_key
BRIGHT_DATA_CUSTOMER_ID=your_customer_id
BRIGHT_DATA_SERP_ZONE=serp
BRIGHT_DATA_WEB_UNLOCKER_ZONE=unlocker

# Optional: AI-generated briefs (falls back to deterministic summaries)
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

## Local Setup

```bash
# Clone the repository
git clone https://github.com/your-username/KeiretsuRadar.git
cd KeiretsuRadar

# Install dependencies
npm install

# (Optional) Configure API keys
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Mode

The app ships with a complete demo scenario: **"EV Battery Supply Chain Risk Scan"** featuring:

- **8 fictional suppliers** across semiconductors, batteries, logistics, and chemicals
- **45 web signals** with realistic news, regulatory, financial, and hiring data
- **3 high-risk suppliers** with critical alerts
- **2 medium-risk suppliers** under review
- **3 low-risk suppliers** with stable profiles
- Interactive network graph, risk charts, and a full executive brief

No API keys needed — just `npm run dev` and click "Scan."

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

```bash
npm run build
npm start
```

## What Makes This Original

1. **Cultural concept as product metaphor** — Keiretsu (interconnected business networks) as the framing for supply chain intelligence
2. **Live web data → structured risk scoring** — Bright Data SERP API feeds into a transparent, weighted risk model
3. **Visual-first approach** — Network graphs, heatmaps, and timelines over tables and text
4. **Boardroom-ready outputs** — AI briefs designed for executive consumption, not raw data dumps
5. **Transparent data mode** — Clear distinction between live and demo data, never fake

## Risk Scoring Model

```
Risk Score = weighted average across 8 categories:

  20%  Financial Health (negative news volume)
  15%  Leadership Changes (executive turnover signals)
  15%  Hiring Momentum (layoffs, abnormal spikes)
  15%  Regulatory & Compliance (fines, investigations)
  15%  Reputation & Sentiment (media, reviews)
  10%  Product & Pricing (supply, availability)
   5%  Operational Stability (disruptions)
   5%  Cyber Exposure (breaches, data incidents)
  + 10% Source Confidence factor

Score Range:
  0–39  = Low Risk
  40–69 = Medium Risk
  70–100 = High Risk
```

## Future Roadmap

- Multi-tier supplier mapping (Tier 2, Tier 3 visibility)
- Automated alert workflows (Slack, email, webhook)
- Historical risk trending and comparison
- Custom supplier watchlists
- PDF report export
- Bright Data Web Scraper API for structured financial data
- Real-time monitoring with scheduled scans
- Multi-language signal analysis

## Demo Script

1. **Open the landing page** — Show the product concept and keiretsu explanation
2. **Click "EV Battery Supply Chain"** — Triggers the demo scan
3. **Watch the scan progress** — Loading states show each analysis stage
4. **Explore the network graph** — Click nodes to navigate to suppliers
5. **Review the risk table** — Sort by risk score, show high-risk alerts
6. **Click a high-risk supplier** (Pacific Rare Materials) — Show category breakdown and evidence
7. **Navigate to the Brief page** — Show the executive summary and recommended actions
8. **Copy the brief** — Demonstrate the export functionality
9. **Show the Settings page** — Explain Bright Data integration and live mode activation

## Pitch Deck Outline

1. **Problem:** Enterprise teams cannot see supplier risk early enough. Internal systems lag weeks behind public web signals.
2. **Why Now:** The web updates faster than ERP systems. AI can now structure unstructured web data at scale.
3. **Solution:** Keiretsu Radar — live web intelligence for supplier risk.
4. **Cultural Hook:** Keiretsu as connected supplier intelligence, not isolated vendor management.
5. **How It Works:** Bright Data collects → AI scores → Dashboard visualizes → Brief recommends.
6. **Demo Workflow:** Show the 60-second scan-to-brief flow.
7. **Business Value:** Earlier risk detection, reduced supply disruption, faster procurement decisions.
8. **Technical Architecture:** Next.js + Bright Data + AI analysis pipeline.
9. **Bright Data Integration:** SERP API for signal collection, Web Unlocker for page access.
10. **Roadmap:** Multi-tier mapping, automated alerts, real-time monitoring.

## Tags

AI Agents, Bright Data, Web Data, Supplier Risk, Market Intelligence, Finance, Compliance, Procurement, Risk Monitoring, Enterprise AI

---

Built for the [Bright Data Web Data UNLOCKED Hackathon](https://brightdata.com).
