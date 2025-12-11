import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { InstancedMesh, Vector3, Object3D, Color, AdditiveBlending } from 'three';
import { useStore } from '../store';
import { generateTreeCoordinates, generateNebulaCoordinates } from '../utils/geometry';
import { ORNAMENT_COLORS, AUDIO_RECORDINGS } from '../constants';
import gsap from 'gsap';

const COUNT = 8000;
const tempObject = new Object3D();
const tempVec = new Vector3();
const tempColor = new Color();

const ChristmasTree: React.FC = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const { phase, setPhase, gesture } = useStore();
  const { pointer, camera } = useThree();
  
  // Audio handling for recording orbs
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  // Generate coordinate sets
  const treeCoords = useMemo(() => generateTreeCoordinates(COUNT), []);
  const nebulaCoords = useMemo(() => generateNebulaCoordinates(COUNT), []);
  const colors = useMemo(() => {
     const c = new Float32Array(COUNT * 3);
     for(let i=0; i<COUNT; i++) {
        // Mostly green, some variations
        tempColor.setHSL(Math.random() * 0.1 + 0.3, 0.8, Math.random() * 0.4 + 0.1);
        c[i*3] = tempColor.r;
        c[i*3+1] = tempColor.g;
        c[i*3+2] = tempColor.b;
     }
     return c;
  }, []);

  // Animation progress refs
  const progressRef = useRef(0); // 0 = Tree, 1 = Nebula
  const explodeRef = useRef(0); // 0 = Normal, 1 = Exploded

  // Handle Phase Transitions via GSAP
  useEffect(() => {
    if (phase === 'blooming') {
      gsap.to(explodeRef, { current: 1, duration: 2, ease: "power2.out", onComplete: () => setPhase('nebula') });
    } else if (phase === 'nebula') {
      gsap.to(explodeRef, { current: 0, duration: 1 }); // settle down
      gsap.to(progressRef, { current: 1, duration: 3, ease: "power2.inOut" });
    } else if (phase === 'collapsing') {
      gsap.to(progressRef, { current: 0, duration: 3, ease: "power3.inOut", onComplete: () => setPhase('tree') });
    }
  }, [phase, setPhase]);

  // Interaction with gestures
  useEffect(() => {
      if(phase === 'tree' && gesture === 'Open_Palm') {
          setPhase('blooming');
      }
      if(phase === 'nebula' && gesture === 'Closed_Fist') {
          setPhase('collapsing');
      }
  }, [gesture, phase, setPhase]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const progress = progressRef.current;
    const explosion = explodeRef.current;
    
    // Mouse Interaction Plane
    // Project mouse to a plane at z=0 for simple repulsion logic approximation
    const mouseVec = new Vector3(pointer.x * 10, pointer.y * 10, 0); 
    if(phase === 'tree') {
        // Adjust mouse vec for camera distance approx if needed, 
        // strictly simpler to use unproject or standard pointer ray
        mouseVec.set(pointer.x * 10, pointer.y * 10, 2); 
    }

    for (let i = 0; i < COUNT; i++) {
      // Get base positions
      const tx = treeCoords[i * 3];
      const ty = treeCoords[i * 3 + 1];
      const tz = treeCoords[i * 3 + 2];

      const nx = nebulaCoords[i * 3];
      const ny = nebulaCoords[i * 3 + 1];
      const nz = nebulaCoords[i * 3 + 2];

      // Interpolate
      let x = tx + (nx - tx) * progress;
      let y = ty + (ny - ty) * progress;
      let z = tz + (nz - tz) * progress;

      // Explosion Effect
      if (explosion > 0.01) {
          const dir = tempVec.set(x, y, z).normalize();
          x += dir.x * explosion * 20;
          y += dir.y * explosion * 20;
          z += dir.z * explosion * 20;
      }

      // Movement / Breathing
      if (phase === 'tree') {
          y += Math.sin(time + x) * 0.1;
      } else if (phase === 'nebula') {
          // Rotate nebula
          const angle = time * 0.05;
          const rx = x * Math.cos(angle) - z * Math.sin(angle);
          const rz = x * Math.sin(angle) + z * Math.cos(angle);
          x = rx;
          z = rz;
      }

      // Repulsion (Water Ripple) - Only in Tree phase or Settled Nebula
      if (phase === 'tree' || (phase === 'nebula' && explosion < 0.1)) {
          tempVec.set(x, y, z);
          const dist = tempVec.distanceTo(mouseVec);
          if (dist < 3) {
              const force = (3 - dist) * 1.5;
              const angle = Math.atan2(y - mouseVec.y, x - mouseVec.x);
              x += Math.cos(angle) * force;
              y += Math.sin(angle) * force;
          }
      }

      tempObject.position.set(x, y, z);
      
      // Scale particles based on phase
      const scale = (Math.sin(time * 2 + i) * 0.5 + 1) * (phase === 'nebula' ? 0.05 : 0.08);
      tempObject.scale.setScalar(scale);
      
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </instancedMesh>
      
      {/* Ornaments - only visible in Tree phase mainly, but transition nicely */}
      <Ornaments progress={progressRef} explosion={explodeRef} playAudio={(idx) => {
          if(activeAudio) activeAudio.pause();
          const audio = new Audio(AUDIO_RECORDINGS[idx % AUDIO_RECORDINGS.length]);
          audio.play();
          setActiveAudio(audio);
      }} />

      {/* Star at top */}
      <mesh position={[0, 6.5, 0]} scale={progressRef.current < 0.5 ? 1 - explodeRef.current : 0}>
         <octahedronGeometry args={[0.8, 0]} />
         <meshStandardMaterial emissive="#FFD700" emissiveIntensity={2} color="#FFD700" />
      </mesh>
    </group>
  );
};

// Sub-component for Ornaments
const Ornaments = ({ progress, explosion, playAudio }: { progress: React.MutableRefObject<number>, explosion: React.MutableRefObject<number>, playAudio: (i: number) => void }) => {
    const ornaments = useMemo(() => {
        const arr = [];
        const count = 40;
        for(let i=0; i<count; i++) {
            const t = i / count;
            const h = 12;
            const y = t * h - h/2;
            const r = 4.5 * (1 - t);
            const theta = t * Math.PI * 15;
            arr.push({ 
                pos: new Vector3(r * Math.cos(theta), y, r * Math.sin(theta)),
                color: ORNAMENT_COLORS[i % ORNAMENT_COLORS.length],
                isAudio: i % 10 === 0 // Every 10th is an audio orb
            });
        }
        return arr;
    }, []);

    const meshRefs = useRef<(Object3D | null)[]>([]);

    useFrame((state) => {
       const p = progress.current;
       const e = explosion.current;
       const time = state.clock.getElapsedTime();

       ornaments.forEach((o, i) => {
           const ref = meshRefs.current[i];
           if(!ref) return;

           // Interpolate to nebula positions (random scattered for ornaments in nebula)
           // Simplified: Ornaments explode and disappear or join the ring
           // Let's make them float out
           
           let { x, y, z } = o.pos;
           
           // Explosion logic
           if (e > 0) {
              const dir = o.pos.clone().normalize();
              x += dir.x * e * 30;
              y += dir.y * e * 30;
              z += dir.z * e * 30;
           }

           // Fade out in nebula
           ref.scale.setScalar((1 - p) * 0.4);
           ref.position.set(x, y, z);
           ref.rotation.y = time;
       });
    });

    return (
        <group>
            {ornaments.map((o, i) => (
                <mesh 
                    key={i} 
                    ref={el => meshRefs.current[i] = el}
                    position={o.pos}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (o.isAudio && progress.current < 0.1) playAudio(i);
                    }}
                >
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial 
                        color={o.color} 
                        roughness={0.2} 
                        metalness={0.8}
                        emissive={o.isAudio ? o.color : '#000000'}
                        emissiveIntensity={o.isAudio ? 0.5 : 0}
                    />
                    {o.isAudio && (
                        <pointLight distance={3} intensity={2} color={o.color} />
                    )}
                </mesh>
            ))}
        </group>
    );
};

export default ChristmasTree;
