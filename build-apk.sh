#!/bin/bash
# Helper script to build the Android APK locally for production-ready app

echo "========================================="
echo "Building Sorat Android APK..."
echo "========================================="

# 1. Install dependencies
echo "Step 1: Installing dependencies..."
npm install

# 2. Generate production export build
echo "Step 2: Generating production export build..."
npm run static

# 3. Synchronize assets to native Android project
echo "Step 3: Syncing web assets to Android wrapper..."
npx cap sync android

# 4. Compile the APK (if local android directory is set up)
if [ -d "android" ]; then
  echo "Step 4: Building native Android APK..."
  cd android
  ./gradlew assembleDebug

  if [ $? -eq 0 ]; then
    echo "========================================="
    echo "SUCCESS! APK compiled successfully."
    echo "You can find your APK file at:"
    echo "android/app/build/outputs/apk/debug/app-debug.apk"
    echo "========================================="
  else
    echo "========================================="
    echo "ERROR: Failed to build native Android APK."
    echo "Please make sure Android SDK and Java JDK are installed on your system."
    echo "========================================="
  fi
else
  echo "========================================="
  echo "CAPACITOR SYNC COMPLETED."
  echo "To build the APK, run 'npx cap open android' to open in Android Studio and build."
  echo "========================================="
fi
