# Appwrite Universal Sync Timer (Global Cron)

This folder contains the complete, production-ready Node.js background worker function to drive the **Universal Timer (Global Sync Timer)** system for the **SORAT** game.

## Overview
Because standard serverless cron engines are limited to a **minimum execution interval of 1 minute**, this function utilizes a high-precision, low-latency compensation pattern. Once invoked by the cron, the function runs a continuous, non-blocking 58-second cycle with 1-second ticks. Each tick updates the central Appwrite Database timer document, allowing all active web and mobile clients connected via Appwrite Realtime Subscriptions to stay perfectly synchronized.

## Backend Database Schema Configuration
Before deploying, make sure you have the following database structure created in your Appwrite console:

1. **Database ID**: `main` (or matching your `VITE_APPWRITE_DATABASE_ID` environment variable)
2. **Collection ID**: `timer_sync`
3. **Fields (Attributes)**:
   - `current_round` (Type: **String**, size: 255)
   - `time_left` (Type: **Integer**)
   - `status` (Type: **String**, size: 50, standard values: `'active'`, `'calculating'`)
4. **Permissions**:
   - **Role `any`**: Set **Read** permission to allow all active visitors and players to subscribe to the timer.
   - **Role `users`**: Set **Read** permission.
   - **Service/Admin API Key**: Full read/write permissions.

## Deployment Instructions

### Method 1: Deployment via Appwrite CLI
1. Initialize your Appwrite project in the root:
   ```bash
   appwrite init project
   ```
2. Create/Define the function in your `appwrite.json` settings:
   ```json
   "functions": [
     {
       "$id": "sorat-timer-sync",
       "name": "Sorat Global Sync Timer",
       "runtime": "node-18.0",
       "path": "appwrite-function/timer-sync",
       "entrypoint": "index.js",
       "execute": [],
       "schedule": "* * * * *",
       "timeout": 60
     }
   ]
   ```
3. Deploy the function code:
   ```bash
   appwrite deploy function
   ```

### Method 2: Manual Console Deployment
1. Navigate to your **Appwrite Console** -> **Functions** -> **Create Function**.
2. Select **Node.js** as the runtime.
3. Compress the contents of this `timer-sync` directory (including `index.js` and `package.json`) into a `.zip` file.
4. Upload the archive as the function source.
5. Set `index.js` as the Entrypoint.

---

## Configuration Variables
Inside the Appwrite Console, add the following environment variables to your function settings:

| Variable Name | Description | Example / Recommended |
|---|---|---|
| `APPWRITE_FUNCTION_API_KEY` | An Appwrite API Key with full database read/write permissions | *[Your Secret Key]* |
| `VITE_APPWRITE_DATABASE_ID` | The ID of your game database | `main` |
| `VITE_APPWRITE_TIMER_COLLECTION_ID`| The collection ID for the timer document | `timer_sync` |

## How the Cron Trigger Works
Under the **Settings** tab of your function in the Appwrite Console:
1. Locate **Schedule** (Cron).
2. Set the Cron string to: `* * * * *` (this instructs Appwrite to spin up the function at the beginning of every minute).
3. Set the function **Timeout** to `60` seconds.

The system is now fully automated!
- Every minute, the function wakes up, fetches the state, and runs a decrementing countdown loops for 58 seconds.
- Every client receives instantaneous real-time updates through Appwrite's WebSockets.
- If the countdown reaches zero, the function automatically increments the round ID, transitions the game status, and resets the timer!
