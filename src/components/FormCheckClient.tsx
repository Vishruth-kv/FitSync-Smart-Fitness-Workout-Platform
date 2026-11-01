"use client";

import React, { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { calculateAngle } from "@/lib/pose";
import { Camera, Upload, Square, ActivitySquare, AlertTriangle, CheckCircle2 } from "lucide-react";

type ExerciseType = "Squat" | "Bicep Curl" | "Lateral Raise";
type AnalysisMode = "camera" | "video" | null;
type SessionRecord = { id: string, date: string, exercise: string, reps: number, duration: number, events: string[] };

export default function FormCheckClient() {
  const [exercise, setExercise] = useState<ExerciseType>("Squat");
  const [mode, setMode] = useState<AnalysisMode>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  
  // Real-time analysis state
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState("READY");
  const [primaryAngle, setPrimaryAngle] = useState(0);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  
  // Last session summary
  const [lastSession, setLastSession] = useState<SessionRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mutable state for the loop to avoid dependency issues in requestAnimationFrame
  const stateRef = useRef({
    reps: 0,
    phase: "READY",
    lastTime: 0,
    feedbacks: new Set<string>(),
    events: [] as string[],
    isAnalyzing: false,
    exercise: "Squat" as ExerciseType,
    depthReached: false,
  });

  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const reqRef = useRef<number>(0);

  // Load Model
  useEffect(() => {
    const initModel = async () => {
      try {
        setIsLoadingModel(true);
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        landmarkerRef.current = poseLandmarker;
        setIsLoadingModel(false);
      } catch (e) {
        console.error("Failed to load MediaPipe model:", e);
        setIsLoadingModel(false);
      }
    };
    initModel();
  }, []);

  // Update refs when state changes
  useEffect(() => {
    stateRef.current.exercise = exercise;
  }, [exercise]);
  useEffect(() => {
    stateRef.current.isAnalyzing = isAnalyzing;
  }, [isAnalyzing]);

  // Clean up
  useEffect(() => {
    return () => {
      cancelAnimationFrame(reqRef.current);
      stopCamera();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const addFeedback = (msg: string) => {
    if (!stateRef.current.feedbacks.has(msg)) {
      stateRef.current.feedbacks.add(msg);
      setFeedbacks(Array.from(stateRef.current.feedbacks));
    }
  };
  const clearFeedback = () => {
    stateRef.current.feedbacks.clear();
    setFeedbacks([]);
  };
  const recordEvent = (msg: string) => {
    stateRef.current.events.push(msg);
  };

  const startCamera = async () => {
    setMode("camera");
    resetSession();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsAnalyzing(true);
        setSessionStartTime(Date.now());
        processVideo();
      }
    } catch (e) {
      console.error("Camera access denied", e);
      setMode(null);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMode("video");
      resetSession();
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        setIsAnalyzing(true);
        setSessionStartTime(Date.now());
        processVideo();
      }
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    cancelAnimationFrame(reqRef.current);
    if (mode === "camera") stopCamera();
    else if (videoRef.current) videoRef.current.pause();
    
    // Save session
    const durSecs = Math.floor((Date.now() - sessionStartTime) / 1000);
    const session: SessionRecord = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      exercise,
      reps: stateRef.current.reps,
      duration: durSecs,
      events: [...stateRef.current.events]
    };
    
    const existing = JSON.parse(localStorage.getItem('formCheckHistory') || '[]');
    localStorage.setItem('formCheckHistory', JSON.stringify([session, ...existing]));
    
    setLastSession(session);
    setMode(null);
  };

  const resetSession = () => {
    stateRef.current.reps = 0;
    stateRef.current.phase = "READY";
    stateRef.current.events = [];
    stateRef.current.feedbacks.clear();
    setReps(0);
    setPhase("READY");
    setFeedbacks([]);
    setPrimaryAngle(0);
  };

  const processVideo = () => {
    if (!stateRef.current.isAnalyzing || !videoRef.current || !canvasRef.current || !landmarkerRef.current) return;
    
    const video = videoRef.current;
    if (video.videoWidth === 0) {
      reqRef.current = requestAnimationFrame(processVideo);
      return;
    }

    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    let startTimeMs = performance.now();
    if (stateRef.current.lastTime === video.currentTime) {
      // frame didn't change
      reqRef.current = requestAnimationFrame(processVideo);
      return;
    }
    stateRef.current.lastTime = video.currentTime;

    const results = landmarkerRef.current.detectForVideo(video, startTimeMs);
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const drawingUtils = new DrawingUtils(ctx);
      
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: "#94a3b8", lineWidth: 2 });
      drawingUtils.drawLandmarks(landmarks, { color: "#ef4444", lineWidth: 1, radius: 3 });

      analyzeForm(landmarks);
    } else {
      addFeedback("Make sure your full body is visible.");
    }
    
    reqRef.current = requestAnimationFrame(processVideo);
  };

  const analyzeForm = (landmarks: NormalizedLandmark[]) => {
    const ex = stateRef.current.exercise;
    
    // MediaPipe pose indices
    // 11 left shoulder, 12 right shoulder
    // 13 left elbow, 14 right elbow
    // 15 left wrist, 16 right wrist
    // 23 left hip, 24 right hip
    // 25 left knee, 26 right knee
    // 27 left ankle, 28 right ankle

    const getLandmark = (idx: number) => {
      const l = landmarks[idx];
      return { x: l.x, y: l.y, vis: l.visibility || 0 };
    };

    if (ex === "Squat") {
      const hip = getLandmark(23); // using left side by default, could use average or best visibility
      const knee = getLandmark(25);
      const ankle = getLandmark(27);
      
      if (hip.vis < 0.5 || knee.vis < 0.5 || ankle.vis < 0.5) {
        addFeedback("Move into the camera frame.");
        return;
      }
      
      const angle = calculateAngle(hip, knee, ankle);
      setPrimaryAngle(Math.round(angle));
      
      const st = stateRef.current;
      if (st.phase === "READY" && angle < 140) {
        st.phase = "DESCENDING";
        st.depthReached = false;
        clearFeedback();
        addFeedback("✓ Controlled movement");
      } else if (st.phase === "DESCENDING" && angle < 100) {
        st.phase = "BOTTOM";
        st.depthReached = true;
        addFeedback("✓ Good squat depth");
      } else if ((st.phase === "BOTTOM" || st.phase === "DESCENDING") && angle > 120 && angle < 150) {
        st.phase = "ASCENDING";
        if (!st.depthReached) {
          addFeedback("⚠ Try to reach a little more depth");
        }
      } else if (st.phase === "ASCENDING" && angle > 160) {
        st.phase = "READY";
        st.reps += 1;
        setReps(st.reps);
        if (st.depthReached) {
          recordEvent("Squat met depth criterion");
        } else {
          recordEvent("Squat did NOT meet depth criterion");
        }
      }
      setPhase(st.phase);
    } 
    else if (ex === "Bicep Curl") {
      const shoulder = getLandmark(11);
      const elbow = getLandmark(13);
      const wrist = getLandmark(15);
      
      if (shoulder.vis < 0.5 || elbow.vis < 0.5 || wrist.vis < 0.5) {
        addFeedback("Make sure your full body is visible.");
        return;
      }
      
      const angle = calculateAngle(shoulder, elbow, wrist);
      setPrimaryAngle(Math.round(angle));
      
      const st = stateRef.current;
      if (st.phase === "READY" && angle < 130) {
        st.phase = "CURLING";
        clearFeedback();
      } else if (st.phase === "CURLING" && angle < 60) {
        st.phase = "CONTRACTED";
        addFeedback("✓ Full curl");
      } else if ((st.phase === "CONTRACTED" || st.phase === "CURLING") && angle > 90 && angle < 140) {
        st.phase = "LOWERING";
      } else if (st.phase === "LOWERING" && angle > 150) {
        st.phase = "READY";
        st.reps += 1;
        setReps(st.reps);
        recordEvent("Full curl completed");
      }
      setPhase(st.phase);
    }
    else if (ex === "Lateral Raise") {
      const hip = getLandmark(23);
      const shoulder = getLandmark(11);
      const elbow = getLandmark(13);
      
      if (hip.vis < 0.5 || shoulder.vis < 0.5 || elbow.vis < 0.5) {
        addFeedback("Move into the camera frame.");
        return;
      }
      
      const angle = calculateAngle(hip, shoulder, elbow);
      setPrimaryAngle(Math.round(angle));
      
      const st = stateRef.current;
      if (st.phase === "READY" && angle > 40) {
        st.phase = "RAISING";
        clearFeedback();
        addFeedback("✓ Good controlled raise");
      } else if (st.phase === "RAISING" && angle > 75) {
        st.phase = "SHOULDER LEVEL";
        if (angle > 105) {
          addFeedback("⚠ Avoid raising excessively above shoulder level");
        }
      } else if ((st.phase === "SHOULDER LEVEL" || st.phase === "RAISING") && angle < 60) {
        st.phase = "LOWERING";
      } else if (st.phase === "LOWERING" && angle < 30) {
        st.phase = "READY";
        st.reps += 1;
        setReps(st.reps);
        recordEvent("Lateral raise completed");
      }
      setPhase(st.phase);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      
      {/* Controls & Setup */}
      {!isAnalyzing && !lastSession && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6">
            <div className="w-full md:w-1/3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Select Exercise</label>
              <select 
                value={exercise} 
                onChange={(e) => setExercise(e.target.value as ExerciseType)}
                className="w-full bg-background border rounded-lg px-4 py-3 font-semibold text-lg"
              >
                <option value="Squat">Squat</option>
                <option value="Bicep Curl">Bicep Curl</option>
                <option value="Lateral Raise">Lateral Raise</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={startCamera} 
                disabled={isLoadingModel}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                {isLoadingModel ? "Loading Model..." : "USE CAMERA"}
              </button>
              
              <label className="flex items-center justify-center gap-2 bg-slate-800 text-slate-100 font-bold px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
                <Upload className="w-5 h-5" />
                UPLOAD VIDEO
                <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoUpload} />
              </label>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-5 border border-border">
            <h4 className="font-bold text-sm uppercase text-slate-500 mb-2">FOR BEST RESULTS</h4>
            <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
              <li>• Keep your body fully visible.</li>
              <li>• Place the camera far enough away.</li>
              <li>• Avoid loose clothing that hides joint positions.</li>
              <li>• Keep the camera stable.</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border/50">
              <span className="text-xs font-bold uppercase text-primary">Recommended View: </span>
              <span className="text-sm font-semibold ml-2">
                {exercise === 'Squat' ? 'SIDE VIEW' : exercise === 'Bicep Curl' ? 'FRONT or SIDE VIEW' : 'FRONT VIEW'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Pose analysis runs on your device when supported. Camera/video is used for form analysis and is not saved automatically.
          </div>
        </div>
      )}

      {/* Live Analysis */}
      {isAnalyzing && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 bg-slate-950 rounded-2xl overflow-hidden relative border shadow-lg aspect-video flex items-center justify-center">
            <div className="absolute top-4 left-4 z-20 bg-slate-900/80 px-3 py-1.5 rounded text-white font-bold tracking-widest text-xs uppercase backdrop-blur flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Camera
            </div>
            
            <button 
              onClick={stopAnalysis}
              className="absolute top-4 right-4 z-20 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold hover:bg-destructive/90 flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              STOP
            </button>

            <video 
              ref={videoRef} 
              className="w-full h-full object-contain absolute inset-0 z-0" 
              playsInline 
              muted 
              autoPlay 
            />
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain absolute inset-0 z-10 pointer-events-none" 
            />
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="bg-card border rounded-2xl p-6 shadow-sm text-center flex flex-col items-center justify-center">
              <span className="text-xs font-bold uppercase text-muted-foreground mb-1">Rep Count</span>
              <span className="text-7xl font-black text-primary leading-none">{String(reps).padStart(2, '0')}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border rounded-xl p-4 shadow-sm">
                <span className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Current Phase</span>
                <span className="font-bold text-sm tracking-tight">{phase}</span>
              </div>
              <div className="bg-card border rounded-xl p-4 shadow-sm">
                <span className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Primary Angle</span>
                <span className="font-bold text-sm tracking-tight">{primaryAngle}°</span>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-5 shadow-sm flex-1">
              <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-4 border-b pb-2">
                <ActivitySquare className="w-4 h-4" />
                Form Quality
              </span>
              <div className="flex flex-col gap-2">
                {feedbacks.length === 0 ? (
                  <span className="text-sm text-muted-foreground italic">Analyzing movement...</span>
                ) : (
                  feedbacks.map((f, i) => (
                    <div key={i} className={`text-sm font-semibold flex gap-2 p-2 rounded-md ${f.startsWith('✓') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'}`}>
                      {f}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Summary */}
      {!isAnalyzing && lastSession && (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-primary/10 p-6 border-b text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
            <h2 className="text-2xl font-black uppercase">Form Check Complete</h2>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-3 gap-6 mb-8 text-center divide-x">
              <div>
                <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Exercise</div>
                <div className="text-xl font-bold">{lastSession.exercise}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Reps Detected</div>
                <div className="text-xl font-bold text-primary">{lastSession.reps}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Session Duration</div>
                <div className="text-xl font-bold">{Math.floor(lastSession.duration / 60)}:{String(lastSession.duration % 60).padStart(2, '0')}</div>
              </div>
            </div>

            <div className="bg-muted/50 p-6 rounded-xl border">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2">
                <ActivitySquare className="w-4 h-4" /> Form Observations
              </h3>
              
              {lastSession.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No significant form events recorded during this short session.</p>
              ) : (
                <ul className="space-y-3">
                  {lastSession.exercise === 'Squat' && (
                    <>
                      {lastSession.events.filter(e => e.includes('met depth')).length > 0 && (
                        <li className="flex gap-3 text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                          ✓ {lastSession.events.filter(e => e === 'Squat met depth criterion').length} reps reached the configured depth criterion
                        </li>
                      )}
                      {lastSession.events.filter(e => e.includes('NOT')).length > 0 && (
                        <li className="flex gap-3 text-sm font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
                          ⚠ {lastSession.events.filter(e => e === 'Squat did NOT meet depth criterion').length} reps did not reach the configured depth criterion
                        </li>
                      )}
                    </>
                  )}
                  {lastSession.exercise !== 'Squat' && (
                    <li className="flex gap-3 text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                      ✓ Completed {lastSession.reps} proper repetitions
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button 
                onClick={() => setLastSession(null)}
                className="bg-slate-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-700 transition-colors"
              >
                START NEW CHECK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
