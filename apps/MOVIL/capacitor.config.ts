import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.riaar.app',
  appName: 'RiaarApp',
  webDir: 'dist',     // <<--- aquí el cambio
  bundledWebRuntime: false
};

export default config;
