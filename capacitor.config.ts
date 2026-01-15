import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.omnicore.app',
  appName: 'OmniCoreAI',
  server: {
    url: 'https://studio-drg3.vercel.app',
    cleartext: false
  }
};

export default config;
