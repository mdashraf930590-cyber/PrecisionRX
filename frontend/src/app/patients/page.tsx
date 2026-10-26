"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, Search, Filter, AlertTriangle, Dna, Activity, Brain,
  Settings, ChevronRight, ArrowUpRight, ArrowDownRight, Pill,
  Heart, ShieldAlert, Sparkles, CheckCircle2, Plus, ExternalLink,
  Download, RefreshCw, FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Comprehensive Clinical Patient Cohort
const COHORT_PATIENTS = [
  {
    id: "p1",
    name: "Margaret Johnson",
    age: 68,
    sex: "Female",
    mrn: "MRN-2024-001",
    condition: "Type 2 Diabetes + Essential HTN",
    pgxGene: "CYP2D6 *4/*4",
    pgxImpact: "Poor Metabolizer",
    activeMed: "Metformin + Codeine",
    riskScore: 0.89,
    status: "critical",
    adherence: 71,
    eGFR: 42,
    lastVisit: "Today, 09:15 AM",
  },
  {
    id: "p2",
    name: "Robert Chen",
    age: 54,
    sex: "Male",
    mrn: "MRN-2024-002",
    condition: "Atrial Fibrillation · Post-PCI",
    pgxGene: "CYP2C19 *2/*2",
    pgxImpact: "Loss-of-Function",
    activeMed: "Clopidogrel (Plavix) 75mg",
    riskScore: 0.62,
    status: "high",
    adherence: 84,
    eGFR: 78,
    lastVisit: "Yesterday, 03:30 PM",
  },
  {
    id: "p3",
    name: "Amelia Rodriguez",
    age: 41,
    sex: "Female",
    mrn: "MRN-2024-003",
    condition: "Familial Hypercholesterolemia",
    pgxGene: "SLCO1B1 *5 Carrier",
    pgxImpact: "Statin Myopathy Risk",
    activeMed: "Simvastatin 40mg QD",
    riskScore: 0.74,
    status: "high",
    adherence: 93,
    eGFR: 90,
    lastVisit: "Oct 24, 2026",
  },
  {
    id: "p4",
    name: "James Thompson",
    age: 73,
    sex: "Male",
    mrn: "MRN-2024-004",
    condition: "CKD Stage 3B + Refractory HTN",
    pgxGene: "CYP2C9 *3/*3",
    pgxImpact: "Reduced Clearance",
    activeMed: "Warfarin 5mg + Lisinopril",
    riskScore: 0.91,
    status: "critical",
    adherence: 65,
    eGFR: 34,
    lastVisit: "Oct 23, 2026",
  },
  {
    id: "p5",
    name: "Sarah Williams",
    age: 29,
    sex: "Female",
    mrn: "MRN-2024-005",
    condition: "Major Depressive Disorder",
    pgxGene: "CYP2D6 *1/*1",
    pgxImpact: "Normal Metabolizer",
    activeMed: "Sertraline 50mg QD",
    riskScore: 0.15,
    status: "low",
    adherence: 97,
    eGFR: 104,
    lastVisit: "Oct 22, 2026",
  },
  {
    id: "p6",
    name: "David Kim",
    age: 61,
    sex: "Male",
    mrn: "MRN-2024-006",
    condition: "Post-STEMI Recovery · CAD",
    pgxGene: "CYP2C19 *1/*17",
    pgxImpact: "Rapid Metabolizer",
    activeMed: "Ticagrelor 90mg BID",
    riskScore: 0.38,
    status: "medium",
    adherence: 88,
    eGFR: 82,
    lastVisit: "Oct 20, 2026",
  },
  {
    id: "p7",
    name: "Lisa Anderson",
    age: 47,
    sex: "Female",
    mrn: "MRN-2024-007",
    condition: "Colorectal Adenocarcinoma (Stage II)",
    pgxGene: "DPYD *2A Heterozygote",
    pgxImpact: "Severe Toxicity Hazard",
    activeMed: "Fluorouracil (5-FU) Planned",
    riskScore: 0.95,
    status: "critical",
    adherence: 92,
    eGFR: 75,
    lastVisit: "Oct 19, 2026",
  },
  {
    id: "p8",
    name: "Michael Davis",
    age: 58,
    sex: "Male",
    mrn: "MRN-2024-008",
    condition: "HIV-1 Infection · Naïve",
    pgxGene: "HLA-B *57:01 Positive",
    pgxImpact: "Hypersensitivity Risk",
    activeMed: "Antiretroviral Screening",
    riskScore: 0.82,
    status: "critical",
    adherence: 90,
    eGFR: 88,
    lastVisit: "Oct 18, 2026",
  },
  {
    id: "p9",
    name: "Elena Rostova",
    age: 52,
    sex: "Female",
    mrn: "MRN-2024-009",
    condition: "Rheumatoid Arthritis",
    pgxGene: "TPMT *3A/*3C",
    pgxImpact: "Intermediate Metabolizer",
    activeMed: "Azathioprine 50mg QD",
    riskScore: 0.58,
    status: "medium",
    adherence: 86,
    eGFR: 81,
    lastVisit: "Oct 17, 2026",
  },
  {
    id: "p10",
    name: "Marcus Vance",
    age: 66,
    sex: "Male",
    mrn: "MRN-2024-010",
    condition: "Deep Vein Thrombosis (DVT)",
    pgxGene: "VKORC1 -1639G>A",
    pgxImpact: "Warfarin Sensitivity",
    activeMed: "Warfarin 2.5mg QD",
    riskScore: 0.67,
    status: "high",
    adherence: 82,
    eGFR: 69,
    lastVisit: "Oct 15, 2026",
  },
];

// Unified Clinical Sidebar Navigation
function Sidebar() {
  const links = [
    { href: "/dashboard", icon: <Activity size={18} />, label: "Dashboard", badge: "Live" },
    { href: "/patients", icon: <Users size={18} />, label: "Patients", badge: "1,284", active: true },
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

      {/* Clinician Active Session Card */}
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

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [geneFilter, setGeneFilter] = useState<string>("all");

  const filteredPatients = COHORT_PATIENTS.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.activeMed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.pgxGene.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || patient.status === statusFilter;

    const matchesGene =
      geneFilter === "all" ||
      patient.pgxGene.toLowerCase().includes(geneFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesGene;
  });

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 flex flex-col">
      {/* Universal Top Navbar with three-strip line menu on right side */}
      <Navbar showSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-sky-200">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Patient Roster &amp; Pharmacogenomics Registry
                </h1>
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-600 text-white shadow-xs">
                  1,284 Cohort Enrolled
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-800 font-medium">
                Comprehensive patient management, metabolizer stratification, and real-time clinical decision triage
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/patient/p1">
                <button className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors">
                  <Sparkles size={14} />
                  <span>Open Featured Patient (p1)</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border-2 border-sky-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-sky-800 mb-1">
                <span>Active Clinical Cohort</span>
                <Users size={16} className="text-sky-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">1,284</div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">● 100% EHR Synced (HL7 FHIR R4)</div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-rose-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
                <span>Critical ADR Risk (0.80+)</span>
                <ShieldAlert size={16} className="text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600">42</div>
              <div className="text-[11px] text-rose-700 font-bold mt-1">Requires immediate pharmacist review</div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-purple-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-purple-800 mb-1">
                <span>Actionable PGx Phenotypes</span>
                <Dna size={16} className="text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700">672 (52.3%)</div>
              <div className="text-[11px] text-purple-700 font-bold mt-1">CPIC Level 1A guidelines flagged</div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
                <span>Safe Titrations Approved</span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">928</div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">0 fatal ADR incidents this quarter</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600" />
                <input
                  type="text"
                  placeholder="Filter by name, MRN, condition, or medication..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-sky-50 border-2 border-sky-200 rounded-xl focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-sky-100 p-1 rounded-xl">
                {[
                  { id: "all", label: "All Status" },
                  { id: "critical", label: "Critical" },
                  { id: "high", label: "High Risk" },
                  { id: "medium", label: "Moderate" },
                  { id: "low", label: "Low Risk" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setStatusFilter(btn.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === btn.id
                        ? "bg-white text-sky-950 shadow-xs"
                        : "text-sky-800 hover:text-sky-950"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <select
                value={geneFilter}
                onChange={(e) => setGeneFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-sky-50 border-2 border-sky-200 rounded-xl text-sky-950 focus:outline-none"
              >
                <option value="all">All Pharmacogenes</option>
                <option value="CYP2D6">CYP2D6</option>
                <option value="CYP2C19">CYP2C19</option>
                <option value="CYP2C9">CYP2C9</option>
                <option value="SLCO1B1">SLCO1B1</option>
                <option value="DPYD">DPYD</option>
                <option value="HLA-B">HLA-B</option>
              </select>
            </div>
          </div>

          {/* Patient Table */}
          <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sky-100/70 border-b-2 border-sky-200 text-sky-900 text-xs font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Patient Profile &amp; MRN</th>
                    <th className="py-3 px-4">Primary Diagnosis</th>
                    <th className="py-3 px-4">Pharmacogenomic Marker</th>
                    <th className="py-3 px-4">Active Medication</th>
                    <th className="py-3 px-4">ADR Risk Score</th>
                    <th className="py-3 px-4">Adherence / eGFR</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-xs font-semibold text-slate-800">
                  {filteredPatients.map((patient) => {
                    const isCritical = patient.status === "critical";
                    const isHigh = patient.status === "high";
                    const isMedium = patient.status === "medium";

                    return (
                      <tr
                        key={patient.id}
                        className="hover:bg-sky-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                                isCritical
                                  ? "bg-rose-100 text-rose-700 border border-rose-300"
                                  : isHigh
                                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                                  : "bg-sky-100 text-sky-700 border border-sky-300"
                              }`}
                            >
                              {patient.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                {patient.name}
                                {isCritical && (
                                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" title="Critical Alert" />
                                )}
                              </div>
                              <div className="text-[11px] text-sky-700 font-bold">
                                {patient.mrn} · {patient.age}y {patient.sex}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="text-slate-900 font-bold">
                            {patient.condition}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="inline-flex flex-col">
                            <span className="font-black text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-md text-[11px] w-fit">
                              {patient.pgxGene}
                            </span>
                            <span className="text-[10px] text-purple-700 font-bold mt-0.5">
                              {patient.pgxImpact}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">
                            {patient.activeMed}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isCritical
                                    ? "bg-rose-600"
                                    : isHigh
                                    ? "bg-amber-500"
                                    : isMedium
                                    ? "bg-sky-600"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.round(patient.riskScore * 100)}%` }}
                              />
                            </div>
                            <span
                              className={`font-black text-xs ${
                                isCritical
                                  ? "text-rose-600"
                                  : isHigh
                                  ? "text-amber-600"
                                  : "text-sky-800"
                              }`}
                            >
                              {(patient.riskScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{patient.adherence}% adherence</div>
                          <div className="text-[10px] text-sky-700 font-bold">eGFR: {patient.eGFR} mL/min</div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/patient/${patient.id}`}>
                            <button className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-colors">
                              <span>Profile</span>
                              <ChevronRight size={14} />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPatients.length === 0 && (
              <div className="p-8 text-center text-sky-800 font-bold">
                No patients found matching your search criteria.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
