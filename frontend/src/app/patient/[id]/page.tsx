"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Brain, AlertTriangle, Check, X, ChevronRight,
  Activity, Dna, Pill, FileText, Heart, Watch, Clock,
  TrendingUp, TrendingDown, Info, Edit, Download, Zap, Sparkles, Copy
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell
} from "recharts";
import Navbar from "@/components/Navbar";

// ─── Interfaces ────────────────────────────────────────────────────────────
export interface PrescriptionOrder {
  drug: string;
  dose: string;
  frequency: string;
  instructions: string;
  notes: string;
  prescriber: string;
  npi: string;
  timestamp: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  dob: string;
  mrn: string;
  sex: "Female" | "Male";
  blood_type: string;
  weight: string;
  height: string;
  insurance: string;
  primary_dx: string;
  diseaseCategory: "liver" | "diabetes" | "gastro" | "hypertension" | "dyslipidemia" | "obesity";
  diseaseBadge: string;
  risk_score: number;
  adherence: number;
  genomic_ready: boolean;
  biomarkers: Array<{ label: string; value: string; trend: "up" | "down" | "stable"; note: string; good: boolean }>;
  labChartTitle: string;
  labYDomain: [number, number];
  labUnit: string;
  labTarget: number;
  labTargetLabel: string;
  labs: Array<{ date: string; value: number; secondary?: number }>;
  snps: Array<{ gene: string; variant: string; impact: string; risk: "high" | "medium" | "low"; drugs: string[] }>;
  shap: Array<{ feature: string; value: number; direction: number }>;
  aiExplanation: string;
  riskFlags: Array<{ flag: string; color: string }>;
  defaultPrescription: PrescriptionOrder;
  drugChoices: string[];
  doseChoices: string[];
}

// ─── Patient Dossier Database (p1 through p12) ─────────────────────────────
const PATIENTS_DATABASE: Record<string, PatientRecord> = {
  p1: {
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
    diseaseCategory: "diabetes",
    diseaseBadge: "Diabetes & Glycemic",
    risk_score: 0.89,
    adherence: 71,
    genomic_ready: true,
    biomarkers: [
      { label: "HbA1c", value: "7.6%", trend: "down", note: "Target: <7.0%", good: false },
      { label: "eGFR", value: "42", trend: "down", note: "Stage 3 CKD", good: false },
      { label: "Blood Pressure", value: "138/86", trend: "stable", note: "Hypertensive", good: false },
    ],
    labChartTitle: "HbA1c 6-Month Trajectory (%)",
    labYDomain: [6, 10],
    labUnit: "%",
    labTarget: 7.0,
    labTargetLabel: "Target < 7.0%",
    labs: [
      { date: "Apr", value: 9.1 },
      { date: "May", value: 8.8 },
      { date: "Jun", value: 8.5 },
      { date: "Jul", value: 8.2 },
      { date: "Aug", value: 7.9 },
      { date: "Sep", value: 7.6 },
    ],
    snps: [
      { gene: "CYP2D6", variant: "*4/*4", impact: "Poor Metabolizer", risk: "high", drugs: ["Codeine", "Tamoxifen", "Fluoxetine"] },
      { gene: "CYP2C19", variant: "*1/*1", impact: "Normal Metabolizer", risk: "low", drugs: [] },
      { gene: "CYP2C9", variant: "*1/*2", impact: "Intermediate Metabolizer", risk: "medium", drugs: ["Warfarin", "NSAIDs"] },
      { gene: "SLCO1B1", variant: "*5 carrier", impact: "Statin Myopathy Risk", risk: "high", drugs: ["Simvastatin", "Lovastatin"] },
      { gene: "HLA-B", variant: "*57:01 negative", impact: "No Abacavir Risk", risk: "low", drugs: [] },
    ],
    shap: [
      { feature: "CYP2D6 Poor Metabolizer", value: 0.35, direction: 1 },
      { feature: "eGFR = 42 (Stage 3 CKD)", value: 0.28, direction: 1 },
      { feature: "HbA1c = 7.6%", value: 0.18, direction: 1 },
      { feature: "Concurrent Metformin", value: 0.09, direction: 1 },
      { feature: "BMI = 31.2", value: 0.06, direction: 1 },
      { feature: "Age = 68", value: -0.04, direction: -1 },
    ],
    aiExplanation: "Recommendation driven by CYP2D6 Poor Metabolizer profile (+35%), reduced renal clearance eGFR=42 (+28%), and positive glycemic response (+18%).",
    riskFlags: [
      { flag: "Renal dose adjustment needed (eGFR 42)", color: "#DC2626" },
      { flag: "CYP2D6 Poor Metabolizer (*4/*4)", color: "#DC2626" },
      { flag: "Monitor for rare lactic acidosis risk", color: "#D97706" },
    ],
    defaultPrescription: {
      drug: "Metformin HCl",
      dose: "500mg",
      frequency: "Twice Daily (BID)",
      instructions: "Titrate to 1000mg BID at week 4 based on eGFR stability. Combine with Empagliflozin 10mg QD.",
      notes: "Starting dosage modified based on patient's eGFR 42 (Stage 3 CKD) and CYP2D6 metabolizer profile. Scheduled 3-week renal function re-check.",
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: "Oct 28, 2026 · 11:20 AM",
    },
    drugChoices: [
      "Metformin HCl (Biguanide)",
      "Empagliflozin (Jardiance SGLT2i)",
      "Sitagliptin (Januvia DPP-4i)",
      "Linagliptin (Tradjenta)",
      "Tirzepatide (Mounjaro GIP/GLP-1)",
      "Insulin Glargine (Basal Insulin)",
    ],
    doseChoices: ["250mg", "500mg", "850mg", "1000mg", "10mg QD", "25mg QD"],
  },

  p5: {
    id: "p5",
    name: "Dr. Carlos Mendoza",
    age: 52,
    dob: "Aug 12, 1974",
    mrn: "MRN-2024-005",
    sex: "Male",
    blood_type: "O+",
    weight: "94 kg",
    height: "178 cm",
    insurance: "Blue Cross PPO",
    primary_dx: "MASH / Fatty Liver Disease (F3 Advanced Fibrosis)",
    diseaseCategory: "liver",
    diseaseBadge: "Fatty Liver & Hepatic",
    risk_score: 0.85,
    adherence: 89,
    genomic_ready: true,
    biomarkers: [
      { label: "FibroScan (E)", value: "12.4 kPa", trend: "up", note: "Stage F3 Advanced Fibrosis", good: false },
      { label: "ALT (Alanine Aminotransferase)", value: "84 U/L", trend: "down", note: "Target: <35 U/L", good: false },
      { label: "AST (Aspartate Aminotransferase)", value: "68 U/L", trend: "down", note: "Target: <35 U/L", good: false },
    ],
    labChartTitle: "Liver Stiffness FibroScan Trajectory (kPa)",
    labYDomain: [5, 18],
    labUnit: "kPa",
    labTarget: 8.0,
    labTargetLabel: "F1/F2 Threshold < 8.0 kPa",
    labs: [
      { date: "May", value: 16.2 },
      { date: "Jun", value: 15.1 },
      { date: "Jul", value: 14.3 },
      { date: "Aug", value: 13.5 },
      { date: "Sep", value: 12.8 },
      { date: "Oct", value: 12.4 },
    ],
    snps: [
      { gene: "PNPLA3", variant: "I148M (rs738409 G/G)", impact: "Accelerated Steatohepatitis Hazard", risk: "high", drugs: ["Resmetirom", "Pioglitazone", "Semaglutide"] },
      { gene: "TM6SF2", variant: "E167K Heterozygote", impact: "Increased Hepatic Triglycerides", risk: "high", drugs: ["Lipid Lowering"] },
      { gene: "HSD17B13", variant: "rs72613567 Non-protective", impact: "Unattenuated Fibrogenesis", risk: "medium", drugs: [] },
      { gene: "CYP2E1", variant: "*1A/*1A", impact: "Normal Oxidation", risk: "low", drugs: [] },
      { gene: "SLCO1B1", variant: "*1/*1", impact: "Normal Transporter", risk: "low", drugs: ["Statins"] },
    ],
    shap: [
      { feature: "PNPLA3 I148M G/G Homozygote", value: 0.46, direction: 1 },
      { feature: "FibroScan 12.4 kPa (F3 Fibrosis)", value: 0.29, direction: 1 },
      { feature: "Elevated ALT 84 U/L", value: 0.14, direction: 1 },
      { feature: "Concurrent Dyslipidemia", value: 0.08, direction: 1 },
      { feature: "Normal eGFR (84 mL/min)", value: -0.05, direction: -1 },
    ],
    aiExplanation: "Recommendation driven by PNPLA3 I148M homozygous genotype (+46%), F3 advanced hepatic fibrosis stage (+29%), and active transaminitis (+14%). Resmetirom initiates direct hepatocyte THR-β activation.",
    riskFlags: [
      { flag: "High risk of rapid cirrhotic transformation (PNPLA3 G/G)", color: "#DC2626" },
      { flag: "Active transaminitis with elevated ALT (84 U/L)", color: "#DC2626" },
      { flag: "Monitor gallbladder for cholelithiasis during THR-β therapy", color: "#D97706" },
    ],
    defaultPrescription: {
      drug: "Resmetirom (Rezdiffra)",
      dose: "80mg",
      frequency: "Once Daily (QD)",
      instructions: "Take orally once daily with or without food. Co-administer with Pioglitazone 30mg QD. Repeat FibroScan at month 6.",
      notes: "Initiated FDA-approved THR-β agonist Resmetirom for non-cirrhotic MASH with moderate to advanced liver fibrosis (F3) in setting of PNPLA3 I148M high-risk genotype.",
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: "Oct 28, 2026 · 02:45 PM",
    },
    drugChoices: [
      "Resmetirom / Rezdiffra (THR-β Agonist)",
      "Pioglitazone (PPAR-γ Agonist)",
      "Semaglutide / Wegovy (GLP-1 RA)",
      "Ursodeoxycholic Acid / UDCA",
      "Vitamin E (d-alpha tocopherol 800 IU)",
      "Obeticholic Acid (FXR Agonist)",
    ],
    doseChoices: ["60mg QD", "80mg QD", "100mg QD", "15mg QD", "30mg QD", "45mg QD"],
  },

  p7: {
    id: "p7",
    name: "Patricia Green",
    age: 46,
    dob: "Feb 03, 1980",
    mrn: "MRN-2024-007",
    sex: "Female",
    blood_type: "B+",
    weight: "64 kg",
    height: "168 cm",
    insurance: "Aetna Health Plan",
    primary_dx: "Refractory GERD & Severe Erosive Esophagitis (Grade C)",
    diseaseCategory: "gastro",
    diseaseBadge: "Gastroenterology (GERD/GI)",
    risk_score: 0.72,
    adherence: 94,
    genomic_ready: true,
    biomarkers: [
      { label: "DeMeester Reflux Score", value: "48.2", trend: "down", note: "Severe Reflux (Normal <14.7)", good: false },
      { label: "Esophageal Acid Exposure", value: "14.8%", trend: "down", note: "Target: <4.0% total time", good: false },
      { label: "Endoscopy Grade", value: "LA Grade C", trend: "stable", note: "Erosive Mucosal Breaks >5mm", good: false },
    ],
    labChartTitle: "24-Hour pH DeMeester Reflux Score Trajectory",
    labYDomain: [10, 60],
    labUnit: "pts",
    labTarget: 14.7,
    labTargetLabel: "Normal Threshold < 14.7",
    labs: [
      { date: "May", value: 58.4 },
      { date: "Jun", value: 55.2 },
      { date: "Jul", value: 52.8 },
      { date: "Aug", value: 50.1 },
      { date: "Sep", value: 49.0 },
      { date: "Oct", value: 48.2 },
    ],
    snps: [
      { gene: "CYP2C19", variant: "*17/*17", impact: "Ultra-Rapid Metabolizer (PPI Failure)", risk: "high", drugs: ["Omeprazole", "Esomeprazole", "Pantoprazole"] },
      { gene: "CYP3A4", variant: "*1/*1", impact: "Normal Clearance", risk: "low", drugs: [] },
      { gene: "ABCB1", variant: "3435C>T", impact: "Altered Drug Efflux", risk: "medium", drugs: ["PPIs"] },
      { gene: "CYP2D6", variant: "*1/*1", impact: "Normal Metabolizer", risk: "low", drugs: [] },
      { gene: "HLA-B", variant: "*57:01 negative", impact: "Normal", risk: "low", drugs: [] },
    ],
    shap: [
      { feature: "CYP2C19 *17/*17 Ultra-Rapid PPI Clearer", value: 0.52, direction: 1 },
      { feature: "Prior Omeprazole 40mg BID Failure", value: 0.28, direction: 1 },
      { feature: "DeMeester Score = 48.2", value: 0.12, direction: 1 },
      { feature: "Young Age (46y)", value: -0.04, direction: -1 },
      { feature: "Normal eGFR (96 mL/min)", value: -0.06, direction: -1 },
    ],
    aiExplanation: "Patient has CYP2C19 *17/*17 ultra-rapid metabolizer diplotype (+52%), causing subtherapeutic acid suppression on standard proton pump inhibitors. Switching to potassium-competitive acid blocker (P-CAB) Vonoprazan restores 24h intragastric pH > 4.",
    riskFlags: [
      { flag: "Complete PPI resistance due to CYP2C19 *17/*17 hyper-clearance", color: "#DC2626" },
      { flag: "Erosive esophagitis Los Angeles Grade C with ulceration risk", color: "#DC2626" },
      { flag: "Re-evaluate endoscopic mucosal healing at 8 weeks", color: "#0284C7" },
    ],
    defaultPrescription: {
      drug: "Vonoprazan (Voquezna)",
      dose: "20mg",
      frequency: "Once Daily (QD)",
      instructions: "Take orally once daily in the morning with or without food for 8 weeks to achieve complete erosive mucosal healing.",
      notes: "Proton pump inhibitors failed due to CYP2C19 *17/*17 ultra-rapid enzyme clearance. Vonoprazan acts via potassium-competitive acid inhibition independent of CYP2C19.",
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: "Oct 26, 2026 · 04:15 PM",
    },
    drugChoices: [
      "Vonoprazan / Voquezna (P-CAB)",
      "Dexlansoprazole / Dexilant (Dual Delayed Release)",
      "Rabeprazole (Non-enzymatic Clearance)",
      "Pantoprazole 40mg BID",
      "Famotidine / Pepcid (H2RA Adjunct)",
      "Sucralfate (Mucosal Protective)",
    ],
    doseChoices: ["10mg QD", "20mg QD", "30mg QD", "40mg BID", "60mg QD"],
  },

  p8: {
    id: "p8",
    name: "Michael Davis",
    age: 58,
    dob: "Nov 04, 1967",
    mrn: "MRN-2024-008",
    sex: "Male",
    blood_type: "AB+",
    weight: "79 kg",
    height: "172 cm",
    insurance: "Medicare Standard",
    primary_dx: "Decompensated Hepatic Cirrhosis & Portal HTN",
    diseaseCategory: "liver",
    diseaseBadge: "Liver Cirrhosis & Hepatic",
    risk_score: 0.93,
    adherence: 76,
    genomic_ready: true,
    biomarkers: [
      { label: "Child-Pugh Score", value: "Class B (8)", trend: "stable", note: "Moderate Hepatic Impairment", good: false },
      { label: "MELD-Na Score", value: "17", trend: "up", note: "3-month mortality risk 19.6%", good: false },
      { label: "Total Bilirubin", value: "3.2 mg/dL", trend: "up", note: "Target: <1.2 mg/dL", good: false },
    ],
    labChartTitle: "MELD-Na Score Trajectory (Hepatic Cirrhosis)",
    labYDomain: [10, 25],
    labUnit: "pts",
    labTarget: 12.0,
    labTargetLabel: "Low-Risk MELD < 12",
    labs: [
      { date: "May", value: 14.0 },
      { date: "Jun", value: 14.5 },
      { date: "Jul", value: 15.2 },
      { date: "Aug", value: 16.0 },
      { date: "Sep", value: 16.8 },
      { date: "Oct", value: 17.0 },
    ],
    snps: [
      { gene: "CYP2E1", variant: "*5B (c1/c2 RsaI)", impact: "Hyper-Inducible Hepatotoxic Oxidation", risk: "high", drugs: ["Acetaminophen", "Ethanol"] },
      { gene: "PNPLA3", variant: "I148M Heterozygote", impact: "Accelerated Cirrhotic Steatohepatitis", risk: "high", drugs: [] },
      { gene: "UGT1A1", variant: "*28/*28 (Gilbert/Deficiency)", impact: "Impaired Glucuronidation", risk: "medium", drugs: ["Irinotecan", "Atazanavir"] },
      { gene: "CYP2D6", variant: "*1/*1", impact: "Normal Metabolizer", risk: "low", drugs: [] },
      { gene: "CYP3A4", variant: "*1/*22", impact: "Reduced Hepatic Extraction", risk: "medium", drugs: ["Sedatives"] },
    ],
    shap: [
      { feature: "Severely Reduced Hepatic Clearance", value: 0.44, direction: 1 },
      { feature: "MELD-Na = 17 / Child-Pugh B", value: 0.27, direction: 1 },
      { feature: "Recurrent Hepatic Encephalopathy Risk", value: 0.19, direction: 1 },
      { feature: "Portal Vein Thrombosis Risk", value: 0.08, direction: 1 },
      { feature: "eGFR = 58 mL/min", value: -0.05, direction: -1 },
    ],
    aiExplanation: "Severely impaired hepatic first-pass metabolism (+44%) and MELD-Na 17 (+27%) contraindicate systemically metabolized sedatives or hepatotoxic drugs. Gut-selective Rifaximin + Lactulose prevents neurotoxic ammonia accumulation.",
    riskFlags: [
      { flag: "High danger of acute hepatic encephalopathy crisis", color: "#DC2626" },
      { flag: "All hepatically metabolized sedatives strictly contraindicated", color: "#DC2626" },
      { flag: "Portal hypertension with active esophageal varices risk", color: "#D97706" },
    ],
    defaultPrescription: {
      drug: "Rifaximin + Lactulose",
      dose: "550mg BID / 30mL TID",
      frequency: "Twice Daily + Three Times Daily",
      instructions: "Take Rifaximin 550mg BID. Titrate Lactulose 30mL TID to produce 2 to 3 soft bowel movements daily.",
      notes: "Gut-selective non-absorbable antibiotic Rifaximin eliminates ammoniagenic intestinal bacteria. Lactulose promotes enteric ammonia trapping in Child-Pugh B cirrhosis.",
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: "Oct 25, 2026 · 10:30 AM",
    },
    drugChoices: [
      "Rifaximin (Xifaxan 550mg BID)",
      "Lactulose Oral Solution 30mL TID",
      "Propranolol / Nadolol (Non-selective Beta Blocker)",
      "Spironolactone + Furosemide (Ascites Diuresis)",
      "Ursodeoxycholic Acid / UDCA",
      "Albumin Infusion Protocol",
    ],
    doseChoices: ["550mg BID", "200mg TID", "30mL TID", "20mg BID", "40mg QD", "100mg QD"],
  },

  p3: {
    id: "p3",
    name: "Amelia Rodriguez",
    age: 41,
    dob: "Jun 24, 1985",
    mrn: "MRN-2024-003",
    sex: "Female",
    blood_type: "O+",
    weight: "61 kg",
    height: "165 cm",
    insurance: "UnitedHealthcare Choice Plus",
    primary_dx: "Severe Familial Dyslipidemia & Hypercholesterolemia",
    diseaseCategory: "dyslipidemia",
    diseaseBadge: "Dyslipidemia (Lipids)",
    risk_score: 0.74,
    adherence: 93,
    genomic_ready: true,
    biomarkers: [
      { label: "LDL-C (Low-Density Lipoprotein)", value: "192 mg/dL", trend: "down", note: "Target: <70 mg/dL", good: false },
      { label: "Apolipoprotein B (ApoB)", value: "132 mg/dL", trend: "down", note: "Target: <80 mg/dL", good: false },
      { label: "Creatine Kinase (CK)", value: "148 U/L", trend: "stable", note: "Normal <200 U/L", good: true },
    ],
    labChartTitle: "LDL-C Trajectory under Lipid Modification (mg/dL)",
    labYDomain: [50, 240],
    labUnit: "mg/dL",
    labTarget: 70,
    labTargetLabel: "High-Risk Target < 70 mg/dL",
    labs: [
      { date: "May", value: 234 },
      { date: "Jun", value: 221 },
      { date: "Jul", value: 210 },
      { date: "Aug", value: 202 },
      { date: "Sep", value: 196 },
      { date: "Oct", value: 192 },
    ],
    snps: [
      { gene: "SLCO1B1", variant: "*5 (rs4149056 C/T)", impact: "Decreased Hepatic Influx (Statin Myopathy)", risk: "high", drugs: ["Simvastatin", "Atorvastatin", "Lovastatin"] },
      { gene: "CYP3A4", variant: "*22 Heterozygote", impact: "Reduced Statin Metabolism", risk: "medium", drugs: ["Simvastatin"] },
      { gene: "LDLR", variant: "Exon 4 c.662A>G", impact: "Familial Hypercholesterolemia Carrier", risk: "high", drugs: [] },
      { gene: "CYP2C9", variant: "*1/*1", impact: "Normal Metabolizer", risk: "low", drugs: [] },
      { gene: "HLA-B", variant: "*57:01 negative", impact: "Normal", risk: "low", drugs: [] },
    ],
    shap: [
      { feature: "SLCO1B1 *5 Carrier (Myopathy Hazard)", value: 0.48, direction: 1 },
      { feature: "Severe Baseline LDL-C 192 mg/dL", value: 0.25, direction: 1 },
      { feature: "Prior Simvastatin Severe Myalgia", value: 0.15, direction: 1 },
      { feature: "ApoB = 132 mg/dL", value: 0.08, direction: 1 },
      { feature: "Normal CK = 148 U/L", value: -0.06, direction: -1 },
    ],
    aiExplanation: "Patient carries SLCO1B1 *5 allele (+48%), leading to deficient hepatic OATP1B1 uptake and a 16.9-fold rhabdomyolysis hazard with lipophilic statins like Simvastatin. Switching to hydrophilic Rosuvastatin 10mg + Ezetimibe achieves target LDL safely.",
    riskFlags: [
      { flag: "Simvastatin and Lovastatin strictly contraindicated (SLCO1B1 *5)", color: "#DC2626" },
      { flag: "High risk of statin-induced toxic myopathy and rhabdomyolysis", color: "#DC2626" },
      { flag: "Target LDL-C reduction of >50% needed for cardiovascular prevention", color: "#0284C7" },
    ],
    defaultPrescription: {
      drug: "Rosuvastatin + Ezetimibe",
      dose: "10mg / 10mg QD",
      frequency: "Once Daily (QD) at bedtime",
      instructions: "Take one combination dose daily at bedtime. Avoid grapefruit. Check lipid panel and ALT in 6 weeks.",
      notes: "Replaced Simvastatin with low-dose hydrophilic Rosuvastatin + Ezetimibe to avoid SLCO1B1 *5 dependent myotoxicity while effectively suppressing hepatic cholesterol synthesis and intestinal absorption.",
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: "Oct 29, 2026 · 09:15 AM",
    },
    drugChoices: [
      "Rosuvastatin 10mg + Ezetimibe 10mg",
      "Pitavastatin 2mg QD (Minimal SLCO1B1)",
      "Evolocumab / Repatha (PCSK9 Inhibitor)",
      "Bempedoic Acid / Nexletol",
      "Icosapent Ethyl / Vascepa 2g BID",
      "Atorvastatin 10mg QD (Low Dose)",
    ],
    doseChoices: ["5mg / 10mg QD", "10mg / 10mg QD", "20mg / 10mg QD", "2mg QD", "4mg QD", "140mg SC Q2W"],
  },

  p4: {
    id: "p4",
    name: "James Thompson",
    age: 73,
    dob: "May 19, 1953",
    mrn: "MRN-2024-004",
    sex: "Male",
    blood_type: "A-",
    weight: "83 kg",
    height: "175 cm",
    insurance: "Medicare Choice",
    primary_dx: "Refractory Stage 3B Hypertension + CKD",
    diseaseCategory: "hypertension",
    diseaseBadge: "Hypertension (HTN)",
    risk_score: 0.91,
    adherence: 65,
    genomic_ready: true,
    biomarkers: [
      { label: "Blood Pressure (Office)", value: "168/98 mmHg", trend: "up", note: "Stage 2 Refractory HTN", good: false },
      { label: "eGFR", value: "34 mL/min", trend: "down", note: "Stage 3B CKD", good: false },
      { label: "Urine Albumin-to-Cr Ratio", value: "320 mg/g", trend: "up", note: "Severely Increased Albuminuria", good: false },
    ],
    labChartTitle: "Systolic Blood Pressure Trajectory (mmHg)",
    labYDomain: [120, 190],
    labUnit: "mmHg",
    labTarget: 130,
    labTargetLabel: "ACC/AHA Target < 130 mmHg",
    labs: [
      { date: "May", value: 178 },
      { date: "Jun", value: 174 },
      { date: "Jul", value: 172 },
      { date: "Aug", value: 170 },
      { date: "Sep", value: 169 },
      { date: "Oct", value: 168 },
    ],
    snps: [
      { gene: "CYP2C9", variant: "*3/*3 (Poor Metabolizer)", impact: "Deficient Losartan Bioactivation", risk: "high", drugs: ["Losartan", "Warfarin", "Glipizide"] },
      { gene: "CYP2D6", variant: "*1/*4 (Intermediate)", impact: "Reduced Beta Blocker Clearance", risk: "medium", drugs: ["Metoprolol", "Carvedilol"] },
      { gene: "NOS3", variant: "rs1799983 (Glu298Asp)", impact: "Blunted Endothelial Vasodilation", risk: "medium", drugs: [] },
      { gene: "SLCO1B1", variant: "*1/*1", impact: "Normal Transporter", risk: "low", drugs: [] },
      { gene: "HLA-B", variant: "*57:01 negative", impact: "Normal", risk: "low", drugs: [] },
    ],
    shap: [
      { feature: "CYP2C9 *3/*3 Losartan Inactivation", value: 0.38, direction: 1 },
      { feature: "Stage 3B CKD (eGFR 34 mL/min)", value: 0.31, direction: 1 },
      { feature: "Refractory SBP 168 mmHg", value: 0.18, direction: 1 },
      { feature: "Microalbuminuria 320 mg/g", value: 0.11, direction: 1 },
      { feature: "Male Sex", value: 0.04, direction: 1 },
    ],
    aiExplanation: "Losartan failed because CYP2C9 *3/*3 poor metabolizer genotype prevents enzymatic oxidation into its 40x more potent EXP3174 metabolite. Telmisartan does not depend on CYP2C9 and provides direct AT1 receptor blockade.",
    riskFlags: [
      { flag: "Losartan therapeutically ineffective due to CYP2C9 *3/*3", color: "#DC2626" },
      { flag: "Stage 3B CKD progression risk; monitor serum potassium closely", color: "#DC2626" },
      { flag: "Combine with dihydropyridine calcium channel blocker for synergy", color: "#0284C7" },
    ],
    defaultPrescription: {
      drug: "Telmisartan + Amlodipine",
      dose: "80mg / 10mg QD",
      frequency: "Once Daily (QD) in the morning",
      instructions: "Take orally once daily in the morning. Re-check basic metabolic panel and serum potassium in 2 weeks.",
      notes: "Substituted Losartan with Telmisartan (eliminated primarily via glucuronidation with zero CYP2C9 dependence). Added Amlodipine 10mg to reach goal BP < 130/80 mmHg in CKD.",
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: "Oct 28, 2026 · 01:10 PM",
    },
    drugChoices: [
      "Telmisartan 80mg + Amlodipine 10mg",
      "Valsartan 160mg + Amlodipine 10mg",
      "Spironolactone 25mg QD (Aldosterone Blocker)",
      "Chlorthalidone 25mg QD (Thiazide-like Diuretic)",
      "Carvedilol 25mg BID",
      "Clonidine 0.1mg BID (Central Alpha Agonist)",
    ],
    doseChoices: ["40mg / 5mg QD", "80mg / 5mg QD", "80mg / 10mg QD", "25mg QD", "12.5mg QD"],
  },

  p9: {
    id: "p9",
    name: "Elena Rostova",
    age: 39,
    dob: "Sep 29, 1987",
    mrn: "MRN-2024-009",
    sex: "Female",
    blood_type: "A+",
    weight: "106 kg",
    height: "166 cm",
    insurance: "Cigna Open Access",
    primary_dx: "Class II Severe Obesity (BMI 38.6 kg/m²) + Metabolic Syndrome",
    diseaseCategory: "obesity",
    diseaseBadge: "Obesity & Metabolic",
    risk_score: 0.68,
    adherence: 91,
    genomic_ready: true,
    biomarkers: [
      { label: "Body Mass Index (BMI)", value: "38.6 kg/m²", trend: "down", note: "Class II Severe Obesity", good: false },
      { label: "Fasting Insulin", value: "28 µIU/mL", trend: "down", note: "Target: <10 µIU/mL", good: false },
      { label: "HOMA-IR Score", value: "6.4", trend: "down", note: "Severe Insulin Resistance", good: false },
    ],
    labChartTitle: "Body Mass Index (BMI) Trajectory (kg/m²)",
    labYDomain: [30, 45],
    labUnit: "kg/m²",
    labTarget: 25.0,
    labTargetLabel: "Normal BMI < 25.0",
    labs: [
      { date: "May", value: 42.1 },
      { date: "Jun", value: 41.2 },
      { date: "Jul", value: 40.5 },
      { date: "Aug", value: 39.8 },
      { date: "Sep", value: 39.1 },
      { date: "Oct", value: 38.6 },
    ],
    snps: [
      { gene: "FTO", variant: "rs9939609 A/A Homozygote", impact: "High Satiety Resistance Allele", risk: "high", drugs: ["Tirzepatide", "Semaglutide"] },
      { gene: "MC4R", variant: "rs17782313 Heterozygote", impact: "Blunted Leptin Satiety Signalling", risk: "high", drugs: ["GLP-1/GIP Agonists"] },
      { gene: "ADRB3", variant: "Trp64Arg", impact: "Reduced Lipolytic Response", risk: "medium", drugs: [] },
      { gene: "CYP2D6", variant: "*1/*1", impact: "Normal Metabolizer", risk: "low", drugs: [] },
      { gene: "CYP3A4", variant: "*1/*1", impact: "Normal Metabolizer", risk: "low", drugs: [] },
    ],
    shap: [
      { feature: "FTO rs9939609 A/A Satiety Resistance", value: 0.41, direction: 1 },
      { feature: "Severe Baseline BMI = 38.6", value: 0.31, direction: 1 },
      { feature: "HOMA-IR = 6.4 (High Insulin Resistance)", value: 0.16, direction: 1 },
      { feature: "Young Age (39y)", value: -0.04, direction: -1 },
      { feature: "Preserved eGFR (102 mL/min)", value: -0.07, direction: -1 },
    ],
    aiExplanation: "Patient carries the high-penetrance FTO rs9939609 A/A obesity risk genotype (+41%) with MC4R blunted satiety signalling. Dual GIP/GLP-1 receptor co-agonist Tirzepatide provides superior hypothalamic appetite suppression and 20%+ sustained weight reduction.",
    riskFlags: [
      { flag: "High genetic satiety resistance (FTO A/A homozygous)", color: "#DC2626" },
      { flag: "Severe hyperinsulinemia and high non-alcoholic steatohepatitis risk", color: "#D97706" },
      { flag: "Titrate every 4 weeks to minimize transient gastrointestinal symptoms", color: "#0284C7" },
    ],
    defaultPrescription: {
      drug: "Tirzepatide (Zepbound)",
      dose: "2.5mg SC Weekly (Titrate to 10mg)",
      frequency: "Once Weekly Subcutaneous",
      instructions: "Inject 2.5mg subcutaneously once weekly into abdomen for 4 weeks, then step-titrate to 5mg, 7.5mg, and 10mg at monthly intervals.",
      notes: "Indicated for chronic weight management in Class II obesity with metabolic syndrome and genetic FTO satiety dysregulation.",
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: "Oct 24, 2026 · 03:00 PM",
    },
    drugChoices: [
      "Tirzepatide / Zepbound (Dual GIP/GLP-1)",
      "Semaglutide / Wegovy 2.4mg SC Weekly",
      "Liraglutide / Saxenda 3.0mg SC Daily",
      "Phentermine / Topiramate (Qsymia)",
      "Bupropion / Naltrexone (Contrave)",
      "Metformin ER 1000mg BID (Adjunct)",
    ],
    doseChoices: ["2.5mg SC Weekly", "5mg SC Weekly", "7.5mg SC Weekly", "10mg SC Weekly", "15mg SC Weekly", "2.4mg SC Weekly"],
  },

  p12: {
    id: "p12",
    name: "Arthur Pendelton",
    age: 63,
    dob: "Jan 18, 1963",
    mrn: "MRN-2024-012",
    sex: "Male",
    blood_type: "B+",
    weight: "77 kg",
    height: "171 cm",
    insurance: "Humana Gold Choice",
    primary_dx: "Acute Drug-Induced Liver Injury (DILI) & Cholestasis",
    diseaseCategory: "liver",
    diseaseBadge: "DILI & Liver Related",
    risk_score: 0.96,
    adherence: 88,
    genomic_ready: true,
    biomarkers: [
      { label: "ALT (Alanine Aminotransferase)", value: "540 U/L", trend: "down", note: "Peak 720 U/L (Marked Cytolysis)", good: false },
      { label: "Total Bilirubin", value: "4.8 mg/dL", trend: "down", note: "Target: <1.2 mg/dL (Cholestasis)", good: false },
      { label: "Alkaline Phosphatase (ALP)", value: "310 U/L", trend: "down", note: "Target: <120 U/L", good: false },
    ],
    labChartTitle: "Serum ALT Cytolysis Trajectory during DILI Recovery (U/L)",
    labYDomain: [50, 800],
    labUnit: "U/L",
    labTarget: 35,
    labTargetLabel: "Normal Upper Limit < 35 U/L",
    labs: [
      { date: "Week 1", value: 720 },
      { date: "Week 2", value: 680 },
      { date: "Week 3", value: 610 },
      { date: "Week 4", value: 575 },
      { date: "Week 5", value: 550 },
      { date: "Week 6", value: 540 },
    ],
    snps: [
      { gene: "HLA-B", variant: "*57:01 Positive", impact: "Immune-Mediated DILI Hypersensitivity", risk: "high", drugs: ["Amoxicillin-Clavulanate", "Flucloxacillin", "Abacavir"] },
      { gene: "HLA-DRB1", variant: "*15:01 Positive", impact: "Cholestatic DILI Predisposition", risk: "high", drugs: ["Amox-Clav"] },
      { gene: "ABCB11 (BSEP)", variant: "c.1331T>C (V444A)", impact: "Decreased Bile Salt Secretion", risk: "medium", drugs: [] },
      { gene: "CYP2E1", variant: "*1A/*1A", impact: "Normal Activity", risk: "low", drugs: [] },
      { gene: "SLCO1B1", variant: "*1/*1", impact: "Normal Transporter", risk: "low", drugs: [] },
    ],
    shap: [
      { feature: "HLA-B *57:01 Positive (DILI Hypersensitivity)", value: 0.54, direction: 1 },
      { feature: "Peak ALT = 720 U/L (Hy's Law Warning)", value: 0.26, direction: 1 },
      { feature: "Total Bilirubin = 4.8 mg/dL (Cholestasis)", value: 0.14, direction: 1 },
      { feature: "HLA-DRB1 *15:01 Carrier", value: 0.08, direction: 1 },
      { feature: "Normal Renal Function eGFR 74", value: -0.06, direction: -1 },
    ],
    aiExplanation: "Patient developed acute immune-mediated hepatotoxicity and cholestatic jaundice triggered by Amoxicillin-Clavulanate in setting of HLA-B *57:01 and HLA-DRB1 *15:01 alleles (+54%). Culprit immediately discontinued; hepatoprotective UDCA and N-Acetylcysteine protocol initiated.",
    riskFlags: [
      { flag: "CRITICAL: Permanent contraindication to Amoxicillin-Clavulanate & Flucloxacillin", color: "#DC2626" },
      { flag: "Hy's Law criteria met: close inpatient liver function monitoring", color: "#DC2626" },
      { flag: "Initiate hydrophilic bile acid therapy (UDCA) to relieve cholestasis", color: "#0284C7" },
    ],
    defaultPrescription: {
      drug: "Stop Amox-Clav + Ursodeoxycholic Acid + NAC",
      dose: "500mg BID / Protocol",
      frequency: "Twice Daily (BID)",
      instructions: "Permanently stop all aminopenicillin-clavulanate formulations. Administer Ursodeoxycholic Acid 500mg BID with meals; complete N-Acetylcysteine antioxidant protocol.",
      notes: "Severe drug-induced liver injury (DILI) with cholestasis confirmed on HLA-B *57:01 genotype. Registered allergy alert in hospital EHR.",
      prescriber: "Dr. Rachel Kim, MD",
      npi: "1892048123",
      timestamp: "Oct 21, 2026 · 11:45 AM",
    },
    drugChoices: [
      "Stop Culprit + Ursodeoxycholic Acid 500mg BID",
      "N-Acetylcysteine (NAC) Infusion Protocol",
      "Prednisolone 40mg QD (Immune-Mediated DILI)",
      "Cholestyramine 4g BID (Pruritus Relief)",
      "S-Adenosylmethionine (SAMe) Adjunct",
      "Supportive Hepatoprotective Regimen",
    ],
    doseChoices: ["500mg BID", "250mg TID", "40mg QD tapering", "4g BID", "1000mg QD"],
  },
};

// ─── Wearable 30-Day Activity Data Generator ──────────────────────────────
const WEARABLE_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Oct ${i + 1}`,
  hr: 72 + Math.sin(i * 0.3) * 8 + Math.random() * 5,
  spo2: 96 + Math.random() * 2,
  steps: 3500 + Math.random() * 2000,
  sleep: 5.5 + Math.random() * 2,
}));

// ─── AI Recommendation Panel Component ─────────────────────────────────────
function AIRecommendationPanel({
  patient,
  onOpenFhirModal
}: {
  patient: PatientRecord;
  onOpenFhirModal: () => void;
}) {
  const [status, setStatus] = useState<"pending" | "approved" | "modified_approved" | "rejected">("pending");
  const [prescription, setPrescription] = useState<PrescriptionOrder>(patient.defaultPrescription);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("Alternative therapeutic agent preferred based on clinical examination");
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
    showToast(`AI Recommendation for ${prescription.drug} approved by Dr. Rachel Kim, MD`);
  };

  const handleConfirmReject = () => {
    setStatus("rejected");
    setIsRejectModalOpen(false);
    showToast("AI Recommendation declined by prescriber");
  };

  const handleResetToDefault = () => {
    setPrescription(patient.defaultPrescription);
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
          <div>
            <span className="font-black text-slate-900 text-sm block">Precision Rx Recommendation</span>
            <span className="text-[10px] text-sky-700 font-bold uppercase">{patient.diseaseBadge}</span>
          </div>
        </div>
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          Model v2.4 (CPIC Aligned)
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
              : "Recommended Therapeutic Regimen"}
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

        <div className="text-lg font-black text-slate-900">{prescription.drug}</div>
        <div className="text-xs font-black text-sky-700 mt-0.5">
          {prescription.dose} · {prescription.frequency}
        </div>
        <div className="text-[11px] text-slate-700 font-medium mt-1.5 leading-relaxed">
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
          <span className="text-xs font-bold text-slate-700">Model Recommendation Confidence</span>
          <span className="text-base font-black text-emerald-600">89%</span>
        </div>
        <div className="confidence-bar bg-sky-100">
          <div className="confidence-fill bg-emerald-500" style={{ width: "89%" }} />
        </div>
      </div>

      {/* Risk Flags */}
      <div>
        <div className="text-xs font-bold text-slate-800 mb-2">Clinical Safety &amp; PGx Flags</div>
        <div className="space-y-1.5">
          {patient.riskFlags.map((r) => (
            <div key={r.flag} className="flex items-center gap-2 p-2 rounded-lg bg-sky-50 border border-sky-200">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
              <span className="text-xs font-semibold text-slate-800">{r.flag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP Explainability */}
      <div>
        <div className="text-[11px] font-black text-sky-800 mb-2 uppercase tracking-wider">
          SHAP Biomarker &amp; Genetic Feature Importance
        </div>
        <div className="space-y-2">
          {patient.shap.map((s) => (
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

      {/* Natural Language Explanation */}
      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-slate-700 font-medium leading-relaxed">
        <Info size={13} className="inline mr-1 text-sky-600 font-bold" />
        {patient.aiExplanation}
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

      {/* HL7 FHIR Interoperability Link */}
      <div className="pt-2 border-t border-sky-100">
        <button
          onClick={onOpenFhirModal}
          className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <FileText size={14} className="text-sky-600" />
          <span>View HL7 FHIR R4 Bundle</span>
        </button>
      </div>

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
                    Patient: {patient.name} · {patient.mrn} · {patient.diseaseBadge}
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
                    {patient.drugChoices.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
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
                    {patient.doseChoices.map((ds) => (
                      <option key={ds} value={ds}>
                        {ds}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Frequency & Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-sky-900 mb-1">
                    Administration Frequency
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Once Daily (QD)">Once Daily (QD)</option>
                    <option value="Once Daily (QD) in morning">Once Daily (QD) in morning</option>
                    <option value="Once Daily (QD) at bedtime">Once Daily (QD) at bedtime</option>
                    <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                    <option value="Three Times Daily (TID)">Three Times Daily (TID)</option>
                    <option value="Once Weekly Subcutaneous">Once Weekly Subcutaneous</option>
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
                  Titration &amp; Clinical Instructions
                </label>
                <input
                  type="text"
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Titrate weekly based on liver function stability"
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
                <option value="Alternative therapeutic agent preferred based on clinical examination">Alternative therapeutic agent preferred based on clinical examination</option>
                <option value="Patient reported past intolerance to drug class">Patient reported past intolerance to drug class</option>
                <option value="Active acute renal or hepatic impairment concern">Active acute renal or hepatic impairment concern</option>
                <option value="Scheduled for contrast imaging or procedure within 48h">Scheduled for contrast imaging or procedure within 48h</option>
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

// ─── Patient Profile Page Component ───────────────────────────────────────
export default function PatientProfilePage() {
  const params = useParams();
  const rawId = (params?.id as string) || "p1";
  const patient = PATIENTS_DATABASE[rawId] || PATIENTS_DATABASE["p1"];

  const [activeTab, setActiveTab] = useState("overview");
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const [copiedFhir, setCopiedFhir] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: <Activity size={14} /> },
    { id: "genomics", label: "Genomics", icon: <Dna size={14} /> },
    { id: "medications", label: "Medications", icon: <Pill size={14} /> },
    { id: "labs", label: "Labs & Trajectory", icon: <FileText size={14} /> },
    { id: "wearables", label: "Wearables", icon: <Watch size={14} /> },
  ];

  // Generate HL7 FHIR R4 Compliant JSON Bundle
  const fhirBundle = {
    resourceType: "Bundle",
    id: `precisionrx-bundle-${patient.id}`,
    type: "document",
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: patient.id,
          identifier: [{ system: "urn:oid:precisionrx:mrn", value: patient.mrn }],
          name: [{ text: patient.name, family: patient.name.split(" ").slice(-1)[0], given: [patient.name.split(" ")[0]] }],
          gender: patient.sex.toLowerCase(),
          birthDate: patient.dob,
        },
      },
      {
        resource: {
          resourceType: "Condition",
          id: `cond-${patient.id}-1`,
          subject: { reference: `Patient/${patient.id}` },
          code: { text: patient.primary_dx },
          clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
        },
      },
      {
        resource: {
          resourceType: "MedicationRequest",
          id: `medreq-${patient.id}-1`,
          status: "active",
          intent: "order",
          medicationCodeableConcept: { text: patient.defaultPrescription.drug },
          dosageInstruction: [
            {
              text: `${patient.defaultPrescription.dose} ${patient.defaultPrescription.frequency} - ${patient.defaultPrescription.instructions}`,
            },
          ],
        },
      },
      {
        resource: {
          resourceType: "Observation",
          id: `genomics-${patient.id}-1`,
          status: "final",
          code: { text: "Pharmacogenomics Phenotype & CPIC Level 1A Guidelines" },
          subject: { reference: `Patient/${patient.id}` },
          component: patient.snps.map((s) => ({
            code: { text: s.gene },
            valueString: `${s.variant} (${s.impact})`,
          })),
        },
      },
    ],
  };

  const handleCopyFhir = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2500);
  };

  const handleDownloadFhir = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `patient-${patient.id}-fhir-r4.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 flex flex-col">
      {/* Universal Top Navbar */}
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
              {patient.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="text-[11px] font-black text-sky-700 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <Link href="/patients" className="hover:underline text-sky-600">Patients Cohort</Link>
                <span>/</span>
                <span className="text-slate-500 font-semibold">{patient.diseaseBadge}</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{patient.name}</h1>
                <span className="risk-critical px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Risk: {(patient.risk_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-sky-800 font-semibold mt-1">
                <span>DOB: {patient.dob} (Age {patient.age})</span>
                <span>•</span>
                <span>Sex: {patient.sex}</span>
                <span>•</span>
                <span>Blood: <strong className="text-slate-900">{patient.blood_type}</strong></span>
                <span>•</span>
                <span>MRN: <strong className="font-mono text-slate-900">{patient.mrn}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setIsFhirModalOpen(true)}
              className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-xs font-bold border-2 border-sky-300 hover:bg-sky-100 text-sky-900"
            >
              <FileText size={14} className="text-sky-700" />
              <span>Export HL7 FHIR R4 Dossier</span>
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
                <strong className="text-slate-900">{patient.insurance}</strong>
              </div>
              <div>
                <span className="text-sky-800 font-medium">Primary Condition:</span>{" "}
                <strong className="text-slate-900">{patient.primary_dx}</strong>
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

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {patient.biomarkers.map((m) => (
                    <div key={m.label} className="bg-white rounded-2xl border-2 border-sky-200 p-4 shadow-sm">
                      <div className="text-xs text-sky-800 font-bold mb-1">{m.label}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900">{m.value}</span>
                        {m.trend === "down" && <TrendingDown size={16} className={m.good ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"} />}
                        {m.trend === "up" && <TrendingUp size={16} className={m.good ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"} />}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">{m.note}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">{patient.labChartTitle}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={patient.labs}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: "#BAE6FD" }} tickLine={false} />
                      <YAxis tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} domain={patient.labYDomain} unit={` ${patient.labUnit}`} />
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
                      <ReferenceLine y={patient.labTarget} stroke="#059669" strokeDasharray="4 4" label={{ value: patient.labTargetLabel, fill: "#059669", fontSize: 11 }} />
                      <Line type="monotone" dataKey="value" stroke="#0284C7" strokeWidth={3} dot={{ fill: "#0284C7", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Tab 2: Genomics */}
            {activeTab === "genomics" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base mb-2">Pharmacogenomics Enzyme &amp; Transporter Panel</h3>
                  <p className="text-xs text-sky-800 font-medium mb-4">Whole-exome sequencing matched against CPIC Level 1A guidelines</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patient.snps.map((s) => (
                      <div
                        key={s.gene}
                        className="p-4 rounded-xl border-2"
                        style={{
                          background: s.risk === "high" ? "#FEF2F2" : s.risk === "medium" ? "#FFFBEB" : "#ECFDF5",
                          borderColor: s.risk === "high" ? "#FECACA" : s.risk === "medium" ? "#FDE68A" : "#A7F3D0",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-sm font-black text-slate-900">{s.gene}</span>
                          <span className="font-mono text-xs text-slate-600 font-bold">{s.variant}</span>
                        </div>
                        <div className="text-xs font-bold" style={{ color: s.risk === "high" ? "#DC2626" : s.risk === "medium" ? "#D97706" : "#059669" }}>
                          {s.impact}
                        </div>
                        {s.drugs.length > 0 && (
                          <div className="text-[11px] text-slate-700 font-medium mt-1">
                            Impacts: <strong>{s.drugs.join(", ")}</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Medications */}
            {activeTab === "medications" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">Therapeutic Drug History &amp; Reconciled Medication List</h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-900 uppercase tracking-wider mb-1">
                        <span>Current AI Recommended Regimen</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px]">Active Recommendation</span>
                      </div>
                      <div className="text-base font-black text-slate-900">{patient.defaultPrescription.drug} ({patient.defaultPrescription.dose})</div>
                      <div className="text-xs text-emerald-800 font-semibold mt-0.5">{patient.defaultPrescription.frequency} · {patient.defaultPrescription.instructions}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                      <div className="font-black text-sky-950 mb-1">Prior / Concurrent Medications on EHR Record</div>
                      <div className="text-slate-700 font-medium">Reconciled via HL7 FHIR R4 MedicationRequest feed across outpatient and acute encounters.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Labs */}
            {activeTab === "labs" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">{patient.labChartTitle}</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={patient.labs}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: "#BAE6FD" }} tickLine={false} />
                      <YAxis tick={{ fill: "#0369A1", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} domain={patient.labYDomain} unit={` ${patient.labUnit}`} />
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
                      <ReferenceLine y={patient.labTarget} stroke="#059669" strokeDasharray="4 4" label={{ value: patient.labTargetLabel, fill: "#059669", fontSize: 11 }} />
                      <Line type="monotone" dataKey="value" stroke="#0284C7" strokeWidth={3} dot={{ fill: "#0284C7", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Tab 5: Wearables */}
            {activeTab === "wearables" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-sm">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base mb-4">Continuous Wearable Biometrics (30-Day Trend)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={WEARABLE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: "#0369A1", fontSize: 11 }} interval={5} axisLine={{ stroke: "#BAE6FD" }} tickLine={false} />
                      <YAxis tick={{ fill: "#0369A1", fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 110]} unit=" bpm" />
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
            )}
          </div>

          {/* Right Side: AI Recommendation Panel */}
          <div className="lg:col-span-1">
            <AIRecommendationPanel
              patient={patient}
              onOpenFhirModal={() => setIsFhirModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* ─── HL7 FHIR R4 Modal Dialog ─────────────────────────────────────── */}
      {isFhirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-3 border-sky-400 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b-2 border-sky-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">HL7 FHIR R4 Document Bundle</h3>
                  <p className="text-xs text-sky-800 font-bold">
                    Patient: {patient.name} ({patient.mrn}) · Standard R4 Format
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFhirModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-600 font-medium shrink-0">
              Interoperable electronic health record payload ready for bidirectional synchronization with Epic, Cerner, or SMART on FHIR backends.
            </div>

            <div className="flex-1 overflow-auto rounded-xl bg-slate-900 p-4 border-2 border-sky-200">
              <pre className="text-xs font-mono text-sky-300 leading-relaxed overflow-x-auto whitespace-pre">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-sky-100 shrink-0">
              <span className="text-[11px] text-slate-500 font-bold">
                Resource Type: <strong className="text-slate-900">Bundle (FHIR R4)</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyFhir}
                  className="px-3.5 py-2 rounded-xl bg-white border-2 border-sky-300 text-sky-900 hover:bg-sky-50 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Copy size={13} /> {copiedFhir ? "Copied to Clipboard!" : "Copy JSON"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFhir}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <Download size={14} /> Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
