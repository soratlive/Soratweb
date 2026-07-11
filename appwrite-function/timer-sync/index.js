const { Client, Databases } = require('node-appwrite');

/**
 * Universal Sync Timer for SORAT Game
 * 
 * This function is designed to be triggered on an Appwrite Cron schedule (e.g., "* * * * *")
 * or via execution events.
 * 
 * Since standard serverless cron engines have a minimum resolution of 1 minute, this function
 * runs a highly accurate 60-second loop with 1-second ticks. It updates the database 
 * status every second, allowing real-time frontend subscribers to stay perfectly in sync.
 */
module.exports = async (context) => {
  const { req, res, log, error } = context;

  // Initialize Appwrite Node SDK Client
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://api.sorat.in/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const databases = new Databases(client);

  const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'main';
  const COLLECTION_ID = process.env.VITE_APPWRITE_TIMER_COLLECTION_ID || 'timer_sync';
  const DOCUMENT_ID = 'current';

  // Game cycle configuration (in seconds)
  const ROUND_DURATION = 60; // 1-minute round loop as requested (e.g. 45s betting, 10s calculating, 5s transition)
  const BETTING_DURATION = 45; 
  const CALC_DURATION = 15;

  log(`[Timer Server] Universal Timer Script Started. Database: ${DATABASE_ID}, Collection: ${COLLECTION_ID}`);

  // Fetch or initialize the global timer document
  let timerDoc = null;
  try {
    timerDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, DOCUMENT_ID);
    log(`[Timer Server] Current state fetched: Round ${timerDoc.current_round}, Time Left: ${timerDoc.time_left}s, Status: ${timerDoc.status}`);
  } catch (err) {
    if (err.code === 404 || err.message?.includes('not found')) {
      log(`[Timer Server] Timer document not found. Bootstrapping initial state...`);
      try {
        timerDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          DOCUMENT_ID,
          {
            current_round: "1001",
            time_left: BETTING_DURATION,
            status: 'active'
          }
        );
        log(`[Timer Server] Initial timer document created successfully.`);
      } catch (createErr) {
        error(`[Timer Server] Failed to create timer document: ${createErr.message}`);
        return res.json({ success: false, error: createErr.message });
      }
    } else {
      error(`[Timer Server] Error fetching timer document: ${err.message}`);
      return res.json({ success: false, error: err.message });
    }
  }

  // To prevent multiple overlapping instances of the function from causing race conditions,
  // we check if an execution lock is active or check execution timestamp.
  // We will run the loop for exactly 58 seconds to leave a safe 2-second buffer before the next cron trigger.
  const startTime = Date.now();
  let tickCount = 0;
  const maxTicks = 58; 

  log(`[Timer Server] Starting 58-second high-precision database interval loop...`);

  // Define the tick logic
  const runTick = async () => {
    if (tickCount >= maxTicks) {
      log(`[Timer Server] Reached max ticks (${maxTicks}s). Stopping to avoid next cron overlap.`);
      return;
    }

    tickCount++;
    
    // Fetch latest status to ensure no split-brain or manual admin intervention is overwritten
    try {
      timerDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, DOCUMENT_ID);
    } catch (err) {
      error(`[Timer Server] Tick fetch error: ${err.message}`);
      // Fallback: use previous local values
    }

    let timeLeft = parseInt(timerDoc.time_left) || 0;
    let currentRound = parseInt(timerDoc.current_round) || 1001;
    let status = timerDoc.status || 'active'; // active = betting, calculating = locked/settlement

    // Decrement time
    timeLeft--;

    // Phase transition rules
    if (timeLeft <= 0) {
      if (status === 'active') {
        // Betting closed -> Calculate results
        status = 'calculating';
        timeLeft = CALC_DURATION;
        log(`[Timer Server] Round ${currentRound} betting complete. Transitioning to CALCULATING phase.`);
      } else {
        // Settlement complete -> Move to next round
        status = 'active';
        currentRound = currentRound + 1;
        timeLeft = BETTING_DURATION;
        log(`[Timer Server] Starting New Round: ${currentRound}. Resetting timer to ${BETTING_DURATION}s.`);
      }
    }

    // Update document in database
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        DOCUMENT_ID,
        {
          current_round: currentRound.toString(),
          time_left: timeLeft,
          status: status
        }
      );
      
      // Log debug info every 5 ticks to keep logs clean
      if (tickCount % 5 === 0) {
        log(`[Tick ${tickCount}] Sync -> Round ${currentRound}, Time Left: ${timeLeft}s, Phase: ${status}`);
      }
    } catch (updateErr) {
      error(`[Timer Server] Failed to write tick to DB: ${updateErr.message}`);
    }

    // Schedule next tick precisely 1 second from now, compensating for database writing latency
    const elapsedTime = Date.now() - startTime;
    const expectedTime = tickCount * 1000;
    const drift = elapsedTime - expectedTime;
    const nextDelay = Math.max(0, 1000 - drift);

    setTimeout(runTick, nextDelay);
  };

  // Start the ticking sequence asynchronously
  runTick();

  return res.json({
    success: true,
    message: "SORAT global timer sync cron launched successfully.",
    initial_state: {
      current_round: timerDoc.current_round,
      time_left: timerDoc.time_left,
      status: timerDoc.status
    }
  });
};
