"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, Brain, Activity, Dna, LayoutDashboard, Settings,
  FileText, Shield, LogOut, User, ExternalLink, ChevronRight,
  Sparkles, Users
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface NavbarProps {
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onOpenAuth?: (mode: "signin" | "register") => void;
}

export default function Navbar({ showSearch, searchTerm, onSearchChange, onOpenAuth }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const clinicianName = user?.fullName || "Dr. Rachel Kim";
  const clinicianRole =
    user?.role === "doctor"
      ? "Attending Physician · Oncology"
      : user?.role === "geneticist"
      ? "Medical Geneticist"
      : user?.role === "pharmacist"
      ? "Clinical Pharmacist (PharmD)"
      : "Chief Medical Officer";
  const clinicianShortRole =
    user?.role === "doctor"
      ? "Physician"
      : user?.role === "geneticist"
      ? "Geneticist"
      : user?.role === "pharmacist"
      ? "Pharmacist"
      : "Admin";
  const clinicianInitials =
    clinicianName
      .replace(/^Dr\.\s*/i, "")
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MD";

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const topNavLinks = [
    { label: "About Us", href: "/#about" },
    { label: "Benefits", href: "/#benefits" },
    { label: "Features", href: "/#features" },
    { label: "Plans", href: "/#plans" },
    { label: "Blog", href: "/#blog" },
    { label: "Contact", href: "/#contact" },
  ];

  const navLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" style={{ color: "#0284c7" }} />,
      description: "Real-time clinical cohort overview & alert triage",
      badge: "Live Triage",
      iconBg: "#e0f2fe",
    },
    {
      title: "Patients",
      href: "/patients",
      icon: <Users className="w-5 h-5" style={{ color: "#2563eb" }} />,
      description: "Patient cohort directory, EHR records & risk scoring",
      badge: "1,284 Active",
      iconBg: "#dbeafe",
    },
    {
      title: "AI Insights",
      href: "/insights",
      icon: <Brain className="w-5 h-5" style={{ color: "#059669" }} />,
      description: "ClinPGx ML models, ADR prediction & SHAP explainability",
      badge: "Trained ML",
      iconBg: "#d1fae5",
    },
    {
      title: "Genomics",
      href: "/genomics",
      icon: <Dna className="w-5 h-5" style={{ color: "#7c3aed" }} />,
      description: "Pharmacogenomic catalog, CPIC Level 1A & star alleles",
      badge: "CPIC 1A",
      iconBg: "#ede9fe",
    },
    {
      title: "System Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5" style={{ color: "#475569" }} />,
      description: "HIPAA security, FHIR EHR gateways & audit trails",
      badge: "HIPAA §164",
      iconBg: "#f1f5f9",
    },
  ];

  return (
    <>
      {/* ── Solid Sky Blue Top Navigation Bar ── */}
      <header
        style={{
          backgroundColor: "#0284c7",
          borderBottom: "2px solid #0369a1",
          color: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0",
            padding: "0 1.5rem",
            height: "4.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          {/* Left: Brand Logo & Title */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "0.75rem",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                overflow: "hidden",
                padding: "0.15rem",
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 900, fontSize: "1.125rem", letterSpacing: "-0.02em" }}>
                  PrecisionRx
                </span>
                <span
                  style={{
                    backgroundColor: "#0369a1",
                    color: "#ffffff",
                    border: "1px solid #38bdf8",
                    fontSize: "0.65rem",
                    fontWeight: 900,
                    padding: "0.15rem 0.4rem",
                    borderRadius: "0.25rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  AI
                </span>
              </div>
              <p style={{ fontSize: "0.7rem", color: "#e0f2fe", margin: 0, fontWeight: 500 }}>
                Personalized Medicine Intelligence
              </p>
            </div>
          </Link>

          {/* Upper Nav Links requested by user: About Us, Benefits, Features, Plans, Blog, Contact (clean, no brackets) */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              margin: "0 0.5rem",
              flexWrap: "nowrap",
            }}
          >
            {topNavLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  padding: "0.35rem 0.6rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "transparent",
                  border: "1px solid transparent",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0369a1";
                  e.currentTarget.style.borderColor = "#38bdf8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Center search (if enabled) */}
          {showSearch && onSearchChange && (
            <div style={{ maxWidth: "14rem" }}>
              <input
                type="text"
                placeholder="Search patient, MRN..."
                value={searchTerm || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.78rem",
                  backgroundColor: "#0369a1",
                  color: "#ffffff",
                  border: "1px solid #38bdf8",
                  borderRadius: "0.75rem",
                  outline: "none",
                }}
              />
            </div>
          )}

          {/* Right Side: Clinician Pill & 3-Strip Line Menu Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>

            {/* Quick Clinician Pill */}
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.65rem",
                borderRadius: "0.65rem",
                backgroundColor: "#0369a1",
                border: "1px solid #38bdf8",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "0.75rem",
              }}
              title="View Dashboard"
            >
              <div
                style={{
                  width: "1.65rem",
                  height: "1.65rem",
                  borderRadius: "9999px",
                  backgroundColor: "#ffffff",
                  color: "#0284c7",
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                }}
              >
                {clinicianInitials}
              </div>
              <div style={{ textAlign: "left" }} className="hidden sm:block">
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.72rem", lineHeight: 1.1 }}>{clinicianName}</p>
                <p style={{ margin: 0, fontSize: "0.62rem", color: "#bae6fd", lineHeight: 1.1 }}>{clinicianShortRole}</p>
              </div>
            </Link>

            {/* The Three-Strip Line Menu Button (Right Side, Solid) */}
            <button
              id="main-nav-menu-toggle"
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open Navigation Menu"
              style={{
                backgroundColor: "#ffffff",
                color: "#0284c7",
                border: "2px solid #ffffff",
                borderRadius: "0.65rem",
                padding: "0.45rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontWeight: 800,
                fontSize: "0.825rem",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
              title="Open Menu"
            >
              <Menu style={{ width: "1.25rem", height: "1.25rem", color: "#0284c7", strokeWidth: 2.8 }} />
              <span style={{ color: "#0369a1" }}>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Right-Side Slide-Over Menu Drawer (100% SOLID, ZERO TRANSPARENCY) ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9990,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {/* Clickable Background Catch (Invisible, NOT transparent dark, so page remains 100% clear & bright) */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "transparent",
              zIndex: 9991,
              cursor: "pointer",
            }}
            aria-label="Close menu on background click"
          />

          {/* Drawer Sidebar Aligned to RIGHT SIDE (100% Solid White, Solid Sky Header, Opaque) */}
          <div
            style={{
              position: "relative",
              zIndex: 9992,
              width: "100%",
              maxWidth: "24rem",
              height: "100vh",
              backgroundColor: "#ffffff",
              borderLeft: "4px solid #0284c7",
              boxShadow: "-8px 0 25px rgba(2, 132, 199, 0.25)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflowY: "auto",
              opacity: 1,
            }}
          >
            {/* Top of Drawer */}
            <div>
              {/* Drawer Header (Solid Sky Blue) */}
              <div
                style={{
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  padding: "1.25rem",
                  borderBottom: "2px solid #0369a1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "2.25rem",
                      height: "2.25rem",
                      borderRadius: "0.5rem",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      padding: "0.15rem",
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
                    <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
                      PrecisionRx Navigation
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#e0f2fe" }}>
                      Clinical Intelligence System
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  style={{
                    backgroundColor: "#0369a1",
                    border: "1px solid #38bdf8",
                    color: "#ffffff",
                    borderRadius: "0.5rem",
                    padding: "0.35rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X style={{ width: "1.25rem", height: "1.25rem" }} />
                </button>
              </div>

              {/* Clinician Card (Solid Sky 50) */}
              <div
                style={{
                  margin: "1rem",
                  padding: "1rem",
                  borderRadius: "1rem",
                  backgroundColor: "#f0f9ff",
                  border: "2px solid #bae6fd",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  {clinicianInitials}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0c4a6e" }}>
                    {clinicianName}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: "#0369a1", fontWeight: 500 }}>
                    {clinicianRole}
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "0.25rem",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      backgroundColor: "#d1fae5",
                      color: "#065f46",
                      border: "1px solid #6ee7b7",
                      padding: "0.1rem 0.5rem",
                      borderRadius: "9999px",
                    }}
                  >
                    ● Verified Clinician
                  </span>
                </div>
              </div>

              {/* Nav Links (Solid White with Sky Blue borders) */}
              <div style={{ padding: "0 1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.5rem 0.25rem 0.5rem" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#0369a1",
                    }}
                  >
                    Clinical Workspaces
                  </p>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      color: "#0284c7",
                      backgroundColor: "#e0f2fe",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "0.25rem",
                    }}
                  >
                    5 Active
                  </span>
                </div>

                {navLinks.map((item) => {
                  const isActive = pathname === item.href || (item.href === "/patients" && pathname.startsWith("/patient"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.85rem 1rem",
                        marginBottom: "0.5rem",
                        borderRadius: "0.85rem",
                        textDecoration: "none",
                        backgroundColor: isActive ? "#0284c7" : "#ffffff",
                        color: isActive ? "#ffffff" : "#0f172a",
                        border: isActive ? "2px solid #0369a1" : "2px solid #bae6fd",
                        boxShadow: isActive ? "0 4px 12px rgba(2, 132, 199, 0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
                        transition: "all 0.18s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#0284c7";
                          e.currentTarget.style.backgroundColor = "#f0f9ff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#bae6fd";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }
                      }}
                    >
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          borderRadius: "0.65rem",
                          backgroundColor: isActive ? "rgba(255,255,255,0.18)" : item.iconBg || "#f0f9ff",
                          border: isActive ? "1px solid rgba(255,255,255,0.3)" : "1px solid #bae6fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                padding: "0.15rem 0.5rem",
                                borderRadius: "9999px",
                                backgroundColor: isActive ? "#ffffff" : "#e0f2fe",
                                color: isActive ? "#0284c7" : "#0369a1",
                                border: isActive ? "1px solid #ffffff" : "1px solid #bae6fd",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: "0.2rem 0 0",
                            fontSize: "0.72rem",
                            color: isActive ? "#e0f2fe" : "#64748b",
                            lineHeight: 1.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 500,
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight
                        style={{
                          width: "1.1rem",
                          height: "1.1rem",
                          color: isActive ? "#ffffff" : "#0284c7",
                          flexShrink: 0,
                        }}
                      />
                    </Link>
                  );
                })}
              </div>



              {/* Documentation */}
              <div
                style={{
                  margin: "1rem 1rem 0",
                  paddingTop: "0.75rem",
                  borderTop: "2px solid #e0f2fe",
                }}
              >
                <p
                  style={{
                    margin: "0 0.25rem 0.5rem",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#0369a1",
                  }}
                >
                  Developer Documentation
                </p>
                <a
                  href="http://localhost:8000/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.85rem",
                    marginBottom: "0.35rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    textDecoration: "none",
                    color: "#0c4a6e",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FileText style={{ width: "1rem", height: "1rem", color: "#0284c7" }} />
                    FastAPI Swagger Docs
                  </span>
                  <ExternalLink style={{ width: "0.85rem", height: "0.85rem", color: "#0284c7" }} />
                </a>

                <Link
                  href="/#features"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.85rem",
                    marginBottom: "0.35rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    textDecoration: "none",
                    color: "#0c4a6e",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Shield style={{ width: "1rem", height: "1rem", color: "#0284c7" }} />
                    Tech Stack &amp; Architecture (docs/)
                  </span>
                  <ChevronRight style={{ width: "0.85rem", height: "0.85rem", color: "#0284c7" }} />
                </Link>
              </div>
            </div>

            {/* Bottom Footer (Solid Sky 50) */}
            <div
              style={{
                padding: "1rem",
                borderTop: "2px solid #bae6fd",
                backgroundColor: "#f0f9ff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "#0369a1",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                }}
              >
                <span>Version 1.0.0</span>
                <span
                  style={{
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                    border: "1px solid #6ee7b7",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "0.25rem",
                    fontWeight: 800,
                  }}
                >
                  HIPAA Certified
                </span>
              </div>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#ffffff",
                  border: "2px solid #bae6fd",
                  color: "#0369a1",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <LogOut style={{ width: "1rem", height: "1rem", color: "#0284c7" }} />
                <span>Switch Role / Sign Out</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
