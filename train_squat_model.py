#!/usr/bin/env python3
"""
Squat Form Analyzer - Python Training Script
Trains a classifier to better identify good/bad squat form
Uses scikit-learn for model training
"""

import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)
import pickle
import argparse
from pathlib import Path


class SquatFormTrainer:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_type = "random_forest"

    def load_dataset(self, json_file: str) -> tuple:
        """Load training dataset from JSON file exported from browser"""
        with open(json_file, "r") as f:
            data = json.load(f)

        features = np.array(data["features"])
        labels = np.array(data["labels"])

        print(f"✓ Loaded {len(features)} samples")
        print(f"  Feature dimension: {features.shape[1]}")
        print(f"  Label distribution: {np.bincount(np.round(labels).astype(int))}")

        return features, labels

    def prepare_data(self, features: np.ndarray, labels: np.ndarray):
        """Split and normalize data"""
        # Convert soft labels (0, 0.5, 1) to hard labels (0, 1) for classification
        hard_labels = np.round(labels).astype(int)

        # Split data: 80% train, 20% test
        X_train, X_test, y_train, y_test = train_test_split(
            features, hard_labels, test_size=0.2, random_state=42, stratify=hard_labels
        )

        # Normalize features
        X_train = self.scaler.fit_transform(X_train)
        X_test = self.scaler.transform(X_test)

        print(f"✓ Data prepared:")
        print(f"  Training samples: {len(X_train)}")
        print(f"  Testing samples: {len(X_test)}")
        print(f"  Training distribution: good={np.sum(y_train)}, bad={len(y_train)-np.sum(y_train)}")

        return X_train, X_test, y_train, y_test

    def train_random_forest(self, X_train: np.ndarray, y_train: np.ndarray) -> dict:
        """Train Random Forest classifier"""
        print("\n🎯 Training Random Forest...")

        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        )

        self.model.fit(X_train, y_train)

        # Get feature importance
        feature_importance = self.model.feature_importances_
        top_features_idx = np.argsort(feature_importance)[-10:]

        print(f"✓ Random Forest trained")
        print(f"  Top 10 important features:")
        for idx in reversed(top_features_idx):
            print(f"    Feature {idx}: {feature_importance[idx]:.4f}")

        return {"type": "random_forest"}

    def train_gradient_boosting(self, X_train: np.ndarray, y_train: np.ndarray) -> dict:
        """Train Gradient Boosting classifier"""
        print("\n🎯 Training Gradient Boosting...")

        self.model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
        )

        self.model.fit(X_train, y_train)

        # Get feature importance
        feature_importance = self.model.feature_importances_
        top_features_idx = np.argsort(feature_importance)[-10:]

        print(f"✓ Gradient Boosting trained")
        print(f"  Top 10 important features:")
        for idx in reversed(top_features_idx):
            print(f"    Feature {idx}: {feature_importance[idx]:.4f}")

        return {"type": "gradient_boosting"}

    def evaluate(self, X_train: np.ndarray, y_train: np.ndarray,
                 X_test: np.ndarray, y_test: np.ndarray):
        """Evaluate model performance"""
        if self.model is None:
            raise ValueError("Model not trained yet")

        print("\n📊 Model Evaluation:")

        # Training performance
        train_pred = self.model.predict(X_train)
        train_accuracy = accuracy_score(y_train, train_pred)
        print(f"\n  Training Accuracy: {train_accuracy:.4f}")

        # Testing performance
        test_pred = self.model.predict(X_test)
        test_accuracy = accuracy_score(y_test, test_pred)
        test_precision = precision_score(y_test, test_pred, zero_division=0)
        test_recall = recall_score(y_test, test_pred, zero_division=0)
        test_f1 = f1_score(y_test, test_pred, zero_division=0)

        print(f"\n  Test Accuracy:  {test_accuracy:.4f}")
        print(f"  Precision:      {test_precision:.4f}")
        print(f"  Recall:         {test_recall:.4f}")
        print(f"  F1 Score:       {test_f1:.4f}")

        # Confusion matrix
        cm = confusion_matrix(y_test, test_pred)
        print(f"\n  Confusion Matrix:")
        print(f"    True Negatives:  {cm[0, 0]} | False Positives: {cm[0, 1]}")
        print(f"    False Negatives: {cm[1, 0]} | True Positives:  {cm[1, 1]}")

        # Classification report
        print(f"\n  Detailed Classification Report:")
        print(classification_report(y_test, test_pred, target_names=["Bad Form", "Good Form"]))

        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=5)
        print(f"\n  Cross-Validation Scores: {cv_scores}")
        print(f"  Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    def save_model(self, output_path: str):
        """Save trained model and scaler"""
        if self.model is None:
            raise ValueError("Model not trained yet")

        model_path = Path(output_path) / "squat_form_model.pkl"
        scaler_path = Path(output_path) / "scaler.pkl"

        Path(output_path).mkdir(parents=True, exist_ok=True)

        with open(model_path, "wb") as f:
            pickle.dump(self.model, f)

        with open(scaler_path, "wb") as f:
            pickle.dump(self.scaler, f)

        print(f"\n✓ Model saved to {model_path}")
        print(f"✓ Scaler saved to {scaler_path}")

    def load_model(self, model_path: str, scaler_path: str):
        """Load previously trained model"""
        with open(model_path, "rb") as f:
            self.model = pickle.load(f)

        with open(scaler_path, "rb") as f:
            self.scaler = pickle.load(f)

        print(f"✓ Model loaded from {model_path}")

    def predict(self, features: np.ndarray) -> tuple:
        """Make predictions on new data"""
        if self.model is None:
            raise ValueError("Model not loaded/trained")

        features_normalized = self.scaler.transform(features)
        predictions = self.model.predict(features_normalized)
        probabilities = self.model.predict_proba(features_normalized)

        return predictions, probabilities

    def print_summary(self):
        """Print model summary"""
        if self.model is None:
            print("No model loaded/trained")
            return

        print("\n" + "=" * 50)
        print("MODEL SUMMARY")
        print("=" * 50)
        print(f"Model Type: {type(self.model).__name__}")
        print(f"Feature Scaler: StandardScaler")
        print(f"Training Date: {pd.Timestamp.now()}")

        if hasattr(self.model, "n_estimators"):
            print(f"Number of Estimators: {self.model.n_estimators}")

        if hasattr(self.model, "max_depth"):
            print(f"Max Depth: {self.model.max_depth}")

        print("=" * 50)


def main():
    parser = argparse.ArgumentParser(description="Train squat form classifier")
    parser.add_argument(
        "--data",
        required=True,
        help="Path to training data JSON file"
    )
    parser.add_argument(
        "--model",
        choices=["random_forest", "gradient_boosting"],
        default="random_forest",
        help="Model type to train",
    )
    parser.add_argument(
        "--output",
        default="./models",
        help="Output directory for trained model",
    )

    args = parser.parse_args()

    # Initialize trainer
    trainer = SquatFormTrainer()
    trainer.model_type = args.model

    try:
        # Load data
        print("📂 Loading training data...")
        features, labels = trainer.load_dataset(args.data)

        # Prepare data
        X_train, X_test, y_train, y_test = trainer.prepare_data(features, labels)

        # Train model
        if args.model == "random_forest":
            trainer.train_random_forest(X_train, y_train)
        else:
            trainer.train_gradient_boosting(X_train, y_train)

        # Evaluate
        trainer.evaluate(X_train, y_train, X_test, y_test)

        # Save model
        trainer.save_model(args.output)

        # Print summary
        trainer.print_summary()

        print("\n✅ Training completed successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    import pandas as pd
    exit(main())
