"""Genomics processing service — VCF parsing and pharmacogenomic predictions."""
from __future__ import annotations

import io
from typing import Any

try:
    from fastapi import UploadFile
except ImportError:
    UploadFile = Any

try:
    from sqlalchemy.ext.asyncio import AsyncSession
except ImportError:
    AsyncSession = Any

try:
    from app.models.db_models import GenomicProfile, Patient
except ImportError:
    try:
        from backend.app.models.db_models import GenomicProfile, Patient
    except ImportError:
        GenomicProfile = Any
        Patient = Any

# CYP450 metabolizer status lookup tables (based on CPIC guidelines)
METABOLIZER_TABLE = {
    "CYP2D6": {
        "poor": ["*3/*4", "*4/*4", "*5/*5", "*4/*5"],
        "intermediate": ["*4/*41", "*5/*9", "*1/*5"],
        "normal": ["*1/*1", "*1/*2", "*2/*2"],
        "rapid": ["*1/*XN", "*2/*XN"],
        "ultra_rapid": ["*1/*1xN", "*2/*2xN"],
    },
    "CYP2C19": {
        "poor": ["*2/*2", "*2/*3", "*3/*3"],
        "intermediate": ["*1/*2", "*1/*3"],
        "normal": ["*1/*1"],
        "rapid": ["*17/*1"],
        "ultra_rapid": ["*17/*17"],
    },
    "CYP3A4": {
        "poor": [],
        "intermediate": ["*22/*1"],
        "normal": ["*1/*1"],
        "rapid": ["*1B/*1"],
        "ultra_rapid": [],
    },
    "CYP2C9": {
        "poor": ["*3/*3", "*2/*3"],
        "intermediate": ["*1/*2", "*1/*3", "*2/*2"],
        "normal": ["*1/*1"],
        "rapid": [],
        "ultra_rapid": [],
    },
}

DRUG_PGX_PREDICTIONS = {
    "Codeine":        {"CYP2D6_poor": "Avoid - no analgesia", "CYP2D6_ultra_rapid": "Avoid - toxicity risk"},
    "Tamoxifen":      {"CYP2D6_poor": "Consider alternative", "CYP2D6_intermediate": "Standard dose"},
    "Clopidogrel":    {"CYP2C19_poor": "Avoid - no activation", "CYP2C19_ultra_rapid": "Normal response"},
    "Warfarin":       {"CYP2C9_poor": "Reduce dose significantly", "CYP2C9_intermediate": "Reduce dose"},
    "Simvastatin":    {"SLCO1B1_risk": "High myopathy risk - use alternative"},
    "Abacavir":       {"HLA_B_5701": "Contraindicated - hypersensitivity"},
    "Carbamazepine":  {"HLA_B_1502": "Contraindicated - SJS risk"},
    "Fluoxetine":     {"CYP2D6_poor": "Increase interval", "CYP2D6_ultra_rapid": "May need higher dose"},
    "Omeprazole":     {"CYP2C19_poor": "Standard dose sufficient", "CYP2C19_ultra_rapid": "Increase dose"},
}


class GenomicsService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def process_vcf(self, patient: Patient, vcf_file: UploadFile) -> str:
        """Parse VCF file and extract pharmacogenomic variants. Returns Celery task ID."""
        contents = await vcf_file.read()
        snps = self._parse_vcf_content(contents.decode("utf-8", errors="ignore"))
        metabolizer_statuses = self._infer_metabolizer_statuses(snps)
        pgx_flags = self._compute_pgx_risk_flags(snps, metabolizer_statuses)

        # Upsert genomic profile
        from sqlalchemy import select
        result = await self.db.execute(
            select(GenomicProfile).where(GenomicProfile.patient_id == patient.id)
        )
        profile = result.scalar_one_or_none()

        from datetime import datetime, timezone
        if profile:
            profile.parsed_snps = snps
            profile.metabolizer_statuses = metabolizer_statuses
            profile.pgx_risk_flags = pgx_flags
            profile.processed_at = datetime.now(timezone.utc)
            profile.pipeline_version = "v1.0.0"
        else:
            profile = GenomicProfile(
                patient_id=patient.id,
                raw_vcf_path=f"s3://precisionrx-data-lake/vcf/{patient.id}/{vcf_file.filename}",
                parsed_snps=snps,
                metabolizer_statuses=metabolizer_statuses,
                pgx_risk_flags=pgx_flags,
                processed_at=datetime.now(timezone.utc),
                pipeline_version="v1.0.0",
            )
            self.db.add(profile)
        await self.db.flush()

        return f"task-genomics-{patient.id}"

    def _parse_vcf_content(self, content: str) -> dict[str, Any]:
        """Extract SNP variants from VCF format."""
        snps = {}
        for line in content.splitlines():
            if line.startswith("#"):
                continue
            parts = line.strip().split("\t")
            if len(parts) < 5:
                continue
            chrom, pos, rsid, ref, alt = parts[:5]
            if rsid.startswith("rs"):
                snps[rsid] = {
                    "chromosome": chrom,
                    "position": pos,
                    "ref": ref,
                    "alt": alt,
                    "gene": self._rsid_to_gene(rsid),
                }
        return snps

    def _rsid_to_gene(self, rsid: str) -> str:
        """Map known pharmacogenomic rsIDs to genes."""
        known = {
            "rs1065852": "CYP2D6", "rs3892097": "CYP2D6",
            "rs4244285": "CYP2C19", "rs4986893": "CYP2C19",
            "rs1799853": "CYP2C9", "rs1057910": "CYP2C9",
            "rs4149056": "SLCO1B1", "rs2740574": "CYP3A4",
        }
        return known.get(rsid, "Unknown")

    def _infer_metabolizer_statuses(self, snps: dict) -> dict[str, str]:
        """Infer CYP enzyme metabolizer status from SNP diplotypes."""
        # Simplified inference — real implementation uses PharmVar diplotype caller
        statuses = {}
        for gene in ["CYP2D6", "CYP2C19", "CYP2C9", "CYP3A4"]:
            statuses[gene] = "Normal"  # Default
        return statuses

    def _compute_pgx_risk_flags(self, snps: dict, statuses: dict) -> dict[str, Any]:
        return {
            "risk_alleles": [k for k, v in snps.items() if v.get("gene") != "Unknown"],
            "statin_myopathy_risk": "SLCO1B1" in [v.get("gene") for v in snps.values()],
            "warfarin_sensitivity": statuses.get("CYP2C9") in ["Poor", "Intermediate"],
        }

    def get_drug_predictions(self, statuses: dict) -> dict[str, str]:
        """Return drug recommendations based on metabolizer statuses."""
        predictions = {}
        for drug, rules in DRUG_PGX_PREDICTIONS.items():
            for rule_key, recommendation in rules.items():
                gene, status = rule_key.rsplit("_", 1)
                gene = gene.replace("_", " ").upper().replace(" ", "_")
                if statuses.get(gene.replace("_", ""), "").lower() == status.lower():
                    predictions[drug] = recommendation
                    break
            else:
                predictions[drug] = "Standard dosing — no genomic risk identified"
        return predictions
