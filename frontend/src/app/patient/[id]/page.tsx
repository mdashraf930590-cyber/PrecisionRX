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

interface PrescriptionOrder {
  drug: string;
  dose: string;
  frequency: string;
  instructions: string;
  notes: string;
  prescriber: string;
  npi: string;
  timestamp: string;
}

const DEFAULT_PRESCRIPTION: PrescriptionOrder = {
  drug: "Metformin HCl",
  dose: "500mg",
  frequency: "Twice Daily (BID)",
  instructions: "Titrate to 1000mg BID at week 4 based on eGFR stability",
  notes: "Starting dosage modified based on patient's eGFR 42 (Stage 3 CKD) and CYP2D6 metabolizer profile. Scheduled 3-week renal function re-check.",
  prescriber: "Dr. Rachel Kim, MD",
  npi: "1892048123",
  timestamp: "Oct 28, 2026 · 11:20 AM",
};

// ─── AI Recommendation Panel (Solid Sky Blue Theme, No Transparency) ───────
function AIRecommendationPanel() {
  const [status, setStatus] = useState<"pending" | "approved" | "modified_approved" | "rejected">("pending");
  const [prescription, setPrescription] = useState<PrescriptionOrder>(DEFAULT_PRESCRIPTION);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("Patient reported past intolerance to biguanides");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form draft state for Modify Modal
  const [formDrug, setFormDrug] = useState(prescription.drug);
  const [formDose, setFormDose] = useState(prescription.dose);
  const [formFrequency, setFormFrequency] = useState(prescription.frequency);
  const [formInstructions, setFormInstructions] = useState(prescription.instructions);
  const [formNotes, setFormNotes] = useState(prescription.notes);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleOpenModifyModal = () => {
    setFormDrug(prescription.drug);
    setFormDose(prescription.dose);
    setFormFrequency(prescription.frequency);
    setFormInstructions(prescription.instructions);
    setFormNotes(prescription.notes);
    setIsModifyModalOpen(true);
  };

  const handleSaveModification = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedTime = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " · " + now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updated: PrescriptionOrder = {
      drug: formDrug,
      dose: formDose,
      frequency: formFrequency,
      instructions: formInstructions,
      notes: formNotes,
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: formattedTime,
    };

    setPrescription(updated);
    setStatus("modified_approved");
    setIsModifyModalOpen(false);
    showToast(`Order successfully modified & approved: ${updated.drug} ${updated.dose} (${updated.frequency})`);
  };

  const handleDirectApprove = () => {
    const now = new Date();
    const formattedTime = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " · " + now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setPrescription((prev) => ({
      ...prev,
      timestamp: formattedTime,
    }));
    setStatus("approved");
    showToast(`AI Recommendation for ${prescription.drug} 500mg approved by Dr. Rachel Kim, MD`);
  };

  const handleConfirmReject = () => {
    setStatus("rejected");
    setIsRejectModalOpen(false);
    showToast("AI Recommendation declined by prescriber");
  };

  const handleResetToDefault = () => {
    setPrescription(DEFAULT_PRESCRIPTION);
    setStatus("pending");
    showToast("Recommendation restored to original AI model proposal");
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-sky-300 p-6 shadow-md sticky top-20 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-sky-900 text-white text-xs font-bold border-2 border-sky-500 shadow-lg flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-sky-300 hover:text-white">
            <X size={13} />
          </button>
        </div>
      )}

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

      {/* Drug Card (Dynamic State-Aware) */}
      <div
        className={`p-4 rounded-2xl border-2 shadow-xs transition-colors ${
          status === "modified_approved"
            ? "bg-sky-50 border-sky-400"
            : status === "approved"
            ? "bg-emerald-50 border-emerald-400"
            : status === "rejected"
            ? "bg-rose-50 border-rose-300"
            : "bg-sky-50 border-sky-200"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-black text-sky-800 uppercase tracking-wider">
            {status === "modified_approved"
              ? "Modified Clinical Prescription"
              : status === "approved"
              ? "Approved Clinical Prescription"
              : status === "rejected"
              ? "Declined Prescription"
              : "Recommended Drug"}
          </span>
          {status === "modified_approved" && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-600 text-white flex items-center gap-1">
              <Check size={11} /> Modified &amp; Approved
            </span>
          )}
          {status === "approved" && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1">
              <Check size={11} /> Approved
            </span>
          )}
          {status === "rejected" && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white flex items-center gap-1">
              <X size={11} /> Rejected
            </span>
          )}
        </div>

        <div className="text-xl font-black text-slate-900">{prescription.drug}</div>
        <div className="text-xs font-black text-sky-700">
          {prescription.dose} · {prescription.frequency}
        </div>
        <div className="text-[11px] text-slate-600 font-medium mt-1">
          {prescription.instructions}
        </div>

        {/* Clinician Modification Note */}
        {status === "modified_approved" && (
          <div className="mt-3 p-2.5 rounded-xl bg-white border border-sky-300 text-xs">
            <div className="text-[10px] font-black uppercase text-sky-800 tracking-wider mb-0.5">
              Attending Physician Rationale:
            </div>
            <p className="text-slate-800 font-medium italic">&ldquo;{prescription.notes}&rdquo;</p>
            <div className="text-[10px] text-sky-700 font-bold mt-1.5 pt-1 border-t border-sky-100 flex items-center justify-between">
              <span>Prescriber: {prescription.prescriber}</span>
              <span>{prescription.timestamp}</span>
            </div>
          </div>
        )}

        {/* Approval Signature */}
        {status === "approved" && (
          <div className="mt-2.5 pt-2 border-t border-emerald-200 text-[10px] font-bold text-emerald-800 flex items-center justify-between">
            <span>Signed: Dr. Rachel Kim, MD (NPI #{prescription.npi})</span>
            <span>{prescription.timestamp}</span>
          </div>
        )}

        {/* Rejection Note */}
        {status === "rejected" && (
          <div className="mt-2.5 p-2 rounded-lg bg-white border border-rose-200 text-xs text-rose-800">
            <span className="font-bold">Reason:</span> {rejectionReason}
          </div>
        )}
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
          <button
            id="rec-approve-btn"
            onClick={handleDirectApprove}
            className="btn-success flex items-center justify-center gap-1.5 text-xs py-2.5 font-black"
          >
            <Check size={14} /> Approve
          </button>
          <button
            id="rec-reject-btn"
            onClick={() => setIsRejectModalOpen(true)}
            className="btn-danger flex items-center justify-center gap-1.5 text-xs py-2.5 font-black"
          >
            <X size={14} /> Reject
          </button>
          <button
            id="rec-modify-btn"
            onClick={handleOpenModifyModal}
            className="btn-ghost col-span-2 flex items-center justify-center gap-1.5 text-xs py-2.5 font-black bg-sky-100 text-sky-900 border-2 border-sky-300 hover:bg-sky-200"
          >
            <Edit size={14} className="text-sky-700" /> Modify &amp; Approve
          </button>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <div
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border-2 ${
              status === "modified_approved"
                ? "bg-sky-50 text-sky-900 border-sky-300"
                : status === "approved"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-rose-50 text-rose-800 border-rose-300"
            }`}
          >
            {status === "modified_approved" && <Check size={16} className="text-sky-600" />}
            {status === "approved" && <Check size={16} className="text-emerald-600" />}
            {status === "rejected" && <X size={16} className="text-rose-600" />}
            <span>
              {status === "modified_approved"
                ? "Modified Order Approved & Signed"
                : status === "approved"
                ? "Recommendation Approved"
                : "Recommendation Declined"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOpenModifyModal}
              className="py-2 px-3 rounded-xl bg-white border-2 border-sky-300 text-sky-800 hover:bg-sky-50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Edit size={13} /> {status === "modified_approved" ? "Edit Order" : "Modify Order"}
            </button>
            <button
              onClick={handleResetToDefault}
              className="py-2 px-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              Reset to AI Default
            </button>
          </div>
        </div>
      )}

      {/* ─── Modify & Approve Modal Dialog ─────────────────────────────────── */}
      {isModifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-3 border-sky-400 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-sky-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Edit size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Modify &amp; Approve Clinical Order</h3>
                  <p className="text-xs text-sky-800 font-bold">
                    Patient: Margaret Johnson · MRN-2024-001 · eGFR 42 (Stage 3 CKD)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModifyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModification} className="space-y-4">
              {/* Row 1: Drug & Dose */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">
                    Select Medication
                  </label>
                  <select
                    value={formDrug}
                    onChange={(e) => setFormDrug(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Metformin HCl">Metformin HCl (Biguanide)</option>
                    <option value="Sitagliptin (Januvia)">Sitagliptin / Januvia (DPP-4 Inhibitor)</option>
                    <option value="Empagliflozin (Jardiance)">Empagliflozin / Jardiance (SGLT2 Inhibitor)</option>
                    <option value="Glipizide">Glipizide (Sulfonylurea)</option>
                    <option value="Linagliptin (Tradjenta)">Linagliptin / Tradjenta (Hepatic Elimination)</option>
                    <option value="Insulin Glargine">Insulin Glargine (Basal Insulin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">
                    Dosage Strength
                  </label>
                  <select
                    value={formDose}
                    onChange={(e) => setFormDose(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="250mg">250mg (Renal Starting Dose)</option>
                    <option value="500mg">500mg (Standard Starting Dose)</option>
                    <option value="750mg">750mg (Intermediate Titration)</option>
                    <option value="850mg">850mg (Standard Maintenance)</option>
                    <option value="1000mg">1000mg (Maximum Renal Capped Dose)</option>
                    <option value="25mg">25mg (Renal Adjusted Dose)</option>
                    <option value="50mg">50mg (Standard DPP-4 Dose)</option>
                    <option value="10mg">10mg (Starting SGLT2 Dose)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Frequency & Administration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">
                    Frequency / Schedule
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Twice Daily (BID)">Twice Daily (BID) with meals</option>
                    <option value="Once Daily (QD)">Once Daily (QD) with breakfast</option>
                    <option value="Three Times Daily (TID)">Three Times Daily (TID) with meals</option>
                    <option value="At Bedtime (QHS)">At Bedtime (QHS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">
                    Genomic Safety Check
                  </label>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 h-[38px]">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span>CPIC Level A Verified · No Contraindications</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Titration Instructions */}
              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">
                  Titration &amp; Nurse/Pharmacist Instructions
                </label>
                <input
                  type="text"
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Titrate to 1000mg BID at week 4 based on eGFR stability"
                />
              </div>

              {/* Row 4: Clinical Justification Notes */}
              <div>
                <label className="block text-xs font-black text-sky-900 mb-1">
                  Prescriber Clinical Rationale (Saved to EHR Audit Log)
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500 leading-relaxed"
                  placeholder="Document why dosage or drug was modified from the AI baseline..."
                />
              </div>

              {/* Row 5: Prescriber Sign-off Banner */}
              <div className="p-3 rounded-xl bg-sky-50 border-2 border-sky-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-black text-slate-900">Dr. Rachel Kim, MD</div>
                  <div className="text-[11px] text-sky-800 font-medium">Attending Physician · NPI #1892048123 · Lic #NY-MD-99412</div>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded bg-sky-600 text-white uppercase tracking-wider">
                  Digital Sign-off
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsModifyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 border border-sky-700"
                >
                  <Check size={15} /> Confirm &amp; Sign Modified Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Reject Modal Dialog ───────────────────────────────────────────── */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-3 border-rose-400 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle size={18} />
                <h3 className="text-sm font-black text-slate-900">Decline AI Recommendation</h3>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please specify the clinical rationale for declining this AI dosing recommendation. This will be recorded in the hospital quality audit trail.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Clinical Reason</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border-2 border-rose-200 bg-rose-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-400"
              >
                <option value="Patient reported past intolerance to biguanides">Patient reported past intolerance to biguanides</option>
                <option value="Active acute renal impairment concern">Active acute renal impairment concern</option>
                <option value="Alternative therapeutic class preferred by specialist">Alternative therapeutic class preferred by specialist</option>
                <option value="Scheduled for contrast imaging within 48h">Scheduled for contrast imaging within 48h</option>
                <option value="Clinical judgment / Prescriber discretion">Clinical judgment / Prescriber discretion</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm"
              >
                Confirm Decline
              </button>
            </div>
          </div>
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
