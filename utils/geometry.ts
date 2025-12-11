import * as THREE from 'three';

// Tree Parameters
const TREE_HEIGHT = 12;
const TREE_RADIUS = 4.5;
const TREE_DENSITY = 8000;

// Nebula Parameters
const NEBULA_RADIUS = 12;
const NEBULA_TUBE = 3;

export function generateTreeCoordinates(count: number) {
  const positions: Float32Array = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Cone distribution
    const y = Math.random() * TREE_HEIGHT; // 0 to Height
    const relativeY = y / TREE_HEIGHT;
    const radiusAtY = TREE_RADIUS * (1 - relativeY);
    const theta = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radiusAtY;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    // Shift y down so tree is centered vertically
    positions[i * 3] = x;
    positions[i * 3 + 1] = y - TREE_HEIGHT / 2;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

export function generateNebulaCoordinates(count: number) {
  const positions: Float32Array = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Torus distribution
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    
    const x = (NEBULA_RADIUS + NEBULA_TUBE * Math.cos(v)) * Math.cos(u);
    const z = (NEBULA_RADIUS + NEBULA_TUBE * Math.cos(v)) * Math.sin(u);
    const y = NEBULA_TUBE * Math.sin(v);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

export function generateOrnamentPositions(count: number) {
    const coords = [];
    // Spiral distribution on cone surface
    for(let i=0; i<count; i++) {
        const t = i / count;
        const y = t * TREE_HEIGHT - TREE_HEIGHT/2;
        const radius = TREE_RADIUS * (1 - t);
        const theta = t * Math.PI * 20; // 10 turns
        
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        coords.push(new THREE.Vector3(x, y, z));
    }
    return coords;
}
