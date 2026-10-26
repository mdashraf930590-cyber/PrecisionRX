"""Training script for Model A — XGBoost Multi-Label Drug Recommender with ClinPGx Data."""
from __future__ import annotations

import logging
import sys
from pathlib import Path

# Add project and ml root to path
ML_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_DIR))

import numpy as np
from models.core_models import DrugRecommendationModel
from data_loaders.clinpgx_loader import load_recommender_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    logger.info("==================================================")
    logger.info("🧬 Training Model A: ClinPGx Drug Recommendation Engine")
    logger.info("==================================================")
    
    # Load dataset derived from real ClinPGx clinicalVariants.tsv
    X, y, target_drugs = load_recommender_dataset(n_samples=500)
    
    # 80/20 train/validation split
    split_idx = int(0.8 * len(X))
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    logger.info(f"Training on {len(X_train)} samples, validating on {len(X_val)} samples across drugs: {target_drugs}")
    
    model = DrugRecommendationModel(n_classes=len(target_drugs))
    
    try:
        model.train(X_train, y_train, label_names=target_drugs, X_val=X_val, y_val=y_val)
    except Exception as e:
        logger.warning(f"Fallback training mode (MLflow offline): {e}")
        import xgboost as xgb
        model.label_names = target_drugs
        model.models = []
        for i, drug in enumerate(target_drugs):
            clf = xgb.XGBClassifier(n_estimators=40, max_depth=4, learning_rate=0.08, random_state=42, eval_metric="auc")
            clf.fit(X_train, y_train[:, i])
            model.models.append(clf)
            
    # Sample inference test
    test_patient = X_val[:1]
    recommendations = model.predict(test_patient, top_k=3)
    logger.info("\n🏆 Top Ranked Drug Recommendations for Test Patient:")
    for rank, rec in enumerate(recommendations, 1):
        logger.info(f"   #{rank}: {rec['drug'].capitalize()} (Confidence: {rec['confidence_score']:.1%})")
        
    # Save model artifacts
    save_dir = ML_DIR / "models" / "saved"
    save_dir.mkdir(parents=True, exist_ok=True)
    import joblib
    joblib.dump(model, save_dir / "recommender_xgboost.joblib")
    logger.info(f"💾 Saved Model A artifacts to {save_dir / 'recommender_xgboost.joblib'}")
    logger.info("✅ Model A training on ClinPGx successfully complete.")


if __name__ == "__main__":
    main()
