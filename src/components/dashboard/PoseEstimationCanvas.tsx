"use client";

import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { Loader2 } from 'lucide-react';

interface Props {
  onAccuracyChange: (score: number) => void;
  trainerVideoRef?: React.RefObject<HTMLVideoElement | null>; // Primim referința la video-ul antrenorului
}

// --- AGENT BIOMECANIC (Matematică pură) ---
// Funcție care calculează unghiul dintre 3 puncte (ex: Umăr -> Cot -> Încheietură)
const calculateAngle = (a: any, b: any, c: any) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return Math.round(angle);
};

const PoseEstimationCanvas = ({ onAccuracyChange, trainerVideoRef }: Props) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const lastScoreUpdateRef = useRef(0);
  const scoreAccumulatorRef = useRef<number[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `/models/pose_landmarker_lite.task`,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        poseLandmarkerRef.current = landmarker;
        setIsLoading(false);
      } catch (e: any) {
        console.error("Error loading PoseLandmarker model", e);
        setError("Nu am putut încărca modelul AI. Verifică conexiunea la internet sau dacă fișierul model este în public/models.");
        setIsLoading(false);
      }
    };

    createPoseLandmarker();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  const predictWebcam = () => {
    const video = webcamRef.current?.video;
    const canvasElement = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (!video || !canvasElement || !poseLandmarker || video.readyState < 2) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx) return;

    if (canvasElement.width !== video.videoWidth) {
      canvasElement.width = video.videoWidth;
      canvasElement.height = video.videoHeight;
    }

    const drawingUtils = new DrawingUtils(canvasCtx);
    const videoTime = video.currentTime;

    if (videoTime > lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoTime;
      
      // 1. Detectăm utilizatorul (Webcam)
      const results = poseLandmarker.detectForVideo(video, performance.now());

      // 2. Detectăm antrenorul (Video Local) - DOAR dacă există și rulează
      let trainerResults = null;
      if (trainerVideoRef?.current && !trainerVideoRef.current.paused && trainerVideoRef.current.readyState >= 2) {
        // Folosim un timestamp diferit pentru a nu bloca MediaPipe
        trainerResults = poseLandmarker.detectForVideo(trainerVideoRef.current, performance.now());
      }

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      let currentFrameScore = 0;

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];

        // 1. Desenăm scheletul standard
        for (const landmark of results.landmarks) {
          drawingUtils.drawLandmarks(landmark, { radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1), color: '#d946ef' });
          drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: '#FFFFFF', lineWidth: 2 });
        }

        // Calculăm unghiurile utilizatorului
        const leftArmAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
        const rightArmAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
        const leftLegAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
        const rightLegAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);

        // --- LOGICA DE SCORING ---
        
        // CAZUL A: Avem video cu antrenorul (COMPARARE DIRECTĂ)
        if (trainerResults && trainerResults.landmarks && trainerResults.landmarks.length > 0) {
          const trainerLandmarks = trainerResults.landmarks[0];
          
          // Unghiuri Antrenor
          const tLeftArm = calculateAngle(trainerLandmarks[11], trainerLandmarks[13], trainerLandmarks[15]);
          const tRightArm = calculateAngle(trainerLandmarks[12], trainerLandmarks[14], trainerLandmarks[16]);
          const tLeftLeg = calculateAngle(trainerLandmarks[23], trainerLandmarks[25], trainerLandmarks[27]);
          const tRightLeg = calculateAngle(trainerLandmarks[24], trainerLandmarks[26], trainerLandmarks[28]);

          // Calculăm diferența (Eroarea)
          const diff = (
            Math.abs(leftArmAngle - tLeftArm) +
            Math.abs(rightArmAngle - tRightArm) +
            Math.abs(leftLegAngle - tLeftLeg) +
            Math.abs(rightLegAngle - tRightLeg)
          ) / 4;

          // Scorul este 100 minus eroarea medie
          // Dacă diferența e mică, scorul e mare.
          currentFrameScore = Math.max(0, 100 - diff);

          // Desenăm un indicator vizual "MATCH" dacă ești sincronizat
          if (currentFrameScore > 85) {
            canvasCtx.fillStyle = "#4ade80"; // Verde
            canvasCtx.fillText("PERFECT MATCH!", 50, 50);
          }
        } 
        // CAZUL B: Nu avem video local (YouTube) -> Rămânem pe Biomecanică Generală
        else {
           // 3. Desenăm unghiurile pe ecran (HUD)
        canvasCtx.fillStyle = "white";
        canvasCtx.font = "bold 20px Arial";
        
        // Afișăm unghiurile lângă articulații
        canvasCtx.fillText(`${leftArmAngle}°`, landmarks[13].x * canvasElement.width + 10, landmarks[13].y * canvasElement.height);
        canvasCtx.fillText(`${rightArmAngle}°`, landmarks[14].x * canvasElement.width - 40, landmarks[14].y * canvasElement.height);
        
        // Colorăm unghiurile picioarelor în funcție de adâncime (verde dacă e squat bun)
        canvasCtx.fillStyle = leftLegAngle < 100 ? "#4ade80" : "white"; // Verde dacă e sub 100 grade
        canvasCtx.fillText(`${leftLegAngle}°`, landmarks[25].x * canvasElement.width + 10, landmarks[25].y * canvasElement.height);
        
        canvasCtx.fillStyle = rightLegAngle < 100 ? "#4ade80" : "white";
        canvasCtx.fillText(`${rightLegAngle}°`, landmarks[26].x * canvasElement.width - 40, landmarks[26].y * canvasElement.height);

        const symmetryScore = 100 - Math.abs(leftArmAngle - rightArmAngle) - Math.abs(leftLegAngle - rightLegAngle);
        const intensityScore = (
          (180 - leftArmAngle) + 
          (180 - rightArmAngle) + 
          (180 - leftLegAngle) + 
          (180 - rightLegAngle)
        ) / 4; // Media flexiei

        currentFrameScore = Math.min(Math.max((symmetryScore * 0.4) + (intensityScore * 0.8), 10), 100);
        }
      }

      // --- STABILIZARE SCOR ---
      scoreAccumulatorRef.current.push(currentFrameScore);
      const now = performance.now();

      if (now - lastScoreUpdateRef.current > 300) {
        const avgScore = scoreAccumulatorRef.current.reduce((a, b) => a + b, 0) / (scoreAccumulatorRef.current.length || 1);
        onAccuracyChange(Math.floor(avgScore));
        scoreAccumulatorRef.current = [];
        lastScoreUpdateRef.current = now;
      }

      canvasCtx.restore();
    }

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  };

  const handleUserMedia = () => {
    if (poseLandmarkerRef.current) {
      predictWebcam();
    }
  };

  return (
    <div className="w-full h-full relative bg-gray-900 overflow-hidden">
      {isLoading && <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-20 bg-black/50"><Loader2 className="animate-spin w-8 h-8 mb-2" /><p className="text-sm font-bold">Se calibrează camera AI...</p></div>}
      {error && <div className="absolute inset-0 flex items-center justify-center text-center text-red-400 z-20 bg-black/50 p-4"><p>{error}</p></div>}
      <Webcam 
        ref={webcamRef} 
        audio={false} 
        className="w-full h-full object-cover transform scale-x-[-1] absolute" 
        mirrored={true}
        onUserMedia={handleUserMedia} 
      />
      <canvas ref={canvasRef} className="w-full h-full object-cover transform scale-x-[-1] absolute z-10" />
    </div>
  );
};

export default PoseEstimationCanvas;
