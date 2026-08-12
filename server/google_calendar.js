const express = require("express");
const router = express.Router();

const FIREBASE_DB_URL = (
  process.env.FIREBASE_DATABASE_URL ||
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://vintexair-f074c-default-rtdb.firebaseio.com"
).replace(/\/$/, "");

const FIREBASE_DB_SECRET = process.env.FIREBASE_DB_SECRET || process.env.FIREBASE_DATABASE_SECRET || "";

/**
 * Firebase Realtime Database REST API Helper
 */
async function firebaseDb(path, method = "GET", body = null) {
  try {
    const authQuery = FIREBASE_DB_SECRET ? `?auth=${encodeURIComponent(FIREBASE_DB_SECRET)}` : "";
    const url = `${FIREBASE_DB_URL}/${path}.json${authQuery}`;
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`[Google Calendar] Firebase DB Error ${res.status} (${res.statusText}) on ${path}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("[Google Calendar] Firebase DB Exception:", err);
    return null;
  }
}

/**
 * Helper to Get Static Configured Google Meet / Strategy Call Link
 */
async function createUniqueGoogleMeetEvent({ fullName, email, dateStr, timeStr, hostEmail } = {}) {
  try {
    const config = (await firebaseDb("whatsapp_configuration/firstoptionagency")) || {};
    const staticUrl =
      config.defaultMeetingUrl ||
      process.env.STATIC_GOOGLE_MEET_URL ||
      process.env.DEFAULT_MEETING_URL ||
      "https://meet.google.com/firstoption-strategy-call";

    console.log(`[Static Google Meet 🎥] Returning saved static Meet link for ${fullName || "Client"}: ${staticUrl}`);
    return staticUrl;
  } catch (err) {
    console.error("[Static Google Meet Exception]:", err);
    return process.env.STATIC_GOOGLE_MEET_URL || "https://meet.google.com/firstoption-strategy-call";
  }
}

/* ==========================================================================
   REST ENDPOINTS FOR STATIC GOOGLE MEET CONFIGURATION
   ========================================================================== */

/**
 * GET /api/google/auth-url
 * Returns Static Google Meet mode status
 */
router.get("/auth-url", (req, res) => {
  return res.status(200).json({
    success: true,
    mode: "static",
    message: "Static Google Meet URL mode active. Configure meeting link in Manager settings.",
  });
});

/**
 * GET /api/google/callback
 * Handles OAuth callback cleanly for static URL mode
 */
router.get("/callback", async (req, res) => {
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Static Google Meet Mode Active</title>
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    </head>
    <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center font-sans p-4">
      <div class="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div class="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-3xl font-extrabold flex items-center justify-center mx-auto">
          🎥
        </div>
        <h2 class="text-xl font-black text-white">Static Google Meet Link Active</h2>
        <p class="text-xs text-slate-300">
          Your saved static Google Meet URL is automatically dispatched for all strategy calls & notifications.
        </p>
        <div class="pt-2">
          <button onclick="window.close(); if(window.opener) window.opener.location.reload();" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer">
            Return to Manager Dashboard
          </button>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * POST /api/google/connect-oauth
 * Saves Static Google Meet Account / Room details into Firebase RTDB
 */
router.post("/connect-oauth", async (req, res) => {
  try {
    const { name, email, meetingUrl } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: "Name and email are required" });
    }

    const accId = `meet_static_${Date.now()}`;
    const payload = {
      id: accId,
      name: name.trim(),
      email: email.trim(),
      type: "static_meet",
      meetingUrl: meetingUrl || "https://meet.google.com/firstoption-strategy-call",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await firebaseDb(`google_meet_integrations/global/${accId}`, "PUT", payload);
    await firebaseDb(`google_meet_integrations/firstoptionagency/${accId}`, "PUT", payload);

    return res.status(200).json({ success: true, message: "Static Google Meet link configured", data: payload });
  } catch (err) {
    console.error("Connect Static Meet Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/google/generate-meet-link
 * Returns configured static Google Meet link
 */
router.post("/generate-meet-link", async (req, res) => {
  try {
    const { fullName, email, dateStr, timeStr, hostEmail } = req.body;
    const staticUrl = await createUniqueGoogleMeetEvent({ fullName, email, dateStr, timeStr, hostEmail });

    return res.status(200).json({ success: true, isStatic: true, meetingUrl: staticUrl });
  } catch (err) {
    console.error("Generate Meet Link Exception:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = { router, createUniqueGoogleMeetEvent };
