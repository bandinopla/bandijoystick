import { defineConfig } from 'vite';
import path from 'path';
import version from './src/utils/module_version';
import tsconfigPaths from 'vite-tsconfig-paths'


export default defineConfig({
  plugins: [version(), tsconfigPaths()], 
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  }, 
});
