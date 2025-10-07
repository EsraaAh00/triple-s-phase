import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Define __dirname for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Vercel-specific configuration to avoid rollup native module issues
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable manual chunks to avoid rollup issues
        format: 'es', // Use ES modules format
      },
      external: [], // Don't externalize any modules
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 2000,
    // Use esbuild for bundling instead of rollup
    lib: false,
  },
  base: '/',
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react',
      'react-dom',
      'react-router-dom',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: ['console', 'debugger'],
  },
  // Disable rollup optimizations that cause issues on Vercel
  ssr: {
    noExternal: ['@mui/material', '@emotion/react', '@emotion/styled'],
  },
})