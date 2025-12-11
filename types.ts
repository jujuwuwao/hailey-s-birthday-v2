export type Phase = 'tree' | 'blooming' | 'nebula' | 'collapsing';

export type GestureType = 'None' | 'Open_Palm' | 'Closed_Fist' | 'Pointing_Up';

export interface AppState {
  phase: Phase;
  setPhase: (phase: Phase) => void;
  gesture: GestureType;
  setGesture: (gesture: GestureType) => void;
  cameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;
  audioPlaying: boolean;
  setAudioPlaying: (playing: boolean) => void;
  activePhotoIndex: number | null;
  setActivePhotoIndex: (index: number | null) => void;
}

export interface ParticleData {
  position: [number, number, number];
  color: string;
  size: number;
}
