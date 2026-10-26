# 02. Frontend Technologies & User Interface Architecture

This document provides a comprehensive technical analysis of the frontend stack, design system, component hierarchy, and client-side state management implemented in **PrecisionRx AI**.

---

## 1. Frontend Technology Stack Overview

| Technology | Version | Location in Codebase | Role / Responsibility |
|---|---|---|---|
| **Next.js** | `16.2.10` | `frontend/src/app/`, `package.json` | React application framework, App Router, hybrid SSR/CSR, Turbopack |
| **React** | `19.2.4` | `frontend/src/` | Declarative UI rendering, hooks, component lifecycle |
| **TypeScript** | `^5.0.0` | `frontend/tsconfig.json`, all `.tsx`/`.ts` | Static typing, clinical entity interfaces, type safety |
| **Tailwind CSS** | `^4.0.0` | `frontend/src/app/globals.css` | Utility-first styling engine, custom color design tokens |
| **Recharts** | `^2.15.1` | `dashboard/`, `insights/`, `patient/[id]/` | Interactive SVG data visualization (trends, SHAP importances, histograms) |
| **Zustand** | `^5.0.3` | `frontend/src/store/authStore.ts` | Minimalist client state for clinician authentication and active role |
| **Lucide React** | `^1.16.0` | Across all UI components | Scalable vector SVG iconography tailored for clinical workflows |
| **clsx & tailwind-merge** | `^2.1.1` / `^3.0.1` | Utility class composition | Dynamic conditional class merging without style collision |

---

## 2. Deep Dive: Why & Where Each Technology is Used

### 2.1 Next.js 16 (App Router + Turbopack)
- **Where It Is Used**:
  - `frontend/src/app/layout.tsx`: Root HTML layout with Google Font injection (Inter), metadata tags, and full-viewport structure.
  - `frontend/src/app/page.tsx`: Landing page with clinician role selection modal, clinical benefits, and feature matrices.
  - `frontend/src/app/dashboard/page.tsx`: Clinical cohort overview with real-time patient risk triage.
  - `frontend/src/app/patients/page.tsx`: Comprehensive patient roster, search, and pharmacogenomic filter system.
  - `frontend/src/app/insights/page.tsx`: Model registry, longitudinal outcomes, and global SHAP explainability.
  - `frontend/src/app/genomics/page.tsx`: Pharmacogenomic hub, CPIC Level 1A rules, and VCF dropzone.
  - `frontend/src/app/patient/[id]/page.tsx`: Dynamic route for deep-dive patient profile, EHR telemetry, and AI dosage panel.
  - `frontend/src/app/settings/page.tsx`: System settings, FHIR EHR gateways, and HIPAA audit logs.
- **Why It Was Chosen Over Alternatives (Vite / Pure React SPA / Remix)**:
  1. **Turbopack Build Speed**: Turbopack compiles pages in under **1.5 seconds**, enabling rapid development iteration and production bundle optimization.
  2. **File-System App Router**: Dynamic route nesting (`/patient/[id]`) provides clean URL-driven state and seamless deep-linking for medical charts.
  3. **Hybrid Hydration & Performance**: Initial HTML rendering guarantees lightning-fast First Contentful Paint (FCP) on hospital workstations, critical for emergency triage.

---

### 2.2 React 19 & TypeScript 5
- **Where It Is Used**:
  - Across every UI file in `frontend/src/`.
- **Why It Was Chosen**:
  1. **Clinical Type Safety**: In healthcare, a runtime error caused by passing an undefined `eGFR` or malformed star-allele string (`*4/*4`) can lead to erroneous prescribing. TypeScript enforces strict contracts:
     ```typescript
     interface PatientRecord {
       id: string;
       name: string;
       mrn: string;
       condition: string;
       pgxGene: string;
       pgxImpact: "Poor Metabolizer" | "Intermediate" | "Normal" | "Ultra-Rapid";
       riskScore: number;
       status: "critical" | "high" | "medium" | "low";
       eGFR: number;
       adherence: number;
     }
     ```
  2. **React 19 Reactivity**: Uses modern React 19 primitives with enhanced component re-render optimization, eliminating unnecessary re-renders of heavy biometric charts.

---

### 2.3 Tailwind CSS v4 & The Solid Clinical Design System
- **Where It Is Used**:
  - `frontend/src/app/globals.css` and inline Tailwind classes in all `.tsx` components.
- **Why It Was Chosen & Architectural Rules**:
  1. **Solid Sky Blue / White High-Contrast Theme**: Hospital monitors and physician workstations often have glare and variable ambient lighting. We explicitly rejected dark mode and semi-transparent glassy overlays in favor of:
     - **Primary Accent**: `#0284c7` (Sky Blue 600) — commanding, professional, and associated with medical authority.
     - **Active Border**: `#0369a1` (Sky Blue 700) and `#38bdf8` (Sky Blue 400).
     - **Container Backgrounds**: `#ffffff` (Solid White), `#f0f9ff` (Sky Blue 50), and `#e0f2fe` (Sky Blue 100).
     - **Typography**: High-contrast `#0f172a` (Slate 900) and `#0c4a6e` (Sky 900) ensuring **WCAG AAA Accessibility Compliance**.
  2. **Zero-Transparency Policy**: Dialog backdrops and sliding drawers use opaque white and solid borders so underlying text never bleeds through, preserving cognitive clarity for clinicians.

---

### 2.4 Recharts 2.15 (Data Visualization)
- **Where It Is Used**:
  - `dashboard/page.tsx`: Longitudinal 6-month clinical outcome area charts (`OUTCOME_DATA`).
  - `insights/page.tsx`: Clinical Efficacy curve (`EFFICACY_COMPARISON`), CYP2D6 population pie chart (`CYP2D6_DISTRIBUTION`), and SHAP feature importance bars.
  - `patient/[id]/page.tsx`: Longitudinal HbA1c lab trend chart, continuous heart-rate wearable telemetry (30-day plot).
- **Why It Was Chosen Over Chart.js or D3**:
  1. **React SVG Native Integration**: Recharts renders pure SVG elements directly into the React DOM tree. This avoids canvas blurring on high-DPI Retina screens and medical displays.
  2. **Custom Tooltips & Reference Lines**: Enables instant insertion of clinical threshold markers, such as `<ReferenceLine y={7.0} stroke="#059669" label="Target HbA1c" />` or critical HR alert bands.
  3. **Responsive Container**: Automatically recalculates chart geometry on window resizing without layout shifting.

---

### 2.5 Zustand 5 (Client State Management)
- **Where It Is Used**:
  - `frontend/src/store/authStore.ts`.
- **Why It Was Chosen Over Redux Toolkit / React Context**:
  1. **Minimalist Footprint (<1KB)**: Unlike Redux, which requires actions, reducers, dispatchers, and extensive boilerplate, Zustand manages authentication in 30 lines of code.
  2. **No Context Provider Wrapping**: Zustand hooks (`useAuthStore()`) can be called anywhere in the component tree without wrapping the entire application in context providers that trigger cascading re-renders.
  3. **Multi-Role Clinical Profiles**: Effortlessly tracks clinician role changes (`doctor`, `geneticist`, `pharmacist`, `admin`) and instantly updates navigation privileges across the application.

---

### 2.6 Lucide React (Clinical Iconography)
- **Where It Is Used**:
  - Navigation drawer, workspace sidebar, KPI stat cards, and risk badges.
- **Key Icons Used**:
  - `LayoutDashboard` & `Activity`: Dashboard clinical monitoring.
  - `Users`: Patient cohort registry.
  - `Brain`: Artificial intelligence & ML explainability.
  - `Dna`: Pharmacogenomic sequencing & star alleles.
  - `Settings` & `Shield`: HIPAA security and audit logging.
  - `AlertTriangle` & `ShieldAlert`: Critical contraindication and toxic hazard warnings.
- **Why It Was Chosen**:
  - Tree-shakable SVG icons with uniform 24px grid alignment, pixel-perfect rendering, and zero additional font-file downloads.

---

## 3. UI Component Architecture

```
frontend/src/
├── app/
│   ├── globals.css           # Global typography, color variables, and table utility classes
│   ├── layout.tsx            # Global HTML document wrapper with font definitions
│   ├── page.tsx              # Landing page, Benefits, Plans, and Role-Based Sign-In Modal
│   ├── dashboard/
│   │   └── page.tsx          # Main Clinical Dashboard (Cohort metrics, activity feed, risk table)
│   ├── patients/
│   │   └── page.tsx          # Cohort Registry (Search, gene filter chips, eGFR/adherence matrix)
│   ├── patient/[id]/
│   │   └── page.tsx          # Individual Patient Deep-Dive (Margaret Johnson, labs, SHAP, AI panel)
│   ├── insights/
│   │   └── page.tsx          # AI & PGx Insights (Trained models manifest, global SHAP, population data)
│   ├── genomics/
│   │   └── page.tsx          # Genomics Hub (8 core pharmacogenes, diplotype calculator, VCF dropzone)
│   └── settings/
│       └── page.tsx          # System Settings (FHIR gateway, federated learning node, HIPAA logs)
├── components/
│   └── Navbar.tsx            # Sticky top bar with logo, public nav links, clinician pill, and menu drawer
└── store/
    └── authStore.ts          # Zustand store for user session and clinical role
```

### 3.1 The Slide-Out Navigation Drawer
Implemented in [Navbar.tsx](file:///Users/mdashraf9431/PrecisionRX-AI/frontend/src/components/Navbar.tsx):
- Triggered by the 3-strip line **Menu** button in the top navigation bar.
- Uses an invisible click-catch overlay to close upon clicking outside.
- Features a verified clinician status card (`Dr. Rachel Kim, MD · Verified Clinician`).
- Directly routes clinicians to the 4 core clinical workspaces (**Dashboard**, **Patients**, **AI Insights**, **Genomics**) plus **System Settings**.
- Styled in 100% solid white with Sky Blue 600 borders (`#0284c7`), high-contrast typography, and live workspace status chips.
