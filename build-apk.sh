#!/bin/bash
# Helper script to build the Android APK locally

echo "========================================="
echo "Building Sorat Android APK..."
echo "========================================="

# 1. Install dependencies
echo "Step 1: Installing dependencies..."
npm install

# 2. Build the React web application
echo "Step 2: Building React web app..."
npm run build

# 3. Synchronize assets to native Android project
echo "Step 3: Syncing web assets to Android project..."
npx cap sync

# 4. Compile the APK
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
