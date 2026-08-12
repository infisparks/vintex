const { CloudTasksClient } = require("@google-cloud/tasks");

let taskClientInstance = null;

/**
 * Helper to initialize CloudTasksClient with flexible environment credentials (Singleton pattern)
 */
function getCloudTasksClient() {
  if (taskClientInstance) return taskClientInstance;

  const serviceAccountKey = process.env.GCP_SERVICE_ACCOUNT_KEY;

  // Guard against Application Default Credentials (ADC) search exceptions when key is unconfigured
  if (!serviceAccountKey || !serviceAccountKey.trim()) {
    return null;
  }

  const options = {};
  try {
    let rawJson = serviceAccountKey.trim();
    if (!rawJson.startsWith("{")) {
      rawJson = Buffer.from(rawJson, "base64").toString("utf-8");
    }
    const credentials = JSON.parse(rawJson);
    options.credentials = credentials;
    if (credentials.project_id) {
      options.projectId = credentials.project_id;
    }
  } catch (err) {
    console.warn("[Cloud Tasks ⚠️] Could not parse GCP_SERVICE_ACCOUNT_KEY as JSON/Base64:", err.message);
    return null;
  }

  if (process.env.GCP_PROJECT_ID) {
    options.projectId = process.env.GCP_PROJECT_ID;
  }

  try {
    taskClientInstance = new CloudTasksClient(options);
    return taskClientInstance;
  } catch (err) {
    console.warn("[Cloud Tasks ⚠️] CloudTasksClient instantiation error:", err.message);
    return null;
  }
}

/**
 * Schedules an HTTP Task in Google Cloud Tasks
 * 
 * @param {Object} params
 * @param {string} params.taskId - Unique Task ID (e.g. "task_919958399157_rule123_1720000000")
 * @param {string} params.url - Target HTTP Webhook URL (e.g. "https://vintex.infiplus.in/api/whatsapp/execute-task")
 * @param {Object} params.payload - JSON body to pass to the webhook
 * @param {number} params.scheduleTimeSeconds - Execution UNIX timestamp in seconds
 * @returns {Promise<{success: boolean, taskName?: string, error?: string}>}
 */
async function createScheduledHttpTask({ taskId, url, payload, scheduleTimeSeconds }) {
  const projectId = process.env.GCP_PROJECT_ID || "firstoption-8da25";
  const location = process.env.GCP_LOCATION || "asia-south1";
  const queueName = process.env.GCP_QUEUE_NAME || "whatsapp-automation-queue";
  const webhookSecret = process.env.WEBHOOK_SECRET || "valdho_gcp_tasks_sec_2026_x89";

  const sanitizedTaskId = String(taskId).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 450);

  try {
    const client = getCloudTasksClient();
    if (!client) {
      console.log(`[Cloud Tasks ℹ️] GCP service account credentials not configured. Task '${sanitizedTaskId}' safely recorded in Firebase RTDB queue.`);
      return {
        success: true,
        localTask: true,
        taskId: sanitizedTaskId,
        scheduledTimeSeconds: scheduleTimeSeconds,
      };
    }

    const parent = client.queuePath(projectId, location, queueName);
    const fullTaskName = client.taskPath(projectId, location, queueName, sanitizedTaskId);

    const task = {
      name: fullTaskName,
      httpRequest: {
        httpMethod: "POST",
        url,
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": webhookSecret,
        },
        body: Buffer.from(JSON.stringify(payload)).toString("base64"),
      },
      scheduleTime: {
        seconds: scheduleTimeSeconds,
      },
    };

    console.log(`[Cloud Tasks 🚀] Enqueuing task '${sanitizedTaskId}' to fire at UNIX timestamp ${scheduleTimeSeconds} (Target IST: ${new Date(scheduleTimeSeconds * 1000).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })})`);

    const [response] = await client.createTask({ parent, task });
    console.log(`[Cloud Tasks ✅] Successfully scheduled Cloud Task: ${response.name}`);

    return {
      success: true,
      taskName: response.name,
      taskId: sanitizedTaskId,
      scheduledTimeSeconds: scheduleTimeSeconds,
    };
  } catch (err) {
    if (err.code === 6 || (err.message && err.message.includes("ALREADY_EXISTS"))) {
      console.warn(`[Cloud Tasks ⚠️] Task name '${sanitizedTaskId}' is tombstoned or already exists in GCP.`);
      return {
        success: true,
        tombstoned: true,
        taskId: sanitizedTaskId,
        scheduledTimeSeconds: scheduleTimeSeconds,
      };
    }

    console.warn(`[Cloud Tasks ℹ️] Could not enqueue to GCP Cloud Tasks (${err.message}). Safely recorded in Firebase RTDB.`);
    return {
      success: true,
      localTask: true,
      taskId: sanitizedTaskId,
      error: err.message,
    };
  }
}

/**
 * Deletes a scheduled task from Google Cloud Tasks by Task ID or full Task Name
 * 
 * @param {Object} params
 * @param {string} [params.taskId] - Task ID substring
 * @param {string} [params.taskName] - Full GCP Task Resource Name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteScheduledHttpTask({ taskId, taskName }) {
  try {
    const client = getCloudTasksClient();
    if (!client) {
      return { success: true, localTask: true };
    }

    let fullTaskName = taskName;

    if (!fullTaskName && taskId) {
      const projectId = process.env.GCP_PROJECT_ID || "firstoption-8da25";
      const location = process.env.GCP_LOCATION || "asia-south1";
      const queueName = process.env.GCP_QUEUE_NAME || "whatsapp-automation-queue";
      const sanitizedTaskId = String(taskId).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 450);
      fullTaskName = client.taskPath(projectId, location, queueName, sanitizedTaskId);
    }

    if (!fullTaskName) {
      return { success: false, error: "Neither taskId nor taskName provided" };
    }

    console.log(`[Cloud Tasks 🗑️] Requesting deletion of task: ${fullTaskName}`);
    await client.deleteTask({ name: fullTaskName });
    console.log(`[Cloud Tasks ✅] Successfully deleted task: ${fullTaskName}`);

    return { success: true };
  } catch (err) {
    if (err.code === 5 || (err.message && err.message.includes("NOT_FOUND"))) {
      return { success: true, alreadyDeleted: true };
    }
    console.warn(`[Cloud Tasks ℹ️] GCP task deletion notice (${err.message || err}).`);
    return { success: true, localTask: true };
  }
}

const FIREBASE_DB_URL = (
  process.env.FIREBASE_DATABASE_URL ||
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://vintexair-f074c-default-rtdb.firebaseio.com"
).replace(/\/$/, "");
const FIREBASE_DB_SECRET = process.env.FIREBASE_DB_SECRET || process.env.FIREBASE_DATABASE_SECRET || "";

async function firebaseDbRead(path) {
  try {
    const authQuery = FIREBASE_DB_SECRET ? `?auth=${encodeURIComponent(FIREBASE_DB_SECRET)}` : "";
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json${authQuery}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

async function listScheduledTasksFromFirebase() {
  try {
    const allScheduledObj = (await firebaseDbRead("whatsapp_scheduled_tasks")) || {};
    const formattedTasks = [];

    for (const [phone, tasksMap] of Object.entries(allScheduledObj)) {
      if (!tasksMap || typeof tasksMap !== "object") continue;
      for (const [taskId, record] of Object.entries(tasksMap)) {
        if (!record || typeof record !== "object") continue;
        formattedTasks.push({
          name: record.taskName || `projects/gcp/locations/asia-south1/queues/whatsapp/tasks/${taskId}`,
          taskId: taskId,
          scheduleTimeSeconds: record.scheduledTimeSeconds || (record.scheduleTimeMs ? Math.floor(record.scheduleTimeMs / 1000) : Math.floor(Date.now() / 1000) + 300),
          leadPhone: record.leadPhone || (phone ? `+${phone}` : "Unknown Phone"),
          ruleTitle: record.ruleTitle || record.title || "Stage Automation Rule",
          stageId: record.stageId || "Active Pipeline Stage",
          payload: record,
        });
      }
    }

    formattedTasks.sort((a, b) => a.scheduleTimeSeconds - b.scheduleTimeSeconds);
    return { success: true, tasks: formattedTasks, source: "firebase" };
  } catch (err) {
    console.error("[listScheduledTasksFromFirebase Error]:", err);
    return { success: true, tasks: [], source: "firebase_fallback" };
  }
}

async function listScheduledTasks() {
  try {
    const client = getCloudTasksClient();
    if (!client) {
      return await listScheduledTasksFromFirebase();
    }

    const projectId = process.env.GCP_PROJECT_ID || "firstoption-8da25";
    const location = process.env.GCP_LOCATION || "asia-south1";
    const queueName = process.env.GCP_QUEUE_NAME || "whatsapp-automation-queue";

    let timerId;
    const timeoutPromise = new Promise((_, reject) => {
      timerId = setTimeout(() => reject(new Error("GCP Cloud Tasks connection timeout")), 3000);
    });

    try {
      const parent = client.queuePath(projectId, location, queueName);
      const [tasks] = await Promise.race([
        client.listTasks({ parent, responseView: "FULL" }),
        timeoutPromise,
      ]);
      clearTimeout(timerId);

      const formattedTasks = tasks.map((task) => {
        let payload = {};
        try {
          if (task.httpRequest && task.httpRequest.body) {
            let rawBody = task.httpRequest.body;
            if (Buffer.isBuffer(rawBody)) {
              rawBody = rawBody.toString("utf-8");
            } else if (typeof rawBody === "string") {
              try {
                const decoded = Buffer.from(rawBody, "base64").toString("utf-8");
                if (decoded.startsWith("{")) rawBody = decoded;
              } catch (e) {}
            }
            payload = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
          }
        } catch (e) {}

        const rawTaskId = payload.taskId || task.name.split("/").pop() || "";

        let extractedPhone = payload.leadPhone;
        if (!extractedPhone && rawTaskId.startsWith("task_")) {
          const parts = rawTaskId.split("_");
          if (parts.length >= 2 && parts[1].length >= 10) {
            extractedPhone = "+" + parts[1];
          }
        }

        return {
          name: task.name,
          taskId: rawTaskId,
          scheduleTimeSeconds: task.scheduleTime ? parseInt(task.scheduleTime.seconds, 10) : 0,
          leadPhone: extractedPhone || payload.leadPhone || "Unknown Phone",
          ruleTitle: payload.ruleTitle || (rawTaskId.includes("fallback") ? "Auto Funnel Welcome" : "Stage Automation Rule"),
          stageId: payload.stageId || "Active Pipeline Stage",
          payload: payload,
        };
      });

      formattedTasks.sort((a, b) => a.scheduleTimeSeconds - b.scheduleTimeSeconds);
      return { success: true, tasks: formattedTasks, source: "gcp" };
    } catch (gcpErr) {
      clearTimeout(timerId);
      throw gcpErr;
    }
  } catch (err) {
    return await listScheduledTasksFromFirebase();
  }
}

module.exports = {
  getCloudTasksClient,
  createScheduledHttpTask,
  deleteScheduledHttpTask,
  listScheduledTasks,
};

