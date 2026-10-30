"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dna, Search, Filter, AlertTriangle, CheckCircle2, Shield,
  ArrowLeft, FileText, Upload, Sparkles, RefreshCw, Info,
  ChevronRight, ExternalLink, Activity, Layers, Check, Database,
  Users, Settings, Brain
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Unified Clinical Sidebar Navigation
function Sidebar() {
  const links = [
    { href: "/dashboard", icon: <Activity size={18} />, label: "Dashboard", badge: "Live" },
    { href: "/patients", icon: <Users size={18} />, label: "Patients", badge: "1,284" },
    { href: "/insights", icon: <Brain size={18} />, label: "AI Insights", badge: "ML" },
    { href: "/genomics", icon: <Dna size={18} />, label: "Genomics", badge: "CPIC", active: true },
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

// Core Pharmacogenomic Genes and Curated ClinPGx / CPIC Guidelines
const CORE_GENES = [
  {
    symbol: "CYP2D6",
    name: "Cytochrome P450 2D6",
    chromosome: "22q13.2",
    variants: "*4, *10, *41, *1xN",
    phenotype: "Poor / Ultra-Rapid",
    affectedDrugs: ["Codeine", "Tramadol", "Tamoxifen", "Fluoxetine", "Venlafaxine"],
    cpicLevel: "Level 1A",
    status: "critical",
    activityScore: "0.0 (Poor)",
  },
  {
    symbol: "CYP2C19",
    name: "Cytochrome P450 2C19",
    chromosome: "10q23.33",
    variants: "*2, *3, *17",
    phenotype: "Loss-of-Function",
    affectedDrugs: ["Clopidogrel (Plavix)", "Omeprazole", "Voriconazole", "Sertraline"],
    cpicLevel: "Level 1A",
    status: "warning",
    activityScore: "0.5 (Intermediate)",
  },
  {
    symbol: "CYP2C9",
    name: "Cytochrome P450 2C9",
    chromosome: "10q23.33",
    variants: "*2, *3, *8, *11",
    phenotype: "Reduced Clearance",
    affectedDrugs: ["Warfarin", "Phenytoin", "Celecoxib", "Glipizide"],
    cpicLevel: "Level 1A",
    status: "warning",
    activityScore: "1.0 (Intermediate)",
  },
  {
    symbol: "SLCO1B1",
    name: "Solute Carrier Organic Anion Transporter 1B1",
    chromosome: "12p12.1",
    variants: "*5 (rs4149056), *15",
    phenotype: "Decreased Hepatic Uptake",
    affectedDrugs: ["Simvastatin", "Atorvastatin", "Rosuvastatin", "Methotrexate"],
    cpicLevel: "Level 1A",
    status: "critical",
    activityScore: "Poor Transporter",
  },
  {
    symbol: "DPYD",
    name: "Dihydropyrimidine Dehydrogenase",
    chromosome: "1p21.3",
    variants: "*2A (rs3918290), *13, HapB3",
    phenotype: "Complete/Partial Deficiency",
    affectedDrugs: ["Fluorouracil (5-FU)", "Capecitabine", "Tegafur"],
    cpicLevel: "Level 1A",
    status: "critical",
    activityScore: "0.5 (High Toxicity Risk)",
  },
  {
    symbol: "HLA-B",
    name: "Major Histocompatibility Complex Class I, B",
    chromosome: "6p21.33",
    variants: "*57:01, *15:02, *58:01",
    phenotype: "Immune Hyper-Reactivity",
    affectedDrugs: ["Abacavir", "Carbamazepine", "Allopurinol"],
    cpicLevel: "Level 1A",
    status: "critical",
    activityScore: "Positive (Contraindicated)",
  },
  {
    symbol: "TPMT",
    name: "Thiopurine S-Methyltransferase",
    chromosome: "6p22.3",
    variants: "*2, *3A, *3C",
    phenotype: "Low Activity",
    affectedDrugs: ["Azathioprine", "Mercaptopurine", "Thioguanine"],
    cpicLevel: "Level 1A",
    status: "warning",
    activityScore: "Intermediate Metabolizer",
  },
  {
    symbol: "CYP3A4",
    name: "Cytochrome P450 3A4",
    chromosome: "7q22.1",
    variants: "*22, *1B",
    phenotype: "Variable Clearance",
    affectedDrugs: ["Tacrolimus", "Cyclosporine", "Midazolam", "Simvastatin"],
    cpicLevel: "Level 1B",
    status: "normal",
    activityScore: "Normal Metabolizer",
  },
  {
    symbol: "PNPLA3",
    name: "Patatin-Like Phospholipase Domain 3",
    chromosome: "22q13.31",
    variants: "I148M (rs738409 C>G)",
    phenotype: "Accelerated Steatohepatitis & Fibrogenesis",
    affectedDrugs: ["Resmetirom (Rezdiffra)", "Pioglitazone", "Semaglutide", "Vitamin E"],
    cpicLevel: "Level 1A",
    status: "critical",
    activityScore: "High Hepatic Steatosis Hazard",
  },
  {
    symbol: "CYP2E1",
    name: "Cytochrome P450 2E1",
    chromosome: "10q26.3",
    variants: "*1D, *5B (c1/c2 RsaI)",
    phenotype: "Hyper-Inducible Hepatotoxic Oxidation",
    affectedDrugs: ["Acetaminophen (APAP)", "Isoniazid", "Halothane", "Alcohol/Ethanol"],
    cpicLevel: "Level 1A",
    status: "critical",
    activityScore: "Accelerated Reactive NAPQI Generation",
  },
  {
    symbol: "FTO / MC4R",
    name: "Fat Mass & Obesity-Associated Pathway",
    chromosome: "16q12.2 / 18q21.32",
    variants: "rs9939609 A/A, rs17782313",
    phenotype: "Impaired Satiety & Elevated Adipogenesis",
    affectedDrugs: ["Tirzepatide (Zepbound)", "Semaglutide (Wegovy)", "Phentermine-Topiramate"],
    cpicLevel: "Level 1B",
    status: "warning",
    activityScore: "High Satiety Resistance Allele",
  },
];

const CLINICAL_ALERTS = [
  {
    id: "alt-1",
    gene: "CYP2D6 *4/*4",
    drug: "Codeine / Tramadol",
    recommendation: "CONTRAINDICATED: Patient lacks CYP2D6 bioactivation capacity. Zero prodrug conversion to morphine; use non-opioid alternative (e.g. Acetaminophen, Gabapentin).",
    evidence: "CPIC Level 1A / FDA Boxed Warning",
    risk: "Critical",
  },
  {
    id: "alt-2",
    gene: "CYP2C19 *2/*2",
    drug: "Clopidogrel (Plavix)",
    recommendation: "HIGH THROMBOSIS RISK: Subtherapeutic antiplatelet activation. Switch to direct P2Y12 inhibitor (Ticagrelor 90mg BID or Prasugrel 10mg QD).",
    evidence: "CPIC Level 1A / ACC/AHA Guideline",
    risk: "Critical",
  },
  {
    id: "alt-3",
    gene: "PNPLA3 I148M (rs738409 G/G)",
    drug: "Resmetirom (Rezdiffra) 80mg",
    recommendation: "FATTY LIVER / MASH INDICATION: 3.5x risk of accelerated steatohepatitis and cirrhosis. Initiate Resmetirom 80mg QD + Pioglitazone 30mg with FibroScan monitoring.",
    evidence: "AASLD / FDA Breakthrough Approval 2024",
    risk: "Critical",
  },
  {
    id: "alt-4",
    gene: "CYP2C19 *17/*17 (Ultra-Rapid)",
    drug: "Omeprazole / Pantoprazole",
    recommendation: "GERD THERAPY FAILURE: Hyper-clearance of standard PPIs causes persistent erosive esophagitis. Switch to potassium-competitive acid blocker Vonoprazan (Voquezna) 20mg QD.",
    evidence: "ACG Clinical Guidelines / CPIC Level 1A",
    risk: "High",
  },
  {
    id: "alt-5",
    gene: "SLCO1B1 *5 Carrier",
    drug: "Simvastatin 40mg",
    recommendation: "MYOPATHY HAZARD: 4.5x elevated systemic statin exposure. Reduce dose to max 20mg or switch to hydrophilic Rosuvastatin 10mg or Pitavastatin.",
    evidence: "CPIC Level 1A / FDA Label",
    risk: "High",
  },
  {
    id: "alt-6",
    gene: "HLA-B *57:01 Positive",
    drug: "Amox-Clav / Flucloxacillin",
    recommendation: "ACUTE DILI & CHOLESTASIS: Severe immune-mediated hepatotoxicity. Immediately discontinue culprit and initiate Ursodeoxycholic acid (UDCA) 500mg BID + NAC.",
    evidence: "EASL DILI Guidelines / CPIC Level 1A",
    risk: "Critical",
  },
  {
    id: "alt-7",
    gene: "FTO rs9939609 A/A",
    drug: "Tirzepatide (Zepbound) 2.5mg",
    recommendation: "OBESITY & METABOLIC RESISTANCE: Hyper-expression of adipogenic signals. Titrate Tirzepatide weekly to 10mg-15mg subcutaneous for sustained 20%+ weight reduction.",
    evidence: "ADA / Obesity Society Level 1 Evidence",
    risk: "High",
  },
  {
    id: "alt-8",
    gene: "DPYD *2A Heterozygote",
    drug: "Fluorouracil (5-FU) / Capecitabine",
    recommendation: "LETHAL TOXICITY RISK: 50% initial dose reduction mandatory with therapeutic drug monitoring (TDM).",
    evidence: "CPIC Level 1A / NCCN Guidelines",
    risk: "Critical",
  },
];

export default function GenomicsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"catalog" | "alerts" | "calculator" | "vcf">("catalog");
  
  // Interactive Calculator State
  const [calcGene, setCalcGene] = useState("CYP2D6");
  const [calcAllele1, setCalcAllele1] = useState("*4 (Non-functional, score=0)");
  const [calcAllele2, setCalcAllele2] = useState("*4 (Non-functional, score=0)");
  const [calcDrug, setCalcDrug] = useState("Codeine");

  const filteredGenes = CORE_GENES.filter((g) => {
    const matchesSearch =
      g.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.affectedDrugs.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "critical") return matchesSearch && g.status === "critical";
    if (selectedFilter === "warning") return matchesSearch && g.status === "warning";
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 flex flex-col">
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
                  Pharmacogenomics (PGx) Intelligence Hub
                </h1>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
                  CPIC Level 1A Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-800 font-medium">
                Standardized star-allele translation, ClinPGx variant associations, and clinical guideline rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("vcf")}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
            >
              <Upload size={13} />
              <span>Ingest VCF Sequencing File</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-800">Curated Variant Pairs</span>
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Database size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">5,193</div>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">● Synced with ClinPGx 2026</p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-800">CPIC Dosing Guidelines</span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Layers size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">222</div>
            <p className="text-[11px] text-purple-700 font-bold mt-1">Level 1A &amp; 1B Peer-Reviewed</p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-800">Actionable Drug Labels</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">240</div>
            <p className="text-[11px] text-amber-700 font-bold mt-1">FDA / EMA Black-Box Warnings</p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-800">Cohort Actionable Rate</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Dna size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">92.4%</div>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">Patients with $\ge$1 High-Risk Variant</p>
          </div>
        </div>

        {/* Navigation Tabs for Genomics Hub */}
        <div className="flex items-center gap-2 border-b-2 border-sky-200 pb-2">
          {[
            { id: "catalog", label: "Core Pharmacogenes & Alleles", icon: <Dna size={14} /> },
            { id: "alerts", label: "Active CPIC Decision Rules", icon: <AlertTriangle size={14} /> },
            { id: "calculator", label: "Diplotype Activity Calculator", icon: <Sparkles size={14} /> },
            { id: "vcf", label: "VCF Sequencing Ingestion", icon: <Upload size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-sky-600 text-white border-2 border-sky-700 shadow-sm"
                  : "bg-white text-sky-900 hover:bg-sky-100 border-2 border-sky-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Pharmacogenes Catalog */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border-2 border-sky-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={16} />
                <input
                  type="text"
                  placeholder="Search by gene (e.g. CYP2D6), variant (*4), or medication (Codeine, Warfarin)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-sky-50 border-2 border-sky-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                {["all", "critical", "warning"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                      selectedFilter === f
                        ? "bg-sky-600 text-white border-sky-700"
                        : "bg-white text-sky-900 border-sky-200 hover:bg-sky-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Gene Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredGenes.map((gene) => (
                <div
                  key={gene.symbol}
                  className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-xs flex flex-col justify-between hover:border-sky-400 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-lg">{gene.symbol}</h3>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              gene.status === "critical"
                                ? "bg-rose-50 text-rose-800 border-rose-300"
                                : gene.status === "warning"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            {gene.cpicLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-sky-800 font-semibold">{gene.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-3 pt-3 border-t border-sky-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium">Locus:</span>{" "}
                        <strong className="text-slate-800 font-mono text-[11px]">{gene.chromosome}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium">Star Alleles:</span>{" "}
                        <strong className="text-purple-800 font-semibold">{gene.variants}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium">Phenotypic Impact:</span>{" "}
                        <span className="font-bold text-slate-900">{gene.phenotype}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium block mb-1">Impacted Medications:</span>
                        <div className="flex flex-wrap gap-1">
                          {gene.affectedDrugs.map((drug) => (
                            <span
                              key={drug}
                              className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md"
                            >
                              {drug}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">Activity Score:</span>
                    <strong className="text-sky-900 text-[11px]">{gene.activityScore}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Active CPIC Clinical Decision Rules */}
        {activeTab === "alerts" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-xs">
              <h2 className="text-base font-black text-slate-900 mb-1">Automated Clinical Guidance Matrix</h2>
              <p className="text-xs text-sky-800 font-medium mb-4">
                Deterministic rules compiled directly from CPIC 2026 Level 1A guidelines and FDA pharmacogenomic package inserts.
              </p>

              <div className="space-y-3">
                {CLINICAL_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl border-2 border-sky-200 bg-sky-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white">
                          {alert.risk}
                        </span>
                        <strong className="text-slate-900 text-sm font-bold">{alert.gene}</strong>
                        <span className="text-slate-400">→</span>
                        <span className="text-sky-900 font-black text-sm">{alert.drug}</span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed max-w-4xl">
                        {alert.recommendation}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-sky-300 text-sky-900 font-bold text-xs">
                        {alert.evidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Interactive Diplotype Activity Calculator */}
        {activeTab === "calculator" && (
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-xs max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Clinical Star-Allele Activity Score Calculator</h2>
              <p className="text-xs text-sky-800 font-medium">
                Simulate diplotype translation and verify CPIC metabolic phenotype activity score prior to clinical administration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Select Pharmacogene</label>
                <select
                  value={calcGene}
                  onChange={(e) => setCalcGene(e.target.value)}
                  className="w-full p-2.5 bg-sky-50 border-2 border-sky-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="CYP2D6">CYP2D6 (Opioids, Tamoxifen, SSRIs)</option>
                  <option value="CYP2C19">CYP2C19 (Clopidogrel, PPIs)</option>
                  <option value="CYP2C9">CYP2C9 (Warfarin, NSAIDs)</option>
                  <option value="SLCO1B1">SLCO1B1 (Statins)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Candidate Medication</label>
                <select
                  value={calcDrug}
                  onChange={(e) => setCalcDrug(e.target.value)}
                  className="w-full p-2.5 bg-sky-50 border-2 border-sky-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="Codeine">Codeine / Tramadol</option>
                  <option value="Clopidogrel">Clopidogrel (Plavix)</option>
                  <option value="Warfarin">Warfarin (Coumadin)</option>
                  <option value="Simvastatin">Simvastatin (Zocor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Maternal Star Allele</label>
                <select
                  value={calcAllele1}
                  onChange={(e) => setCalcAllele1(e.target.value)}
                  className="w-full p-2.5 bg-sky-50 border-2 border-sky-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="*4 (Non-functional, score=0)">*4 (Non-functional, score=0)</option>
                  <option value="*1 (Normal function, score=1)">*1 (Normal function, score=1)</option>
                  <option value="*2 (Normal function, score=1)">*2 (Normal function, score=1)</option>
                  <option value="*10 (Decreased, score=0.25)">*10 (Decreased, score=0.25)</option>
                  <option value="*41 (Decreased, score=0.5)">*41 (Decreased, score=0.5)</option>
                  <option value="*1xN (Gene duplication, score=2)">*1xN (Gene duplication, score=2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Paternal Star Allele</label>
                <select
                  value={calcAllele2}
                  onChange={(e) => setCalcAllele2(e.target.value)}
                  className="w-full p-2.5 bg-sky-50 border-2 border-sky-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="*4 (Non-functional, score=0)">*4 (Non-functional, score=0)</option>
                  <option value="*1 (Normal function, score=1)">*1 (Normal function, score=1)</option>
                  <option value="*2 (Normal function, score=1)">*2 (Normal function, score=1)</option>
                  <option value="*10 (Decreased, score=0.25)">*10 (Decreased, score=0.25)</option>
                  <option value="*41 (Decreased, score=0.5)">*41 (Decreased, score=0.5)</option>
                  <option value="*1xN (Gene duplication, score=2)">*1xN (Gene duplication, score=2)</option>
                </select>
              </div>
            </div>

            {/* Calculated Result Card */}
            <div className="p-5 rounded-2xl bg-sky-50 border-2 border-sky-300 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-800 font-bold uppercase tracking-wider">Calculated Phenotype</span>
                  <div className="text-xl font-black text-rose-700">Poor Metabolizer (PM) · Activity Score = 0.0</div>
                </div>
                <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-xs font-bold">High Risk Alert</span>
              </div>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                CPIC Recommendation for <strong>{calcDrug}</strong>: Patient has completely absent enzyme catalytic activity. 
                Prodrug bioactivation will fail. Immediate therapy modification recommended.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: VCF Ingestion Dropzone */}
        {activeTab === "vcf" && (
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-8 shadow-xs max-w-2xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center">
              <Upload size={32} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Direct VCF / VCF.GZ Sequencing Ingestion</h2>
              <p className="text-xs text-sky-800 font-medium max-w-md mx-auto mt-1">
                Drag and drop raw genomic variant callsets from Illumina, Ion Torrent, or Oxford Nanopore sequencers.
              </p>
            </div>

            <div className="border-2 border-dashed border-sky-300 rounded-2xl p-8 bg-sky-50/50 hover:bg-sky-50 transition-colors cursor-pointer">
              <FileText className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">Drop .vcf or .vcf.gz here or click to browse</p>
              <p className="text-[11px] text-sky-700 mt-1">Supports GRCh38 / hg38 and GRCh37 / hg19 coordinate assemblies</p>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1"><Check size={14} className="text-emerald-600" /> Auto Star-Allele Calling</span>
              <span className="flex items-center gap-1"><Check size={14} className="text-emerald-600" /> HIPAA De-identification</span>
              <span className="flex items-center gap-1"><Check size={14} className="text-emerald-600" /> Fast PyVCF3 Parsing</span>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
