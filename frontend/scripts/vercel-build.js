#!/usr/bin/env node

// Vercel build script to handle rollup native module issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Set environment variables to avoid rollup native module issues
  process.env.VITE_SKIP_ROLLUP_NATIVE = 'true';
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  
  // Run the build with the Vercel-specific config
  console.log('📦 Running Vite build...');
  execSync('npx vite build --config vite.config.vercel.final.js', {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VITE_SKIP_ROLLUP_NATIVE: 'true'
    }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
