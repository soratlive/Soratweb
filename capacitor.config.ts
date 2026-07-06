import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sorat.game',
  appName: 'Sorat',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
