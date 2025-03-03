
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: process.env.APP_ID || 'app.lovable.29ba2954667b4ebd9b92e8e6252aa0d3', // Set a default if env variable is not set
  appName: process.env.APP_NAME || 'crossbreed-app-builder', // Default name
  webDir: process.env.WEB_DIR || 'dist',  // Default webDir
  server: {
    url: process.env.SERVER_URL || 'https://29ba2954-667b-4ebd-9b92-e8e6252aa0d3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
