import * as PoseDetection from '@mediapipe/tasks-vision';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFrame {
  landmarks: PoseLandmark[];
  timestamp: number;
}

let poseDetector: PoseDetection.PoseLandmarker | null = null;

export async function initializePoseDetector() {
  const vision = await PoseDetection.FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
  );

  poseDetector = await PoseDetection.PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
  });

  return poseDetector;
}

export async function detectPoseInImage(
  imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<PoseLandmark[] | null> {
  if (!poseDetector) {
    await initializePoseDetector();
  }

  try {
    const result = poseDetector!.detectForVideo(
      imageSource,
      performance.now()
    );

    if (result.landmarks && result.landmarks.length > 0) {
      return result.landmarks[0].map((landmark) => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility || 0,
      }));
    }
    return null;
  } catch (error) {
    console.error('Error detecting pose:', error);
    return null;
  }
}

// Extract key joints for squat analysis
export const SQUAT_KEYPOINTS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

export function extractSquatKeypoints(landmarks: PoseLandmark[]) {
  return {
    leftShoulder: landmarks[SQUAT_KEYPOINTS.LEFT_SHOULDER],
    rightShoulder: landmarks[SQUAT_KEYPOINTS.RIGHT_SHOULDER],
    leftHip: landmarks[SQUAT_KEYPOINTS.LEFT_HIP],
    rightHip: landmarks[SQUAT_KEYPOINTS.RIGHT_HIP],
    leftKnee: landmarks[SQUAT_KEYPOINTS.LEFT_KNEE],
    rightKnee: landmarks[SQUAT_KEYPOINTS.RIGHT_KNEE],
    leftAnkle: landmarks[SQUAT_KEYPOINTS.LEFT_ANKLE],
    rightAnkle: landmarks[SQUAT_KEYPOINTS.RIGHT_ANKLE],
  };
}

// Calculate angle between three points (in degrees)
export function calculateAngle(
  p1: PoseLandmark,
  p2: PoseLandmark,
  p3: PoseLandmark
): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const det = v1.x * v2.y - v1.y * v2.x;
  const angle = Math.atan2(det, dot);

  return Math.abs((angle * 180) / Math.PI);
}

// Calculate vertical alignment (how straight the torso is)
export function calculateTorsoAlignment(keypoints: ReturnType<typeof extractSquatKeypoints>): number {
  const { leftShoulder, rightShoulder, leftHip, rightHip } = keypoints;
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  const dx = shoulderMidpoint.x - hipMidpoint.x;
  const dy = shoulderMidpoint.y - hipMidpoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Lower value means more vertical alignment (better)
  return Math.abs(dx) / (distance + 0.0001);
}

// Calculate knee bend angle
export function calculateKneeBendAngle(keypoints: ReturnType<typeof extractSquatKeypoints>): {
  left: number;
  right: number;
  average: number;
} {
  const leftKneeAngle = calculateAngle(
    keypoints.leftHip,
    keypoints.leftKnee,
    keypoints.leftAnkle
  );
  const rightKneeAngle = calculateAngle(
    keypoints.rightHip,
    keypoints.rightKnee,
    keypoints.rightAnkle
  );

  return {
    left: leftKneeAngle,
    right: rightKneeAngle,
    average: (leftKneeAngle + rightKneeAngle) / 2,
  };
}

// Check if hips are lower than shoulders (good squat depth)
export function checkSquatDepth(keypoints: ReturnType<typeof extractSquatKeypoints>): number {
  const shoulderY = Math.min(keypoints.leftShoulder.y, keypoints.rightShoulder.y);
  const hipY = Math.min(keypoints.leftHip.y, keypoints.rightHip.y);

  // If hip is lower than shoulder, positive value (deeper squat)
  return hipY - shoulderY;
}
