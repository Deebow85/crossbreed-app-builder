# Building an APK for Crossbreed App

## Prerequisites

1. **Android SDK** - You need to have Android SDK installed on your system
2. **Java Development Kit (JDK)** - Version 11 or newer is recommended
3. **Node.js and npm** - Already installed in your project

## Setting Up Android SDK

1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, make sure to select the option to install Android SDK
3. After installation, set up the environment variables:
   - Set `ANDROID_HOME` to your Android SDK location (typically `C:\Users\YourUsername\AppData\Local\Android\Sdk` on Windows)
   - Add `%ANDROID_HOME%\platform-tools` to your PATH

## Building the APK

Once you have the prerequisites installed and configured, follow these steps:

1. **Build the web app**:
   ```
   npm run build
   ```

2. **Add Android platform** (if not already added):
   ```
   npx @capacitor/cli add android
   ```

3. **Sync the web app with Android**:
   ```
   npx @capacitor/cli sync android
   ```

4. **Open the Android project in Android Studio**:
   ```
   npx @capacitor/cli open android
   ```

5. **Build the APK in Android Studio**:
   - In Android Studio, go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`
   - Wait for the build to complete
   - You'll get a notification with a link to the APK file location

## Alternative: Command Line Build

If you prefer using the command line, after setting up the Android SDK:

1. Navigate to the Android directory:
   ```
   cd android
   ```

2. Run the Gradle build command:
   ```
   ./gradlew assembleDebug
   ```

3. The APK will be generated at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Distributing the APK

Once you have the APK file, you can:

1. Transfer it to Android devices via USB, email, or file sharing services
2. Install it directly on Android devices by opening the APK file
3. Note that users may need to enable "Install from Unknown Sources" in their device settings

## Troubleshooting

- If you encounter `SDK location not found` error, make sure your ANDROID_HOME environment variable is correctly set
- If Gradle sync fails, try updating Gradle in Android Studio
- For signing issues, you may need to create a keystore file for release builds

## Current Project Status

The project has been configured for APK generation with:
- Updated capacitor.config.ts with proper app ID and name
- Web app built and ready for packaging
- Android platform added to the project

The only remaining step is to complete the build process with properly configured Android SDK.