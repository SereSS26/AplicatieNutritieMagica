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
  const smoothedScoreRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number | null>(null);

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

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];

        // 1. Desenăm scheletul. 
        // Facem flip la context temporar ca să potrivim cu webcam-ul, dar FĂRĂ să întoarcem tot canvas-ul din CSS.
        canvasCtx.save();
        canvasCtx.translate(canvasElement.width, 0);
        canvasCtx.scale(-1, 1);
        
        for (const landmark of results.landmarks) {
          drawingUtils.drawLandmarks(landmark, { radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1), color: '#d946ef' });
          drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: '#FFFFFF', lineWidth: 2 });
        }
        canvasCtx.restore(); // Revenim la coordonate normale! Textul se va vedea perfect!

        // Calculăm unghiurile utilizatorului
        const leftArmAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
        const rightArmAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
        const leftLegAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
        const rightLegAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);

        // --- LOGICA DE SCORING ---
        
        // CAZUL A: Avem video cu antrenorul (COMPARARE DIRECTĂ)
        if (trainerVideoRef?.current) {
          let currentFrameScore = 0;
          if (trainerResults && trainerResults.landmarks && trainerResults.landmarks.length > 0) {
            const trainerLandmarks = trainerResults.landmarks[0];
            const tLeftArm = calculateAngle(trainerLandmarks[11], trainerLandmarks[13], trainerLandmarks[15]);
            const tRightArm = calculateAngle(trainerLandmarks[12], trainerLandmarks[14], trainerLandmarks[16]);
            const tLeftLeg = calculateAngle(trainerLandmarks[23], trainerLandmarks[25], trainerLandmarks[27]);
            const tRightLeg = calculateAngle(trainerLandmarks[24], trainerLandmarks[26], trainerLandmarks[28]);
  
            const diff = (Math.abs(leftArmAngle - tLeftArm) + Math.abs(rightArmAngle - tRightArm) + Math.abs(leftLegAngle - tLeftLeg) + Math.abs(rightLegAngle - tRightLeg)) / 4;
            currentFrameScore = Math.max(0, 100 - diff);
  
            if (currentFrameScore > 85) {
              canvasCtx.shadowBlur = 15;
              canvasCtx.shadowColor = "#4ade80";
              canvasCtx.fillStyle = "#4ade80"; 
              canvasCtx.font = "900 24px sans-serif";
              canvasCtx.fillText("PERFECT MATCH!", 50, 50);
              canvasCtx.shadowBlur = 0;
            }
          }
          
          // Netezire ușoară pentru urmărire video
          smoothedScoreRef.current = smoothedScoreRef.current * 0.8 + currentFrameScore * 0.2;
        
        } else {
          // CAZUL B: TIME TO MOVE (Rutina structurată pentru pauza de birou)
          if (!sessionStartTimeRef.current) {
            sessionStartTimeRef.current = performance.now();
          }
          const elapsedSec = (performance.now() - sessionStartTimeRef.current) / 1000;
          
          let phaseName = "";
          let targetScore = 0;
          let phaseTimeLeft = 0;

          // Extragem articulațiile principale pentru birou
          const nose = landmarks[0];
          const lShoulder = landmarks[11];
          const rShoulder = landmarks[12];
          const lWrist = landmarks[15];
          const rWrist = landmarks[16];
          
          // Helper funcții pentru UI direct peste corp (mapate pe reverse din cauza camerei oglindite)
          const getX = (lm: any) => (1 - lm.x) * canvasElement.width;
          const getY = (lm: any) => lm.y * canvasElement.height;

          if (elapsedSec < 30) {
            phaseName = "FAZA 1: Rotații Cap (0-30s)";
            phaseTimeLeft = 30 - elapsedSec;
            
            const logShCX = (lShoulder.x + rShoulder.x) / 2;
            const turnAmount = Math.abs(nose.x - logShCX);
            
            targetScore = turnAmount > 0.07 ? 100 : 5;
            
            // Vizualizare Scanner: Linia dintre umeri și nas
            const nX = getX(nose);
            const nY = getY(nose);
            const shCX = (getX(lShoulder) + getX(rShoulder)) / 2;
            const shCY = (getY(lShoulder) + getY(rShoulder)) / 2;
            
            canvasCtx.beginPath();
            canvasCtx.moveTo(nX, nY);
            canvasCtx.lineTo(shCX, shCY);
            canvasCtx.shadowBlur = targetScore > 80 ? 15 : 0;
            canvasCtx.shadowColor = targetScore > 80 ? "#4ade80" : "transparent";
            canvasCtx.strokeStyle = targetScore > 80 ? "#4ade80" : "#facc15";
            canvasCtx.lineWidth = 4;
            canvasCtx.stroke();
            
            canvasCtx.fillStyle = targetScore > 80 ? "#4ade80" : "#facc15";
            canvasCtx.font = "900 18px sans-serif";
            canvasCtx.fillText(targetScore > 80 ? "Postură Activă! ✨" : "Rotește capul...", nX + 20, nY);
            canvasCtx.shadowBlur = 0;
            
          } else if (elapsedSec < 90) {
            phaseName = "FAZA 2: Aplecări Stânga-Dreapta";
            phaseTimeLeft = 90 - elapsedSec;
            
            // Unghiul exact al umerilor
            const dx = Math.abs(lShoulder.x - rShoulder.x);
            const dy = Math.abs(lShoulder.y - rShoulder.y);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            targetScore = angle > 12 ? 100 : 5;
            
            const lShX = getX(lShoulder);
            const lShY = getY(lShoulder);
            const rShX = getX(rShoulder);
            const rShY = getY(rShoulder);

            canvasCtx.beginPath();
            canvasCtx.moveTo(lShX, lShY);
            canvasCtx.lineTo(rShX, rShY);
            canvasCtx.shadowBlur = targetScore > 80 ? 15 : 0;
            canvasCtx.shadowColor = targetScore > 80 ? "#4ade80" : "transparent";
            canvasCtx.strokeStyle = targetScore > 80 ? "#4ade80" : "#facc15";
            canvasCtx.lineWidth = 5;
            canvasCtx.stroke();
            
            canvasCtx.fillStyle = targetScore > 80 ? "#4ade80" : "white";
            canvasCtx.font = "900 20px sans-serif";
            canvasCtx.fillText(`Înclinare: ${Math.round(angle)}°`, lShX, lShY - 20);
            canvasCtx.shadowBlur = 0;
            
          } else if (elapsedSec < 150) {
            phaseName = "FAZA 3: Extensii Brațe (1m30s+)";
            phaseTimeLeft = 150 - elapsedSec;
            
            // Analizăm nu doar înălțimea, ci și dacă brațul este perfect ÎNTINS (unghiul cotului > 130 grade)
            const leftUp = (lShoulder.y - lWrist.y) > 0.15 && leftArmAngle > 130;
            const rightUp = (rShoulder.y - rWrist.y) > 0.15 && rightArmAngle > 130;
            
            targetScore = (leftUp && rightUp) ? 100 : (leftUp || rightUp ? 40 : 5);
            
            const drawArmLine = (shoulder: any, wrist: any, isUp: boolean) => {
               canvasCtx.beginPath();
               canvasCtx.moveTo(getX(shoulder), getY(shoulder));
               canvasCtx.lineTo(getX(wrist), getY(wrist));
               canvasCtx.shadowBlur = isUp ? 15 : 0;
               canvasCtx.shadowColor = isUp ? "#4ade80" : "transparent";
               canvasCtx.strokeStyle = isUp ? "#4ade80" : "#ef4444";
               canvasCtx.lineWidth = isUp ? 6 : 3;
               canvasCtx.stroke();
               canvasCtx.shadowBlur = 0;
            };
            
            drawArmLine(lShoulder, lWrist, leftUp);
            drawArmLine(rShoulder, rWrist, rightUp);
            
          } else {
            phaseName = "Antrenament Finalizat! 🏆";
            phaseTimeLeft = 0;
            targetScore = 100;
          }

          // Smooth EMA mult mai strict la coborâri (dacă te oprești, scade mai repede)
          smoothedScoreRef.current = smoothedScoreRef.current * 0.75 + targetScore * 0.25;

          // ==========================================
          // --- HUD CENTRAL SUS (Ceas Premium Tech) ---
          // ==========================================
          const cx = canvasElement.width / 2;
          const hudWidth = 340;
          const hudHeight = 110;
          const hudX = cx - hudWidth / 2;
          const hudY = 40;
          const radius = 30; // Aspect tip "Pill" modern

          const isUrgent = phaseTimeLeft <= 5 && phaseTimeLeft > 0;
          const themeColor = isUrgent ? "#ef4444" : "#00f6ff"; // Roșu de urgență vs Cyan Premium
          const glowColor = isUrgent ? "rgba(239, 68, 68, 0.5)" : "rgba(0, 246, 255, 0.4)";

          // 1. Fundal Premium (Gradient tip Slate/Glassmorphism)
          const bgGradient = canvasCtx.createLinearGradient(hudX, hudY, hudX, hudY + hudHeight);
          bgGradient.addColorStop(0, "rgba(15, 23, 42, 0.85)"); // Slate 900
          bgGradient.addColorStop(1, "rgba(15, 23, 42, 0.98)");

          canvasCtx.shadowBlur = isUrgent ? 30 : 20;
          canvasCtx.shadowColor = glowColor;
          
          canvasCtx.beginPath();
          canvasCtx.moveTo(hudX + radius, hudY);
          canvasCtx.lineTo(hudX + hudWidth - radius, hudY);
          canvasCtx.quadraticCurveTo(hudX + hudWidth, hudY, hudX + hudWidth, hudY + radius);
          canvasCtx.lineTo(hudX + hudWidth, hudY + hudHeight - radius);
          canvasCtx.quadraticCurveTo(hudX + hudWidth, hudY + hudHeight, hudX + hudWidth - radius, hudY + hudHeight);
          canvasCtx.lineTo(hudX + radius, hudY + hudHeight);
          canvasCtx.quadraticCurveTo(hudX, hudY + hudHeight, hudX, hudY + hudHeight - radius);
          canvasCtx.lineTo(hudX, hudY + radius);
          canvasCtx.quadraticCurveTo(hudX, hudY, hudX + radius, hudY);
          canvasCtx.closePath();
          
          canvasCtx.fillStyle = bgGradient;
          canvasCtx.fill();
          
          // 2. Stroke / Contur subțire gradient
          canvasCtx.shadowBlur = 0;
          const borderGradient = canvasCtx.createLinearGradient(hudX, hudY, hudX + hudWidth, hudY + hudHeight);
          borderGradient.addColorStop(0, themeColor);
          borderGradient.addColorStop(1, "rgba(255, 255, 255, 0.05)");
          
          canvasCtx.lineWidth = 1.5;
          canvasCtx.strokeStyle = borderGradient;
          canvasCtx.stroke();

          // 3. Text Nume Fază (Design Curat)
          canvasCtx.fillStyle = isUrgent ? "#fca5a5" : "#94a3b8"; // Slate 400
          canvasCtx.font = "600 15px system-ui, -apple-system, sans-serif";
          canvasCtx.textAlign = "center";
          // Simulăm letter-spacing adăugând spații între litere (canvas limitare)
          const spacedPhaseName = phaseName.toUpperCase().split('').join(String.fromCharCode(8202));
          canvasCtx.fillText(spacedPhaseName, cx, hudY + 32);

          // 4. Text Ceas (Efect Neon Premium, font modern gros)
          const mins = Math.floor(Math.max(0, phaseTimeLeft) / 60);
          const secs = Math.floor(Math.max(0, phaseTimeLeft) % 60).toString().padStart(2, '0');
          const timeText = `${mins}:${secs}`;
          
          canvasCtx.font = "800 52px system-ui, -apple-system, sans-serif";
          
          // Strat 1: Glow / Aura extinsă
          canvasCtx.shadowBlur = 25;
          canvasCtx.shadowColor = themeColor;
          canvasCtx.fillStyle = themeColor;
          canvasCtx.fillText(timeText, cx, hudY + 85);
          
          // Strat 2: Miezul luminos alb
          canvasCtx.shadowBlur = 0;
          canvasCtx.fillStyle = "#ffffff";
          canvasCtx.fillText(timeText, cx, hudY + 85);
          
          // Strat 3: Extra reflexie subtilă (opțional, dă efect de sticlă pe text)
          canvasCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
          canvasCtx.fillText(timeText, cx, hudY + 84);
        }
      } else {
        // Scade scorul dacă utilizatorul iese din cameră
        smoothedScoreRef.current = smoothedScoreRef.current * 0.9;
      }

      const now = performance.now();

      if (now - lastScoreUpdateRef.current > 400) {
        let finalScore = smoothedScoreRef.current;
        
        // Dacă utilizatorul nu este deloc detectat în cadru, forțăm la 0
        if (!results.landmarks || results.landmarks.length === 0) {
          finalScore = 0;
          smoothedScoreRef.current = 0;
          // Opțional: Oprim timerul dacă iese din cadru prin resetarea sesiunii, dar preferăm să lăsăm timpul să meargă.
        }

        onAccuracyChange(Math.floor(finalScore));
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
      <canvas ref={canvasRef} className="w-full h-full object-cover absolute z-10" />
    </div>
  );
};

export default PoseEstimationCanvas;
