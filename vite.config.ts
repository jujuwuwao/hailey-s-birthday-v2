import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  base: "/hailey-s-birthday-v2/",   // ⭐ 关键
  plugins: [react()],
});
