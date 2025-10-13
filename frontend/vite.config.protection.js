// Vite Configuration for Code Protection
// Add this to your vite.config.js for additional protection

export const protectionConfig = {
  build: {
    // Minify code
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true, // Remove debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        toplevel: true, // Mangle top-level variable names
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Source maps - disable in production for security
    sourcemap: false,
  },
  // Disable in-browser console warnings in production
  esbuild: {
    drop: ['console', 'debugger'],
  },
};

// Instructions to add to vite.config.js:
/*
import { protectionConfig } from './vite.config.protection';

export default defineConfig({
  ...protectionConfig,
  // ... your other config
});
*/

