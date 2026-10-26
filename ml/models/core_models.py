"""
Core ML Models — Drug Recommendation Engine
=============================================
Model A: XGBoost multi-label drug classification with Optuna hyperparameter search.
Model B: LightGBM ADR (Adverse Drug Reaction) predictor.
Model C: CatBoost dosage optimizer.
Model D: LSTM adherence predictor (PyTorch).
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Optional

try:
    import mlflow
    import mlflow.sklearn
    import mlflow.xgboost
    HAS_MLFLOW = True
except ImportError:
    mlflow = None
    HAS_MLFLOW = False

try:
    import optuna
    HAS_OPTUNA = True
except ImportError:
    optuna = None
    HAS_OPTUNA = False

import numpy as np
import pandas as pd
from sklearn.metrics import (
    classification_report, f1_score, mean_absolute_error, roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score

logger = logging.getLogger(__name__)

# ─── Model A: Drug Recommendation (XGBoost) ──────────────────────────────────
class DrugRecommendationModel:
    """
    Multi-label XGBoost classifier: predicts ranked drug recommendations.
    Uses Optuna for Bayesian hyperparameter optimization.
    """
    MODEL_NAME = "drug-recommendation-xgboost"

    def __init__(self, n_classes: int = 50, experiment_name: str = "precisionrx-models"):
        self.n_classes = n_classes
        self.experiment_name = experiment_name
        self.models: list[Any] = []  # one binary XGB per drug label
        self.label_names: list[str] = []

    def optimize_hyperparams(self, X_train: np.ndarray, y_train: np.ndarray, n_trials: int = 50) -> dict:
        import xgboost as xgb

        def objective(trial):
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 100, 500),
                "max_depth": trial.suggest_int("max_depth", 3, 10),
                "learning_rate": trial.suggest_float("learning_rate", 1e-3, 0.3, log=True),
                "subsample": trial.suggest_float("subsample", 0.5, 1.0),
                "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
                "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
                "gamma": trial.suggest_float("gamma", 0, 5),
                "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 1.0, log=True),
                "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 1.0, log=True),
                "scale_pos_weight": trial.suggest_float("scale_pos_weight", 1.0, 10.0),
                "use_label_encoder": False,
                "eval_metric": "auc",
                "tree_method": "hist",
            }
            model = xgb.XGBClassifier(**params, random_state=42)
            # Use first label for optimization (single-label proxy)
            scores = cross_val_score(model, X_train, y_train[:, 0], cv=3, scoring="roc_auc")
            return scores.mean()

        if not HAS_OPTUNA:
            return {"n_estimators": 100, "max_depth": 4, "learning_rate": 0.05, "eval_metric": "auc", "random_state": 42}

        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=n_trials, show_progress_bar=False)
        return study.best_params

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        label_names: list[str],
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> None:
        import xgboost as xgb

        self.label_names = label_names
        best_params = self.optimize_hyperparams(X_train, y_train)

        if HAS_MLFLOW:
            mlflow.set_experiment(self.experiment_name)
            ctx = mlflow.start_run(run_name=self.MODEL_NAME)
        else:
            from contextlib import nullcontext
            ctx = nullcontext()

        with ctx:
            if HAS_MLFLOW:
                mlflow.log_params(best_params)

            self.models = []
            val_aucs = []

            params = dict(best_params)
            params.pop("random_state", None)
            params.pop("eval_metric", None)
            params.pop("use_label_encoder", None)
            for i, label in enumerate(label_names):
                model = xgb.XGBClassifier(
                    **params,
                    random_state=42,
                    eval_metric="auc",
                )
                model.fit(
                    X_train, y_train[:, i],
                    eval_set=[(X_val, y_val[:, i])] if X_val is not None else None,
                    verbose=False,
                )
                self.models.append(model)

                if X_val is not None:
                    pred = model.predict_proba(X_val)[:, 1]
                    auc = roc_auc_score(y_val[:, i], pred)
                    val_aucs.append(auc)
                    logger.info(f"  {label}: val_AUC={auc:.4f}")

            if val_aucs and HAS_MLFLOW:
                mlflow.log_metric("mean_val_auc", np.mean(val_aucs))

            if HAS_MLFLOW and self.models:
                mlflow.xgboost.log_model(self.models[0], "model", registered_model_name=self.MODEL_NAME)

    def predict(self, X: np.ndarray, top_k: int = 5) -> list[dict]:
        """Return top-k ranked drug recommendations with confidence scores."""
        if not self.models:
            raise RuntimeError("Model not trained. Call .train() or .load() first.")
        scores = np.array([m.predict_proba(X)[:, 1][0] for m in self.models])
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [
            {"drug": self.label_names[i], "confidence_score": float(scores[i])}
            for i in top_indices
        ]


# ─── Model B: ADR Predictor (LightGBM) ───────────────────────────────────────
class ADRPredictorModel:
    """
    Binary classifier: predicts Adverse Drug Reaction probability per drug.
    Uses LightGBM for speed and interpretability.
    """
    MODEL_NAME = "adr-predictor-lightgbm"

    def __init__(self):
        self.model = None

    def train(self, X_train: np.ndarray, y_train: np.ndarray, drug_name: str) -> None:
        try:
            import lightgbm as lgb
            params = {
                "objective": "binary",
                "metric": "auc",
                "num_leaves": 63,
                "learning_rate": 0.05,
                "feature_fraction": 0.8,
                "bagging_fraction": 0.8,
                "bagging_freq": 5,
                "n_estimators": 300,
                "min_child_samples": 20,
                "is_unbalance": True,
                "random_state": 42,
            }
            self.model = lgb.LGBMClassifier(**params)
        except ImportError:
            from sklearn.ensemble import HistGradientBoostingClassifier
            self.model = HistGradientBoostingClassifier(
                max_iter=300,
                learning_rate=0.05,
                max_leaf_nodes=63,
                random_state=42,
            )
            params = {"model": "HistGradientBoostingClassifier"}

        self.model.fit(X_train, y_train)

        if HAS_MLFLOW:
            mlflow.set_experiment("precisionrx-models")
            with mlflow.start_run(run_name=f"{self.MODEL_NAME}-{drug_name}"):
                mlflow.log_params(params)
                mlflow.sklearn.log_model(self.model, "model")

    def predict(self, X: np.ndarray) -> dict[str, Any]:
        prob = float(self.model.predict_proba(X)[:, 1][0])
        severity = "Mild" if prob < 0.3 else "Moderate" if prob < 0.6 else "Severe"
        return {"adr_probability": prob, "adr_severity": severity}


# ─── Model C: Dosage Optimizer (CatBoost) ─────────────────────────────────────
class DosageOptimizerModel:
    """
    Regression model: predicts optimal dose and frequency.
    CatBoost natively handles categorical genomic features without encoding.
    """
    MODEL_NAME = "dosage-optimizer-catboost"

    def __init__(self):
        self.model = None

    def train(
        self,
        X_train: pd.DataFrame,
        y_dose: np.ndarray,
        cat_features: list[str],
    ) -> None:
        from catboost import CatBoostRegressor

        self.model = CatBoostRegressor(
            iterations=500,
            learning_rate=0.05,
            depth=8,
            loss_function="RMSE",
            eval_metric="MAE",
            cat_features=cat_features,
            random_seed=42,
            verbose=100,
        )
        self.model.fit(X_train, y_dose)
        mae = mean_absolute_error(y_dose, self.model.predict(X_train))

        if HAS_MLFLOW:
            mlflow.set_experiment("precisionrx-models")
            with mlflow.start_run(run_name=self.MODEL_NAME):
                mlflow.log_metric("train_mae_mg", mae)
        logger.info(f"Dosage optimizer MAE: {mae:.2f}mg")

    def predict(self, X: pd.DataFrame) -> dict[str, Any]:
        dose = float(self.model.predict(X)[0])
        return {
            "dose_mg": round(dose, 1),
            "titration_schedule": [
                {"week": 1, "dose_mg": round(dose * 0.5, 1), "note": "Start low"},
                {"week": 2, "dose_mg": round(dose * 0.75, 1), "note": "Titrate up"},
                {"week": 4, "dose_mg": round(dose, 1), "note": "Target dose"},
            ],
        }


# ─── Model D: Adherence Predictor (LSTM) ─────────────────────────────────────
class AdherencePredictorModel:
    """
    Time-series LSTM: predicts 30-day adherence risk.
    Input: 90-day sequence of [vitals, refill_flag, app_engagement].
    """
    MODEL_NAME = "adherence-lstm"
    SEQUENCE_LEN = 90
    INPUT_DIM = 8   # HR, HRV, SpO2, steps, sleep, refill_flag, app_open, dose_taken
    HIDDEN_DIM = 128

    def __init__(self):
        self.model = None
        self.device = None

    def build_model(self):
        import torch
        import torch.nn as nn

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        class LSTMAdherenceNet(nn.Module):
            def __init__(self, input_dim, hidden_dim, num_layers=2, dropout=0.3):
                super().__init__()
                self.lstm = nn.LSTM(
                    input_dim, hidden_dim, num_layers=num_layers,
                    batch_first=True, dropout=dropout, bidirectional=True,
                )
                self.attention = nn.Linear(hidden_dim * 2, 1)
                self.classifier = nn.Sequential(
                    nn.Linear(hidden_dim * 2, 64),
                    nn.ReLU(),
                    nn.Dropout(0.2),
                    nn.Linear(64, 1),
                    nn.Sigmoid(),
                )

            def forward(self, x):
                lstm_out, _ = self.lstm(x)
                attn_weights = torch.softmax(self.attention(lstm_out), dim=1)
                context = (attn_weights * lstm_out).sum(dim=1)
                return self.classifier(context)

        self.model = LSTMAdherenceNet(self.INPUT_DIM, self.HIDDEN_DIM).to(self.device)
        return self.model

    def predict(self, sequence: np.ndarray) -> dict[str, Any]:
        """
        sequence: ndarray of shape (90, 8) — 90 days, 8 features.
        Returns 30-day adherence risk score + recommendations.
        """
        import torch
        if self.model is None:
            self.build_model()

        self.model.eval()
        with torch.no_grad():
            x = torch.tensor(sequence, dtype=torch.float32).unsqueeze(0).to(self.device)
            risk_score = float(self.model(x).item())

        interventions = []
        if risk_score > 0.7:
            interventions = ["Daily SMS reminders", "Pharmacist call", "Pill organizer enrollment"]
        elif risk_score > 0.4:
            interventions = ["Weekly check-in message", "Refill reminder"]

        return {
            "adherence_risk_score": risk_score,
            "risk_level": "High" if risk_score > 0.7 else "Medium" if risk_score > 0.4 else "Low",
            "intervention_recommendations": interventions,
        }
