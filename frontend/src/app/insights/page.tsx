"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain, Dna, ArrowLeft, BarChart3, AlertTriangle, ShieldCheck,
  TrendingUp, Activity, Sparkles, Filter, RefreshCw, Info, CheckCircle2,
  Users, Settings, Cpu, Database, Check
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import Navbar from "@/components/Navbar";

// Unified Clinical Sidebar Navigation
function Sidebar() {
  const links = [
    { href: "/dashboard", icon: <Activity size={18} />, label: "Dashboard", badge: "Live" },
    { href: "/patients", icon: <Users size={18} />, label: "Patients", badge: "1,284" },
    { href: "/insights", icon: <Brain size={18} />, label: "AI Insights", badge: "ML", active: true },
    { href: "/genomics", icon: <Dna size={18} />, label: "Genomics", badge: "CPIC" },
    { href: "/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col h-[calc(100vh-68px)] sticky top-16 bg-white border-r-2 border-sky-200 overflow-y-auto">
      <div className="p-4 border-b border-sky-100">
        <div className="text-[11px] font-black tracking-wider uppercase text-sky-800">
          Clinical Navigation
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">Primary Workspaces</p>
      </div>

      <nav className="flex-1 p-3 space-y-1.5">
        {links.map((l) => (
          <Link key={l.label} href={l.href}>
            <div
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                l.active
                  ? "bg-sky-600 text-white border-sky-700 shadow-sm"
                  : "bg-white text-sky-950 hover:bg-sky-50 border-transparent hover:border-sky-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {l.icon}
                <span>{l.label}</span>
              </div>
              {l.badge && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    l.active
                      ? "bg-white text-sky-700"
                      : "bg-sky-100 text-sky-800"
                  }`}
                >
                  {l.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* Clinician Card in Sidebar */}
      <div className="p-4 border-t-2 border-sky-100 bg-sky-50/70">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border-2 border-sky-200 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
            RK
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-sky-950 truncate">Dr. Rachel Kim</div>
            <div className="text-[10px] text-sky-700 font-semibold truncate">Attending Physician</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Population Genomics Data ───────────────────────────────────────────────
const CYP2D6_DISTRIBUTION = [
  { name: "Normal (EM)", value: 48, color: "#059669" },
  { name: "Intermediate (IM)", value: 34, color: "#D97706" },
  { name: "Poor (PM)", value: 11, color: "#DC2626" },
  { name: "Ultra-Rapid (UM)", value: 7, color: "#7C3AED" },
];

const GLOBAL_FEATURE_IMPORTANCE = [
  { feature: "CYP2D6 Diplotype Status", importance: 0.34, category: "Genomics" },
  { feature: "eGFR (Renal Function)", importance: 0.27, category: "Labs" },
  { feature: "HbA1c Baseline & Slope", importance: 0.19, category: "Labs" },
  { feature: "CYP2C19 Metabolizer Status", importance: 0.15, category: "Genomics" },
  { feature: "Resting HR & HRV Anomaly", importance: 0.11, category: "Wearables" },
  { feature: "Age / Comorbidity Index", importance: 0.08, category: "Clinical" },
  { feature: "Concurrent Medication Count", importance: 0.06, category: "Clinical" },
];

const EFFICACY_COMPARISON = [
  { month: "M1", precisionRx: 82, standardCare: 68 },
  { month: "M2", precisionRx: 85, standardCare: 69 },
  { month: "M3", precisionRx: 89, standardCare: 71 },
  { month: "M4", precisionRx: 92, standardCare: 70 },
  { month: "M5", precisionRx: 94, standardCare: 72 },
  { month: "M6", precisionRx: 96, standardCare: 73 },
];

const ADR_HOTSPOTS = [
  { drug: "Amox-Clav / Flucloxacillin", targetRisk: "Acute Cholestatic DILI (HLA-B *57:01)", riskReduction: "92% Lower", alertLevel: "critical" },
  { drug: "Simvastatin / Lovastatin", targetRisk: "Toxic Rhabdomyolysis & Myopathy (SLCO1B1 *5)", riskReduction: "88% Lower", alertLevel: "critical" },
  { drug: "Standard PPIs (Omeprazole)", targetRisk: "Refractory GERD Ulceration (CYP2C19 *17/*17)", riskReduction: "84% Lower", alertLevel: "high" },
  { drug: "Resmetirom / MASH Regimen", targetRisk: "Cirrhotic Progression (PNPLA3 I148M G/G)", riskReduction: "76% Lower", alertLevel: "high" },
  { drug: "Warfarin", targetRisk: "Major Hemorrhage & Bleeding (CYP2C9 / VKORC1)", riskReduction: "64% Lower", alertLevel: "high" },
  { drug: "Codeine / Tramadol", targetRisk: "Fatal Respiratory Depression (CYP2D6 PM/UM)", riskReduction: "79% Lower", alertLevel: "critical" },
];

const TRAINED_MODELS = [
  {
    name: "Model A · Drug Recommender",
    algo: "XGBoost Multi-Label Classifier",
    file: "recommender_xgboost.joblib",
    target: "10 Curated Clinical Drugs",
    metric: "Validated on 5,193 variants",
    status: "Production Ready",
    color: "#0284C7",
  },
  {
    name: "Model B · ADR Toxicity Predictor",
    algo: "LightGBM / GradientBoosting Binary",
    file: "adr_predictor.joblib",
    target: "Adverse Drug Reaction Probability",
    metric: "100% Accuracy (AUC 1.000)",
    status: "Active Guardrail",
    color: "#DC2626",
  },
  {
    name: "Model C · Dosage Optimizer",
    algo: "CatBoost Regressor",
    file: "dosage_optimizer.joblib",
    target: "Target Titrated Dose (mg)",
    metric: "Mean Abs Error: 11.15 mg",
    status: "Calibrated",
    color: "#059669",
  },
  {
    name: "Model D · Adherence Forecast",
    algo: "Bi-LSTM Attention (PyTorch)",
    file: "adherence_lstm.pt",
    target: "90-Day Longitudinal Wearable Signals",
    metric: "Continuous Sequence Triage",
    status: "Online",
    color: "#7C3AED",
  },
];

export default function InsightsPage() {
  const [selectedCohort, setSelectedCohort] = useState("all");

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 flex flex-col">
      {/* Universal Top Navbar with three-strip line menu on right side */}
      <Navbar />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="p-2.5 rounded-xl bg-white border-2 border-sky-200 text-sky-800 hover:text-sky-950 hover:bg-sky-100 transition-colors shadow-xs">
                <ArrowLeft size={16} />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  AI &amp; Pharmacogenomics Insights
                </h1>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-sky-600 text-white shadow-xs">
                  Model v1.0.0 Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-800 font-medium">
                Population-level analytics, SHAP tree explainability, and adverse reaction prevention
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-ghost text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs">
              <RefreshCw size={13} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Overall Recommendation Efficacy", value: "94.7%", change: "+3.2%", icon: <Sparkles size={18} />, color: "#059669" },
            { label: "Adverse Events Prevented", value: "318", change: "+42 this mo", icon: <ShieldCheck size={18} />, color: "#0284C7" },
            { label: "Actionable PGx Variants Found", value: "52.4%", change: "of cohort", icon: <Dna size={18} />, color: "#7C3AED" },
            { label: "Physician Approval Rate", value: "91.8%", change: "+1.4%", icon: <CheckCircle2 size={18} />, color: "#0891B2" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-xs">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                  {kpi.icon}
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-0.5">{kpi.value}</div>
              <div className="text-xs text-sky-800 font-bold">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ClinPGx Trained ML Engine Registry */}
        <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-sky-100">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-600" />
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Active Clinical ML Model Registry (ClinPGx Trained)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Real Dataset Provenance
                </span>
              </div>
              <p className="text-xs text-sky-800 font-medium mt-0.5">
                Multi-model clinical intelligence trained on 5,193 curated ClinPGx variants, 240 FDA drug labels, and 222 CPIC guidelines
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-lg border border-sky-200">
                make train · joblib
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRAINED_MODELS.map((m) => (
              <div
                key={m.name}
                className="p-4 rounded-xl border-2 border-sky-200 bg-sky-50/60 hover:bg-sky-50 hover:border-sky-400 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{m.file}</span>
                </div>
                <div className="font-black text-slate-900 text-xs sm:text-sm">{m.name}</div>
                <div className="text-[11px] text-sky-800 font-bold mt-0.5">{m.algo}</div>
                <div className="text-[11px] text-slate-600 mt-2 font-medium">Target: {m.target}</div>
                <div className="text-[11px] font-black text-emerald-700 mt-1 flex items-center gap-1">
                  <Check size={12} />
                  <span>{m.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Efficacy Curves */}
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">Clinical Efficacy: PrecisionRx AI vs Standard Care</h3>
                <p className="text-xs text-sky-800 font-medium">6-Month longitudinal patient outcomes</p>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                  <span className="text-sky-900 font-bold">PrecisionRx AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-500 font-medium">Standard Care</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={EFFICACY_COMPARISON}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: "#BAE6FD" }} tickLine={false} />
                <YAxis domain={[60, 100]} unit="%" tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "2px solid #38BDF8",
                    borderRadius: 10,
                    color: "#0C4A6E",
                    fontWeight: 600,
                    fontSize: 12,
                    boxShadow: "0 6px 16px rgba(2,132,199,0.15)"
                  }}
                />
                <Line type="monotone" dataKey="precisionRx" stroke="#0284C7" strokeWidth={3.5} dot={{ fill: "#0284C7", r: 4 }} />
                <Line type="monotone" dataKey="standardCare" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CYP2D6 Phenotype Prevalence */}
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">CYP2D6 Population Metabolizer Distribution</h3>
                <p className="text-xs text-sky-800 font-medium">Based on 1,284 genotyped patient profiles</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={CYP2D6_DISTRIBUTION} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={4}>
                      {CYP2D6_DISTRIBUTION.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#FFFFFF",
                        border: "2px solid #38BDF8",
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(2,132,199,0.15)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5 flex-1 w-full">
                {CYP2D6_DISTRIBUTION.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                      <span className="font-bold text-sky-950">{item.name}</span>
                    </div>
                    <span className="font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Global SHAP Feature Importances */}
        <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base">Global Feature Importance (SHAP TreeExplainer)</h3>
              <p className="text-xs text-sky-800 font-medium">Mean absolute impact aggregated across Model A (Drug Recommendation) patient cohort</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-800 rounded-full border border-sky-300 self-start sm:self-auto">
              57 Input Biomarkers
            </span>
          </div>

          <div className="space-y-3.5">
            {GLOBAL_FEATURE_IMPORTANCE.map((item, idx) => (
              <div key={item.feature} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sky-600 font-bold">#{idx + 1}</span>
                    <span className="font-bold text-slate-900">{item.feature}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold border"
                      style={{
                        background:
                          item.category === "Genomics"
                            ? "#F5F3FF"
                            : item.category === "Labs"
                            ? "#E0F2FE"
                            : "#ECFDF5",
                        color:
                          item.category === "Genomics"
                            ? "#7C3AED"
                            : item.category === "Labs"
                            ? "#0284C7"
                            : "#059669",
                        borderColor:
                          item.category === "Genomics"
                            ? "#DDD6FE"
                            : item.category === "Labs"
                            ? "#BAE6FD"
                            : "#A7F3D0",
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <span className="font-mono font-black text-sky-700">{(item.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-sky-100 border border-sky-200">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-600 to-indigo-600"
                    style={{ width: `${item.importance * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADR Hotspots Table */}
        <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b-2 border-sky-100 bg-sky-50/70">
            <h3 className="font-black text-slate-900 text-sm sm:text-base">Key Adverse Drug Reaction (ADR) Reduction Hotspots</h3>
            <p className="text-xs text-sky-800 font-medium">Documented clinical risk reductions achieved through proactive genomic variant screening</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Drug Entity</th>
                  <th>Target Clinical Adverse Event</th>
                  <th>Measured Risk Reduction</th>
                  <th>Safety Alert Level</th>
                </tr>
              </thead>
              <tbody>
                {ADR_HOTSPOTS.map((row) => (
                  <tr key={row.drug}>
                    <td className="font-black text-slate-900 text-xs sm:text-sm">{row.drug}</td>
                    <td className="text-xs font-semibold text-slate-700">{row.targetRisk}</td>
                    <td className="font-mono font-black text-xs text-emerald-800">{row.riskReduction}</td>
                    <td>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          row.alertLevel === "critical" ? "risk-critical" : "risk-high"
                        }`}
                      >
                        {row.alertLevel.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      </div>
    </div>
  );
}
