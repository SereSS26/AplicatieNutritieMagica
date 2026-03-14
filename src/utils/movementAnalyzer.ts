import { PoseLandmark, PoseFrame, extractSquatKeypoints, calculateKneeBendAngle, checkSquatDepth, calculateTorsoAlignment } from './poseDetection';

// Exponential Moving Average filter for smooth values
class EMAFilter {
  private value: number = 0;
  private initialized: boolean = false;
  private alpha: number;

  constructor(alpha: number = 0.25) {
    this.alpha = alpha; // 0.2-0.3 = smoother, less responsive
  }

  update(newValue: number): number {
    if (!this.initialized) {
      this.value = newValue;
      this.initialized = true;
      return newValue;
    }

    this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    return this.value;
  }

  getValue(): number {
    return this.value;
  }

  reset() {
    this.initialized = false;
    this.value = 0;
  }
}

export interface SquatMetrics {
  kneeAngle: {
    left: number;
    right: number;
    average: number;
  };
  depth: number;
  torsoAlignment: number;
  symmetry: number;
  timestamp: number;
  confidence: number; // 0-1, based on landmark visibility
}

export interface MovementPhase {
  name: 'initial' | 'descent' | 'bottom' | 'ascent';
  startFrame: number;
  endFrame: number;
  metrics: SquatMetrics[];
}

export interface MovementAnalysis {
  squat: {
    quality: number; // 0-100
    issues: string[];
    phases: MovementPhase[];
    averageMetrics: Partial<SquatMetrics>;
  };
  comparison: {
    similarity: number; // 0-100
    differences: string[];
    recommendations: string[];
  };
}

/**
 * Calculates confidence based on visibility of key landmarks
 * Only returns metrics if all critical joints are visible
 */
function calculatePoseConfidence(landmarks: PoseLandmark[], keyIndices: number[]): number {
  const visibilities = keyIndices.map((i) => landmarks[i]?.visibility || 0);
  return visibilities.reduce((a, b) => a + b, 0) / visibilities.length;
}

/**
 * Validates that pose is physically possible
 * Prevents faulty detections from affecting results
 */
function validatePose(keypoints: ReturnType<typeof extractSquatKeypoints>): boolean {
  const { leftKnee, rightKnee, leftHip, rightHip, leftAnkle, rightAnkle } = keypoints;

  // Check that feet are roughly on same level (standing on ground)
  const footDiff = Math.abs(leftAnkle.y - rightAnkle.y);
  if (footDiff > 0.15) return false; // Feet too misaligned

  // Check that hips are between shoulders and ankles
  const leftKneeY = leftKnee.y;
  const leftHipY = leftHip.y;
  const leftAnkleY = leftAnkle.y;

  if (leftHipY > leftAnkleY || leftHipY < leftKneeY) return false; // Hip-knee-ankle not aligned vertically

  return true;
}

export class MovementAnalyzer {
  private referenceFrames: PoseFrame[] = [];
  private userFrames: PoseFrame[] = [];
  private filteredMetrics: SquatMetrics[] = [];

  // EMA Filters for each metric (prevents jittery updates)
  private kneeAngleFilter = new EMAFilter(0.25);
  private depthFilter = new EMAFilter(0.25);
  private alignmentFilter = new EMAFilter(0.25);
  private symmetryFilter = new EMAFilter(0.25);

  // Tracking for change detection
  private lastSignificantUpdate: number = 0;
  private updateThreshold: number = 30; // milliseconds between updates
  private minValueChange: number = 1; // minimum change in degrees to register

  private keyJoints = [11, 12, 23, 24, 25, 26, 27, 28]; // Critical joints for squat

  addReferenceFrame(landmarks: PoseLandmark[], timestamp: number) {
    this.referenceFrames.push({ landmarks, timestamp });
  }

  addUserFrame(landmarks: PoseLandmark[], timestamp: number) {
    // Only add if confidence is high enough
    const confidence = calculatePoseConfidence(landmarks, this.keyJoints);
    if (confidence > 0.7) {
      this.userFrames.push({ landmarks, timestamp });
    }
  }

  clearUser() {
    this.userFrames = [];
    this.filteredMetrics = [];
    this.kneeAngleFilter.reset();
    this.depthFilter.reset();
    this.alignmentFilter.reset();
    this.symmetryFilter.reset();
    this.lastSignificantUpdate = 0;
  }

  private calculateSquatMetrics(frame: PoseFrame): SquatMetrics | null {
    const keypoints = extractSquatKeypoints(frame.landmarks);

    // VALIDATION: Ensure pose is physically possible
    if (!validatePose(keypoints)) {
      return null;
    }

    const confidence = calculatePoseConfidence(frame.landmarks, this.keyJoints);

    // Only calculate if all landmarks are visible enough
    if (confidence < 0.7) {
      return null;
    }

    const kneeAngle = calculateKneeBendAngle(keypoints);
    const depth = checkSquatDepth(keypoints);
    const torsoAlignment = calculateTorsoAlignment(keypoints);
    const symmetry = Math.abs(kneeAngle.left - kneeAngle.right);

    // Validate metric ranges (biomechanically possible values)
    if (kneeAngle.average < 30 || kneeAngle.average > 180) return null; // Invalid knee angle
    if (symmetry > 45) return null; // Unrealistic asymmetry

    return {
      kneeAngle,
      depth,
      torsoAlignment,
      symmetry,
      timestamp: frame.timestamp,
      confidence,
    };
  }

  /**
   * Get smoothed metrics using EMA filters
   * Only updates if enough time has passed or significant change detected
   */
  private getSmoothedMetrics(metrics: SquatMetrics): SquatMetrics {
    const now = performance.now();
    const timeSinceLastUpdate = now - this.lastSignificantUpdate;

    // Check if there's significant change
    const kneeChange = Math.abs(metrics.kneeAngle.average - this.kneeAngleFilter.getValue());
    const depthChange = Math.abs(metrics.depth - this.depthFilter.getValue());
    const hasSignificantChange =
      (kneeChange > this.minValueChange) ||
      (depthChange > 0.05) ||
      (timeSinceLastUpdate < 500); // Always update in first 500ms

    if (hasSignificantChange) {
      this.lastSignificantUpdate = now;
    }

    // Apply EMA smoothing (prevents jitter)
    const smoothedKneeAngle = this.kneeAngleFilter.update(metrics.kneeAngle.average);
    const smoothedDepth = this.depthFilter.update(metrics.depth);
    const smoothedAlignment = this.alignmentFilter.update(metrics.torsoAlignment);
    const smoothedSymmetry = this.symmetryFilter.update(metrics.symmetry);

    return {
      kneeAngle: {
        left: metrics.kneeAngle.left, // Individual sides not smoothed
        right: metrics.kneeAngle.right,
        average: smoothedKneeAngle,
      },
      depth: smoothedDepth,
      torsoAlignment: smoothedAlignment,
      symmetry: smoothedSymmetry,
      timestamp: metrics.timestamp,
      confidence: metrics.confidence,
    };
  }

  private detectSquatPhases(frames: PoseFrame[]): MovementPhase[] {
    let metrics: SquatMetrics[] = [];

    // Calculate and filter valid metrics
    for (const frame of frames) {
      const metric = this.calculateSquatMetrics(frame);
      if (metric) {
        metrics.push(metric);
      }
    }

    const phases: MovementPhase[] = [];

    if (metrics.length < 5) return phases; // Need at least 5 frames to detect phases

    // Find knee angle range
    const minKneeAngle = Math.min(...metrics.map((m) => m.kneeAngle.average));
    const maxKneeAngle = Math.max(...metrics.map((m) => m.kneeAngle.average));
    const kneeRange = maxKneeAngle - minKneeAngle;

    // Need sufficient range to detect meaningful squat
    if (kneeRange < 15) return phases; // No significant squat detected

    let currentPhase: MovementPhase | null = null;

    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      const kneeAngle = metric.kneeAngle.average;

      let phase: 'initial' | 'descent' | 'bottom' | 'ascent';

      // Determine phase based on knee angle thresholds
      if (kneeAngle > maxKneeAngle - kneeRange * 0.1) {
        phase = 'initial';
      } else if (kneeAngle < minKneeAngle + kneeRange * 0.1) {
        phase = 'bottom';
      } else if (i < metrics.length / 2) {
        phase = 'descent';
      } else {
        phase = 'ascent';
      }

      // Only change phase if significantly different
      if (!currentPhase || currentPhase.name !== phase) {
        if (currentPhase && currentPhase.metrics.length > 3) {
          currentPhase.endFrame = i - 1;
          phases.push(currentPhase);
        }

        currentPhase = {
          name: phase,
          startFrame: i,
          endFrame: i,
          metrics: [],
        };
      }

      currentPhase.metrics.push(metric);
    }

    if (currentPhase && currentPhase.metrics.length > 3) {
      currentPhase.endFrame = metrics.length - 1;
      phases.push(currentPhase);
    }

    return phases;
  }

  private scoreSquatQuality(frames: PoseFrame[]): { score: number; issues: string[] } {
    let metrics: SquatMetrics[] = [];

    for (const frame of frames) {
      const metric = this.calculateSquatMetrics(frame);
      if (metric && metric.confidence > 0.7) {
        metrics.push(metric);
      }
    }

    if (metrics.length < 5) {
      return { score: 0, issues: ['Not enough valid frames - ensure good lighting and full body visibility'] };
    }

    let score = 100;
    const issues: string[] = [];

    // KNEE ANGLE ANALYSIS
    const kneeAngles = metrics.map((m) => m.kneeAngle.average);
    const minKneeAngle = Math.min(...kneeAngles);
    const avgKneeAngle = kneeAngles.reduce((a, b) => a + b, 0) / kneeAngles.length;
    const kneeRange = Math.max(...kneeAngles) - minKneeAngle;

    // Ideal range: 80-100° at bottom
    if (minKneeAngle > 105) {
      score -= 25;
      issues.push('❌ Squat depth too shallow - bend knees more (target: 80-100°)');
    } else if (minKneeAngle < 60) {
      score -= 15;
      issues.push('⚠️ Squat depth too deep - risk of knee strain');
    } else if (minKneeAngle >= 80 && minKneeAngle <= 100) {
      score += 10; // Bonus for correct depth
    }

    // Check if sufficient movement
    if (kneeRange < 20) {
      score -= 20;
      issues.push('❌ Minimal movement - perform a deeper squat');
    }

    // TORSO ALIGNMENT ANALYSIS
    const alignments = metrics.map((m) => m.torsoAlignment);
    const avgAlignment = alignments.reduce((a, b) => a + b, 0) / alignments.length;
    const maxAlignment = Math.max(...alignments);

    if (avgAlignment > 0.25) {
      score -= 20;
      issues.push('❌ Significant forward lean - keep torso upright');
    } else if (avgAlignment < 0.1) {
      score += 5; // Bonus for good alignment
    }

    if (maxAlignment > 0.35) {
      score -= 10;
      issues.push('⚠️ Excessive torso movement - stabilize your core');
    }

    // SYMMETRY ANALYSIS
    const symmetries = metrics.map((m) => m.symmetry);
    const avgSymmetry = symmetries.reduce((a, b) => a + b, 0) / symmetries.length;
    const maxSymmetry = Math.max(...symmetries);

    if (avgSymmetry > 20) {
      score -= 20;
      issues.push('❌ Poor balance - distribute weight equally');
    } else if (avgSymmetry < 8) {
      score += 5; // Bonus for good symmetry
    }

    if (maxSymmetry > 30) {
      score -= 10;
      issues.push('⚠️ One-sided movement detected');
    }

    // DEPTH CONSISTENCY ANALYSIS
    const depths = metrics.map((m) => m.depth);
    const depthVariance = Math.max(...depths) - Math.min(...depths);

    if (depthVariance > 0.4) {
      score -= 10;
      issues.push('⚠️ Inconsistent depth - maintain steady form throughout');
    }

    // Movement smoothness (variance in angle change)
    const angleChanges = [];
    for (let i = 1; i < kneeAngles.length; i++) {
      angleChanges.push(Math.abs(kneeAngles[i] - kneeAngles[i - 1]));
    }
    const avgChangeRate = angleChanges.reduce((a, b) => a + b, 0) / angleChanges.length;

    if (avgChangeRate > 5) {
      score -= 5;
      issues.push('⚠️ Jerky movement - move more fluidly and controlled');
    } else if (avgChangeRate < 1.5) {
      score += 3; // Bonus for smooth movement
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
  }

  private euclideanDistance(a: PoseLandmark[], b: PoseLandmark[]): number {
    if (a.length !== b.length) return 100;

    let sum = 0;
    let validCount = 0;

    // Only compare visible landmarks
    for (let i = 0; i < a.length; i++) {
      if (a[i].visibility > 0.5 && b[i].visibility > 0.5) {
        const dx = a[i].x - b[i].x;
        const dy = a[i].y - b[i].y;
        sum += dx * dx + dy * dy; // 2D comparison for stability
        validCount++;
      }
    }

    if (validCount === 0) return 100;

    return Math.sqrt(sum / validCount);
  }

  private findBestMatch(userFrames: PoseFrame[], referenceFrames: PoseFrame[]): number[] {
    if (userFrames.length === 0 || referenceFrames.length === 0) {
      return [];
    }

    // Filter out invalid poses first
    const validUserFrames = userFrames.filter((f) => {
      const metric = this.calculateSquatMetrics(f);
      return metric !== null;
    });

    if (validUserFrames.length < 5) {
      return [];
    }

    // Simple frame alignment
    const matches: number[] = [];
    const step = Math.max(1, Math.floor(referenceFrames.length / validUserFrames.length));

    for (let i = 0; i < validUserFrames.length; i++) {
      const refIndex = Math.min(i * step, referenceFrames.length - 1);
      matches.push(refIndex);
    }

    return matches;
  }

  private calculateSimilarity(userFrames: PoseFrame[], referenceFrames: PoseFrame[]): number {
    const matches = this.findBestMatch(userFrames, referenceFrames);

    if (matches.length < 5) {
      return 0;
    }

    let totalDistance = 0;
    let validCount = 0;

    for (let i = 0; i < Math.min(userFrames.length, matches.length); i++) {
      const refIndex = matches[i];
      const distance = this.euclideanDistance(
        userFrames[i].landmarks,
        referenceFrames[refIndex].landmarks
      );

      if (distance < 5 && distance >= 0) { // Valid distance range
        totalDistance += distance;
        validCount++;
      }
    }

    if (validCount < 3) {
      return 0;
    }

    const avgDistance = totalDistance / validCount;
    // Convert to similarity (0-100)
    const similarity = Math.max(0, Math.min(100, 100 - avgDistance * 50));

    return similarity;
  }

  analyze(): MovementAnalysis {
    const userQuality = this.scoreSquatQuality(this.userFrames);
    const userPhases = this.detectSquatPhases(this.userFrames);
    const referencePhases = this.detectSquatPhases(this.referenceFrames);

    const similarity = this.calculateSimilarity(this.userFrames, this.referenceFrames);

    // Calculate valid metrics
    let validMetrics: SquatMetrics[] = [];
    for (const frame of this.userFrames) {
      const metric = this.calculateSquatMetrics(frame);
      if (metric && metric.confidence > 0.7) {
        validMetrics.push(metric);
      }
    }

    const avgMetrics = validMetrics.length > 0 ? {
      kneeAngle: {
        average: validMetrics.reduce((sum, m) => sum + m.kneeAngle.average, 0) / validMetrics.length,
      } as any,
      depth: validMetrics.reduce((sum, m) => sum + m.depth, 0) / validMetrics.length,
      torsoAlignment: validMetrics.reduce((sum, m) => sum + m.torsoAlignment, 0) / validMetrics.length,
      symmetry: validMetrics.reduce((sum, m) => sum + m.symmetry, 0) / validMetrics.length,
      confidence: validMetrics.reduce((sum, m) => sum + m.confidence, 0) / validMetrics.length,
    } : {};

    const differences: string[] = [];
    const recommendations: string[] = [];

    // Compare with reference
    if (referencePhases.length > 0 && userPhases.length > 0) {
      const refKneeAngles = referencePhases.flatMap((p) =>
        p.metrics.map((m) => m.kneeAngle.average)
      );
      const userKneeAngles = userPhases.flatMap((p) =>
        p.metrics.map((m) => m.kneeAngle.average)
      );

      if (refKneeAngles.length > 0 && userKneeAngles.length > 0) {
        const refMinKnee = Math.min(...refKneeAngles);
        const userMinKnee = Math.min(...userKneeAngles);

        if (Math.abs(refMinKnee - userMinKnee) > 12) {
          differences.push(`Bottom position: Reference ${refMinKnee.toFixed(1)}° vs Your ${userMinKnee.toFixed(1)}°`);
        }
      }
    }

    if (userQuality.issues.length === 0) {
      recommendations.push('✅ Excellent form! Maintain this technique.');
    } else {
      recommendations.push(...userQuality.issues);
    }

    if (similarity < 50 && similarity > 0) {
      recommendations.push('💡 Watch the reference video again - your movement pattern is quite different');
    }

    return {
      squat: {
        quality: userQuality.score,
        issues: userQuality.issues,
        phases: userPhases,
        averageMetrics: avgMetrics,
      },
      comparison: {
        similarity: Math.round(similarity),
        differences,
        recommendations,
      },
    };
  }
}
