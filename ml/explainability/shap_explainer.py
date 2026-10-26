"""
SHAP Explainability Layer
==========================
Generates patient-level SHAP explanations for all tree-based models.
Supports waterfall charts, global feature importance, and NL explanations.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class SHAPExplainer:
    """
    Wraps SHAP TreeExplainer for XGBoost/LightGBM/CatBoost models.
    Also supports DeepExplainer for LSTM via SHAP.
    """

    def __init__(self, model: Any, feature_names: list[str], model_type: str = "tree"):
        self.model = model
        self.feature_names = feature_names
        self.model_type = model_type
        self._explainer = None

    def _build_explainer(self, background_data: Optional[np.ndarray] = None):
        import shap
        if self.model_type == "tree":
            self._explainer = shap.TreeExplainer(self.model)
        elif self.model_type == "deep":
            if background_data is None:
                raise ValueError("background_data required for DeepExplainer")
            import torch
            bg_tensor = torch.tensor(background_data, dtype=torch.float32)
            self._explainer = shap.DeepExplainer(self.model, bg_tensor)
        else:
            self._explainer = shap.KernelExplainer(
                self.model.predict_proba, background_data
            )

    def explain(
        self,
        X: np.ndarray,
        background_data: Optional[np.ndarray] = None,
    ) -> dict[str, Any]:
        """
        Generate SHAP values for a single patient observation.
        Returns structured data for waterfall chart + NL explanation.
        """
        if self._explainer is None:
            self._build_explainer(background_data)

        shap_values = self._explainer.shap_values(X)

        # For binary classification: use class-1 SHAP values
        if isinstance(shap_values, list):
            sv = shap_values[1][0]  # class 1, first sample
        else:
            sv = shap_values[0]

        base_value = float(self._explainer.expected_value)
        if isinstance(base_value, (list, np.ndarray)):
            base_value = float(base_value[1])

        # Build waterfall data
        waterfall = []
        for i, (fname, sv_val, feat_val) in enumerate(zip(self.feature_names, sv, X[0])):
            waterfall.append({
                "rank": i + 1,
                "feature": fname,
                "feature_value": float(feat_val),
                "shap_value": float(sv_val),
                "direction": "positive" if sv_val > 0 else "negative",
                "abs_impact": abs(float(sv_val)),
            })

        # Sort by absolute impact
        waterfall.sort(key=lambda x: x["abs_impact"], reverse=True)
        top_features = waterfall[:10]

        # Natural language explanation
        nl_explanation = self._generate_nl(top_features, base_value)

        return {
            "base_value": base_value,
            "prediction_value": float(base_value + sv.sum()),
            "shap_values_raw": sv.tolist(),
            "waterfall": waterfall,
            "top_features": top_features,
            "natural_language": nl_explanation,
        }

    def _generate_nl(self, top_features: list[dict], base_value: float) -> str:
        """Generate a clinician-friendly natural language explanation."""
        positives = [f for f in top_features if f["direction"] == "positive"][:3]
        negatives = [f for f in top_features if f["direction"] == "negative"][:2]

        pos_parts = []
        for f in positives:
            pct = int(f["abs_impact"] / sum(x["abs_impact"] for x in top_features) * 100)
            pos_parts.append(f"{f['feature']} (↑{pct}% weight)")

        neg_parts = []
        for f in negatives:
            pct = int(f["abs_impact"] / sum(x["abs_impact"] for x in top_features) * 100)
            neg_parts.append(f"{f['feature']} (↓{pct}% weight)")

        explanation = "Recommendation driven by: " + ", ".join(pos_parts)
        if neg_parts:
            explanation += ". Mitigating factors: " + ", ".join(neg_parts)
        explanation += f". Model baseline prediction: {base_value:.2f}."
        return explanation

    def compute_global_importance(
        self, X: np.ndarray, n_samples: int = 100
    ) -> list[dict]:
        """Compute global feature importance averaged over a sample."""
        if self._explainer is None:
            self._build_explainer()

        sample = X[np.random.choice(len(X), min(n_samples, len(X)), replace=False)]
        shap_values = self._explainer.shap_values(sample)

        if isinstance(shap_values, list):
            sv = shap_values[1]
        else:
            sv = shap_values

        mean_abs = np.abs(sv).mean(axis=0)
        importance = [
            {"feature": fname, "mean_abs_shap": float(val), "rank": i + 1}
            for i, (fname, val) in enumerate(
                sorted(zip(self.feature_names, mean_abs), key=lambda x: x[1], reverse=True)
            )
        ]
        return importance
