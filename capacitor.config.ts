
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.dbdcd1de3c0e4fe693c0976cfa2bf734',
  appName: 'holiday-home-guardian',
  webDir: 'dist',
  server: {
    url: 'https://dbdcd1de-3c0e-4fe6-93c0-976cfa2bf734.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
