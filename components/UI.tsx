import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import HandTracker from './HandTracker';
import { BGM_URL } from '../constants';

const UI: React.FC = () => {
  const { 
      phase, 
      gesture, 
      cameraEnabled, 
      setCameraEnabled, 
      audioPlaying, 
      setAudioPlaying 
  } = useStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
      if(audioRef.current) {
          if(audioPlaying) {
              audioRef.current.play().catch(e => console.log("Interaction needed first"));
          } else {
              audioRef.current.pause();
          }
      }
  }, [audioPlaying]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
      <audio ref={audioRef} src={BGM_URL} loop />

      {/* Header / Status */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="glass-panel p-4 rounded-xl text-white backdrop-blur-md bg-white/10 border border-white/20">
            <h3 className="text-xs font-bold tracking-widest uppercase opacity-70 mb-1">Status</h3>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cameraEnabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-sm font-mono">{phase.toUpperCase()}</span>
            </div>
            <div className="mt-2 text-xs opacity-80">
                Gesture: <span className="font-bold text-yellow-300">{gesture}</span>
            </div>
            <div className="mt-2 text-[10px] text-gray-300 max-w-[150px]">
                {phase === 'tree' && "Tips: Hover to scatter. Show 'Open Palm' to bloom."}
                {phase === 'nebula' && "Tips: 'Open Palm' to rotate. 'Closed Fist' to reset."}
            </div>
        </div>

        {/* Camera Preview */}
        <div className="relative w-32 h-24 sm:w-48 sm:h-36 glass-panel rounded-xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 shadow-lg transition-all duration-300">
            {cameraEnabled ? (
                <HandTracker />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-xs text-center p-2">
                    Camera Off
                </div>
            )}
            <button 
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className="absolute bottom-2 right-2 px-2 py-1 bg-white/20 hover:bg-white/40 text-[10px] text-white rounded transition-colors pointer-events-auto"
            >
                {cameraEnabled ? 'STOP' : 'START'} CAM
            </button>
        </div>
      </div>

      {/* Center Title */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-20">
          <h1 className="font-cursive text-6xl md:text-9xl text-yellow-200 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] animate-pulse">
              Merry Christmas
          </h1>
          <h2 className="font-cursive text-4xl md:text-7xl text-white mt-4 drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
              & Happy Birthday
          </h2>
      </div>

      {/* Footer / Music Player */}
      <div className="w-full flex justify-center pointer-events-auto">
          <div className="glass-panel backdrop-blur-xl bg-black/40 border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 text-white shadow-2xl">
                <button 
                    onClick={() => setAudioPlaying(!audioPlaying)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/30"
                >
                    {audioPlaying ? (
                        <span className="animate-spin text-xl">❄️</span>
                    ) : (
                        <span className="text-xl pl-1">▶</span>
                    )}
                </button>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Now Playing</span>
                    <div className="w-40 overflow-hidden whitespace-nowrap mask-gradient">
                        <p className={`text-sm font-light ${audioPlaying ? 'animate-marquee' : ''}`}>
                             Merry Christmas Mr. Lawrence - Ryuichi Sakamoto
                        </p>
                    </div>
                </div>
                {/* Visualizer bars (fake) */}
                <div className="flex gap-1 h-4 items-end">
                    {[1,2,3,4].map(i => (
                        <div key={i} className={`w-1 bg-yellow-200/80 rounded-t ${audioPlaying ? 'animate-music-bar' : 'h-1'}`} style={{animationDelay: `${i*0.1}s`}} />
                    ))}
                </div>
          </div>
      </div>

      <style>{`
        .font-cursive { font-family: 'Great Vibes', cursive; }
        .animate-marquee { display: inline-block; padding-left: 100%; animation: marquee 10s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        @keyframes music-bar { 0%, 100% { height: 20%; } 50% { height: 100%; } }
        .animate-music-bar { animation: music-bar 0.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default UI;