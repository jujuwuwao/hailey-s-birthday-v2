import React, { useRef, useLayoutEffect, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import { DoubleSide, Vector3, Group, Mesh, Texture } from 'three';
import { useStore } from '../store';
import { FULL_PHOTO_LIST } from '../constants';
import gsap from 'gsap';

const RADIUS = 14;

const PhotoItem = ({ url, index, total, setHovered }: any) => {
    const texture = useTexture(url) as Texture;
    const groupRef = useRef<Group>(null);
    const meshRef = useRef<Mesh>(null);
    const { phase, gesture, activePhotoIndex, setActivePhotoIndex } = useStore();
    const [isLandscape, setIsLandscape] = useState(false);
    
    // Auto-orient
    useLayoutEffect(() => {
        if(texture.image) {
            const img = texture.image as HTMLImageElement;
            setIsLandscape(img.width > img.height);
        }
    }, [texture]);

    // Position in ring
    const angle = (index / total) * Math.PI * 2;
    const basePos = new Vector3(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
    
    useFrame((state) => {
        if(!groupRef.current) return;
        
        // Only visible/active in Nebula phase
        if (phase !== 'nebula') {
            groupRef.current.visible = false;
            return;
        }
        groupRef.current.visible = true;

        const isFocused = activePhotoIndex === index;
        
        // Rotation for carousel
        // Access global rotation if needed, or rotate group parent. 
        // Here we keep local relative to parent group.
        
        // Look at center
        groupRef.current.lookAt(0, 0, 0);
        
        // Floating animation
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime + index) * 0.5;

        // Focus animation (zoom in if clicked)
        if (isFocused) {
            // Logic handled by CameraController mostly, but we can scale up slightly
            groupRef.current.scale.lerp(new Vector3(1.5, 1.5, 1.5), 0.1);
        } else {
            groupRef.current.scale.lerp(new Vector3(1, 1, 1), 0.1);
        }
    });

    return (
        <group 
            ref={groupRef} 
            position={basePos} 
            onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex(index === activePhotoIndex ? null : index);
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Polaroid Frame */}
            <mesh rotation={[0, Math.PI, 0]}> {/* Face center */}
                <boxGeometry args={[isLandscape ? 4 : 3, isLandscape ? 3.5 : 4, 0.1]} />
                <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
            {/* Photo */}
            <mesh position={[0, 0.06, 0.2]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[isLandscape ? 3.6 : 2.6, isLandscape ? 2.6 : 2.6]} />
                <meshBasicMaterial map={texture} side={DoubleSide} />
            </mesh>
        </group>
    );
};

const PhotoWall: React.FC = () => {
    const groupRef = useRef<Group>(null);
    const { phase, gesture, activePhotoIndex } = useStore();
    const [hovered, setHovered] = useState(false);
    const rotationVelocity = useRef(0);

    // Load textures efficiently? 
    // R3F useTexture suspends, so wrap in Suspense in Scene.
    
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        
        if (phase === 'nebula') {
            // Gesture Control: Open Palm to rotate
            if (activePhotoIndex === null) {
                // Determine direction based on hand position relative to center of screen?
                // Simplified: Continuous rotation if gesture detected
                if (gesture === 'Open_Palm') {
                    rotationVelocity.current = gsap.utils.interpolate(rotationVelocity.current, 0.5, 0.05);
                } else {
                    rotationVelocity.current = gsap.utils.interpolate(rotationVelocity.current, 0.05, 0.02); // idling
                }
                
                groupRef.current.rotation.y += rotationVelocity.current * delta;
            }
        } else {
            // Hide or shrink
            groupRef.current.scale.lerp(new Vector3(0,0,0), 0.1);
        }
        
        if(phase === 'nebula') {
             groupRef.current.scale.lerp(new Vector3(1,1,1), 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            {FULL_PHOTO_LIST.map((url, i) => (
                <PhotoItem 
                    key={i} 
                    url={url} 
                    index={i} 
                    total={FULL_PHOTO_LIST.length} 
                    setHovered={setHovered}
                />
            ))}
        </group>
    );
};

export default PhotoWall;