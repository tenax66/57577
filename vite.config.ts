import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: true,
    outDir: './pages',
    rollupOptions: {
      plugins: [visualizer()],
      output: {
        manualChunks: id => {
          if (id.includes('node_modules')) {
            if (id.includes('markdown') || id.includes('micromark')) {
              return 'markdown';
            } else {
              return 'vendor'; // all other package goes here
            }
          }
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
    },
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
  plugins: [react()],
  assetsInclude: ['**/*.md'],
});
