import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { GestureType } from '../types';

// Declare global types for MediaPipe loaded via CDN script
declare global {
  interface Window {
    vision: any;
  }
}

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cameraEnabled, setGesture } = useStore();
  const [handLandmarker, setHandLandmarker] = useState<any>(null);
  const requestRef = useRef<number | null>(null);

  // 1. Initialize MediaPipe (with retry mechanism)
  useEffect(() => {
    let intervalId: any;

    const initLandmarker = async () => {
      // Check if global vision object is loaded from script
      if (window.vision) {
        clearInterval(intervalId);
        try {
            const { HandLandmarker, FilesetResolver } = window.vision;
            
            const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );

            const landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
            });
            
            setHandLandmarker(landmarker);
            console.log("HandLandmarker Initialized Successfully");
        } catch (e) {
            console.error("Failed to init MediaPipe", e);
        }
      }
    };

    // Poll every 100ms for the script to load
    intervalId = setInterval(initLandmarker, 100);
    initLandmarker(); // Try immediately

    return () => clearInterval(intervalId);
  }, []);

  // 2. Start Camera
  useEffect(() => {
    if (cameraEnabled && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Camera access error:", err));
    } else {
        // Stop stream
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [cameraEnabled]);

  // 3. Prediction Loop
  useEffect(() => {
    if (!handLandmarker || !cameraEnabled) return;

    const predictWebcam = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        // Ensure video has data
        if (videoRef.current.readyState >= 2) {
            const startTimeMs = performance.now();
            const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];
                
                // Draw debug visual
                drawLandmarks(landmarks);

                // Gesture Logic
                const wrist = landmarks[0];
                // Tips: Thumb(4), Index(8), Middle(12), Ring(16), Pinky(20)
                const tips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
                
                // Calculate average distance from wrist to tips
                const avgDist = tips.reduce((acc: number, tip: any) => {
                    const d = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
                    return acc + d;
                }, 0) / 5;

                // Heuristic thresholds
                let detected: GestureType = 'None';
                if (avgDist > 0.35) { 
                    detected = 'Open_Palm';
                } else if (avgDist < 0.25) {
                    detected = 'Closed_Fist';
                }
                
                setGesture(detected);
            } else {
                setGesture('None');
                clearCanvas();
            }
        }
        
        requestRef.current = requestAnimationFrame(predictWebcam);
    };

    requestRef.current = requestAnimationFrame(predictWebcam);

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [handLandmarker, cameraEnabled, setGesture]);

  const drawLandmarks = (landmarksArray: any[]) => {
      const ctx = canvasRef.current?.getContext('2d');
      if(!ctx || !videoRef.current) return;
      
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.8)'; // Yellow-400
      
      for(const point of landmarksArray) {
          ctx.beginPath();
          ctx.arc(point.x * ctx.canvas.width, point.y * ctx.canvas.height, 4, 0, 2*Math.PI);
          ctx.fill();
      }
  };

  const clearCanvas = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  if (!cameraEnabled) return null;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20">
      <video ref={videoRef} autoPlay playsInline muted className="absolute w-full h-full object-cover transform -scale-x-100" />
      <canvas ref={canvasRef} className="absolute w-full h-full transform -scale-x-100 pointer-events-none" />
    </div>
  );
};

export default HandTracker;