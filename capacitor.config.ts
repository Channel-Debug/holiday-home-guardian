
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.dbdcd1de3c0e4fe693c0976cfa2bf734',
  appName: 'MonHoliday Guardian',
  webDir: 'dist',
  server: {
    url: 'https://dbdcd1de-3c0e-4fe6-93c0-976cfa2bf734.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#2563eb",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#2563eb"
    },
    Keyboard: {
      resize: "ionic"
    }
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: "automatic"
  }
};

export default config;
