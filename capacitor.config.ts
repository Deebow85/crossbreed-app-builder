
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.crossbreed',
  appName: 'Crossbreed App',
  webDir: 'dist',
  // Removing server config to use bundled web assets instead of remote URL
  bundledWebRuntime: false,
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  }
};

export default config;
