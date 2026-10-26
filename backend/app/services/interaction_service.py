"""Drug-Drug Interaction Service — clinical interaction database and cross-checker."""
from __future__ import annotations

import itertools
from typing import Any, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db_models import Medication


# Clinical drug interaction knowledgebase (severity: major, moderate, minor)
KNOWN_INTERACTIONS: dict[frozenset[str], dict[str, str]] = {
    frozenset(["warfarin", "aspirin"]): {
        "severity": "major",
        "description": "Concurrent anticoagulant and antiplatelet therapy significantly increases severe bleeding risk.",
        "mechanism": "Additive pharmacodynamic inhibition of coagulation and platelet aggregation.",
        "management": "Avoid combination unless strictly indicated (e.g. mechanical heart valve + ACS); monitor INR and bleeding signs closely.",
    },
    frozenset(["warfarin", "ibuprofen"]): {
        "severity": "major",
        "description": "NSAIDs displace warfarin from albumin, inhibit platelet COX-1, and cause GI mucosal damage.",
        "mechanism": "Pharmacodynamic and pharmacokinetic synergy leading to elevated gastrointestinal hemorrhage.",
        "management": "Avoid NSAIDs; consider acetaminophen for analgesia or prescribe a proton pump inhibitor if unavoidable.",
    },
    frozenset(["clopidogrel", "omeprazole"]): {
        "severity": "major",
        "description": "Omeprazole inhibits CYP2C19, preventing bioactivation of clopidogrel and reducing antiplatelet efficacy.",
        "mechanism": "CYP2C19 competitive inhibition reduces active clopidogrel thiol metabolite formation.",
        "management": "Switch omeprazole to pantoprazole or famotidine, which exhibit lower CYP2C19 inhibition.",
    },
    frozenset(["simvastatin", "amiodarone"]): {
        "severity": "major",
        "description": "Amiodarone inhibits CYP3A4 metabolism of simvastatin, increasing systemic exposure and rhabdomyolysis risk.",
        "mechanism": "CYP3A4 hepatic clearance inhibition.",
        "management": "Do not exceed simvastatin 20mg daily with amiodarone, or switch to rosuvastatin or pravastatin.",
    },
    frozenset(["lisinopril", "spironolactone"]): {
        "severity": "major",
        "description": "Co-administration of ACE inhibitor and potassium-sparing diuretic causes life-threatening hyperkalemia.",
        "mechanism": "Additive suppression of aldosterone secretion and renal potassium excretion.",
        "management": "Monitor serum potassium and creatinine within 1-2 weeks of initiation and regularly thereafter.",
    },
    frozenset(["metformin", "contrast"]): {
        "severity": "major",
        "description": "Iodinated radiocontrast can precipitate acute renal impairment leading to metformin accumulation and lactic acidosis.",
        "mechanism": "Contrast-induced nephropathy impairs renal clearance of metformin.",
        "management": "Withhold metformin at time of or prior to iodinated contrast procedure, resume 48 hours post-procedure if eGFR stable.",
    },
    frozenset(["ciprofloxacin", "theophylline"]): {
        "severity": "major",
        "description": "Ciprofloxacin strongly inhibits CYP1A2, drastically increasing theophylline serum levels and toxicity (seizures, arrhythmias).",
        "mechanism": "CYP1A2 metabolic inhibition.",
        "management": "Avoid co-administration; if required, reduce theophylline dose by 50% and monitor plasma concentrations.",
    },
    frozenset(["fluoxetine", "tramadol"]): {
        "severity": "major",
        "description": "Increased risk of serotonin syndrome and reduced tramadol analgesic efficacy.",
        "mechanism": "CYP2D6 inhibition blocks active M1 metabolite formation while additive serotonergic transmission occurs.",
        "management": "Avoid combination; monitor for tremor, hyperreflexia, agitation, and hyperthermia.",
    },
    frozenset(["digoxin", "amiodarone"]): {
        "severity": "major",
        "description": "Amiodarone decreases renal and non-renal clearance of digoxin via P-glycoprotein inhibition, causing digitalis toxicity.",
        "mechanism": "P-glycoprotein transporter inhibition in kidneys and gut.",
        "management": "Reduce digoxin dose by 30-50% when initiating amiodarone; monitor serum digoxin and ECG.",
    },
    frozenset(["methotrexate", "ibuprofen"]): {
        "severity": "major",
        "description": "NSAIDs decrease renal clearance of methotrexate, resulting in fatal bone marrow suppression and nephrotoxicity.",
        "mechanism": "Inhibition of renal tubular secretion of methotrexate.",
        "management": "Avoid NSAIDs during high-dose methotrexate therapy; monitor complete blood count and renal profile.",
    },
    frozenset(["atorvastatin", "clarithromycin"]): {
        "severity": "major",
        "description": "Clarithromycin is a potent CYP3A4 inhibitor that markedly increases atorvastatin AUC and myopathy risk.",
        "mechanism": "CYP3A4 inhibition.",
        "management": "Temporarily suspend atorvastatin during clarithromycin course, or switch to azithromycin.",
    },
    frozenset(["metformin", "alcohol"]): {
        "severity": "moderate",
        "description": "Acute or chronic alcohol ingestion potentiates metformin effect on lactate metabolism.",
        "mechanism": "Alcohol oxidation elevates NADH/NAD+ ratio, favoring pyruvate conversion to lactate.",
        "management": "Warn patients against excessive acute or chronic alcohol consumption while taking metformin.",
    },
    frozenset(["lisinopril", "ibuprofen"]): {
        "severity": "moderate",
        "description": "NSAIDs attenuate the antihypertensive effect of ACE inhibitors and precipitate acute kidney injury.",
        "mechanism": "Prostaglandin synthesis inhibition blunts afferent arteriolar vasodilation.",
        "management": "Limit concurrent NSAID use, monitor blood pressure and renal function.",
    },
}


class DrugInteractionService:
    """Service to evaluate pairwise and patient-level drug-drug interactions."""

    async def check(
        self,
        drug_names: list[str],
        patient_id: Optional[str] = None,
        db: Optional[AsyncSession] = None,
    ) -> list[dict[str, Any]]:
        """
        Evaluate interactions between provided drugs, plus any active patient prescriptions if patient_id is provided.
        """
        normalized_drugs = [d.strip().lower() for d in drug_names if d.strip()]

        # If patient_id and db session provided, retrieve current active medications
        if patient_id and db:
            result = await db.execute(
                select(Medication).where(
                    Medication.patient_id == patient_id,
                    Medication.is_deleted == False if hasattr(Medication, "is_deleted") else Medication.is_active == True,
                )
            )
            patient_meds = result.scalars().all()
            for med in patient_meds:
                name_clean = med.drug_name.strip().lower()
                generic_clean = (med.generic_name or "").strip().lower()
                if name_clean and name_clean not in normalized_drugs:
                    normalized_drugs.append(name_clean)
                if generic_clean and generic_clean not in normalized_drugs:
                    normalized_drugs.append(generic_clean)

        found_interactions: list[dict[str, Any]] = []
        tested_pairs: set[frozenset[str]] = set()

        # Pairwise combination check
        for drug_a, drug_b in itertools.combinations(normalized_drugs, 2):
            # Check exact match or substring match in interaction database
            pair_key = frozenset([drug_a, drug_b])
            if pair_key in tested_pairs:
                continue
            tested_pairs.add(pair_key)

            matched_info = self._lookup_interaction(drug_a, drug_b)
            if matched_info:
                found_interactions.append({
                    "drug_a": drug_a.capitalize(),
                    "drug_b": drug_b.capitalize(),
                    "severity": matched_info["severity"],
                    "description": matched_info["description"],
                    "mechanism": matched_info["mechanism"],
                    "management": matched_info.get("management", "Review therapy and monitor patient."),
                })

        # Sort with major interactions first
        severity_order = {"major": 0, "moderate": 1, "minor": 2}
        found_interactions.sort(key=lambda x: severity_order.get(x["severity"], 99))

        return found_interactions

    def _lookup_interaction(self, drug_a: str, drug_b: str) -> Optional[dict[str, str]]:
        """Match against known interaction rules with fuzzy root matching."""
        # Exact match
        direct = KNOWN_INTERACTIONS.get(frozenset([drug_a, drug_b]))
        if direct:
            return direct

        # Substring/root matching (e.g., "metformin hcl" matches "metformin")
        for key_pair, data in KNOWN_INTERACTIONS.items():
            k1, k2 = list(key_pair)
            if (k1 in drug_a or drug_a in k1) and (k2 in drug_b or drug_b in k2):
                return data
            if (k1 in drug_b or drug_b in k1) and (k2 in drug_a or drug_a in k2):
                return data

        return None
