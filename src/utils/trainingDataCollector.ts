/**
 * Training Data Manager
 * Helps collect and analyze training data to improve squat detection accuracy
 */

import { PoseLandmark, PoseFrame } from './poseDetection';
import { SquatMetrics } from './movementAnalyzer';

export interface TrainingDataPoint {
  landmarks: PoseLandmark[];
  metrics: SquatMetrics;
  label: 'good_form' | 'bad_form' | 'intermediate';
  notes?: string;
  timestamp?: number;
}

export interface TrainingDataset {
  name: string;
  version: string;
  createdAt: number;
  dataPoints: TrainingDataPoint[];
  metadata: {
    totalGoodSamples: number;
    totalBadSamples: number;
    totalIntermediateSamples: number;
  };
}

export class TrainingDataCollector {
  private dataset: TrainingDataset;

  constructor(datasetName: string = 'squat_training_v1') {
    this.dataset = {
      name: datasetName,
      version: '1.0',
      createdAt: Date.now(),
      dataPoints: [],
      metadata: {
        totalGoodSamples: 0,
        totalBadSamples: 0,
        totalIntermediateSamples: 0,
      },
    };
  }

  /**
   * Add a labeled training example
   */
  addTrainingExample(
    landmarks: PoseLandmark[],
    metrics: SquatMetrics,
    label: 'good_form' | 'bad_form' | 'intermediate',
    notes?: string
  ) {
    const dataPoint: TrainingDataPoint = {
      landmarks,
      metrics,
      label,
      notes,
      timestamp: Date.now(),
    };

    this.dataset.dataPoints.push(dataPoint);

    // Update metadata
    if (label === 'good_form') {
      this.dataset.metadata.totalGoodSamples++;
    } else if (label === 'bad_form') {
      this.dataset.metadata.totalBadSamples++;
    } else {
      this.dataset.metadata.totalIntermediateSamples++;
    }
  }

  /**
   * Save dataset to localStorage
   */
  saveToLocalStorage(): boolean {
    try {
      const key = `training_dataset_${this.dataset.name}`;
      localStorage.setItem(key, JSON.stringify(this.dataset));
      return true;
    } catch (error) {
      console.error('Failed to save training data:', error);
      return false;
    }
  }

  /**
   * Load dataset from localStorage
   */
  static loadFromLocalStorage(datasetName: string): TrainingDataset | null {
    try {
      const key = `training_dataset_${datasetName}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load training data:', error);
      return null;
    }
  }

  /**
   * Export dataset as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.dataset, null, 2);
  }

  /**
   * Export dataset for model training (numpy-compatible format)
   */
  exportForTraining() {
    const features: number[][] = [];
    const labels: number[] = [];

    this.dataset.dataPoints.forEach((point) => {
      // Flatten landmarks to 1D array
      const flattenedLandmarks = point.landmarks.flatMap((lm) => [lm.x, lm.y, lm.z, lm.visibility]);

      // Add metrics
      const feature = [
        ...flattenedLandmarks,
        point.metrics.kneeAngle.average,
        point.metrics.kneeAngle.left,
        point.metrics.kneeAngle.right,
        point.metrics.depth,
        point.metrics.torsoAlignment,
        point.metrics.symmetry,
      ];

      features.push(feature);

      // Convert label to number
      const labelMap = { good_form: 1, intermediate: 0.5, bad_form: 0 };
      labels.push(labelMap[point.label]);
    });

    return {
      features,
      labels,
      featureNames: [
        ...Array.from({ length: 33 }, (_, i) => `landmark_${i}_x`),
        ...Array.from({ length: 33 }, (_, i) => `landmark_${i}_y`),
        ...Array.from({ length: 33 }, (_, i) => `landmark_${i}_z`),
        ...Array.from({ length: 33 }, (_, i) => `landmark_${i}_visibility`),
        'knee_angle_avg',
        'knee_angle_left',
        'knee_angle_right',
        'depth',
        'torso_alignment',
        'symmetry',
      ],
    };
  }

  /**
   * Get statistical analysis of dataset
   */
  getStatistics() {
    const goodSamples = this.dataset.dataPoints.filter((p) => p.label === 'good_form');
    const badSamples = this.dataset.dataPoints.filter((p) => p.label === 'bad_form');

    const calculateStats = (samples: TrainingDataPoint[]) => {
      if (samples.length === 0) {
        return null;
      }

      const kneeAngles = samples.map((s) => s.metrics.kneeAngle.average);
      const depths = samples.map((s) => s.metrics.depth);
      const alignments = samples.map((s) => s.metrics.torsoAlignment);
      const symmetries = samples.map((s) => s.metrics.symmetry);

      const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const std = (arr: number[]) => {
        const m = mean(arr);
        const variance = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
        return Math.sqrt(variance);
      };

      return {
        count: samples.length,
        kneeAngle: { mean: mean(kneeAngles), std: std(kneeAngles), min: Math.min(...kneeAngles), max: Math.max(...kneeAngles) },
        depth: { mean: mean(depths), std: std(depths), min: Math.min(...depths), max: Math.max(...depths) },
        alignment: { mean: mean(alignments), std: std(alignments), min: Math.min(...alignments), max: Math.max(...alignments) },
        symmetry: { mean: mean(symmetries), std: std(symmetries), min: Math.min(...symmetries), max: Math.max(...symmetries) },
      };
    };

    return {
      totalSamples: this.dataset.dataPoints.length,
      goodForm: calculateStats(goodSamples),
      badForm: calculateStats(badSamples),
      dataBalance: {
        good: (goodSamples.length / this.dataset.dataPoints.length) * 100,
        bad: (badSamples.length / this.dataset.dataPoints.length) * 100,
      },
    };
  }

  /**
   * Validate and clean dataset
   */
  validateDataset(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.dataset.dataPoints.length === 0) {
      errors.push('Dataset is empty');
    }

    this.dataset.dataPoints.forEach((point, idx) => {
      if (!point.landmarks || point.landmarks.length !== 33) {
        errors.push(`Point ${idx}: Invalid number of landmarks`);
      }

      if (!point.metrics) {
        errors.push(`Point ${idx}: Missing metrics`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get recommendations for improving dataset
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getStatistics();

    if (this.dataset.dataPoints.length < 100) {
      recommendations.push('Collect more training samples (currently < 100)');
    }

    if (stats.dataBalance.good < 40 || stats.dataBalance.good > 60) {
      recommendations.push('Dataset is imbalanced - collect more samples of one class');
    }

    const goodForm = stats.goodForm;
    if (goodForm && goodForm.kneeAngle.std > 20) {
      recommendations.push('Good form samples have high variance in knee angle - ensure consistent reference');
    }

    if (this.dataset.dataPoints.length >= 50) {
      recommendations.push('Dataset is ready for model training or fine-tuning');
    }

    return recommendations;
  }

  /**
   * Get the current dataset
   */
  getDataset(): TrainingDataset {
    return this.dataset;
  }

  /**
   * Create comparison profile between good and bad form
   */
  createFormProfile(): {
    goodForm: Partial<SquatMetrics>;
    badForm: Partial<SquatMetrics>;
    differences: { [key: string]: number };
  } {
    const goodSamples = this.dataset.dataPoints.filter((p) => p.label === 'good_form');
    const badSamples = this.dataset.dataPoints.filter((p) => p.label === 'bad_form');

    const averageMetrics = (samples: TrainingDataPoint[]) => {
      if (samples.length === 0) return {};

      const avgKneeAngle =
        samples.reduce((sum, s) => sum + s.metrics.kneeAngle.average, 0) / samples.length;
      const avgDepth = samples.reduce((sum, s) => sum + s.metrics.depth, 0) / samples.length;
      const avgAlignment =
        samples.reduce((sum, s) => sum + s.metrics.torsoAlignment, 0) / samples.length;
      const avgSymmetry = samples.reduce((sum, s) => sum + s.metrics.symmetry, 0) / samples.length;

      return {
        kneeAngle: { average: avgKneeAngle },
        depth: avgDepth,
        torsoAlignment: avgAlignment,
        symmetry: avgSymmetry,
      };
    };

    const goodProfile = averageMetrics(goodSamples);
    const badProfile = averageMetrics(badSamples);

    const differences: { [key: string]: number } = {};

    if (goodProfile.kneeAngle && badProfile.kneeAngle) {
      differences.kneeAngle = Math.abs(
        (goodProfile.kneeAngle.average || 0) - (badProfile.kneeAngle.average || 0)
      );
    }

    if (goodProfile.depth && badProfile.depth) {
      differences.depth = Math.abs(goodProfile.depth - badProfile.depth);
    }

    return {
      goodForm: goodProfile,
      badForm: badProfile,
      differences,
    };
  }
}

export default TrainingDataCollector;
