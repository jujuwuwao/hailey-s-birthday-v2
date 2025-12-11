import { create } from 'zustand';
import { AppState } from './types';

export const useStore = create<AppState>((set) => ({
  phase: 'tree',
  setPhase: (phase) => set({ phase }),
  gesture: 'None',
  setGesture: (gesture) => set({ gesture }),
  cameraEnabled: false,
  setCameraEnabled: (enabled) => set({ cameraEnabled: enabled }),
  audioPlaying: false,
  setAudioPlaying: (playing) => set({ audioPlaying: playing }),
  activePhotoIndex: null,
  setActivePhotoIndex: (index) => set({ activePhotoIndex: index }),
}));
