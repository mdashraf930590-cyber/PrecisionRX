"""
ML Unit Tests
==============
Tests for feature engineering, model training, SHAP explainer, and FL server.
"""
from __future__ import annotations

import sys
from pathlib import Path

# Add backend and ml directories to sys.path
BASE_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))
sys.path.insert(0, str(BASE_DIR / "ml"))

import numpy as np
import pandas as pd
import pytest


# ─── Feature Engineering Tests ───────────────────────────────────────────────
class TestGenomicFeatureExtractor:
    from ml.pipelines.feature_engineering import GenomicFeatureExtractor

    def test_normal_metabolizer_encoding(self):
        from ml.pipelines.feature_engineering import GenomicFeatureExtractor
        extractor = GenomicFeatureExtractor()
        X = pd.DataFrame([{
            "metabolizer_statuses": {
                "CYP2D6": "Normal", "CYP2C19": "Normal",
                "CYP3A4": "Normal", "CYP2C9": "Normal"
            },
            "pgx_risk_flags": {"statin_myopathy_risk": False, "warfarin_sensitivity": False, "risk_alleles": []}
        }])
        result = extractor.transform(X)
        assert result.shape == (1, 7)  # 4 enzymes + 3 flags
        assert result[0, 0] == 2  # CYP2D6 Normal = 2

    def test_poor_metabolizer_encoding(self):
        from ml.pipelines.feature_engineering import GenomicFeatureExtractor, METABOLIZER_STATUS_ENCODING
        extractor = GenomicFeatureExtractor()
        X = pd.DataFrame([{
            "metabolizer_statuses": {"CYP2D6": "Poor", "CYP2C19": "Normal", "CYP3A4": "Normal", "CYP2C9": "Normal"},
            "pgx_risk_flags": {"statin_myopathy_risk": True, "warfarin_sensitivity": False, "risk_alleles": ["rs1065852"]}
        }])
        result = extractor.transform(X)
        assert result[0, 0] == 0   # CYP2D6 Poor = 0
        assert result[0, 4] == 1   # SLCO1B1 risk = 1
        assert result[0, 6] == 1   # 1 risk allele

    def test_missing_genomics_defaults_to_normal(self):
        from ml.pipelines.feature_engineering import GenomicFeatureExtractor
        extractor = GenomicFeatureExtractor()
        X = pd.DataFrame([{"metabolizer_statuses": None, "pgx_risk_flags": None}])
        result = extractor.transform(X)
        assert result.shape[1] == 7
        assert all(result[0, :4] == 2)  # All Normal


class TestLabFeatureExtractor:
    def test_extracts_latest_lab_value(self):
        from ml.pipelines.feature_engineering import LabFeatureExtractor, LAB_FEATURES
        extractor = LabFeatureExtractor()
        lab_data = [
            {"loinc_code": LAB_FEATURES[0], "value": 13.5, "collected_at": "2024-01-15"},
            {"loinc_code": LAB_FEATURES[0], "value": 12.8, "collected_at": "2024-01-10"},
        ]
        X = pd.DataFrame([{"lab_results": lab_data}])
        result = extractor.transform(X)
        assert result.shape[1] == len(LAB_FEATURES) * 2
        assert result[0, 0] == pytest.approx(13.5)  # Latest value

    def test_empty_labs_returns_nan(self):
        from ml.pipelines.feature_engineering import LabFeatureExtractor
        extractor = LabFeatureExtractor()
        X = pd.DataFrame([{"lab_results": []}])
        result = extractor.transform(X)
        assert np.all(np.isnan(result))


class TestWearableFeatureExtractor:
    def test_computes_rolling_average(self):
        from ml.pipelines.feature_engineering import WearableFeatureExtractor
        extractor = WearableFeatureExtractor()
        readings = [{"metric_type": "heart_rate", "value": 72, "is_anomaly": False}] * 5
        readings += [{"metric_type": "heart_rate", "value": 120, "is_anomaly": True}]
        X = pd.DataFrame([{"wearable_readings": readings}])
        result = extractor.transform(X)
        assert result[0, 0] == pytest.approx(80.0)   # avg: (72*5 + 120) / 6 = 480 / 6 = 80
        assert result[0, 1] == 1                       # 1 anomaly


# ─── SHAP Explainer Tests ─────────────────────────────────────────────────────
class TestSHAPExplainer:
    def test_nl_explanation_format(self):
        from ml.explainability.shap_explainer import SHAPExplainer

        class MockModel:
            def predict_proba(self, X):
                return np.array([[0.3, 0.7]] * len(X))

        explainer = SHAPExplainer(MockModel(), feature_names=["CYP2D6", "eGFR", "HbA1c"])
        top_features = [
            {"feature": "CYP2D6 Poor", "shap_value": 0.18, "abs_impact": 0.18, "direction": "positive"},
            {"feature": "eGFR", "shap_value": 0.14, "abs_impact": 0.14, "direction": "positive"},
            {"feature": "Age", "shap_value": -0.05, "abs_impact": 0.05, "direction": "negative"},
        ]
        nl = explainer._generate_nl(top_features, base_value=0.42)
        assert "Recommendation driven by" in nl
        assert "CYP2D6 Poor" in nl
        assert "Mitigating factors" in nl


# ─── Genomics Service Tests ───────────────────────────────────────────────────
class TestGenomicsService:
    def test_rsid_to_gene_known(self):
        try:
            from app.services.genomics_service import GenomicsService
        except ImportError:
            from backend.app.services.genomics_service import GenomicsService
        svc = GenomicsService(db=None)
        assert svc._rsid_to_gene("rs1065852") == "CYP2D6"
        assert svc._rsid_to_gene("rs4244285") == "CYP2C19"
        assert svc._rsid_to_gene("rs4149056") == "SLCO1B1"

    def test_rsid_to_gene_unknown(self):
        try:
            from app.services.genomics_service import GenomicsService
        except ImportError:
            from backend.app.services.genomics_service import GenomicsService
        svc = GenomicsService(db=None)
        assert svc._rsid_to_gene("rs9999999") == "Unknown"

    def test_vcf_parsing(self):
        try:
            from app.services.genomics_service import GenomicsService
        except ImportError:
            from backend.app.services.genomics_service import GenomicsService
        svc = GenomicsService(db=None)
        vcf_content = """##fileformat=VCFv4.1
#CHROM\tPOS\tID\tREF\tALT
22\t42524947\trs1065852\tC\tT
10\t96741053\trs1057910\tA\tC
"""
        snps = svc._parse_vcf_content(vcf_content)
        assert "rs1065852" in snps
        assert snps["rs1065852"]["gene"] == "CYP2D6"
        assert snps["rs1065852"]["ref"] == "C"


# ─── Model Inference Tests ────────────────────────────────────────────────────
class TestDrugRecommendationModel:
    def test_predict_returns_ranked_list(self):
        from ml.models.core_models import DrugRecommendationModel
        import xgboost as xgb

        model = DrugRecommendationModel(n_classes=3)
        model.label_names = ["DrugA", "DrugB", "DrugC"]

        # Mock the underlying XGBoost models
        for _ in range(3):
            mock = xgb.XGBClassifier(n_estimators=1)
            X = np.random.rand(10, 5)
            y = np.random.randint(0, 2, 10)
            mock.fit(X, y)
            model.models.append(mock)

        X_test = np.random.rand(1, 5)
        predictions = model.predict(X_test, top_k=2)
        assert len(predictions) == 2
        assert all("drug" in p and "confidence_score" in p for p in predictions)
        # Should be sorted by confidence descending
        assert predictions[0]["confidence_score"] >= predictions[1]["confidence_score"]
