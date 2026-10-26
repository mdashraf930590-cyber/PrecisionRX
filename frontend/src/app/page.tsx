"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain, Shield, Lock, ArrowRight, Eye, EyeOff, UserCheck, Sparkles,
  UserPlus, CheckCircle2, AlertCircle, Building2, Award, User, X,
  Check, FileText, ChevronRight, Phone, Mail, MapPin, Stethoscope,
  Dna, Activity, HeartPulse, Zap, Database, Sliders, ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";

const ROLES = [
  { id: "doctor", title: "Physician", name: "Dr. Rachel Kim", email: "dr.rachel.kim@precisionrx.ai" },
  { id: "geneticist", title: "Geneticist", name: "Dr. Aris Vance", email: "a.vance@precisionrx.ai" },
  { id: "pharmacist", title: "Pharmacist", name: "Elena Rostova, PharmD", email: "e.rostova@precisionrx.ai" },
  { id: "admin", title: "Admin", name: "Chief Medical Officer", email: "admin@hospital.org" },
];

export default function HomePage() {
  const router = useRouter();
  const { login } = useAuthStore();

  // Auth Dialog Visibility & Mode
  // If false, the front page shows only the website and the clean [Sign In] / [New Registration] options
  // When clicked, the full auth options open
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Sign In Form State
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [email, setEmail] = useState(ROLES[0].email);
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState<"doctor" | "geneticist" | "pharmacist" | "admin">("doctor");
  const [regInstitution, setRegInstitution] = useState("");
  const [regNpi, setRegNpi] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAgreement, setRegAgreement] = useState(true);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactHospital, setContactHospital] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);

  // Listen for query params e.g. ?auth=signin, ?auth=register, ?mode=register
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get("auth") || params.get("mode");
      if (authParam === "register") {
        setAuthMode("register");
        setIsAuthOpen(true);
      } else if (authParam === "signin") {
        setAuthMode("signin");
        setIsAuthOpen(true);
      }
    }
  }, []);

  const openAuth = (mode: "signin" | "register") => {
    setAuthMode(mode);
    setRegError("");
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
    setRegError("");
  };

  const handleRoleSelect = (role: typeof ROLES[0]) => {
    setSelectedRole(role);
    setEmail(role.email);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    login("mock-token-precisionrx-2026", {
      id: "u-101",
      email: email,
      fullName: selectedRole.name,
      role: selectedRole.id as any,
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 350);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim()) {
      setRegError("Please provide your full clinical name and credentials.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setRegError("Please provide a valid institutional work email.");
      return;
    }
    if (!regNpi.trim()) {
      setRegError("Please enter your 10-digit NPI or Medical License number.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters for clinical security.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!regAgreement) {
      setRegError("You must acknowledge HIPAA compliance and data governance.");
      return;
    }

    setIsLoading(true);
    setRegSuccess(true);

    login("mock-token-reg-" + Date.now(), {
      id: "u-" + Date.now(),
      email: regEmail,
      fullName: regName,
      role: regRole,
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    login("mock-token-precisionrx-2026", {
      id: "u-101",
      email: selectedRole.email,
      fullName: selectedRole.name,
      role: selectedRole.id as any,
    });
    router.push("/dashboard");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactName("");
      setContactHospital("");
      setContactEmail("");
      setContactMessage("");
    }, 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#e0f2fe",
        backgroundImage: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 35%, #bae6fd 100%)",
        color: "#0f172a",
        scrollBehavior: "smooth",
      }}
    >
      {/* ── Top Navigation Bar with [About Us] [Benefits] [Features] [Plans] [Blog] [Contact] ── */}
      <Navbar onOpenAuth={openAuth} />

      <main style={{ flex: 1 }}>
        {/* ══════════════════════════════════════════════════════════════════════
            HERO SECTION: Website Introduction & Quick Sign In / Register Entry
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          style={{
            padding: "3.5rem clamp(1.5rem, 4vw, 4rem) 3rem",
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            textAlign: "center",
          }}
        >

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              color: "#0f172a",
              letterSpacing: "-0.03em",
              maxWidth: "60rem",
              margin: "0 auto 1.25rem",
            }}
          >
            Personalized Genomic Dosing &amp; <br />
            <span style={{ color: "#0284c7" }}>Adverse Drug Reaction Intelligence</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "#0369a1",
              fontWeight: 600,
              maxWidth: "48rem",
              margin: "0 auto 2.25rem",
              lineHeight: 1.5,
            }}
          >
            Integrating patient genotype (CYP2D6, CYP2C19, SLCO1B1), clinical organ function, and deep neural pharmacokinetics to optimize patient dosing before adverse drug events occur.
          </p>

          {/* User Requested Clean Entry Box: Shows Sign In or New Registration buttons */}
          <div
            style={{
              maxWidth: "34rem",
              margin: "0 auto 2rem",
              backgroundColor: "#ffffff",
              border: "3px solid #7dd3fc",
              borderRadius: "1.5rem",
              padding: "1.5rem 2rem",
              boxShadow: "0 15px 30px -10px rgba(2, 132, 199, 0.25)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "#0c4a6e",
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Access Clinical Workspace
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {/* Sign In CTA */}
              <button
                id="hero-signin-cta"
                type="button"
                onClick={() => openAuth("signin")}
                style={{
                  padding: "0.9rem 1.25rem",
                  borderRadius: "0.85rem",
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  border: "2px solid #0369a1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.35)",
                  transition: "all 0.15s ease",
                }}
              >
                <Lock style={{ width: "1.1rem", height: "1.1rem" }} />
                <span>Sign In</span>
              </button>

              {/* New Registration CTA */}
              <button
                id="hero-register-cta"
                type="button"
                onClick={() => openAuth("register")}
                style={{
                  padding: "0.9rem 1.25rem",
                  borderRadius: "0.85rem",
                  backgroundColor: "#f0f9ff",
                  color: "#0c4a6e",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  border: "2px solid #7dd3fc",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  transition: "all 0.15s ease",
                }}
              >
                <UserPlus style={{ width: "1.1rem", height: "1.1rem", color: "#0284c7" }} />
                <span>New Registration</span>
              </button>
            </div>

            <p style={{ margin: "0.85rem 0 0", fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
              Clicking <strong>Sign In</strong> or <strong>New Registration</strong> opens credential selection and verification.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.85rem",
              maxWidth: "52rem",
              margin: "0 auto",
            }}
          >
            {[
              { val: "94.7%", label: "Dose Recommendation Accuracy" },
              { val: "3.2×", label: "Faster Clinical Decision Speed" },
              { val: "500+", label: "Connected Academic Medical Centers" },
              { val: "2.1M", label: "Patient Genomes Analyzed" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  backgroundColor: "#ffffff",
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "2px solid #bae6fd",
                  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.08)",
                }}
              >
                <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "#0284c7" }}>{stat.val}</div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", marginTop: "0.2rem" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            ABOUT US SECTION (#about)
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="about"
          style={{
            padding: "4rem 1.5rem",
            backgroundColor: "#ffffff",
            borderTop: "2px solid #bae6fd",
            borderBottom: "2px solid #bae6fd",
            scrollMarginTop: "4.5rem",
          }}
        >
          <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#0284c7",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  backgroundColor: "#e0f2fe",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  border: "1px solid #7dd3fc",
                }}
              >
                About PrecisionRx AI
              </span>
              <h2
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: "0.75rem 0 0.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Bridging Genomic Science &amp; Daily Prescribing
              </h2>
              <p style={{ fontSize: "1rem", color: "#0369a1", maxWidth: "42rem", margin: "0 auto", fontWeight: 600 }}>
                Every year, adverse drug reactions result in over 100,000 preventable deaths and $30 billion in avoidable hospital expenses in the United States alone.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  padding: "1.75rem",
                  borderRadius: "1.25rem",
                  backgroundColor: "#f0f9ff",
                  border: "2px solid #bae6fd",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Dna style={{ width: "1.75rem", height: "1.75rem" }} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0c4a6e", marginBottom: "0.5rem" }}>
                  The Genomic Challenge
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.6, margin: 0 }}>
                  Standard clinical dosing assumes an &ldquo;average&rdquo; patient metabolism. However, variations in Cytochrome P450 genes (such as CYP2D6, CYP2C19, and CYP3A4) render 40% of patients either poor or ultra-rapid metabolizers, causing therapeutic failure or toxicity.
                </p>
              </div>

              <div
                style={{
                  padding: "1.75rem",
                  borderRadius: "1.25rem",
                  backgroundColor: "#f0f9ff",
                  border: "2px solid #bae6fd",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Brain style={{ width: "1.75rem", height: "1.75rem" }} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0c4a6e", marginBottom: "0.5rem" }}>
                  Our AI Solution
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.6, margin: 0 }}>
                  PrecisionRx AI translates complex genetic variant callsets (VCF), medication records, and lab parameters (eGFR, ALT/AST) into actionable, real-time dosing recommendations with SHAP-explained clinical reasoning at the physician&rsquo;s fingertips.
                </p>
              </div>

              <div
                style={{
                  padding: "1.75rem",
                  borderRadius: "1.25rem",
                  backgroundColor: "#f0f9ff",
                  border: "2px solid #bae6fd",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Shield style={{ width: "1.75rem", height: "1.75rem" }} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0c4a6e", marginBottom: "0.5rem" }}>
                  Clinical Governance &amp; Ethics
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.6, margin: 0 }}>
                  Engineered with strict alignment to CPIC, PharmGKB, and FDA guidelines. Built on privacy-preserving Federated Learning and HL7 FHIR standards, ensuring patient PHI never leaves your hospital boundary without explicit consent.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            BENEFITS SECTION (#benefits)
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="benefits"
          style={{
            padding: "4rem clamp(1.5rem, 4vw, 4rem)",
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            scrollMarginTop: "4.5rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#0284c7",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                backgroundColor: "#ffffff",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid #7dd3fc",
              }}
            >
              Clinical Benefits
            </span>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: 900,
                color: "#0f172a",
                margin: "0.75rem 0 0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              Impact Across the Clinical Care Continuum
            </h2>
            <p style={{ fontSize: "1rem", color: "#0369a1", maxWidth: "42rem", margin: "0 auto", fontWeight: 600 }}>
              Tailored tools that provide clear clinical value for physicians, geneticists, pharmacists, and health network leaders.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {[
              {
                role: "For Attending Physicians",
                icon: <Stethoscope style={{ width: "1.5rem", height: "1.5rem", color: "#0284c7" }} />,
                items: [
                  "Instant alert for high-risk drug-gene interactions before prescribing",
                  "Automated therapeutic range calculations calibrated to renal function",
                  "Actionable alternative medication suggestions with comparable efficacy",
                  "Reduces clinical liability and prescription error rates by over 45%",
                ],
              },
              {
                role: "For Medical Geneticists",
                icon: <Dna style={{ width: "1.5rem", height: "1.5rem", color: "#7c3aed" }} />,
                items: [
                  "Automated star-allele calling (*1/*4, *2/*17) from raw VCF files",
                  "Diplotype risk categorization with CPIC/PharmGKB evidence tiers",
                  "Single-nucleotide variant (SNV) consequence modeling via deep learning",
                  "Integrated population frequency benchmarks across all ancestry cohorts",
                ],
              },
              {
                role: "For Clinical Pharmacists",
                icon: <HeartPulse style={{ width: "1.5rem", height: "1.5rem", color: "#059669" }} />,
                items: [
                  "Multi-drug polypharmacy contraindication checker",
                  "Real-time hepatic and renal clearance adjustment calculator",
                  "Black-box warning monitoring and pharmacovigilance tracking",
                  "Comprehensive clinical rationale notes ready for EHR documentation",
                ],
              },
              {
                role: "For Health System Executives",
                icon: <Building2 style={{ width: "1.5rem", height: "1.5rem", color: "#0369a1" }} />,
                items: [
                  "38% documented reduction in 30-day preventable hospital readmissions",
                  "Full HL7 FHIR US Core and SMART-on-FHIR bidirectional interoperability",
                  "Federated Learning keeps patient data secure and HIPAA-compliant",
                  "Accelerates genomic medicine adoption across multi-hospital networks",
                ],
              },
            ].map((col) => (
              <div
                key={col.role}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "1.25rem",
                  padding: "1.75rem",
                  border: "2px solid #bae6fd",
                  boxShadow: "0 4px 10px rgba(2, 132, 199, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "0.65rem",
                      backgroundColor: "#f0f9ff",
                      border: "1px solid #bae6fd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {col.icon}
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0c4a6e", margin: 0 }}>
                    {col.role}
                  </h3>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem", flex: 1 }}>
                  {col.items.map((it, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.825rem", color: "#334155", lineHeight: 1.4 }}>
                      <Check style={{ width: "1rem", height: "1rem", color: "#0284c7", flexShrink: 0, marginTop: "0.15rem" }} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            FEATURES SECTION (#features)
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="features"
          style={{
            padding: "4rem 1.5rem",
            backgroundColor: "#ffffff",
            borderTop: "2px solid #bae6fd",
            borderBottom: "2px solid #bae6fd",
            scrollMarginTop: "4.5rem",
          }}
        >
          <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#0284c7",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  backgroundColor: "#e0f2fe",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  border: "1px solid #7dd3fc",
                }}
              >
                Core Capabilities
              </span>
              <h2
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: "0.75rem 0 0.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Enterprise Precision Medicine Engine
              </h2>
              <p style={{ fontSize: "1rem", color: "#0369a1", maxWidth: "42rem", margin: "0 auto", fontWeight: 600 }}>
                Built on cutting-edge deep learning, federated data privacy, and clinical bioinformatics pipelines.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {[
                {
                  title: "Multi-Modal Ingestion",
                  icon: <Database style={{ width: "1.5rem", height: "1.5rem", color: "#0284c7" }} />,
                  desc: "Seamlessly streams patient genomics (VCF, CRAM), clinical lab measurements, and medication histories directly via HL7 FHIR R4 interfaces.",
                },
                {
                  title: "Explainable AI (SHAP Reasoning)",
                  icon: <Brain style={{ width: "1.5rem", height: "1.5rem", color: "#0284c7" }} />,
                  desc: "Every dosing and interaction alert features exact feature importance attribution, showing physicians why a specific dose adjustment is suggested.",
                },
                {
                  title: "Real-Time ADR Forecasting",
                  icon: <Activity style={{ width: "1.5rem", height: "1.5rem", color: "#0284c7" }} />,
                  desc: "Multi-head neural networks evaluate candidate drugs against the patient’s diplotype to predict adverse reaction likelihood before administration.",
                },
                {
                  title: "Federated Learning Architecture",
                  icon: <Shield style={{ width: "1.5rem", height: "1.5rem", color: "#0284c7" }} />,
                  desc: "Allows multi-hospital networks to cooperatively train models without centralizing patient health records, adhering to strict HIPAA and GDPR standards.",
                },
                {
                  title: "CPIC & PharmGKB Guideline Engine",
                  icon: <Award style={{ width: "1.5rem", height: "1.5rem", color: "#0284c7" }} />,
                  desc: "Automates over 500 clinical pharmacogenomics guidelines, cross-referencing tier-1 and tier-2 gene-drug pairs in under 15 milliseconds.",
                },
                {
                  title: "Immutable Clinical Audit Trails",
                  icon: <Lock style={{ width: "1.5rem", height: "1.5rem", color: "#0284c7" }} />,
                  desc: "Cryptographically records every recommendation, override, and clinician acknowledgment for full medical-legal compliance and QA oversight.",
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  style={{
                    backgroundColor: "#f0f9ff",
                    border: "2px solid #bae6fd",
                    borderRadius: "1.25rem",
                    padding: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#ffffff",
                      border: "2px solid #7dd3fc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    {feat.icon}
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0c4a6e", marginBottom: "0.5rem" }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.5, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            PLANS SECTION (#plans)
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="plans"
          style={{
            padding: "4rem clamp(1.5rem, 4vw, 4rem)",
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            scrollMarginTop: "4.5rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#0284c7",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                backgroundColor: "#ffffff",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid #7dd3fc",
              }}
            >
              Institutional Plans
            </span>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: 900,
                color: "#0f172a",
                margin: "0.75rem 0 0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              Scalable Licensing for Health Systems
            </h2>
            <p style={{ fontSize: "1rem", color: "#0369a1", maxWidth: "42rem", margin: "0 auto", fontWeight: 600 }}>
              Deploy in your specialized department or implement hospital-wide with full EHR integration.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              alignItems: "stretch",
            }}
          >
            {[
              {
                name: "Departmental Pilot",
                price: "$2,400",
                period: "/ month",
                desc: "Designed for single oncology, cardiology, or psychiatric outpatient clinics.",
                isPopular: false,
                features: [
                  "Up to 500 patient genomic profiles / month",
                  "Tier 1 CPIC gene-drug interaction alerts",
                  "Standard HL7 FHIR read-only connector",
                  "5 Clinician & Pharmacist accounts",
                  "Standard business-hours clinical support",
                ],
                buttonText: "Register Clinical Pilot",
              },
              {
                name: "Hospital Enterprise",
                price: "$8,500",
                period: "/ month",
                desc: "Full inpatient & outpatient health system deployment with bidirectional EHR.",
                isPopular: true,
                features: [
                  "Unlimited patient profiles & whole-exome analyses",
                  "Complete 500+ CPIC & PharmGKB guideline library",
                  "Bidirectional Epic / Cerner EHR integration",
                  "Institutional Federated Learning node integration",
                  "Unlimited clinician accounts & role access control",
                  "Dedicated 24/7 clinical bioinformatics engineer",
                ],
                buttonText: "Request Enterprise Access",
              },
              {
                name: "National Network",
                price: "Custom",
                period: "annual contract",
                desc: "For multi-hospital consortia, research networks, and state health authorities.",
                isPopular: false,
                features: [
                  "Multi-center collaborative Federated Learning",
                  "Custom proprietary drug-target model training",
                  "Dedicated on-premise hardware deployment option",
                  "99.99% Clinical uptime SLA guarantee",
                  "Institutional Data Governance Board membership",
                ],
                buttonText: "Contact Medical Director",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "1.5rem",
                  padding: "2rem",
                  border: plan.isPopular ? "3px solid #0284c7" : "2px solid #bae6fd",
                  boxShadow: plan.isPopular
                    ? "0 15px 30px -5px rgba(2, 132, 199, 0.25)"
                    : "0 4px 12px rgba(2, 132, 199, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {plan.isPopular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-0.85rem",
                      right: "1.5rem",
                      backgroundColor: "#0284c7",
                      color: "#ffffff",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      border: "1px solid #0369a1",
                    }}
                  >
                    MOST ADOPTED
                  </div>
                )}

                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0c4a6e", margin: 0 }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.5rem 0 1.25rem" }}>
                  {plan.desc}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "2.25rem", fontWeight: 900, color: "#0f172a" }}>{plan.price}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>{plan.period}</span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.825rem", color: "#334155" }}>
                      <Check style={{ width: "1rem", height: "1rem", color: "#0284c7", flexShrink: 0, marginTop: "0.15rem" }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "0.75rem",
                    backgroundColor: plan.isPopular ? "#0284c7" : "#f0f9ff",
                    color: plan.isPopular ? "#ffffff" : "#0c4a6e",
                    fontWeight: 800,
                    fontSize: "0.875rem",
                    border: plan.isPopular ? "2px solid #0369a1" : "2px solid #7dd3fc",
                    cursor: "pointer",
                    boxShadow: plan.isPopular ? "0 4px 10px rgba(2, 132, 199, 0.3)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            BLOG SECTION (#blog)
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="blog"
          style={{
            padding: "4rem 1.5rem",
            backgroundColor: "#ffffff",
            borderTop: "2px solid #bae6fd",
            borderBottom: "2px solid #bae6fd",
            scrollMarginTop: "4.5rem",
          }}
        >
          <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#0284c7",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  backgroundColor: "#e0f2fe",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  border: "1px solid #7dd3fc",
                }}
              >
                Clinical Blog &amp; Insights
              </span>
              <h2
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: "0.75rem 0 0.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Latest Pharmacogenomics Research
              </h2>
              <p style={{ fontSize: "1rem", color: "#0369a1", maxWidth: "42rem", margin: "0 auto", fontWeight: 600 }}>
                Peer-reviewed insights, CPIC updates, and clinical guidelines published by our medical board.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {[
                {
                  title: "Navigating CYP2D6 Poor Metabolizer Risk in Tamoxifen & Codeine Prescribing",
                  date: "October 18, 2026",
                  readTime: "6 min read",
                  tag: "Clinical Practice",
                  snippet: "Why identifying inactive *4 and *5 alleles is critical prior to initiating adjuvant endocrine breast cancer therapy and post-operative pain management.",
                },
                {
                  title: "Federated Learning in Hospital Networks: Training Genomic Models Without Sharing PHI",
                  date: "September 24, 2026",
                  readTime: "9 min read",
                  tag: "AI & Privacy",
                  snippet: "How decentralized model weight aggregation enables multi-center machine learning without moving sensitive patient genomic sequences beyond hospital firewalls.",
                },
                {
                  title: "CPIC Guideline Update: Clopidogrel and CYP2C19 Loss-of-Function Diplotypes",
                  date: "August 30, 2026",
                  readTime: "5 min read",
                  tag: "Cardiology",
                  snippet: "New clinical data reinforces alternative P2Y12 inhibitor selection (Ticagrelor vs Prasugrel) in patients undergoing percutaneous coronary intervention.",
                },
              ].map((article) => (
                <div
                  key={article.title}
                  style={{
                    backgroundColor: "#f0f9ff",
                    border: "2px solid #bae6fd",
                    borderRadius: "1.25rem",
                    padding: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        backgroundColor: "#0284c7",
                        color: "#ffffff",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "0.35rem",
                      }}
                    >
                      {article.tag}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>{article.readTime}</span>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0c4a6e", lineHeight: 1.35, marginBottom: "0.75rem" }}>
                    {article.title}
                  </h3>

                  <p style={{ fontSize: "0.825rem", color: "#334155", lineHeight: 1.5, flex: 1, margin: "0 0 1rem" }}>
                    {article.snippet}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid #bae6fd" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>{article.date}</span>
                    <button
                      type="button"
                      onClick={() => alert("Full clinical article available in knowledge repository.")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284c7",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <span>Read Article</span>
                      <ChevronRight style={{ width: "0.85rem", height: "0.85rem" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            CONTACT SECTION (#contact)
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="contact"
          style={{
            padding: "4rem clamp(1.5rem, 4vw, 4rem)",
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            scrollMarginTop: "4.5rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#0284c7",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                backgroundColor: "#ffffff",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid #7dd3fc",
              }}
            >
              Institutional Inquiries
            </span>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: 900,
                color: "#0f172a",
                margin: "0.75rem 0 0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              Connect with Our Clinical Engineering Team
            </h2>
            <p style={{ fontSize: "1rem", color: "#0369a1", maxWidth: "42rem", margin: "0 auto", fontWeight: 600 }}>
              Speak with a precision medicine specialist to schedule an EHR integration demonstration or hospital pilot.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* Contact Details Card */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "1.5rem",
                padding: "2rem",
                border: "2px solid #bae6fd",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0c4a6e", marginBottom: "0.5rem" }}>
                  PrecisionRx Medical Headquarters
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                  Our clinical bio-informatics operations operate across North America with direct HL7 FHIR connectivity to major health networks.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin style={{ width: "1.2rem", height: "1.2rem", color: "#0284c7" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Health Sciences Institute</p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>550 1st Avenue, New York, NY 10016</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Phone style={{ width: "1.2rem", height: "1.2rem", color: "#0284c7" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Clinical Liaison Hotline</p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>+1 (800) 773-2479 (24/7 Physician Support)</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail style={{ width: "1.2rem", height: "1.2rem", color: "#0284c7" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Hospital Integration Inquiry</p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>clinical-integrations@precisionrx.ai</p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "1rem",
                  border: "1px solid #bae6fd",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <Shield style={{ width: "1rem", height: "1rem", color: "#059669" }} />
                  <strong style={{ fontSize: "0.78rem", color: "#065f46" }}>HIPAA &amp; BAA Protected</strong>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#334155", margin: 0, lineHeight: 1.4 }}>
                  All communications and demonstrations adhere to Business Associate Agreement (BAA) standards and institutional data privacy protocols.
                </p>
              </div>
            </div>

            {/* Direct Message Form */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "1.5rem",
                padding: "2rem",
                border: "2px solid #bae6fd",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.08)",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0c4a6e", marginBottom: "0.5rem" }}>
                Send Direct Message
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1.25rem" }}>
                Our team responds to institutional inquiries within 2 business hours.
              </p>

              {contactSent && (
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#d1fae5",
                    border: "1px solid #6ee7b7",
                    borderRadius: "0.75rem",
                    color: "#065f46",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <CheckCircle2 style={{ width: "1rem", height: "1rem" }} />
                  <span>Inquiry received! Our medical liaison will contact you shortly.</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                    Clinician Name &amp; Title
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Jordan Lee, MD"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#ffffff",
                      border: "2px solid #bae6fd",
                      borderRadius: "0.65rem",
                      fontSize: "0.825rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                    Hospital or Health System
                  </label>
                  <input
                    type="text"
                    required
                    value={contactHospital}
                    onChange={(e) => setContactHospital(e.target.value)}
                    placeholder="e.g. Johns Hopkins Medicine"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#ffffff",
                      border: "2px solid #bae6fd",
                      borderRadius: "0.65rem",
                      fontSize: "0.825rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="j.lee@jhmi.edu"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#ffffff",
                      border: "2px solid #bae6fd",
                      borderRadius: "0.65rem",
                      fontSize: "0.825rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                    Message &amp; Integration Goals
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your clinic size, current EHR, and pharmacogenomics objectives..."
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#ffffff",
                      border: "2px solid #bae6fd",
                      borderRadius: "0.65rem",
                      fontSize: "0.825rem",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "0.85rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.875rem",
                    border: "2px solid #0369a1",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(2, 132, 199, 0.3)",
                    marginTop: "0.5rem",
                  }}
                >
                  Submit Institutional Inquiry
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          AUTHENTICATION DIALOG MODAL (100% SOLID, ZERO TRANSPARENCY)
          Opens when user clicks "Sign In" or "Register" anywhere on the site!
      ══════════════════════════════════════════════════════════════════════ */}
      {isAuthOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9995,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          {/* Solid Non-Dimming Click Away Catch */}
          <div
            onClick={closeAuth}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "transparent",
              zIndex: 9996,
              cursor: "pointer",
            }}
            aria-label="Close dialog overlay"
          />

          {/* The Authentication Card (100% Solid White, Solid Sky Blue Border, NO Transparency) */}
          <div
            style={{
              position: "relative",
              zIndex: 9997,
              width: "100%",
              maxWidth: authMode === "register" ? "32rem" : "28rem",
              maxHeight: "92vh",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "1.5rem",
              border: "3px solid #0284c7",
              boxShadow: "0 25px 50px -12px rgba(2, 132, 199, 0.35)",
              padding: "1.75rem",
              opacity: 1,
            }}
          >
            {/* Modal Header & Close Button */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(2, 132, 199, 0.35)",
                    overflow: "hidden",
                    padding: "0.2rem",
                    border: "2px solid #bae6fd",
                  }}
                >
                  <img
                    src="/Logo.png"
                    alt="PrecisionRx AI Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 900,
                      color: "#0f172a",
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                  >
                    {authMode === "signin" ? "Clinician Portal Sign In" : "Register New Clinician"}
                  </h2>
                  <p style={{ fontSize: "0.75rem", color: "#0369a1", fontWeight: 600, margin: "0.2rem 0 0" }}>
                    {authMode === "signin"
                      ? "Access patient genomic profiles & AI dosing models"
                      : "Create institutional credentials for pharmacogenomics"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeAuth}
                aria-label="Close authentication dialog"
                style={{
                  backgroundColor: "#f0f9ff",
                  border: "1.5px solid #bae6fd",
                  borderRadius: "0.5rem",
                  padding: "0.35rem",
                  color: "#0c4a6e",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: "1.2rem", height: "1.2rem" }} />
              </button>
            </div>

            {/* Mode Switcher Tabs (Sign In vs Register New) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                backgroundColor: "#f0f9ff",
                padding: "0.35rem",
                borderRadius: "1rem",
                border: "2px solid #bae6fd",
                marginBottom: "1.25rem",
              }}
            >
              <button
                id="modal-tab-signin"
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setRegError("");
                }}
                style={{
                  padding: "0.55rem 0.75rem",
                  borderRadius: "0.75rem",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  transition: "all 0.15s ease",
                  backgroundColor: authMode === "signin" ? "#0284c7" : "#ffffff",
                  color: authMode === "signin" ? "#ffffff" : "#0369a1",
                  border: authMode === "signin" ? "2px solid #0369a1" : "1px solid #bae6fd",
                  boxShadow: authMode === "signin" ? "0 2px 4px rgba(2, 132, 199, 0.25)" : "none",
                }}
              >
                <Lock style={{ width: "0.95rem", height: "0.95rem" }} />
                <span>Clinician Sign In</span>
              </button>
              <button
                id="modal-tab-register"
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setRegError("");
                }}
                style={{
                  padding: "0.55rem 0.75rem",
                  borderRadius: "0.75rem",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  transition: "all 0.15s ease",
                  backgroundColor: authMode === "register" ? "#0284c7" : "#ffffff",
                  color: authMode === "register" ? "#ffffff" : "#0369a1",
                  border: authMode === "register" ? "2px solid #0369a1" : "1px solid #bae6fd",
                  boxShadow: authMode === "register" ? "0 2px 4px rgba(2, 132, 199, 0.25)" : "none",
                }}
              >
                <UserPlus style={{ width: "0.95rem", height: "0.95rem" }} />
                <span>Register New</span>
              </button>
            </div>

            {/* ─── TAB 1: SIGN IN MODE (WITH EXACT USER-REQUESTED OPTIONS) ─── */}
            {authMode === "signin" && (
              <>
                {/* Select Role Profile: Physician, Geneticist, Pharmacist, Admin */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#0369a1",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Select Role Profile
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      padding: "0.35rem",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "1rem",
                      border: "2px solid #bae6fd",
                    }}
                  >
                    {ROLES.map((r) => {
                      const isSelected = selectedRole.id === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleRoleSelect(r)}
                          style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "0.65rem",
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            textAlign: "center",
                            backgroundColor: isSelected ? "#0284c7" : "#ffffff",
                            color: isSelected ? "#ffffff" : "#0c4a6e",
                            border: isSelected ? "2px solid #0369a1" : "1px solid #bae6fd",
                            boxShadow: isSelected ? "0 2px 4px rgba(2, 132, 199, 0.2)" : "none",
                          }}
                        >
                          {r.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Medical Email or NPI */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Medical Email or NPI
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dr.name@hospital.org"
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        backgroundColor: "#ffffff",
                        border: "2px solid #bae6fd",
                        borderRadius: "0.75rem",
                        fontSize: "0.85rem",
                        color: "#0f172a",
                        fontWeight: 600,
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Password [Forgot?] */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                        Password
                      </label>
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Demo password is pre-filled. Click 'Sign In to Clinical Workspace' or 'Instant Demo Access'.");
                        }}
                        style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 700, textDecoration: "none" }}
                      >
                        [Forgot?]
                      </a>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                          backgroundColor: "#ffffff",
                          border: "2px solid #bae6fd",
                          borderRadius: "0.75rem",
                          fontSize: "0.85rem",
                          color: "#0f172a",
                          fontWeight: 600,
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        style={{
                          position: "absolute",
                          right: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#0284c7",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showPassword ? (
                          <EyeOff style={{ width: "1.1rem", height: "1.1rem" }} />
                        ) : (
                          <Eye style={{ width: "1.1rem", height: "1.1rem" }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember workstation & 2FA Verified */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ width: "1rem", height: "1rem", accentColor: "#0284c7" }}
                      />
                      <span>Remember workstation</span>
                    </label>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: "#065f46",
                        backgroundColor: "#d1fae5",
                        border: "1px solid #6ee7b7",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                      }}
                    >
                      <Shield style={{ width: "0.75rem", height: "0.75rem", color: "#059669" }} />
                      2FA Verified
                    </span>
                  </div>

                  {/* Sign In to Clinical Workspace Button */}
                  <button
                    id="btn-modal-signin-submit"
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      marginTop: "0.5rem",
                      padding: "0.85rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#0284c7",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      border: "2px solid #0369a1",
                      cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(2, 132, 199, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {isLoading ? (
                      <span>Authenticating Workspace...</span>
                    ) : (
                      <>
                        <span>Sign In to Clinical Workspace</span>
                        <ArrowRight style={{ width: "1.1rem", height: "1.1rem" }} />
                      </>
                    )}
                  </button>
                </form>

                {/* Instant Demo Access (Skip Login) */}
                <div style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "2px solid #e0f2fe" }}>
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#f0f9ff",
                      color: "#0c4a6e",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      border: "2px solid #bae6fd",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <UserCheck style={{ width: "1rem", height: "1rem", color: "#0284c7" }} />
                    <span>Instant Demo Access (Skip Login)</span>
                  </button>
                </div>

                {/* Switch to Registration */}
                <div style={{ marginTop: "0.85rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0, fontWeight: 600 }}>
                    New clinician joining PrecisionRx?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setRegError("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284c7",
                        fontWeight: 800,
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: "0.8rem",
                      }}
                    >
                      Register New Clinician
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* ─── TAB 2: REGISTRATION MODE ─── */}
            {authMode === "register" && (
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {/* Error Banner */}
                {regError && (
                  <div
                    style={{
                      padding: "0.65rem 0.85rem",
                      backgroundColor: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: "0.75rem",
                      color: "#991b1b",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {regSuccess && (
                  <div
                    style={{
                      padding: "0.65rem 0.85rem",
                      backgroundColor: "#d1fae5",
                      border: "1px solid #6ee7b7",
                      borderRadius: "0.75rem",
                      color: "#065f46",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <CheckCircle2 style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                    <span>Registration verified! Launching clinical workspace...</span>
                  </div>
                )}

                {/* Full Name & Title */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                    Clinician Full Name &amp; Title
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Alexander Hayes, MD"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "#ffffff",
                      border: "2px solid #bae6fd",
                      borderRadius: "0.75rem",
                      fontSize: "0.825rem",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Clinical Role Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0369a1", marginBottom: "0.35rem" }}>
                    Designated Clinical Role
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.4rem",
                      padding: "0.3rem",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "0.85rem",
                      border: "2px solid #bae6fd",
                    }}
                  >
                    {[
                      { id: "doctor", label: "Physician / MD" },
                      { id: "geneticist", label: "Medical Geneticist" },
                      { id: "pharmacist", label: "Clinical PharmD" },
                      { id: "admin", label: "Research / Admin" },
                    ].map((r) => {
                      const isSelected = regRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRegRole(r.id as any)}
                          style={{
                            padding: "0.45rem 0.5rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            backgroundColor: isSelected ? "#0284c7" : "#ffffff",
                            color: isSelected ? "#ffffff" : "#0c4a6e",
                            border: isSelected ? "2px solid #0369a1" : "1px solid #bae6fd",
                            boxShadow: isSelected ? "0 2px 4px rgba(2, 132, 199, 0.2)" : "none",
                          }}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hospital Affiliation & NPI */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                      Hospital / Institution
                    </label>
                    <input
                      type="text"
                      required
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                      placeholder="e.g. Mount Sinai"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.7rem",
                        backgroundColor: "#ffffff",
                        border: "2px solid #bae6fd",
                        borderRadius: "0.65rem",
                        fontSize: "0.8rem",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                      NPI / License #
                    </label>
                    <input
                      type="text"
                      required
                      value={regNpi}
                      onChange={(e) => setRegNpi(e.target.value)}
                      placeholder="10-digit NPI"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.7rem",
                        backgroundColor: "#ffffff",
                        border: "2px solid #bae6fd",
                        borderRadius: "0.65rem",
                        fontSize: "0.8rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                    Institutional Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="a.hayes@mountsinai.org"
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      backgroundColor: "#ffffff",
                      border: "2px solid #bae6fd",
                      borderRadius: "0.65rem",
                      fontSize: "0.8rem",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Password & Confirm */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                      Create Password
                    </label>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.7rem",
                        backgroundColor: "#ffffff",
                        border: "2px solid #bae6fd",
                        borderRadius: "0.65rem",
                        fontSize: "0.8rem",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
                      Confirm Password
                    </label>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.7rem",
                        backgroundColor: "#ffffff",
                        border: "2px solid #bae6fd",
                        borderRadius: "0.65rem",
                        fontSize: "0.8rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* HIPAA Agreement */}
                <div
                  style={{
                    padding: "0.65rem 0.75rem",
                    backgroundColor: "#f0f9ff",
                    border: "1.5px solid #bae6fd",
                    borderRadius: "0.65rem",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#0c4a6e",
                      lineHeight: 1.3,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={regAgreement}
                      onChange={(e) => setRegAgreement(e.target.checked)}
                      style={{ width: "0.95rem", height: "0.95rem", marginTop: "0.1rem", accentColor: "#0284c7" }}
                    />
                    <span>
                      I certify that I am a licensed healthcare professional agreeing to HIPAA protected health information (PHI) guidelines and clinical data governance.
                    </span>
                  </label>
                </div>

                {/* Complete Registration Button */}
                <button
                  id="btn-modal-register-submit"
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.875rem",
                    border: "2px solid #0369a1",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(2, 132, 199, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isLoading ? (
                    <span>Registering Credentials...</span>
                  ) : (
                    <>
                      <span>Complete Registration &amp; Access Workspace</span>
                      <ArrowRight style={{ width: "1.1rem", height: "1.1rem" }} />
                    </>
                  )}
                </button>

                {/* Back to Sign In */}
                <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0, fontWeight: 600 }}>
                    Already have credentials?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setRegError("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284c7",
                        fontWeight: 800,
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: "0.8rem",
                      }}
                    >
                      Sign In to existing account
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Comprehensive Solid Footer ── */}
      <footer
        style={{
          borderTop: "2px solid #bae6fd",
          backgroundColor: "#ffffff",
          padding: "2rem 1.5rem 1.5rem",
          fontSize: "0.78rem",
          color: "#0369a1",
          fontWeight: 600,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: "0.1rem",
                  border: "1px solid #bae6fd",
                }}
              >
                <img
                  src="/Logo.png"
                  alt="PrecisionRx AI Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
              <strong style={{ fontSize: "1.05rem", color: "#0c4a6e" }}>PrecisionRx AI</strong>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5, margin: 0 }}>
              AI-driven pharmacogenomic dosing intelligence system for health networks and clinical specialty clinics.
            </p>
          </div>

          <div>
            <strong style={{ display: "block", color: "#0c4a6e", marginBottom: "0.65rem", fontSize: "0.85rem" }}>
              Platform Navigation
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <Link href="/#about" style={{ color: "#0284c7", textDecoration: "none" }}>About Us</Link>
              <Link href="/#benefits" style={{ color: "#0284c7", textDecoration: "none" }}>Benefits</Link>
              <Link href="/#features" style={{ color: "#0284c7", textDecoration: "none" }}>Features</Link>
              <Link href="/#plans" style={{ color: "#0284c7", textDecoration: "none" }}>Plans</Link>
              <Link href="/#blog" style={{ color: "#0284c7", textDecoration: "none" }}>Blog</Link>
              <Link href="/#contact" style={{ color: "#0284c7", textDecoration: "none" }}>Contact</Link>
            </div>
          </div>

          <div>
            <strong style={{ display: "block", color: "#0c4a6e", marginBottom: "0.65rem", fontSize: "0.85rem" }}>
              Clinical Workspaces
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <Link href="/dashboard" style={{ color: "#0284c7", textDecoration: "none" }}>Clinical Dashboard</Link>
              <Link href="/patient/p1" style={{ color: "#0284c7", textDecoration: "none" }}>Patient Genomic Dossier</Link>
              <Link href="/insights" style={{ color: "#0284c7", textDecoration: "none" }}>AI &amp; Model Insights</Link>
              <Link href="/settings" style={{ color: "#0284c7", textDecoration: "none" }}>System &amp; HIPAA Security</Link>
              <a href="http://localhost:8000/api/docs" target="_blank" rel="noreferrer" style={{ color: "#0284c7", textDecoration: "none" }}>FastAPI Swagger API</a>
            </div>
          </div>

          <div>
            <strong style={{ display: "block", color: "#0c4a6e", marginBottom: "0.65rem", fontSize: "0.85rem" }}>
              Compliance &amp; Governance
            </strong>
            <p style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.4, margin: "0 0 0.5rem" }}>
              PrecisionRx adheres to CPIC Level 1A guidelines, FDA Table of Pharmacogenomic Biomarkers, and HIPAA Security Rule Title II.
            </p>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#d1fae5",
                color: "#065f46",
                border: "1px solid #6ee7b7",
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                fontSize: "0.7rem",
                fontWeight: 800,
              }}
            >
              ● HIPAA Certified 2026
            </span>
          </div>
        </div>

        <div
          style={{
            maxWidth: "75rem",
            margin: "0 auto",
            paddingTop: "1rem",
            borderTop: "1px solid #e0f2fe",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            fontSize: "0.72rem",
            color: "#64748b",
          }}
        >
          <div>© 2026 PrecisionRx AI Inc. All rights reserved. For clinical research and healthcare decision support.</div>
          <div style={{ display: "flex", gap: "1rem", fontWeight: 700 }}>
            <span style={{ color: "#0284c7" }}>Terms of Clinical Service</span>
            <span style={{ color: "#0284c7" }}>HIPAA Notice</span>
            <span style={{ color: "#0284c7" }}>BAA Agreement</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
