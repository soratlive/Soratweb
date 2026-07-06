@echo off
echo =========================================
echo Building Sorat Android APK (Windows)...
echo =========================================

:: 1. Install dependencies
echo Step 1: Installing dependencies...
call npm install

:: 2. Build the React web application
echo Step 2: Building React web app...
call npm run build

:: 3. Synchronize assets to native Android project
echo Step 3: Syncing web assets to Android project...
call npx cap sync

:: 4. Compile the APK
echo Step 4: Building native Android APK...
cd android
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
  echo =========================================
  echo SUCCESS! APK compiled successfully.
  echo You can find your APK file at:
  echo android\app\build\outputs\apk\debug\app-debug.apk
  echo =========================================
) else (
  echo =========================================
  echo ERROR: Failed to build native Android APK.
  echo Please make sure Android SDK and Java JDK are installed on your system.
  echo =========================================
)
pause
