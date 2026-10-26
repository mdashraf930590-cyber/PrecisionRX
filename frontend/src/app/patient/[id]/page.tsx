"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Brain, AlertTriangle, Check, X, ChevronRight,
  Activity, Dna, Pill, FileText, Heart, Watch, Clock,
  TrendingUp, TrendingDown, Info, Edit, Download, Zap
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell
} from "recharts";
import Navbar from "@/components/Navbar";

// ─── Mock Patient Data ────────────────────────────────────────────────────
const PATIENT = {
  id: "p1",
  name: "Margaret Johnson",
  age: 68,
  dob: "Mar 15, 1958",
  mrn: "MRN-2024-001",
  sex: "Female",
  blood_type: "A+",
  weight: "72 kg",
  height: "162 cm",
  insurance: "Medicare Advantage",
  primary_dx: "Type 2 Diabetes Mellitus + Essential Hypertension",
  risk_score: 0.89,
  adherence: 71,
  genomic_ready: true,
};

const LAB_DATA = [
  { date: "Apr", hba1c: 9.1, glucose: 189, egfr: 48, ldl: 142 },
  { date: "May", hba1c: 8.8, glucose: 175, egfr: 46, ldl: 138 },
  { date: "Jun", hba1c: 8.5, glucose: 162, egfr: 45, ldl: 131 },
  { date: "Jul", hba1c: 8.2, glucose: 155, egfr: 43, ldl: 128 },
  { date: "Aug", hba1c: 7.9, glucose: 148, egfr: 42, ldl: 125 },
  { date: "Sep", hba1c: 7.6, glucose: 141, egfr: 42, ldl: 119 },
];

const SNP_VARIANTS = [
  { gene: "CYP2D6", variant: "*4/*4", impact: "Poor Metabolizer", risk: "high", drugs: ["Codeine", "Tamoxifen", "Fluoxetine"] },
  { gene: "CYP2C19", variant: "*1/*1", impact: "Normal Metabolizer", risk: "low", drugs: [] },
  { gene: "CYP2C9", variant: "*1/*2", impact: "Intermediate Metabolizer", risk: "medium", drugs: ["Warfarin", "NSAIDs"] },
  { gene: "SLCO1B1", variant: "*5 carrier", impact: "Statin Myopathy Risk", risk: "high", drugs: ["Simvastatin", "Lovastatin"] },
  { gene: "HLA-B", variant: "*57:01 negative", impact: "No Abacavir Risk", risk: "low", drugs: [] },
];

const SHAP_DATA = [
  { feature: "CYP2D6 Poor Metabolizer", value: 0.35, direction: 1 },
  { feature: "eGFR = 42 (Stage 3 CKD)", value: 0.28, direction: 1 },
  { feature: "HbA1c = 7.6%", value: 0.18, direction: 1 },
  { feature: "Concurrent Metformin", value: 0.09, direction: 1 },
  { feature: "BMI = 31.2", value: 0.06, direction: 1 },
  { feature: "Age = 68", value: -0.04, direction: -1 },
  { feature: "LDL Improving Trend", value: -0.06, direction: -1 },
];

const WEARABLE_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Oct ${i + 1}`,
  hr: 72 + Math.sin(i * 0.3) * 8 + Math.random() * 5,
  spo2: 96 + Math.random() * 2,
  steps: 3500 + Math.random() * 2000,
  sleep: 5.5 + Math.random() * 2,
}));

// ─── AI Recommendation Panel (Solid Sky Blue Theme, No Transparency) ───────
function AIRecommendationPanel() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");

  return (
    <div className="bg-white rounded-3xl border-2 border-sky-300 p-6 shadow-md sticky top-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-sky-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Brain size={18} />
          </div>
          <span className="font-black text-slate-900 text-sm">AI Recommendation</span>
        </div>
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          Model v1.0.0
        </span>
      </div>

      {/* Drug Card */}
      <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-xs">
        <div className="text-[11px] font-black text-sky-800 mb-0.5 uppercase tracking-wider">Recommended Drug</div>
        <div className="text-xl font-black text-slate-900">Metformin HCl</div>
        <div className="text-xs font-black text-sky-700">500mg · Twice Daily (BID)</div>
        <div className="text-[11px] text-slate-600 font-medium mt-1">Titrate to 1000mg BID at week 4 based on eGFR stability</div>
      </div>

      {/* Confidence Score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700">Confidence Score</span>
          <span className="text-base font-black text-emerald-600">87%</span>
        </div>
        <div className="confidence-bar bg-sky-100">
          <div className="confidence-fill bg-emerald-500" style={{ width: "87%" }} />
        </div>
      </div>

      {/* ADR Risk */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border-2 border-amber-200">
        <div>
          <div className="text-[11px] font-bold text-amber-800">ADR Probability</div>
          <div className="font-black text-xs text-amber-900">12% · Mild Risk Expected</div>
        </div>
        <AlertTriangle size={18} className="text-amber-600" />
      </div>

      {/* Risk Flags */}
      <div>
        <div className="text-xs font-bold text-slate-800 mb-2">Clinical Risk Flags</div>
        <div className="space-y-1.5">
          {[
            { flag: "Renal dose adjustment needed (eGFR 42)", color: "#DC2626" },
            { flag: "CYP2D6 Poor Metabolizer (*4/*4)", color: "#DC2626" },
            { flag: "Monitor for rare lactic acidosis risk", color: "#D97706" },
          ].map((r) => (
            <div key={r.flag} className="flex items-center gap-2 p-2 rounded-lg bg-sky-50 border border-sky-200">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
              <span className="text-xs font-semibold text-slate-800">{r.flag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP Explainability */}
      <div>
        <div className="text-[11px] font-black text-sky-800 mb-2 uppercase tracking-wider">Why this recommendation?</div>
        <div className="space-y-2">
          {SHAP_DATA.slice(0, 5).map((s) => (
            <div key={s.feature}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-bold truncate pr-2">{s.feature}</span>
                <span className={`font-black font-mono ${s.direction > 0 ? "text-sky-600" : "text-rose-600"}`}>
                  {s.direction > 0 ? "+" : ""}{(s.value * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-sky-100 border border-sky-200">
                <div
                  className={`h-full rounded-full ${s.direction > 0 ? "bg-sky-600" : "bg-rose-600"}`}
                  style={{ width: `${s.value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NL Explanation */}
      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-slate-700 font-medium leading-relaxed">
        <Info size={13} className="inline mr-1 text-sky-600 font-bold" />
        Recommendation driven by: CYP2D6 Poor Metabolizer status (+35%), eGFR=42 (+28%), and positive HbA1c trajectory (+18%).
      </div>

      {/* Doctor Actions */}
      {status === "pending" ? (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button onClick={() => setStatus("approved")} className="btn-success flex items-center justify-center gap-1 text-xs py-2.5">
            <Check size={14} /> Approve
          </button>
          <button onClick={() => setStatus("rejected")} className="btn-danger flex items-center justify-center gap-1 text-xs py-2.5">
            <X size={14} /> Reject
          </button>
          <button className="btn-ghost col-span-2 flex items-center justify-center gap-1 text-xs py-2.5">
            <Edit size={13} /> Modify &amp; Approve
          </button>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border-2 ${
            status === "approved" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-rose-50 text-rose-800 border-rose-300"
          }`}
        >
          {status === "approved" ? <Check size={16} /> : <X size={16} />}
          <span>{status === "approved" ? "Recommendation Approved" : "Recommendation Rejected"}</span>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Overview ─────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "HbA1c", value: "7.6%", trend: "down", note: "Target: <7.0%", good: false },
          { label: "eGFR", value: "42", trend: "down", note: "Stage 3 CKD", good: false },
          { label: "Blood Pressure", value: "138/86", trend: "stable", note: "Hypertensive", good: false },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border-2 border-sky-200 p-4 shadow-sm">
            <div className="text-xs text-sky-800 font-bold mb-1">{m.label}</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{m.value}</span>
              {m.trend === "down" && <TrendingDown size={16} className="text-rose-600 font-bold" />}
              {m.trend === "up" && <TrendingUp size={16} className="text-emerald-600 font-bold" />}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">{m.note}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
        <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">HbA1c Trend (6-month)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={LAB_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: "#BAE6FD" }} tickLine={false} />
            <YAxis tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} domain={[6, 10]} unit="%" />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "2px solid #38BDF8",
                borderRadius: 10,
                color: "#0C4A6E",
                fontWeight: 600,
                boxShadow: "0 6px 16px rgba(2,132,199,0.15)"
              }}
            />
            <ReferenceLine y={7.0} stroke="#059669" strokeDasharray="4 4" label={{ value: "Target", fill: "#059669", fontSize: 11 }} />
            <Line type="monotone" dataKey="hba1c" stroke="#0284C7" strokeWidth={3} dot={{ fill: "#0284C7", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Tab: Genomics ─────────────────────────────────────────────────────────
function GenomicsTab() {
  return (
    <div className="space-y-6">
      {/* CYP450 Panel */}
      <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
        <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">CYP450 Enzyme Phenotype Status</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { enzyme: "CYP2D6", status: "Poor Metabolizer", risk: "high", color: "#DC2626" },
            { enzyme: "CYP2C19", status: "Normal Metabolizer", risk: "low", color: "#059669" },
            { enzyme: "CYP2C9", status: "Intermediate", risk: "medium", color: "#D97706" },
            { enzyme: "CYP3A4", status: "Normal Metabolizer", risk: "low", color: "#059669" },
          ].map((e) => (
            <div
              key={e.enzyme}
              className="p-4 rounded-xl border-2"
              style={{
                background: e.risk === "high" ? "#FEF2F2" : e.risk === "medium" ? "#FFFBEB" : "#ECFDF5",
                borderColor: e.risk === "high" ? "#FECACA" : e.risk === "medium" ? "#FDE68A" : "#A7F3D0",
              }}
            >
              <div className="font-mono text-sm font-black text-slate-900 mb-1">{e.enzyme}</div>
              <div className="text-xs font-bold" style={{ color: e.color }}>{e.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SNP Variant Table */}
      <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b-2 border-sky-100 bg-sky-50/70">
          <h3 className="font-black text-slate-900 text-sm sm:text-base">Detected Pharmacogenomic Variants</h3>
          <p className="text-xs text-sky-800 font-medium">Whole-exome sequencing aligned to CPIC clinical guidelines</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Gene</th>
                <th>Variant / Diplotype</th>
                <th>Clinical Phenotype</th>
                <th>Affected Drug Entities</th>
              </tr>
            </thead>
            <tbody>
              {SNP_VARIANTS.map((s) => (
                <tr key={s.gene}>
                  <td className="font-mono font-black text-slate-900 text-xs sm:text-sm">{s.gene}</td>
                  <td className="font-mono text-xs text-sky-900 font-bold">{s.variant}</td>
                  <td>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        s.risk === "high" ? "risk-critical" : s.risk === "medium" ? "risk-medium" : "risk-low"
                      }`}
                    >
                      {s.impact}
                    </span>
                  </td>
                  <td className="text-xs text-slate-700 font-medium">
                    {s.drugs.length > 0 ? s.drugs.join(", ") : "None reported"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Labs ─────────────────────────────────────────────────────────────
function LabsTab() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { name: "HbA1c", dataKey: "hba1c", color: "#0284C7", unit: "%", refLow: 4.5, refHigh: 6.5 },
          { name: "eGFR", dataKey: "egfr", color: "#7C3AED", unit: "mL/min", refLow: 60, refHigh: 120 },
          { name: "Plasma Glucose", dataKey: "glucose", color: "#D97706", unit: "mg/dL", refLow: 70, refHigh: 100 },
          { name: "LDL Cholesterol", dataKey: "ldl", color: "#059669", unit: "mg/dL", refLow: 0, refHigh: 100 },
        ].map((lab) => (
          <div key={lab.name} className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-slate-900 text-sm">{lab.name}</h4>
              <span className="text-xs text-sky-800 font-bold">Ref: {lab.refLow}–{lab.refHigh} {lab.unit}</span>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={LAB_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#0369A1", fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: "#BAE6FD" }} tickLine={false} />
                <YAxis tick={{ fill: "#0369A1", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} unit={` ${lab.unit}`} width={50} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "2px solid #38BDF8",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(2,132,199,0.15)"
                  }}
                />
                <ReferenceLine y={lab.refHigh} stroke="#DC2626" strokeDasharray="3 3" />
                <ReferenceLine y={lab.refLow} stroke="#059669" strokeDasharray="3 3" />
                <Line type="monotone" dataKey={lab.dataKey} stroke={lab.color} strokeWidth={3} dot={{ fill: lab.color, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Wearables ────────────────────────────────────────────────────────
function WearablesTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Heart Rate", value: "74 bpm", color: "#DC2626" },
          { label: "Avg SpO₂", value: "96.8%", color: "#0284C7" },
          { label: "Daily Steps", value: "4,210", color: "#059669" },
          { label: "Sleep Duration", value: "6.2 hrs", color: "#7C3AED" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border-2 border-sky-200 p-4 shadow-sm">
            <div className="text-2xl font-black mb-1" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-sky-800 font-bold">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
        <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">Continuous Heart Rate — 30 Day View</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={WEARABLE_DATA.slice(-20)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#0369A1", fontSize: 10, fontWeight: 600 }} axisLine={{ stroke: "#BAE6FD" }} tickLine={false} />
            <YAxis tick={{ fill: "#0369A1", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} unit=" bpm" />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "2px solid #38BDF8",
                borderRadius: 8,
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(2,132,199,0.15)"
              }}
            />
            <ReferenceLine y={100} stroke="#DC2626" strokeDasharray="4 4" label={{ value: "Alert", fill: "#DC2626", fontSize: 10 }} />
            <Line type="monotone" dataKey="hr" stroke="#DC2626" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Patient Profile Page ─────────────────────────────────────────────────
export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Overview", icon: <Activity size={14} /> },
    { id: "genomics", label: "Genomics", icon: <Dna size={14} /> },
    { id: "medications", label: "Medications", icon: <Pill size={14} /> },
    { id: "labs", label: "Labs", icon: <FileText size={14} /> },
    { id: "wearables", label: "Wearables", icon: <Watch size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 flex flex-col">
      {/* Universal Top Navbar with three-strip line menu on right side */}
      <Navbar />

      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Patient Hero Dossier Card */}
        <div className="bg-white rounded-3xl border-2 border-sky-300 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/patients">
              <button className="p-2.5 rounded-xl bg-sky-50 border-2 border-sky-200 text-sky-800 hover:text-sky-950 hover:bg-sky-100 transition-colors shadow-xs" title="Back to Patients Roster">
                <ArrowLeft size={16} />
              </button>
            </Link>
            <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl font-black border-2 border-sky-700 shadow-md">
              MJ
            </div>
            <div>
              <div className="text-[11px] font-black text-sky-700 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <Link href="/patients" className="hover:underline text-sky-600">Patients Cohort</Link>
                <span>/</span>
                <span className="text-slate-500 font-semibold">Clinical Deep-Dive</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{PATIENT.name}</h1>
                <span className="risk-critical px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Risk: {(PATIENT.risk_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-sky-800 font-semibold mt-1">
                <span>DOB: {PATIENT.dob} (Age {PATIENT.age})</span>
                <span>•</span>
                <span>Sex: {PATIENT.sex}</span>
                <span>•</span>
                <span>Blood: <strong className="text-slate-900">{PATIENT.blood_type}</strong></span>
                <span>•</span>
                <span>MRN: <strong className="font-mono text-slate-900">{PATIENT.mrn}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            <button className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-xs font-bold">
              <Download size={14} />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Content Layout: Main Tabs (left 65%) + AI Panel (right 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Tabs Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Context Meta Banner */}
            <div className="bg-white rounded-2xl border-2 border-sky-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
              <div>
                <span className="text-sky-800 font-medium">Insurance:</span>{" "}
                <strong className="text-slate-900">{PATIENT.insurance}</strong>
              </div>
              <div>
                <span className="text-sky-800 font-medium">Primary Condition:</span>{" "}
                <strong className="text-slate-900">{PATIENT.primary_dx}</strong>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold flex items-center gap-1">
                <Dna size={13} />
                Genomic Profile Sequenced
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="tab-list">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`tab-btn flex items-center gap-1.5 ${activeTab === t.id ? "active" : ""}`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Views */}
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "genomics" && <GenomicsTab />}
            {activeTab === "labs" && <LabsTab />}
            {activeTab === "wearables" && <WearablesTab />}
            {activeTab === "medications" && (
              <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
                <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">Current Active Medications</h3>
                {[
                  { drug: "Lisinopril", dose: "10mg QD", indication: "Hypertension", since: "Jan 2023", adherence: 85 },
                  { drug: "Atorvastatin", dose: "20mg QHS", indication: "Hyperlipidemia", since: "Mar 2022", adherence: 72 },
                  { drug: "Aspirin", dose: "81mg QD", indication: "Cardioprotection", since: "Jan 2023", adherence: 90 },
                ].map((m) => (
                  <div key={m.drug} className="flex items-center justify-between py-3.5 border-b-2 border-sky-100 last:border-0">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {m.drug} <span className="text-xs text-sky-700 font-black ml-1 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">{m.dose}</span>
                      </div>
                      <div className="text-xs text-sky-800 font-medium mt-0.5">{m.indication} · Prescribed {m.since}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-bold">Adherence</div>
                      <div className="text-sm font-black text-slate-900">{m.adherence}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* AI Recommendation Sticky Sidebar */}
          <div className="lg:col-span-1">
            <AIRecommendationPanel />
          </div>

        </div>

      </main>
    </div>
  );
}
