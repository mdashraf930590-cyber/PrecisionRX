"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain, Users, AlertTriangle, Activity, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Search, Bell, Settings,
  ChevronRight, Dna, Pill, FileText, Heart, Eye, Filter, Plus
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from "recharts";
import Navbar from "@/components/Navbar";

// ─── Mock Data ────────────────────────────────────────────────────────────
const MOCK_PATIENTS = [
  { id: "p1", name: "Margaret Johnson", age: 68, mrn: "MRN-2024-001", risk: 0.89, condition: "Type 2 Diabetes Mellitus + Essential HTN", status: "critical", adherence: 71 },
  { id: "p5", name: "Dr. Carlos Mendoza", age: 52, mrn: "MRN-2024-005", risk: 0.85, condition: "MASH / Fatty Liver Disease (F3 Fibrosis)", status: "critical", adherence: 89 },
  { id: "p7", name: "Patricia Green", age: 46, mrn: "MRN-2024-007", risk: 0.72, condition: "Refractory GERD & Severe Erosive Esophagitis", status: "high", adherence: 94 },
  { id: "p8", name: "Michael Davis", age: 58, mrn: "MRN-2024-008", risk: 0.93, condition: "Decompensated Hepatic Cirrhosis & Portal HTN", status: "critical", adherence: 76 },
  { id: "p3", name: "Amelia Rodriguez", age: 41, mrn: "MRN-2024-003", risk: 0.74, condition: "Severe Familial Dyslipidemia & Hypercholesterolemia", status: "high", adherence: 93 },
  { id: "p4", name: "James Thompson", age: 73, mrn: "MRN-2024-004", risk: 0.91, condition: "Refractory Stage 3B Hypertension + CKD", status: "critical", adherence: 65 },
  { id: "p9", name: "Elena Rostova", age: 39, mrn: "MRN-2024-009", risk: 0.68, condition: "Class II Severe Obesity (BMI 38.6) + MetSyn", status: "high", adherence: 91 },
  { id: "p12", name: "Arthur Pendelton", age: 63, mrn: "MRN-2024-012", risk: 0.96, condition: "Acute Drug-Induced Liver Injury (DILI) & Cholestasis", status: "critical", adherence: 88 },
  { id: "p6", name: "David Kim", age: 61, mrn: "MRN-2024-006", risk: 0.58, condition: "Mixed Atherogenic Dyslipidemia (TG 380)", status: "medium", adherence: 79 },
  { id: "p2", name: "Robert Chen", age: 54, mrn: "MRN-2024-002", risk: 0.62, condition: "Atrial Fibrillation · Post-PCI Stent", status: "high", adherence: 84 },
];

const OUTCOME_DATA = [
  { month: "May", improved: 68, stable: 22, worsened: 10 },
  { month: "Jun", improved: 71, stable: 20, worsened: 9 },
  { month: "Jul", improved: 74, stable: 19, worsened: 7 },
  { month: "Aug", improved: 73, stable: 21, worsened: 6 },
  { month: "Sep", improved: 78, stable: 17, worsened: 5 },
  { month: "Oct", improved: 82, stable: 14, worsened: 4 },
];

const ACTIVITY_FEED = [
  { time: "2m ago", event: "AI recommendation approved", patient: "Margaret Johnson", icon: <Brain size={14} />, color: "#0284C7" },
  { time: "8m ago", event: "Critical ADR flag raised", patient: "James Thompson", icon: <AlertTriangle size={14} />, color: "#DC2626" },
  { time: "15m ago", event: "Genomic profile processed", patient: "Robert Chen", icon: <Dna size={14} />, color: "#7C3AED" },
  { time: "1h ago", event: "Lab results imported", patient: "Amelia Rodriguez", icon: <FileText size={14} />, color: "#059669" },
  { time: "2h ago", event: "New medication prescribed", patient: "David Kim", icon: <Pill size={14} />, color: "#D97706" },
];

// ─── Risk Badge ───────────────────────────────────────────────────────────
function RiskBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    critical: { label: "Critical", cls: "risk-critical" },
    high:     { label: "High", cls: "risk-high" },
    medium:   { label: "Medium", cls: "risk-medium" },
    low:      { label: "Low", cls: "risk-low" },
  };
  const { label, cls } = config[status] || config.low;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>
      {label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ title, value, change, icon, color }: {
  title: string; value: string; change: string; icon: React.ReactNode; color: string;
}) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-sm hover:border-sky-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
            isPositive ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </span>
      </div>
      <div className="text-2xl font-black text-slate-900 mb-0.5">{value}</div>
      <div className="text-sky-800 text-xs font-bold">{title}</div>
    </div>
  );
}

// ─── Left Sidebar (Solid White & Sky Blue) ─────────────────────────────────
function Sidebar() {
  const links = [
    { href: "/dashboard", icon: <Activity size={18} />, label: "Dashboard", badge: "Live", active: true },
    { href: "/patients", icon: <Users size={18} />, label: "Patients", badge: "1,284" },
    { href: "/insights", icon: <Brain size={18} />, label: "AI Insights", badge: "ML" },
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

// ─── Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = MOCK_PATIENTS.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 flex flex-col">
      {/* Universal Top Navbar with three-strip line menu on right side */}
      <Navbar showSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Subheader */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Clinical Decision Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-sky-800 font-medium">
                Cohort risk stratification, ADR alerts, and pharmacogenomic recommendations
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/patient/p1">
                <button className="btn-primary text-xs py-2 px-3.5">
                  <Plus size={14} />
                  <span>New Clinical Assessment</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Patients" value="1,284" change="+12" icon={<Users size={18} />} color="#0284C7" />
            <StatCard title="High-Risk Alerts" value="47" change="+3" icon={<AlertTriangle size={18} />} color="#DC2626" />
            <StatCard title="Avg Adherence" value="84.2%" change="+2.1%" icon={<Activity size={18} />} color="#059669" />
            <StatCard title="Pending Reviews" value="23" change="-5" icon={<Clock size={18} />} color="#D97706" />
          </div>

          {/* Charts + Activity */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Treatment Outcome Chart (Solid White, Sky Blue accents) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">Treatment Outcome Trends</h3>
                  <p className="text-sky-800 text-xs font-medium">6-month longitudinal clinical efficacy</p>
                </div>
                <div className="flex gap-3 text-xs">
                  {[
                    { label: "Improved", color: "#059669" },
                    { label: "Stable", color: "#0284C7" },
                    { label: "Worsened", color: "#DC2626" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-slate-700 font-bold text-xs">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={OUTCOME_DATA}>
                  <defs>
                    <linearGradient id="colorImproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: "#BAE6FD" }} tickLine={false} />
                  <YAxis tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
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
                  <Area type="monotone" dataKey="improved" stroke="#059669" strokeWidth={3} fill="url(#colorImproved)" />
                  <Line type="monotone" dataKey="stable" stroke="#0284C7" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="worsened" stroke="#DC2626" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
              <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">Recent Clinical Activity</h3>
              <div className="space-y-4">
                {ACTIVITY_FEED.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold"
                      style={{ background: `${a.color}18`, color: a.color }}
                    >
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{a.event}</p>
                      <p className="text-[11px] text-sky-700 font-medium">{a.patient} · {a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Patient Table */}
          <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-sky-100 bg-sky-50/70">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">Patient Cohort</h3>
                <p className="text-xs text-sky-800 font-medium">Stratified by adverse reaction probability</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-white text-sky-800 rounded-full border border-sky-200 shadow-xs">
                {filtered.length} Patients
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>MRN</th>
                    <th>Primary Diagnosis</th>
                    <th>Risk Category</th>
                    <th>Adherence</th>
                    <th>Risk Index</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center text-xs font-black">
                            {p.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">Age {p.age}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-sky-900 font-semibold">{p.mrn}</td>
                      <td className="text-xs font-semibold text-slate-700">{p.condition}</td>
                      <td><RiskBadge status={p.status} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="confidence-bar w-16">
                            <div
                              className="confidence-fill"
                              style={{
                                width: `${p.adherence}%`,
                                background: p.adherence > 85 ? "#059669" : p.adherence > 70 ? "#D97706" : "#DC2626",
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{p.adherence}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs font-black" style={{ color: p.risk > 0.7 ? "#DC2626" : p.risk > 0.4 ? "#D97706" : "#059669" }}>
                          {(p.risk * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td>
                        <Link href={`/patient/${p.id}`}>
                          <button className="flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors py-1 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200">
                            <Eye size={13} />
                            <span>View Dossier</span>
                          </button>
                        </Link>
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
