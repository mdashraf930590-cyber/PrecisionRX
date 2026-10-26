import { create } from "zustand";

export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  mrn: string;
  risk: number;
  condition: string;
  status: "critical" | "high" | "medium" | "low";
  adherence: number;
}

interface PatientStore {
  selectedPatientId: string | null;
  filterRisk: string | null;
  searchQuery: string;
  setSelectedPatientId: (id: string | null) => void;
  setFilterRisk: (risk: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  selectedPatientId: "p1",
  filterRisk: null,
  searchQuery: "",
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  setFilterRisk: (risk) => set({ filterRisk: risk }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
