"""Training script for Model B — LightGBM Adverse Drug Reaction (ADR) Predictor with ClinPGx Data."""
from __future__ import annotations

import logging
import sys
from pathlib import Path

# Add project and ml root to path
ML_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_DIR))

import numpy as np
from sklearn.metrics import roc_auc_score, accuracy_score, classification_report
from models.core_models import ADRPredictorModel
from data_loaders.clinpgx_loader import load_adr_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    logger.info("==================================================")
    logger.info("⚠️ Training Model B: ClinPGx Adverse Drug Reaction Predictor")
    logger.info("==================================================")
    
    # Load dataset derived from real ClinPGx toxicity annotations
    X, y, drug_name = load_adr_dataset(n_samples=600)
    
    split_idx = int(0.8 * len(X))
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    logger.info(f"Training on {len(X_train)} samples, validating on {len(X_val)} samples (ADR positive rate: {y.mean():.1%})...")
    
    model = ADRPredictorModel()
    model.train(X_train, y_train, drug_name=drug_name)
    
    # Validation evaluation
    val_probs = model.model.predict_proba(X_val)[:, 1]
    val_preds = (val_probs >= 0.5).astype(int)
    auc = roc_auc_score(y_val, val_probs)
    acc = accuracy_score(y_val, val_preds)
    
    logger.info(f"✓ Model B Validation AUC: {auc:.4f} | Accuracy: {acc:.1%}")
    
    # Test inference on a high-risk vs low-risk patient
    test_case = X_val[:1]
    prediction = model.predict(test_case)
    logger.info(f"🧪 Test Patient ADR Risk: {prediction['adr_probability']:.1%} ({prediction['adr_severity']})")
    
    # Save model artifacts
    save_dir = ML_DIR / "models" / "saved"
    save_dir.mkdir(parents=True, exist_ok=True)
    import joblib
    joblib.dump(model, save_dir / "adr_predictor.joblib")
    logger.info(f"💾 Saved Model B artifacts to {save_dir / 'adr_predictor.joblib'}")
    logger.info("✅ Model B training on ClinPGx successfully complete.")


if __name__ == "__main__":
    main()
