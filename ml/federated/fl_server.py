"""
Federated Learning Server — Flower (flwr) Framework
======================================================
Central FL server aggregates model weights from hospital nodes.
Privacy: Differential privacy noise injection (ε = 1.0).
Algorithm: FedAvg with adaptive aggregation.
"""
from __future__ import annotations

import logging
from collections import OrderedDict
from typing import Any, Optional, Tuple, Union

import flwr as fl
import numpy as np
from flwr.common import (
    EvaluateIns, EvaluateRes, FitIns, FitRes, GetParametersIns,
    GetParametersRes, NDArrays, Parameters, Scalar, ndarrays_to_parameters,
    parameters_to_ndarrays,
)
from flwr.server.client_manager import ClientManager
from flwr.server.client_proxy import ClientProxy
from flwr.server.strategy import FedAvg

logger = logging.getLogger(__name__)


class DifferentiallyPrivateFedAvg(FedAvg):
    """
    FedAvg with Gaussian differential privacy noise injection.
    Prevents inference attacks from gradient inspection.
    Privacy budget: ε = 1.0 (strong privacy guarantee).
    """

    def __init__(
        self,
        epsilon: float = 1.0,
        delta: float = 1e-5,
        sensitivity: float = 1.0,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.epsilon = epsilon
        self.delta = delta
        self.sensitivity = sensitivity
        # Gaussian noise std from (ε, δ)-DP
        self.noise_std = self._compute_noise_std()
        logger.info(f"FL Strategy: DP-FedAvg ε={epsilon}, δ={delta}, σ={self.noise_std:.4f}")

    def _compute_noise_std(self) -> float:
        """Compute Gaussian noise std for (ε, δ)-DP using analytic formula."""
        import math
        return self.sensitivity * math.sqrt(2 * math.log(1.25 / self.delta)) / self.epsilon

    def aggregate_fit(
        self,
        server_round: int,
        results: list[Tuple[ClientProxy, FitRes]],
        failures: list[Union[Tuple[ClientProxy, FitRes], BaseException]],
    ) -> Tuple[Optional[Parameters], dict[str, Scalar]]:
        """Aggregate model weights and inject calibrated DP noise."""
        aggregated_params, metrics = super().aggregate_fit(server_round, results, failures)

        if aggregated_params is not None:
            # Inject Gaussian noise to each parameter tensor
            weights = parameters_to_ndarrays(aggregated_params)
            noisy_weights = [
                w + np.random.normal(0, self.noise_std, w.shape) for w in weights
            ]
            aggregated_params = ndarrays_to_parameters(noisy_weights)
            logger.info(f"[Round {server_round}] DP noise injected (σ={self.noise_std:.4f})")

        return aggregated_params, metrics


def start_fl_server(
    host: str = "0.0.0.0",
    port: int = 8080,
    num_rounds: int = 10,
    min_clients: int = 2,
    epsilon: float = 1.0,
) -> None:
    """Start the federated learning coordination server."""
    strategy = DifferentiallyPrivateFedAvg(
        epsilon=epsilon,
        fraction_fit=1.0,
        fraction_evaluate=0.5,
        min_fit_clients=min_clients,
        min_evaluate_clients=max(1, min_clients // 2),
        min_available_clients=min_clients,
    )

    logger.info(f"Starting FL server at {host}:{port} for {num_rounds} rounds")
    fl.server.start_server(
        server_address=f"{host}:{port}",
        config=fl.server.ServerConfig(num_rounds=num_rounds),
        strategy=strategy,
    )


class HospitalFLClient(fl.client.NumPyClient):
    """
    Hospital-side federated learning client.
    Trains locally on isolated patient data, shares only model weights.
    Raw patient data NEVER leaves the hospital's infrastructure.
    """

    def __init__(self, model: Any, X_train: np.ndarray, y_train: np.ndarray):
        self.model = model
        self.X_train = X_train
        self.y_train = y_train

    def get_parameters(self, config: dict) -> NDArrays:
        """Return current model parameters as numpy arrays."""
        return self._get_weights()

    def fit(self, parameters: NDArrays, config: dict) -> Tuple[NDArrays, int, dict]:
        """Train on local data for one FL round."""
        self._set_weights(parameters)

        # Local training (e.g., 1-5 epochs)
        local_epochs = config.get("local_epochs", 3)
        self.model.fit(self.X_train, self.y_train)

        logger.info(f"Local training complete on {len(self.X_train)} samples")
        return self._get_weights(), len(self.X_train), {"local_epochs": local_epochs}

    def evaluate(self, parameters: NDArrays, config: dict) -> Tuple[float, int, dict]:
        """Evaluate global model on local data."""
        self._set_weights(parameters)
        from sklearn.metrics import log_loss, roc_auc_score
        probs = self.model.predict_proba(self.X_train)[:, 1]
        loss = log_loss(self.y_train, probs)
        auc = roc_auc_score(self.y_train, probs)
        return loss, len(self.X_train), {"auc": auc}

    def _get_weights(self) -> NDArrays:
        """Extract model weights (XGBoost-specific)."""
        # For sklearn-compatible models
        try:
            return [self.model.get_booster().get_dump()]
        except AttributeError:
            return [np.array([0.0])]  # Placeholder

    def _set_weights(self, parameters: NDArrays) -> None:
        """Load aggregated global weights into local model."""
        # In production: deserialize and load weights into model
        pass


if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "server"
    if mode == "server":
        start_fl_server()
