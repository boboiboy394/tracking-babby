# Baby Tracker App - Design Specification

**Date:** 2026-03-15
**Author:** Claude
**Version:** 1.0

---

## 1. Project Overview

### 1.1 Purpose
A mobile application for parents and childcare facilities to track children's growth, feeding, milestones, vaccinations, and receive AI-powered insights and consultations.

### 1.2 Target Users
- **Primary:** Parents tracking their own children (1-5 children)
- **Secondary:** Nurseries and clinics managing multiple children

### 1.3 Platform
- Mobile (iOS/Android) via React Native (Expo)
- Web dashboard for clinics (future phase)

### 1.4 Timeline
- MVP: 1-2 months

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Mobile App (React Native)            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ Tracking │  │  AI Chat │  │Timeslice│  │ Profile │      │
│  │   UI     │  │   UI     │  │   UI    │  │   UI    │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │             │
│  ┌────┴─────────────┴─────────────┴─────────────┴────┐     │
│  │              State Management (Zustand)             │     │
│  └────────────────────────┬────────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐     │
│  │              Supabase Client (REST)                │     │
│  └────────────────────────┬────────────────────────────┘     │
└───────────────────────────┼──────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
        │ Supabase  │ │  AI API │ │  Video    │
        │  Database │ │(Claude) │ │  Processing│
        │  + Auth   │ │         │ │  (FFmpeg) │
        └───────────┘ └─────────┘ └───────────┘
```

### 2.2 Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile Framework | React Native (Expo) |
| Backend/DB | Supabase |
| AI | Anthropic Claude API |
| Video Processing | FFmpeg (server-side) |
| Hosting | Vercel (frontend) |
| State Management | Zustand |

---

## 3. Database Schema

### 3.1 Tables

#### profiles (extends auth.users)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| email | TEXT | User email |
| full_name | TEXT | Display name |
| role | TEXT | 'parent', 'nurse', 'clinic' |
| avatar_url | TEXT | Profile photo |
| created_at | TIMESTAMP | Creation time |

#### children
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| parent_id | UUID | References profiles(id) |
| name | TEXT | Child's name |
| birth_date | DATE | Date of birth |
| gender | TEXT | 'male', 'female' |
| photo_url | TEXT | Child's photo |
| clinic_id | UUID | Linked clinic (optional) |
| created_at | TIMESTAMP | Creation time |

#### tracking_records
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| child_id | UUID | References children(id) |
| record_type | TEXT | 'feeding', 'milestone', 'vaccination', 'growth', 'sleep' |
| record_date | TIMESTAMP | Date of record |
| data | JSONB | Flexible key-value store |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation time |

#### chat_sessions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| child_id | UUID | References children(id) |
| title | TEXT | Session title |
| created_at | TIMESTAMP | Creation time |

#### chat_messages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | References chat_sessions(id) |
| role | TEXT | 'user' or 'assistant' |
| content | TEXT | Message content |
| created_at | TIMESTAMP | Creation time |

### 3.2 Record Data Structures

| Type | Data Fields |
|------|-------------|
| feeding | `{ "type": "milk"|"porridge"|"solid", "amount_ml": number, "times": number }` |
| milestone | `{ "milestone_type": "teeth"|"crawl"|"walk"|"talk", "description": text }` |
| vaccination | `{ "vaccine_name": text, "dose_number": number, "date": date }` |
| growth | `{ "height_cm": number, "weight_kg": number, "head_circumference_cm": number }` |

---

## 4. UI/UX Design

### 4.1 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #FF6B9D | Main actions, buttons |
| Secondary | #7C4DFF | Secondary elements |
| Accent | #00D9A5 | Success, positive indicators |
| Background | #FFF8FA | App background |
| Surface | #FFFFFF | Cards, inputs |
| Text | #2D3436 | Primary text |
| Text Light | #636E72 | Secondary text |

### 4.2 Navigation Structure

```
┌─────────────────────────────────────┐
│           Baby Tracker App          │
├─────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐    │
│  │ Home  │ │ Track │ │  AI   │    │
│  │  🏠   │ │  📊  │ │ 🤖   │    │
│  └───────┘ └───────┘ └───────┘    │
│                                     │
│  ┌───────┐ ┌───────┐               │
│  │ Times │ │Profile│               │
│  │  🎬  │ │  👤   │               │
│  └───────┘ └───────┘               │
└─────────────────────────────────────┘
```

### 4.3 Screen List

1. **HomeScreen** - Dashboard with child overview
2. **TrackingScreen** - Add new tracking records
3. **GrowthScreen** - Height/weight charts
4. **MilestoneScreen** - Milestone timeline
5. **ChatScreen** - AI Doctor chat
6. **TimesliceScreen** - Video generation
7. **ProfileScreen** - Child management & settings

---

## 5. AI Features

### 5.1 AI Analysis

- User selects time range and data types
- System fetches relevant records from Supabase
- Claude API analyzes and provides insights
- Results displayed with recommendations

### 5.2 AI Doctor Chat

- Conversational interface with AI
- Maintains conversation history
- Quick question chips for common queries
- Always shows medical disclaimer

### 5.3 System Prompts

**AI Analysis:**
```
You are a pediatric AI assistant. Analyze the child's growth data and provide insights in Vietnamese. Be caring, professional.
```

**AI Doctor:**
```
You are Dr. Baby - a caring pediatric assistant. You provide general health guidance for children under 5 years old. Always remind users to consult real doctors for serious concerns. Answer in Vietnamese.
```

---

## 6. API Keys Required

| Service | Key Type | Status |
|---------|----------|--------|
| Supabase | Project URL + Anon Key | Needed |
| Anthropic Claude | API Key | Needed |
| Vercel | Account | Needed |
| Expo | Account | Needed |

---

## 7. Implementation Roadmap

### Week 1-2: Foundation
- Setup Expo project
- Setup Supabase (DB, Auth, Storage)
- Implement Authentication
- Create Child Profile management

### Week 3-4: Core Tracking
- Tracking UI (Add record screens)
- Growth tracking + chart
- Feeding & Milestone tracking
- Vaccination reminders

### Week 5-6: AI Features
- AI Analysis (Edge Function + Claude)
- AI Chat interface
- Quick question chips

### Week 7-8: Polish
- Timeslice feature (basic)
- Polish UI/UX
- Testing & Bug fixes
- Build iOS/Android

---

## 8. Cost Estimation

| Component | Free Tier | Paid |
|-----------|-----------|------|
| Supabase | $0 | $25/mo |
| Claude API | $5-20/mo | - |
| Vercel | $0 | $20/mo |
| **Total** | **$5-20/mo** | **$45-65/mo** |

---

## 9. Security Considerations

- Row Level Security (RLS) on all tables
- Users can only see their own children data
- Medical disclaimers on AI features
- Data encryption at rest (Supabase)

---

*This design document is a living specification and will be updated as the project evolves.*
