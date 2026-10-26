"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Settings, Shield, Server, Database, Lock,
  CheckCircle, Key, RefreshCw, FileText, Bell, Globe,
  Users, Brain, Dna, Activity
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Unified Clinical Sidebar Navigation
function Sidebar() {
  const links = [
    { href: "/dashboard", icon: <Activity size={18} />, label: "Dashboard", badge: "Live" },
    { href: "/patients", icon: <Users size={18} />, label: "Patients", badge: "1,284" },
    { href: "/insights", icon: <Brain size={18} />, label: "AI Insights", badge: "ML" },
    { href: "/genomics", icon: <Dna size={18} />, label: "Genomics", badge: "CPIC" },
    { href: "/settings", icon: <Settings size={18} />, label: "Settings", active: true },
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

const MOCK_AUDIT_LOGS = [
  { id: "aud-01", action: "AI_RECOMMEND_APPROVE", resource: "AIRecommendation (rec-102)", user: "Dr. Rachel Kim", ip: "192.168.1.104", time: "10 mins ago" },
  { id: "aud-02", action: "VCF_UPLOAD_PARSE", resource: "GenomicProfile (p1)", user: "Dr. Rachel Kim", ip: "192.168.1.104", time: "25 mins ago" },
  { id: "aud-03", action: "PATIENT_RECORD_READ", resource: "Patient (MRN-2024-001)", user: "Nurse Sarah Chen", ip: "192.168.1.112", time: "1 hour ago" },
  { id: "aud-04", action: "USER_AUTH_LOGIN", resource: "Session (u-101)", user: "Dr. Rachel Kim", ip: "192.168.1.104", time: "3 hours ago" },
  { id: "aud-05", action: "MEDICATION_PRESCRIBE", resource: "Medication (Lisinopril 10mg)", user: "Dr. Rachel Kim", ip: "192.168.1.104", time: "Yesterday" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "integrations" | "fl" | "audit">("general");
  const [fhirUrl, setFhirUrl] = useState("https://ehr.hospital-network.org/fhir/R4");
  const [flEpsilon, setFlEpsilon] = useState("1.0");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                System Settings &amp; Security
              </h1>
              <p className="text-xs sm:text-sm text-sky-800 font-medium">
                HIPAA compliance, FHIR gateway, and federated learning node parameters
              </p>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary text-xs py-2.5 px-4 self-start sm:self-auto shadow-xs">
            {isSaved ? "Settings Saved ✓" : "Save Changes"}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-list w-fit">
          {[
            { id: "general", label: "General & Profile", icon: <Settings size={14} /> },
            { id: "integrations", label: "EHR / FHIR Integrations", icon: <Globe size={14} /> },
            { id: "fl", label: "Federated Learning Node", icon: <Server size={14} /> },
            { id: "audit", label: "HIPAA Audit Log", icon: <Shield size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab-btn flex items-center gap-2 ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content: General */}
        {activeTab === "general" && (
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-900">Clinician Profile &amp; Hospital Credentials</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
                <input
                  defaultValue="Dr. Rachel Kim, MD"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border-2 border-sky-200 outline-none text-slate-900 font-medium focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                <input
                  defaultValue="dr.rachel.kim@precisionrx.ai"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border-2 border-sky-200 outline-none text-slate-900 font-medium focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">National Provider Identifier (NPI)</label>
                <input
                  defaultValue="1982736450"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border-2 border-sky-200 outline-none text-slate-900 font-mono font-bold focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Assigned Department</label>
                <input
                  defaultValue="Endocrinology &amp; Precision Therapeutics"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border-2 border-sky-200 outline-none text-slate-900 font-medium focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Integrations */}
        {activeTab === "integrations" && (
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-900">FHIR R4 &amp; EHR Connection</h2>
            <p className="text-xs text-sky-800 font-medium">PrecisionRx AI synchronizes patient demographics, labs, and active medications via SMART-on-FHIR.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">FHIR Base URL</label>
                <input
                  value={fhirUrl}
                  onChange={(e) => setFhirUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border-2 border-sky-200 outline-none text-slate-900 font-mono focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Client ID</label>
                  <input
                    defaultValue="precisionrx-fhir-client-prod"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border-2 border-sky-200 outline-none text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Client Secret</label>
                  <input
                    type="password"
                    defaultValue="••••••••••••••••••••••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border-2 border-sky-200 outline-none text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Federated Learning */}
        {activeTab === "fl" && (
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Hospital Federated Learning Node</h2>
                <p className="text-xs text-sky-800 font-medium">Differential Privacy Gaussian Mechanism (DP-FedAvg)</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border-2 border-emerald-300">
                ● Node Connected
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-sky-50 border-2 border-sky-200">
                <div className="text-xs text-sky-800 font-bold mb-1">Privacy Budget (ε)</div>
                <div className="text-2xl font-black font-mono text-sky-600">1.0</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Guarantees provable privacy</div>
              </div>
              <div className="p-4 rounded-xl bg-sky-50 border-2 border-sky-200">
                <div className="text-xs text-sky-800 font-bold mb-1">Local Training Epochs</div>
                <div className="text-2xl font-black font-mono text-purple-600">3 / round</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Edge XGBoost optimization</div>
              </div>
              <div className="p-4 rounded-xl bg-sky-50 border-2 border-sky-200">
                <div className="text-xs text-sky-800 font-bold mb-1">Consensus Rounds Complete</div>
                <div className="text-2xl font-black font-mono text-emerald-600">10 / 10</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Weights synchronized</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: HIPAA Audit Log */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b-2 border-sky-100 bg-sky-50/70 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">HIPAA Immutable Audit Trail</h2>
                <p className="text-xs text-sky-800 font-medium">Cryptographically verified access and modification logs (6-Year Retention)</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-mono font-bold">
                5 Events Logged
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Action Type</th>
                    <th>Resource Target</th>
                    <th>Authorizing User</th>
                    <th>Source IP</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AUDIT_LOGS.map((log) => (
                    <tr key={log.id}>
                      <td className="font-mono text-xs text-sky-900 font-bold">{log.id}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-100 text-sky-900 border border-sky-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="text-xs text-slate-700 font-medium">{log.resource}</td>
                      <td className="text-xs font-bold text-slate-900">{log.user}</td>
                      <td className="font-mono text-xs text-slate-500">{log.ip}</td>
                      <td className="text-xs text-slate-500 font-medium">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
      </div>
    </div>
  );
}
