'use client';

import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { detectPoseInImage, initializePoseDetector, PoseLandmark } from '@/src/utils/poseDetection';
import { MovementAnalyzer, MovementAnalysis } from '@/src/utils/movementAnalyzer';
import { AlertCircle, Play, Pause, RotateCcw, CheckCircle, TrendingUp } from 'lucide-react';

interface SquatAnalyzerProps {
  referenceVideoPath?: string;
}

export default function SquatAnalyzer({ referenceVideoPath = '/genuflexiuni_corecte.mp4' }: SquatAnalyzerProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [analysis, setAnalysis] = useState<MovementAnalysis | null>(null);
  const [recordedFrames, setRecordedFrames] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const analyzerRef = useRef<MovementAnalyzer>(new MovementAnalyzer());
  const frameCountRef = useRef(0);

  // Initialize pose detector
  useEffect(() => {
    const init = async () => {
      try {
        await initializePoseDetector();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize pose detector:', error);
        setFeedbackMessage('Failed to load pose detection model. Please refresh the page.');
      }
    };

    init();
  }, []);

  // Load reference video
  useEffect(() => {
    if (!isInitialized || !videoRef.current) return;

    const loadReferenceVideo = async () => {
      try {
        const video = videoRef.current!;
        video.src = referenceVideoPath;

        // Extract frames from reference video
        const extractFrames = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');

          let currentTime = 0;
          const frameInterval = 1000 / 30; // 30 FPS

          const processFrame = async () => {
            if (currentTime > video.duration) {
              console.log('Reference video processed - frames loaded');
              return;
            }

            video.currentTime = currentTime;
          };

          video.addEventListener('seeked', async () => {
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const pose = await detectPoseInImage(canvas);
              if (pose) {
                analyzerRef.current.addReferenceFrame(pose, video.currentTime);
              }

              currentTime += frameInterval / 1000;
              if (currentTime <= video.duration) {
                processFrame();
              }
            }
          });

          processFrame();
        };

        video.addEventListener('canplaythrough', extractFrames, { once: true });
      } catch (error) {
        console.error('Error loading reference video:', error);
        setFeedbackMessage('Could not load reference video');
      }
    };

    loadReferenceVideo();
  }, [isInitialized, referenceVideoPath]);

  // Real-time pose detection from webcam
  useEffect(() => {
    if (!isInitialized || !isAnalyzing || isPaused || !webcamRef.current || !canvasRef.current) return;

    let frameCount = 0;
    let lastDisplayUpdate = performance.now();

    const interval = setInterval(async () => {
      try {
        const video = webcamRef.current?.video;
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        const pose = await detectPoseInImage(video);
        if (pose) {
          // Add frame to analyzer (it filters internally for high confidence)
          analyzerRef.current.addUserFrame(pose, performance.now());
          frameCount++;

          // Update display less frequently for stable numbers (every 500ms)
          const now = performance.now();
          if (now - lastDisplayUpdate > 500) {
            setRecordedFrames(frameCount);
            lastDisplayUpdate = now;
          }

          // Draw pose on canvas
          drawPoseOnCanvas(pose, video.videoWidth, video.videoHeight);
        }
      } catch (error) {
        console.error('Error detecting pose:', error);
      }
    }, 66); // 15 FPS for more stable, less jittery detection

    return () => clearInterval(interval);
  }, [isAnalyzing, isPaused, isInitialized]);

  const drawPoseOnCanvas = (landmarks: PoseLandmark[], width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);

    // Draw landmarks
    landmarks.forEach((landmark) => {
      if (landmark.visibility > 0.5) {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 8, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw skeleton connections (major joints)
    const connections = [
      [11, 23], // shoulder to hip
      [12, 24],
      [23, 25], // hip to knee
      [24, 26],
      [25, 27], // knee to ankle
      [26, 28],
      [11, 13], // shoulder to elbow
      [12, 14],
    ];

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;

    connections.forEach(([start, end]) => {
      const startLm = landmarks[start];
      const endLm = landmarks[end];

      if (startLm.visibility > 0.5 && endLm.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startLm.x * width, startLm.y * height);
        ctx.lineTo(endLm.x * width, endLm.y * height);
        ctx.stroke();
      }
    });
  };

  const startAnalysis = () => {
    if (!isInitialized) {
      setFeedbackMessage('Pose detector not ready. Please wait...');
      return;
    }

    analyzerRef.current.clearUser();
    frameCountRef.current = 0;
    setRecordedFrames(0);
    setAnalysis(null);
    setIsAnalyzing(true);
    setIsPaused(false);
    setFeedbackMessage('🎥 Recording... Stand in front of camera and perform your squat (ensure full body is visible!)');
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);

    // The analyzer now handles validation internally
    // Check if we got ANY valid frames
    const result = analyzerRef.current.analyze();

    if (!result.squat.averageMetrics || !result.squat.averageMetrics.kneeAngle) {
      setFeedbackMessage('❌ Could not detect valid squat form. Ensure good lighting and your full body is visible.');
      setAnalysis(null);
      return;
    }

    setAnalysis(result);

    if (result.squat.quality >= 85) {
      setFeedbackMessage('🎉 Excellent form! Perfect technique!');
    } else if (result.squat.quality >= 75) {
      setFeedbackMessage('✓ Great form! Minor improvements possible.');
    } else if (result.squat.quality >= 60) {
      setFeedbackMessage('Good effort! Review the recommendations below.');
    } else if (result.squat.quality > 0) {
      setFeedbackMessage('⚠️ Keep practicing! Focus on form corrections.');
    } else {
      setFeedbackMessage('❌ No valid squat detected. Ensure full body visibility.');
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    setFeedbackMessage(isPaused ? 'Resumed recording...' : 'Recording paused');
  };

  const resetAnalysis = () => {
    analyzerRef.current.clearUser();
    frameCountRef.current = 0;
    setRecordedFrames(0);
    setAnalysis(null);
    setIsAnalyzing(false);
    setIsPaused(false);
    setFeedbackMessage('');
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading pose detection model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Squat Form Analyzer</h1>
        <p className="text-gray-400 text-center mb-8">
          Compare your squat form with the reference video using AI pose detection
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Reference Video */}
          <div className="rounded-lg overflow-hidden bg-black border-2 border-green-500">
            <div className="aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                muted
                style={{ display: 'none' }}
              />
              <div className="text-center p-4">
                <p className="text-sm text-gray-400">Reference Video</p>
                <p className="text-xs text-gray-500">Loading...</p>
              </div>
            </div>
          </div>

          {/* User Webcam */}
          <div className="rounded-lg overflow-hidden bg-black border-2 border-blue-500 relative">
            <Webcam
              ref={webcamRef}
              className="w-full h-full aspect-video object-cover"
              mirrored
              screenshotFormat="image/jpeg"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            />
            <div className="absolute top-4 left-4 bg-black/70 px-3 py-2 rounded text-sm">
              <p className="text-gray-400">Your Movement</p>
              <p className="text-green-400 font-bold">{recordedFrames} frames</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {!isAnalyzing ? (
            <button
              onClick={startAnalysis}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
            >
              <Play size={20} />
              Start Recording
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition"
              >
                <Pause size={20} />
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopAnalysis}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                Stop & Analyze
              </button>
            </>
          )}

          {analysis && (
            <button
              onClick={resetAnalysis}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`mb-8 p-4 rounded-lg text-center font-semibold ${
            feedbackMessage.includes('✓')
              ? 'bg-green-900/30 border border-green-500 text-green-200'
              : feedbackMessage.includes('Loading') || feedbackMessage.includes('Recording')
              ? 'bg-blue-900/30 border border-blue-500 text-blue-200'
              : 'bg-yellow-900/30 border border-yellow-500 text-yellow-200'
          }`}>
            {feedbackMessage}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Quality Score */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Form Quality</h2>
                <div className="flex items-center gap-2">
                  <div className="text-5xl font-bold text-green-400">
                    {Math.round(analysis.squat.quality)}
                  </div>
                  <span className="text-gray-400">/100</span>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${analysis.squat.quality}%` }}
                />
              </div>
            </div>

            {/* Similarity Score */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={24} />
                Comparison to Reference
              </h3>

              <div className="text-3xl font-bold text-blue-400 mb-4">
                {analysis.comparison.similarity}% Similar
              </div>

              <div className="space-y-2">
                <p className="text-gray-300">
                  {analysis.comparison.similarity >= 80
                    ? '✓ Your form closely matches the reference video!'
                    : analysis.comparison.similarity >= 60
                    ? 'Your form is similar to the reference, but needs refinement.'
                    : 'Your form differs significantly from the reference. Watch the video and try again.'}
                </p>
              </div>
            </div>

            {/* Metrics */}
            {analysis.squat.averageMetrics && (
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500">
                <h3 className="text-xl font-bold mb-4">Movement Metrics</h3>

                <div className="grid grid-cols-2 gap-4">
                  {analysis.squat.averageMetrics.kneeAngle && (
                    <div className="bg-gray-700 p-4 rounded">
                      <p className="text-gray-400 text-sm">Avg Knee Angle</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {analysis.squat.averageMetrics.kneeAngle.average?.toFixed(1)}°
                      </p>
                      <p className="text-xs text-gray-500">Good range: 80-100°</p>
                    </div>
                  )}

                  {analysis.squat.averageMetrics.symmetry !== undefined && (
                    <div className="bg-gray-700 p-4 rounded">
                      <p className="text-gray-400 text-sm">Left-Right Symmetry</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {analysis.squat.averageMetrics.symmetry.toFixed(1)}°
                      </p>
                      <p className="text-xs text-gray-500">Lower is better</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Issues & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issues */}
              {analysis.squat.issues.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border-2 border-red-500">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={24} />
                    Areas to Improve
                  </h3>

                  <ul className="space-y-3">
                    {analysis.squat.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-red-500 mt-1">•</span>
                        <span className="text-gray-300">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.comparison.recommendations.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="text-blue-500" size={24} />
                    Recommendations
                  </h3>

                  <ul className="space-y-3">
                    {analysis.comparison.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-blue-500 mt-1">→</span>
                        <span className="text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
