import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Sparkles, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import ChristmasTree from './ChristmasTree';
import PhotoWall from './PhotoWall';
import { useStore } from '../store';
import gsap from 'gsap';

const CameraController = () => {
    const { phase, activePhotoIndex } = useStore();
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { camera } = useThree();
    
    useFrame(() => {
        if (phase === 'tree') {
            // Orbit slowly or static cinematic view
            gsap.to(camera.position, { x: 0, y: 0, z: 18, duration: 2 });
            camera.lookAt(0, 0, 0);
        } else if (phase === 'blooming') {
            gsap.to(camera.position, { z: 25, duration: 2 });
        } else if (phase === 'nebula') {
            if (activePhotoIndex !== null) {
                 // Calculate position for specific photo focus
                 // Since photos rotate in a group, getting world position is tricky.
                 // Easier approach: Move camera close to ring edge
                 // But group rotates. 
                 // Strategy: Camera stays relative, let carousel stop? 
                 // For now, simple zoom in
                 gsap.to(camera.position, { y: 2, z: 10, duration: 1.5 });
            } else {
                gsap.to(camera.position, { x: 0, y: 8, z: 30, duration: 2 });
                camera.lookAt(0, 0, 0);
            }
        }
    });
    
    return null;
}

const SceneContent = () => {
    return (
        <>
            <CameraController />
            
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffaa00" /> {/* Warm */}
            <pointLight position={[-10, 0, -10]} intensity={0.5} color="#4444ff" /> {/* Cool */}
            <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" castShadow />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={500} scale={20} size={2} speed={0.4} opacity={0.5} color="#FFFFE0" />
            
            <Suspense fallback={null}>
               <Environment preset="city" /> 
               {/* Using 'city' as a proxy for Shanghai Bund reflection vibes if specific HDR not available */}
               <ChristmasTree />
               <PhotoWall />
            </Suspense>

            <EffectComposer enableNormalPass={false}>
                <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </>
    );
};

const Scene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={50} />
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default Scene;