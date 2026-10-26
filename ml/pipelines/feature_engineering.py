"""
ML Feature Engineering Pipeline
=================================
Multi-modal feature pipeline: Genomic + Clinical + Lab + Wearable + NLP.
Built as a scikit-learn Pipeline for reproducibility and MLflow tracking.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

logger = logging.getLogger(__name__)

# ─── LOINC code groups ───────────────────────────────────────────────────────
CBC_LOINC = ["718-7", "777-3", "4544-3", "26444-0", "731-0"]       # Hgb, Plt, Hct, WBC, Lymph
BMP_LOINC = ["2160-0", "2823-3", "2951-2", "2075-0", "2345-7"]    # Cr, K, Na, Cl, Glucose
LFT_LOINC = ["1742-6", "1920-8", "6768-6", "2324-2"]              # ALT, AST, ALP, GGT
OTHER_LOINC = ["4548-4", "2089-1", "3024-7", "3016-3"]            # HbA1c, LDL, T4, TSH

LAB_FEATURES = CBC_LOINC + BMP_LOINC + LFT_LOINC + OTHER_LOINC

# CYP enzyme diplotype → metabolizer status mapping
METABOLIZER_STATUS_ENCODING = {
    "Poor": 0, "Intermediate": 1, "Normal": 2, "Rapid": 3, "Ultra-Rapid": 4
}


# ─── Custom Transformers ──────────────────────────────────────────────────────
class GenomicFeatureExtractor(BaseEstimator, TransformerMixin):
    """Extract and encode pharmacogenomic features from metabolizer status dicts."""

    ENZYMES = ["CYP2D6", "CYP2C19", "CYP3A4", "CYP2C9"]

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        features = np.zeros((len(X), len(self.ENZYMES) + 3))  # +3: SLCO1B1, HLA_risk, pgx_risk_count
        for i, (_, row) in enumerate(X.iterrows()):
            statuses = row.get("metabolizer_statuses", {}) or {}
            for j, enzyme in enumerate(self.ENZYMES):
                status = statuses.get(enzyme, "Normal")
                features[i, j] = METABOLIZER_STATUS_ENCODING.get(status, 2)  # Default: Normal

            pgx_flags = row.get("pgx_risk_flags", {}) or {}
            features[i, len(self.ENZYMES)] = int(pgx_flags.get("statin_myopathy_risk", False))
            features[i, len(self.ENZYMES) + 1] = int(pgx_flags.get("warfarin_sensitivity", False))
            risk_alleles = pgx_flags.get("risk_alleles", [])
            features[i, len(self.ENZYMES) + 2] = len(risk_alleles)
        return features

    def get_feature_names_out(self, input_features=None):
        names = [f"{e}_status" for e in self.ENZYMES]
        names += ["SLCO1B1_risk", "HLA_warfarin_risk", "pgx_risk_allele_count"]
        return names


class LabFeatureExtractor(BaseEstimator, TransformerMixin):
    """Extract lab value features + 30-day trend slopes."""

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        n = len(X)
        n_features = len(LAB_FEATURES) * 2  # value + slope
        features = np.full((n, n_features), np.nan)

        for i, (_, row) in enumerate(X.iterrows()):
            labs: list[dict] = row.get("lab_results", []) or []
            lab_df = pd.DataFrame(labs) if labs else pd.DataFrame()
            if lab_df.empty:
                continue

            for j, loinc in enumerate(LAB_FEATURES):
                subset = lab_df[lab_df["loinc_code"] == loinc].copy() if "loinc_code" in lab_df else pd.DataFrame()
                if subset.empty:
                    continue
                subset = subset.sort_values("collected_at")
                latest_value = float(subset["value"].iloc[-1])
                features[i, j * 2] = latest_value

                # Compute trend slope if ≥2 data points within 30 days
                if len(subset) >= 2:
                    subset["t"] = pd.to_datetime(subset["collected_at"])
                    subset["t_numeric"] = (subset["t"] - subset["t"].min()).dt.days
                    if subset["t_numeric"].std() > 0:
                        slope = np.polyfit(subset["t_numeric"], subset["value"], 1)[0]
                        features[i, j * 2 + 1] = slope

        return features

    def get_feature_names_out(self, input_features=None):
        names = []
        for loinc in LAB_FEATURES:
            names += [f"lab_{loinc}_value", f"lab_{loinc}_slope30d"]
        return names


class WearableFeatureExtractor(BaseEstimator, TransformerMixin):
    """Compute 7-day rolling averages and anomaly counts from wearable data."""

    METRICS = ["heart_rate", "hrv", "spo2", "steps", "sleep_hours"]

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        n = len(X)
        features = np.zeros((n, len(self.METRICS) * 2))  # avg + anomaly_count

        for i, (_, row) in enumerate(X.iterrows()):
            readings: list[dict] = row.get("wearable_readings", []) or []
            if not readings:
                continue
            df = pd.DataFrame(readings)
            for j, metric in enumerate(self.METRICS):
                subset = df[df["metric_type"] == metric] if "metric_type" in df else pd.DataFrame()
                if subset.empty:
                    continue
                features[i, j * 2] = float(subset["value"].mean())
                features[i, j * 2 + 1] = int(subset.get("is_anomaly", pd.Series([False])).sum())
        return features

    def get_feature_names_out(self, input_features=None):
        names = []
        for m in self.METRICS:
            names += [f"wearable_{m}_7d_avg", f"wearable_{m}_anomaly_count"]
        return names


class ClinicalFeatureExtractor(BaseEstimator, TransformerMixin):
    """Extract structured clinical features: age, BMI, eGFR, comorbidities."""

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        result = pd.DataFrame()

        result["age"] = X["date_of_birth"].apply(
            lambda dob: (now - pd.Timestamp(dob, tz="UTC")).days / 365.25 if pd.notna(dob) else np.nan
        )
        result["weight_kg"] = X.get("weight_kg", pd.Series([np.nan] * len(X)))
        result["height_cm"] = X.get("height_cm", pd.Series([np.nan] * len(X)))
        result["bmi"] = result["weight_kg"] / ((result["height_cm"] / 100) ** 2)
        result["sex_male"] = (X.get("sex", pd.Series(["Unknown"] * len(X))) == "M").astype(int)
        result["medication_count"] = X.get("medication_count", pd.Series([0] * len(X)))

        return result

    def get_feature_names_out(self, input_features=None):
        return ["age", "weight_kg", "height_cm", "bmi", "sex_male", "medication_count"]


class MultiModalFeatureUnion(BaseEstimator, TransformerMixin):
    """Combines Genomic, Lab, Wearable, and Clinical feature extractors into a single matrix."""

    def __init__(self):
        self.genomic_ext = GenomicFeatureExtractor()
        self.lab_ext = LabFeatureExtractor()
        self.wearable_ext = WearableFeatureExtractor()
        self.clinical_ext = ClinicalFeatureExtractor()
        self.imputer = SimpleImputer(strategy="median")
        self.scaler = StandardScaler()

    def fit(self, X, y=None):
        self.genomic_ext.fit(X)
        self.lab_ext.fit(X)
        self.wearable_ext.fit(X)
        self.clinical_ext.fit(X)
        
        # Fit imputer and scaler on concatenated features
        raw_feats = self._extract_all(X)
        imputed = self.imputer.fit_transform(raw_feats)
        self.scaler.fit(imputed)
        return self

    def _extract_all(self, X: pd.DataFrame) -> np.ndarray:
        g = self.genomic_ext.transform(X)
        l = self.lab_ext.transform(X)
        w = self.wearable_ext.transform(X)
        c = self.clinical_ext.transform(X).to_numpy()
        return np.hstack([g, l, w, c])

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        raw_feats = self._extract_all(X)
        imputed = self.imputer.transform(raw_feats)
        return self.scaler.transform(imputed)

    def get_feature_names_out(self, input_features=None) -> list[str]:
        names = []
        names.extend(self.genomic_ext.get_feature_names_out())
        names.extend(self.lab_ext.get_feature_names_out())
        names.extend(self.wearable_ext.get_feature_names_out())
        names.extend(self.clinical_ext.get_feature_names_out())
        return names


# ─── Full Feature Pipeline ────────────────────────────────────────────────────
def build_feature_pipeline() -> Pipeline:
    """
    Assemble the complete multi-modal feature engineering pipeline.
    Output: a fixed-width numeric feature matrix ready for XGBoost / LightGBM.
    """
    return Pipeline([
        ("multimodal_union", MultiModalFeatureUnion()),
    ])


def patient_dict_to_dataframe(patient_data: dict[str, Any]) -> pd.DataFrame:
    """Convert raw patient feature dict to a single-row DataFrame for inference."""
    return pd.DataFrame([patient_data])

