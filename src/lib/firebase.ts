import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, update, get, set, push } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { CAMPAIGNS } from "@/config/campaigns";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForBuild",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://dummy-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:123456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-123456",
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
export const auth = getAuth(app);

const WHATSAPP_SERVER_URL = (
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL
    ? process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL
    : "https://vintex.infiplus.in"
).replace(/\/$/, "");

const syncDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Helper: Triggers Google Cloud Tasks sync for a lead after creation, stage update, or meeting update (Debounced 400ms)
 */
export async function syncLeadCloudTasks(
  leadData: any,
  previousStage?: string | null,
  previousMeetingTime?: string | null
): Promise<void> {
  try {
    if (!leadData || !leadData.phone) return;
    const cleanPhone = String(leadData.phone).replace(/\D/g, "");
    const debounceKey = `sync_${cleanPhone || leadData.id || leadData.email}`;

    if (syncDebounceTimers.has(debounceKey)) {
      clearTimeout(syncDebounceTimers.get(debounceKey)!);
    }

    syncDebounceTimers.set(
      debounceKey,
      setTimeout(async () => {
        syncDebounceTimers.delete(debounceKey);
        try {
          await fetch(`${WHATSAPP_SERVER_URL}/api/whatsapp/sync-lead`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              leadData,
              previousStage,
              previousMeetingTime,
            }),
          });
        } catch (err) {
          console.error("syncLeadCloudTasks Exception:", err);
        }
      }, 400)
    );
  } catch (err) {
    console.error("syncLeadCloudTasks Exception:", err);
  }
}

/**
 * Helper: Cancels all pending Google Cloud Tasks when a lead is deleted or disqualified
 */
export async function cancelLeadCloudTasks(phone: string): Promise<void> {
  try {
    if (!phone) return;
    await fetch(`${WHATSAPP_SERVER_URL}/api/whatsapp/cancel-lead-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
  } catch (err) {
    console.error("cancelLeadCloudTasks Exception:", err);
  }
}


export interface SurveyData {
  industry?: string;
  role?: string;
  revenue?: string;
  investmentReady?: string;
  [key: string]: any;
}

export interface MeetingData {
  meetingDate?: string;
  meetingTime?: string;
  bookedAt?: string;
  rescheduledAt?: string;
  meetingUrl?: string;
}

export interface StaffNote {
  id: string;
  text: string;
  createdAt: string;
  author?: string;
}

export interface LeadData {
  id?: string;
  campaign?: string;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  status: "partial" | "survey_completed" | "completed";
  pipelineStage?: string; // "raw" | "in_progress" | "survey_completed" | "meeting_booked" | "proposal_sent" | "won" | "not_qualified"
  stageMovedAt?: string;
  dealValue?: number; // e.g. 50000 (represented in ₹)
  survey?: SurveyData;
  meeting?: MeetingData;
  notes?: StaffNote[];
  followUpDate?: string;
  onboarded?: boolean;
  onboardedAt?: string;
  onboardCount?: number;
  source?: string; // "crm" | "web" | "ad"
  sourceTag?: string; // "CRM"
  addedBy?: string; // email or author name
  links?: {
    surveyUrl?: string;
    meetingUrl?: string;
  };
  address?: string;
  clientAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  placeOfSupply?: string;
  companyName?: string;
  gstin?: string;
}

export interface OnboardRecord {
  id: string;
  leadId: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  campaign: string;
  onboardedAt: string;
  onboardedDate: string;
  onboardedBy?: string;
  dealValue?: number;
  survey?: SurveyData;
  meeting?: MeetingData;
  notes?: StaffNote[];
  followUpDate?: string;
}

export interface SaveLeadResult {
  leadId: string;
  createdDate: string;
  leadData?: LeadData;
}

/**
 * Sanitize email prefix (before @) to serve as deterministic Firebase Node ID.
 * Example: mk@gmail.com -> "mk", testing1@gmail.com -> "testing1"
 */
export function sanitizeEmailToId(email: string): string {
  if (!email || !email.includes("@")) {
    return "lead_" + Date.now();
  }
  const prefix = email.split("@")[0].trim().toLowerCase();
  const cleanId = prefix.replace(/[^a-z0-9_]/g, "_");
  return cleanId || "lead_" + Date.now();
}

/**
 * Helper: Convert time string like "09:00 AM" to Firebase key "09_00_AM"
 */
export function sanitizeSlotKey(time: string): string {
  return time.replace(/[^a-zA-Z0-9]/g, "_");
}

/**
 * Fetch booked slots for a specific date under path:
 * slots/[campaignName]/[appointmentDate]
 */
export async function getBookedSlotsForDate(
  appointmentDate: string,
  campaignName: string = "vintexair"
): Promise<Record<string, boolean>> {
  try {
    const slotsRef = ref(db, `slots/${campaignName}/${appointmentDate}`);
    const snapshot = await get(slotsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const bookedMap: Record<string, boolean> = {};
      
      if (data._blockedDate && data._blockedDate.blocked) {
        bookedMap["_blockedDate"] = true;
      }

      Object.keys(data).forEach((key) => {
        if (key === "_blockedDate") return;
        if (data[key] && (data[key].booked || data[key].blocked)) {
          bookedMap[key] = true;
        }
      });
      return bookedMap;
    }
    return {};
  } catch (error) {
    console.error("Firebase getBookedSlotsForDate Error:", error);
    return {};
  }
}

/**
 * Standard daily time slots matching system configuration
 */
export const DEFAULT_DAILY_TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "07:00 PM",
  "09:00 PM",
];

/**
 * Mark a full date or range of dates as booked/blocked in Firebase CRM
 */
export async function markDateAsBooked(
  startDateStr: string,
  endDateStr: string,
  reason: string = "Marked as booked by admin",
  campaignName: string = "vintexair"
): Promise<{ success: boolean; message: string }> {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, message: "Invalid date range selected." };
    }

    const updates: Record<string, any> = {};
    const curr = new Date(start);

    while (curr <= end) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, "0");
      const day = String(curr.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      updates[`slots/${campaignName}/${dateStr}/_blockedDate`] = {
        blocked: true,
        date: dateStr,
        reason: reason || "Marked as booked",
        createdAt: Date.now(),
      };

      DEFAULT_DAILY_TIME_SLOTS.forEach((slotTime) => {
        const slotKey = sanitizeSlotKey(slotTime);
        updates[`slots/${campaignName}/${dateStr}/${slotKey}`] = {
          booked: true,
          blocked: true,
          reason: reason || "Marked as booked",
          bookedAt: Date.now(),
        };
      });

      curr.setDate(curr.getDate() + 1);
    }

    await update(ref(db), updates);
    return { success: true, message: "Dates marked as booked successfully." };
  } catch (error: any) {
    console.error("Firebase markDateAsBooked Error:", error);
    return { success: false, message: error.message || "Failed to mark dates as booked." };
  }
}

/**
 * Mark specific time slots on a date as booked/blocked in Firebase CRM
 */
export async function markSlotsAsBooked(
  dateStr: string,
  timeSlots: string[],
  reason: string = "Marked as booked by admin",
  campaignName: string = "vintexair"
): Promise<{ success: boolean; message: string }> {
  try {
    if (!dateStr || !timeSlots || timeSlots.length === 0) {
      return { success: false, message: "Please select a date and at least one time slot." };
    }

    const updates: Record<string, any> = {};
    timeSlots.forEach((slotTime) => {
      const slotKey = sanitizeSlotKey(slotTime);
      updates[`slots/${campaignName}/${dateStr}/${slotKey}`] = {
        booked: true,
        blocked: true,
        reason: reason || "Marked as booked",
        bookedAt: Date.now(),
      };
    });

    await update(ref(db), updates);
    return { success: true, message: "Time slots marked as booked successfully." };
  } catch (error: any) {
    console.error("Firebase markSlotsAsBooked Error:", error);
    return { success: false, message: error.message || "Failed to mark slots as booked." };
  }
}

/**
 * Unmark / unblock a specific date or time slot in Firebase CRM
 */
export async function unmarkDateOrSlot(
  dateStr: string,
  timeSlot?: string,
  campaignName: string = "vintexair"
): Promise<{ success: boolean; message: string }> {
  try {
    if (!dateStr) return { success: false, message: "Date is required." };

    if (timeSlot) {
      const slotKey = sanitizeSlotKey(timeSlot);
      const updates: Record<string, any> = {};
      updates[`slots/${campaignName}/${dateStr}/${slotKey}`] = null;
      await update(ref(db), updates);
    } else {
      const updates: Record<string, any> = {};
      updates[`slots/${campaignName}/${dateStr}`] = null;
      await update(ref(db), updates);
    }
    return { success: true, message: "Unmarked successfully." };
  } catch (error: any) {
    console.error("Firebase unmarkDateOrSlot Error:", error);
    return { success: false, message: error.message || "Failed to unmark." };
  }
}

/**
 * Fetch all blocked dates and slots for CRM management view
 */
export async function getAllBlockedSlotsAndDates(
  campaignName: string = "vintexair"
): Promise<Array<{
  dateStr: string;
  isFullDateBlocked: boolean;
  blockedSlots: string[];
  reason?: string;
}>> {
  try {
    const slotsRef = ref(db, `slots/${campaignName}`);
    const snapshot = await get(slotsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    const result: Array<{
      dateStr: string;
      isFullDateBlocked: boolean;
      blockedSlots: string[];
      reason?: string;
    }> = [];

    Object.keys(data).forEach((dateStr) => {
      const dateObj = data[dateStr];
      if (!dateObj || typeof dateObj !== "object") return;

      const isFullDateBlocked = Boolean(dateObj._blockedDate && dateObj._blockedDate.blocked);
      const blockedSlots: string[] = [];
      let reason = dateObj._blockedDate?.reason;

      Object.keys(dateObj).forEach((key) => {
        if (key === "_blockedDate") return;
        const slotData = dateObj[key];
        if (slotData && slotData.blocked) {
          if (!reason && slotData.reason) reason = slotData.reason;
          // Re-convert sanitized slot key to human readable if possible
          blockedSlots.push(key);
        }
      });

      if (isFullDateBlocked || blockedSlots.length > 0) {
        result.push({
          dateStr,
          isFullDateBlocked,
          blockedSlots,
          reason: reason || "Marked as booked",
        });
      }
    });

    return result.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  } catch (error) {
    console.error("Firebase getAllBlockedSlotsAndDates Error:", error);
    return [];
  }
}

/**
 * Fetch lead profile from Firebase by leadId & createdDate
 */
export async function getLeadById(
  leadId: string,
  createdDate: string,
  campaignName: string = "vintexair"
): Promise<LeadData | null> {
  try {
    const leadRef = ref(db, `campaigns/${campaignName}/leads/${createdDate}/${leadId}`);
    const snapshot = await get(leadRef);
    if (snapshot.exists()) {
      return snapshot.val() as LeadData;
    }
    return null;
  } catch (error) {
    if (!String(error).includes("Permission denied")) {
      console.error("Firebase getLeadById Error:", error);
    }
    return null;
  }
}

/**
 * Search for an existing lead across dates or under a specific createdDate.
 * Enhanced to search by leadId, sanitized email prefix (sanitizeEmailToId), email, or phone number.
 */
export async function findExistingLead(
  leadId: string,
  createdDate?: string | null,
  campaignName: string = "vintexair",
  extraSearch?: { email?: string; phone?: string } | null
): Promise<{ lead: LeadData; createdDate: string } | null> {
  try {
    const cleanLeadId = (leadId || "").trim();
    const cleanEmail = (extraSearch?.email || (cleanLeadId.includes("@") ? cleanLeadId : "")).trim().toLowerCase();
    const cleanPhone = (extraSearch?.phone || (cleanLeadId && /^\+?[0-9]{7,15}$/.test(cleanLeadId) ? cleanLeadId : "")).replace(/\D/g, "");
    const emailSanitizedId = cleanEmail ? sanitizeEmailToId(cleanEmail) : (cleanLeadId ? sanitizeEmailToId(cleanLeadId) : "");

    if (createdDate) {
      const directLead = await getLeadById(cleanLeadId, createdDate, campaignName);
      if (directLead) {
        return { lead: directLead, createdDate };
      }
      if (emailSanitizedId && emailSanitizedId !== cleanLeadId) {
        const emailLead = await getLeadById(emailSanitizedId, createdDate, campaignName);
        if (emailLead) {
          return { lead: emailLead, createdDate };
        }
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (createdDate !== todayStr) {
      const todayLead = await getLeadById(cleanLeadId, todayStr, campaignName);
      if (todayLead) {
        return { lead: todayLead, createdDate: todayStr };
      }
      if (emailSanitizedId && emailSanitizedId !== cleanLeadId) {
        const todayEmailLead = await getLeadById(emailSanitizedId, todayStr, campaignName);
        if (todayEmailLead) {
          return { lead: todayEmailLead, createdDate: todayStr };
        }
      }
    }

    const campaignLeadsRef = ref(db, `campaigns/${campaignName}/leads`);
    const snapshot = await get(campaignLeadsRef);
    if (snapshot.exists()) {
      const allDatesObj = snapshot.val();
      const dateKeys = Object.keys(allDatesObj).sort().reverse();
      for (const dKey of dateKeys) {
        const dayLeads = allDatesObj[dKey];
        if (!dayLeads) continue;

        // 1. Direct key matches
        if (cleanLeadId && dayLeads[cleanLeadId]) {
          return {
            lead: dayLeads[cleanLeadId] as LeadData,
            createdDate: dKey,
          };
        }
        if (emailSanitizedId && dayLeads[emailSanitizedId]) {
          return {
            lead: dayLeads[emailSanitizedId] as LeadData,
            createdDate: dKey,
          };
        }

        // 2. Iterate all leads in this date node to match by leadId, email, sanitized email, or phone
        for (const lKey of Object.keys(dayLeads)) {
          const l = dayLeads[lKey] as LeadData;
          if (!l) continue;

          const lId = (l.id || lKey || "").trim();
          const lEmail = (l.email || "").trim().toLowerCase();
          const lPhone = (l.phone || "").replace(/\D/g, "");
          const lSanitized = lEmail ? sanitizeEmailToId(lEmail) : "";

          const isIdMatch = cleanLeadId && (lId === cleanLeadId || lKey === cleanLeadId);
          const isSanitizedMatch = emailSanitizedId && (lSanitized === emailSanitizedId || lKey === emailSanitizedId || lId === emailSanitizedId);
          const isEmailMatch = cleanEmail && lEmail && lEmail === cleanEmail;
          const isPhoneMatch =
            cleanPhone &&
            cleanPhone.length >= 7 &&
            lPhone &&
            (lPhone === cleanPhone ||
              (lPhone.length >= 10 && cleanPhone.length >= 10 && lPhone.slice(-10) === cleanPhone.slice(-10)));

          if (isIdMatch || isSanitizedMatch || isEmailMatch || isPhoneMatch) {
            return {
              lead: l,
              createdDate: dKey,
            };
          }
        }
      }
    }
    return null;
  } catch (error) {
    if (!String(error).includes("Permission denied")) {
      console.error("Firebase findExistingLead Error:", error);
    }
    return null;
  }
}

export interface ExistingLeadCheckResult {
  emailExists: boolean;
  phoneExists: boolean;
}

/**
 * Fast check to verify if an email or phone number is already registered in Firebase Database across any campaign/date.
 * Checks via Client JS SDK with fallback to Node.js backend server API.
 */
export async function checkExistingLeadByEmailOrPhone(
  email: string,
  phone: string,
  campaignName: string = "vintexair"
): Promise<ExistingLeadCheckResult> {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPhone = (phone || "").replace(/\D/g, "");

  if (!cleanEmail && !cleanPhone) {
    return { emailExists: false, phoneExists: false };
  }

  let emailExists = false;
  let phoneExists = false;

  try {
    const campaignKeys = Object.keys(CAMPAIGNS);
    const orderedKeys = [campaignName, ...campaignKeys.filter((k) => k !== campaignName)];

    for (const cName of orderedKeys) {
      const leadsRef = ref(db, `campaigns/${cName}/leads`);
      const snapshot = await get(leadsRef);

      if (snapshot.exists()) {
        const datesObj = snapshot.val();
        for (const dKey of Object.keys(datesObj)) {
          const dayLeads = datesObj[dKey];
          if (!dayLeads) continue;

          for (const lKey of Object.keys(dayLeads)) {
            const lead = dayLeads[lKey] as LeadData;
            if (!lead) continue;

            const lEmail = (lead.email || "").trim().toLowerCase();
            const lPhone = (lead.phone || "").replace(/\D/g, "");

            if (cleanEmail && lEmail && lEmail === cleanEmail) {
              emailExists = true;
            }
            if (
              cleanPhone &&
              lPhone &&
              (lPhone === cleanPhone ||
                (lPhone.length >= 10 && cleanPhone.length >= 10 && lPhone.slice(-10) === cleanPhone.slice(-10)))
            ) {
              phoneExists = true;
            }

            if (emailExists && phoneExists) break;
          }
          if (emailExists && phoneExists) break;
        }
      }
      if (emailExists && phoneExists) break;
    }
  } catch (error) {
    console.error("Firebase JS checkExistingLeadByEmailOrPhone Error, attempting Node.js API fallback:", error);
    try {
      const serverUrl = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "https://vintex.infiplus.in").replace(/\/$/, "");
      const res = await fetch(`${serverUrl}/api/whatsapp/check-lead-duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, phone: cleanPhone, campaignId: campaignName }),
      });
      if (res.ok) {
        const data = await res.json();
        return { emailExists: !!data.emailExists, phoneExists: !!data.phoneExists };
      }
    } catch (apiErr) {
      console.error("Node.js duplicate check endpoint error:", apiErr);
    }
  }

  return { emailExists, phoneExists };
}


/**
 * CRM Query: Fetch all leads for a specific date across selected or all campaigns
 */
export async function getLeadsForDate(
  targetDate: string,
  campaignId: string = "all"
): Promise<LeadData[]> {
  try {
    const campaignKeys = campaignId === "all" ? Object.keys(CAMPAIGNS) : [campaignId];
    const results: LeadData[] = [];

    for (const cName of campaignKeys) {
      const leadsRef = ref(db, `campaigns/${cName}/leads/${targetDate}`);
      const snapshot = await get(leadsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.values(data).forEach((item: any) => {
          results.push(item as LeadData);
        });
      }
    }

    return results.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  } catch (error) {
    console.error("Firebase getLeadsForDate Error:", error);
    return [];
  }
}

/**
 * CRM Query: Fetch all meetings scheduled for a specific date across selected or all campaigns
 */
export async function getMeetingsForDate(
  targetDate: string,
  campaignId: string = "all"
): Promise<any[]> {
  try {
    const campaignKeys = campaignId === "all" ? Object.keys(CAMPAIGNS) : [campaignId];
    const results: any[] = [];

    for (const cName of campaignKeys) {
      const meetingsRef = ref(db, `campaigns/${cName}/meetings/${targetDate}`);
      const snapshot = await get(meetingsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.values(data).forEach((item: any) => {
          results.push({ ...item, campaign: cName });
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Firebase getMeetingsForDate Error:", error);
    return [];
  }
}

/**
 * CRM Query: Fetch all meetings across all dates for the Interactive Calendar view
 */
export async function getAllMeetings(
  campaignId: string = "all"
): Promise<any[]> {
  try {
    const campaignKeys = campaignId === "all" ? Object.keys(CAMPAIGNS) : [campaignId];
    const results: any[] = [];

    for (const cName of campaignKeys) {
      const meetingsRef = ref(db, `campaigns/${cName}/meetings`);
      const snapshot = await get(meetingsRef);
      if (snapshot.exists()) {
        const datesObj = snapshot.val();
        Object.keys(datesObj).forEach((mDate) => {
          if (datesObj[mDate]) {
            Object.values(datesObj[mDate]).forEach((item: any) => {
              results.push({ ...item, campaign: cName });
            });
          }
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Firebase getAllMeetings Error:", error);
    return [];
  }
}

/**
 * CRM Query: Fetch all leads across all dates for the Pipeline Kanban Board
 */
export async function getAllLeadsAcrossDates(
  campaignId: string = "all"
): Promise<LeadData[]> {
  try {
    const campaignKeys = campaignId === "all" ? Object.keys(CAMPAIGNS) : [campaignId];
    const results: LeadData[] = [];

    for (const cName of campaignKeys) {
      const leadsRef = ref(db, `campaigns/${cName}/leads`);
      const snapshot = await get(leadsRef);
      if (snapshot.exists()) {
        const datesObj = snapshot.val();
        Object.keys(datesObj).forEach((dKey) => {
          if (datesObj[dKey]) {
            Object.values(datesObj[dKey]).forEach((item: any) => {
              results.push({ ...item, campaign: cName });
            });
          }
        });
      }
    }

    return results.sort((a, b) => (b.updatedAt || b.createdDate || "").localeCompare(a.updatedAt || a.createdDate || ""));
  } catch (error) {
    console.error("Firebase getAllLeadsAcrossDates Error:", error);
    return [];
  }
}

/**
 * Stage-Gated Lead Database Writer (Merge & Preserve Aware):
 * - Checks for pre-existing lead records to avoid wiping survey, meeting, links, or status.
 * - Partial (Step 1): Updates contact info while keeping previous survey & meeting data if present.
 * - Survey Completed (Step 2): Merges survey answers while keeping previous meeting data if present.
 * - Completed (Step 3): Updates meeting date & time + atomic slot booking.
 */
export async function saveOrUpdateLead(
  lead: LeadData,
  existingLeadId?: string | null,
  existingCreatedDate?: string | null,
  campaignName: string = "vintexair"
): Promise<SaveLeadResult | null> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const timestamp = new Date().toISOString();

    // Deterministic lead ID from email prefix (e.g., "mudassirs472")
    const leadId = existingLeadId || (lead.email ? sanitizeEmailToId(lead.email) : "lead_" + Date.now());

    // Search for existing lead record to avoid overwriting previously submitted survey/meeting details
    const existingMatch = await findExistingLead(leadId, existingCreatedDate, campaignName, {
      email: lead.email,
      phone: lead.phone,
    });
    const existingLead = existingMatch?.lead || null;
    const createdDate = existingMatch?.createdDate || existingCreatedDate || lead.createdDate || todayStr;

    // Determine status precedence: completed > survey_completed > partial
    const getStatusPriority = (s?: string) => {
      if (s === "completed") return 3;
      if (s === "survey_completed") return 2;
      if (s === "partial") return 1;
      return 0;
    };

    const existingPriority = getStatusPriority(existingLead?.status);
    const newPriority = getStatusPriority(lead.status);

    // Keep highest status achieved unless new submission advances it
    const finalStatus: "partial" | "survey_completed" | "completed" =
      newPriority >= existingPriority ? lead.status : (existingLead?.status || lead.status);

    // Merge survey data: use new survey if provided (and non-empty), otherwise keep existing survey
    const mergedSurvey =
      lead.survey && Object.keys(lead.survey).length > 0
        ? { ...(existingLead?.survey || {}), ...lead.survey }
        : existingLead?.survey;

    // Merge meeting data: use new meeting if user selected/re-selected a slot (lead.meeting), otherwise keep existing meeting
    const mergedMeeting = lead.meeting || existingLead?.meeting;

    // Automated Funnel Stage Progression Weights:
    // raw (1) -> in_progress (2) -> survey_completed (3) -> meeting_booked (4) -> proposal_sent (5) -> won (6) -> not_qualified (7)
    const STAGE_WEIGHTS: Record<string, number> = {
      raw: 1,
      "1st Connection": 2,
      in_progress: 2,
      survey_completed: 3,
      meeting_booked: 4,
      meeting_scheduled: 4,
      proposal_sent: 5,
      won: 6,
      closed_won: 6,
      not_qualified: 7,
      disqualified: 7,
      lost: 7,
    };

    const getStageWeight = (stg?: string) => {
      if (!stg) return 0;
      return STAGE_WEIGHTS[stg] || 0;
    };

    const existingStage = existingLead?.pipelineStage;
    const existingStageWeight = getStageWeight(existingStage);

    // Identify if existing lead is already in a downstream manual sales stage (proposal_sent (5), won (6), not_qualified (7))
    const isDownstreamManualStage = existingStageWeight >= 5;

    const hasSurveyData =
      (mergedSurvey && Object.keys(mergedSurvey).length > 0) ||
      finalStatus === "survey_completed" ||
      lead.status === "survey_completed" ||
      lead.pipelineStage === "survey_completed";

    const hasMeetingData =
      (mergedMeeting && (mergedMeeting.meetingDate || mergedMeeting.bookedAt)) ||
      finalStatus === "completed" ||
      lead.status === "completed" ||
      lead.pipelineStage === "meeting_booked" ||
      lead.pipelineStage === "meeting_scheduled";

    let targetStage: string;

    if (isDownstreamManualStage) {
      // Preserve downstream sales stages if set manually by staff in CRM, unless explicitly updated to another manual stage
      const incomingWeight = getStageWeight(lead.pipelineStage);
      if (incomingWeight >= 5) {
        targetStage = lead.pipelineStage!;
      } else {
        targetStage = existingStage!;
      }
    } else {
      // Automated funnel progression:
      if (hasMeetingData) {
        // Automatically advance to "meeting_booked" if currently in raw, in_progress, or survey_completed
        targetStage = "meeting_booked";
      } else if (hasSurveyData) {
        // Automatically advance to "survey_completed" if currently in raw or in_progress
        targetStage = "survey_completed";
      } else {
        // Step 1 / Contact Form submission or raw lead
        const incomingWeight = getStageWeight(lead.pipelineStage);
        if (incomingWeight >= existingStageWeight) {
          targetStage = lead.pipelineStage || existingStage || "in_progress";
        } else {
          targetStage = existingStage || lead.pipelineStage || "raw";
        }
      }
    }

    const mergedPipelineStage = targetStage;
    const isStageChanged = !existingLead || mergedPipelineStage !== existingLead.pipelineStage;
    const mergedStageMovedAt = isStageChanged
      ? (lead.stageMovedAt || timestamp)
      : (existingLead?.stageMovedAt || lead.stageMovedAt || timestamp);
    const mergedNotes = lead.notes || existingLead?.notes;
    const mergedFollowUpDate = lead.followUpDate || existingLead?.followUpDate;
    const mergedDealValue = lead.dealValue !== undefined ? lead.dealValue : existingLead?.dealValue;
    const mergedOnboarded = lead.onboarded !== undefined ? lead.onboarded : existingLead?.onboarded;
    const mergedOnboardedAt = lead.onboardedAt || existingLead?.onboardedAt;
    const mergedOnboardCount = lead.onboardCount !== undefined ? lead.onboardCount : existingLead?.onboardCount;
    const mergedSource = lead.source || existingLead?.source;
    const mergedSourceTag = lead.sourceTag || existingLead?.sourceTag;
    const mergedAddedBy = lead.addedBy || existingLead?.addedBy;

    // Base Master Lead Payload
    const rawFullName = lead.fullName || existingLead?.fullName || "";
    const formattedFullName = rawFullName.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

    const leadPayload: LeadData = {
      id: leadId,
      campaign: campaignName,
      createdDate: createdDate,
      createdAt: existingLead?.createdAt || lead.createdAt || timestamp,
      updatedAt: timestamp,
      fullName: formattedFullName,
      email: lead.email || existingLead?.email || "",
      phone: lead.phone || existingLead?.phone || "",
      countryCode: lead.countryCode || existingLead?.countryCode || "+91",
      status: finalStatus,
    };

    if (mergedSource) {
      leadPayload.source = mergedSource;
    }

    if (mergedSourceTag) {
      leadPayload.sourceTag = mergedSourceTag;
    }

    if (mergedAddedBy) {
      leadPayload.addedBy = mergedAddedBy;
    }

    if (mergedSurvey) {
      leadPayload.survey = mergedSurvey;
    }

    if (mergedMeeting) {
      leadPayload.meeting = mergedMeeting;
    }

    if (mergedNotes) {
      leadPayload.notes = mergedNotes;
    }

    if (mergedFollowUpDate) {
      leadPayload.followUpDate = mergedFollowUpDate;
    }

    if (mergedPipelineStage) {
      leadPayload.pipelineStage = mergedPipelineStage;
    }

    if (mergedStageMovedAt) {
      leadPayload.stageMovedAt = mergedStageMovedAt;
    }

    if (mergedDealValue !== undefined) {
      leadPayload.dealValue = mergedDealValue;
    }

    if (mergedOnboarded !== undefined) {
      leadPayload.onboarded = mergedOnboarded;
    }

    if (mergedOnboardedAt) {
      leadPayload.onboardedAt = mergedOnboardedAt;
    }

    if (mergedOnboardCount !== undefined) {
      leadPayload.onboardCount = mergedOnboardCount;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://firstoptionagency.in";

    // Build/preserve links
    const links: Record<string, string> = { ...(existingLead?.links || {}) };

    if (mergedSurvey || finalStatus === "survey_completed" || finalStatus === "completed") {
      links.surveyUrl = `${origin}/?step=survey&leadId=${leadId}&createdDate=${createdDate}&campaign=${campaignName}`;
    }

    if (mergedMeeting || finalStatus === "completed") {
      links.surveyUrl = `${origin}/?step=survey&leadId=${leadId}&createdDate=${createdDate}&campaign=${campaignName}`;
      links.meetingUrl = `${origin}/?step=meeting&leadId=${leadId}&createdDate=${createdDate}&campaign=${campaignName}`;
    }

    if (Object.keys(links).length > 0) {
      leadPayload.links = links;
    }

    const updates: Record<string, any> = {};

    // Check if meeting was changed to a different date or time, so we can clean up old slot & old meeting index
    if (
      existingLead?.meeting?.meetingDate &&
      existingLead?.meeting?.meetingTime &&
      lead.meeting?.meetingDate &&
      lead.meeting?.meetingTime &&
      (existingLead.meeting.meetingDate !== lead.meeting.meetingDate ||
        existingLead.meeting.meetingTime !== lead.meeting.meetingTime)
    ) {
      const oldMDate = existingLead.meeting.meetingDate;
      const oldMTime = existingLead.meeting.meetingTime;
      const oldSlotKey = sanitizeSlotKey(oldMTime);
      updates[`campaigns/${campaignName}/meetings/${oldMDate}/${leadId}`] = null;
      updates[`slots/${campaignName}/${oldMDate}/${oldSlotKey}`] = null;
    }

    // Set Master Lead Path
    updates[`campaigns/${campaignName}/leads/${createdDate}/${leadId}`] = leadPayload;

    // High-Performance Meeting Index & Atomic Slot Booking
    const finalMeeting = leadPayload.meeting;
    if (finalMeeting && finalMeeting.meetingDate && finalMeeting.meetingTime) {
      const mDate = finalMeeting.meetingDate;
      const mTime = finalMeeting.meetingTime;
      const slotKey = sanitizeSlotKey(mTime);

      const meetingIndexPayload = {
        leadId: leadId,
        fullName: leadPayload.fullName,
        email: leadPayload.email,
        phone: leadPayload.phone,
        countryCode: leadPayload.countryCode,
        meetingDate: mDate,
        meetingTime: mTime,
        status: "booked",
        createdDate: createdDate,
        bookedAt: finalMeeting.bookedAt || timestamp,
        survey: leadPayload.survey || {},
        notes: leadPayload.notes || [],
        followUpDate: leadPayload.followUpDate || null,
        pipelineStage: leadPayload.pipelineStage || null,
        dealValue: leadPayload.dealValue !== undefined ? leadPayload.dealValue : null,
        source: leadPayload.source || null,
        sourceTag: leadPayload.sourceTag || null,
      };

      // 1. Meeting Index Node
      updates[`campaigns/${campaignName}/meetings/${mDate}/${leadId}`] = meetingIndexPayload;

      // 2. Realtime Dedicated Slot Booking Node
      updates[`slots/${campaignName}/${mDate}/${slotKey}`] = {
        booked: true,
        leadId: leadId,
        fullName: leadPayload.fullName,
        phone: leadPayload.phone,
        bookedAt: finalMeeting.bookedAt || timestamp,
      };
    }

    // Perform Atomic Write to Firebase
    await update(ref(db), updates);

    // Trigger Google Cloud Tasks Automation Sync
    syncLeadCloudTasks(
      leadPayload,
      existingLead?.pipelineStage || null,
      existingLead?.meeting ? `${existingLead.meeting.meetingDate}_${existingLead.meeting.meetingTime}` : null
    ).catch(() => {});

    return {
      leadId,
      createdDate,
      leadData: leadPayload,
    };
  } catch (error) {
    console.error("Firebase Database Save Error:", error);
    return null;
  }
}

/**
 * Permanently delete a lead record from Firebase RTDB along with all assigned client flows
 */
export async function deleteLead(
  leadId: string,
  createdDate?: string | null,
  campaignName: string = "vintexair",
  meetingDate?: string | null,
  meetingTime?: string | null,
  leadEmail?: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const targetCreatedDate = createdDate || todayStr;
    const updates: Record<string, any> = {};

    let targetEmail = leadEmail || null;

    // Fetch lead phone & email to cancel pending Cloud Tasks and find clientFlows
    try {
      const leadRefPath = `campaigns/${campaignName}/leads/${targetCreatedDate}/${leadId}`;
      const leadSnap = await get(ref(db, leadRefPath));
      if (leadSnap.exists()) {
        const lData = leadSnap.val();
        if (lData?.phone) {
          cancelLeadCloudTasks(lData.phone).catch(() => {});
        }
        if (!targetEmail && lData?.email) {
          targetEmail = lData.email;
        }
      }
    } catch (e) {}

    // Delete lead node
    updates[`campaigns/${campaignName}/leads/${targetCreatedDate}/${leadId}`] = null;

    // Delete meeting and slot if present
    if (meetingDate && meetingTime) {
      const slotKey = sanitizeSlotKey(meetingTime);
      updates[`campaigns/${campaignName}/meetings/${meetingDate}/${leadId}`] = null;
      updates[`slots/${campaignName}/${meetingDate}/${slotKey}`] = null;
    }

    // Permanently purge associated assigned Client Flow Instance(s) from /clientFlows node
    try {
      const clientFlowsSnap = await get(ref(db, "clientFlows"));
      if (clientFlowsSnap.exists()) {
        const flowsData = clientFlowsSnap.val();
        Object.keys(flowsData).forEach((flowKey) => {
          const flow = flowsData[flowKey];
          if (flow) {
            const matchesId = flow.clientOnboardId === leadId;
            const matchesEmail =
              targetEmail &&
              flow.clientEmail &&
              flow.clientEmail.toLowerCase().trim() === targetEmail.toLowerCase().trim();

            if (matchesId || matchesEmail) {
              updates[`clientFlows/${flowKey}`] = null;
            }
          }
        });
      }
    } catch (e) {
      console.error("Error finding clientFlows for lead deletion:", e);
    }

    await update(ref(db), updates);
    return { success: true };

  } catch (err: any) {
    console.error("deleteLead Error:", err);
    return { success: false, message: err?.message || "Failed to delete lead." };
  }
}

/**
 * Staff CRM Helper: Add/update staff notes and follow-up date for a lead
 */
export async function updateLeadStaffFields(
  leadId: string,
  createdDate: string,
  staffData: {
    notes?: StaffNote[];
    followUpDate?: string;
    pipelineStage?: string;
    stageMovedAt?: string;
    dealValue?: number;
  },
  campaignName: string = "vintexair"
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const updates: Record<string, any> = {};

    const leadRefPath = `campaigns/${campaignName}/leads/${createdDate}/${leadId}`;
    const snapshot = await get(ref(db, leadRefPath));
    if (!snapshot.exists()) return false;

    const existingLead = snapshot.val() as LeadData;

    if (staffData.notes !== undefined) {
      updates[`${leadRefPath}/notes`] = staffData.notes;
    }
    if (staffData.followUpDate !== undefined) {
      updates[`${leadRefPath}/followUpDate`] = staffData.followUpDate;
    }
    if (staffData.pipelineStage !== undefined) {
      updates[`${leadRefPath}/pipelineStage`] = staffData.pipelineStage;
      updates[`${leadRefPath}/stageMovedAt`] = timestamp;
    }
    // If dealValue is updated, also update any onboard snapshot records for this lead
    if (staffData.dealValue !== undefined) {
      updates[`${leadRefPath}/dealValue`] = staffData.dealValue;
      try {
        const onboardsSnap = await get(ref(db, `onboards/${campaignName}/all`));
        if (onboardsSnap.exists()) {
          const obData = onboardsSnap.val();
          Object.keys(obData).forEach((obId) => {
            if (obData[obId]?.leadId === leadId || obData[obId]?.email === existingLead.email) {
              const obDate = obData[obId]?.onboardedDate;
              updates[`onboards/${campaignName}/all/${obId}/dealValue`] = staffData.dealValue;
              if (obDate) {
                updates[`onboards/${campaignName}/${obDate}/${obId}/dealValue`] = staffData.dealValue;
              }
            }
          });
        }
      } catch (err) {
        console.error("Error syncing dealValue to onboards:", err);
      }
    }
    updates[`${leadRefPath}/updatedAt`] = timestamp;

    // If a meeting index exists for this lead, update meeting index node too
    if (existingLead.meeting?.meetingDate) {
      const mDate = existingLead.meeting.meetingDate;
      const meetingRefPath = `campaigns/${campaignName}/meetings/${mDate}/${leadId}`;
      if (staffData.notes !== undefined) {
        updates[`${meetingRefPath}/notes`] = staffData.notes;
      }
      if (staffData.followUpDate !== undefined) {
        updates[`${meetingRefPath}/followUpDate`] = staffData.followUpDate;
      }
      if (staffData.pipelineStage !== undefined) {
        updates[`${meetingRefPath}/pipelineStage`] = staffData.pipelineStage;
        updates[`${meetingRefPath}/stageMovedAt`] = timestamp;
      }
      if (staffData.dealValue !== undefined) {
        updates[`${meetingRefPath}/dealValue`] = staffData.dealValue;
      }
      updates[`${meetingRefPath}/updatedAt`] = timestamp;
    }

    await update(ref(db), updates);

    // Trigger Cloud Tasks Sync if pipelineStage or staff fields updated
    syncLeadCloudTasks(
      {
        ...existingLead,
        notes: staffData.notes !== undefined ? staffData.notes : existingLead.notes,
        followUpDate: staffData.followUpDate !== undefined ? staffData.followUpDate : existingLead.followUpDate,
        pipelineStage: staffData.pipelineStage !== undefined ? staffData.pipelineStage : existingLead.pipelineStage,
        dealValue: staffData.dealValue !== undefined ? staffData.dealValue : existingLead.dealValue,
      },
      staffData.pipelineStage !== undefined ? existingLead.pipelineStage || null : null,
      existingLead.meeting ? `${existingLead.meeting.meetingDate}_${existingLead.meeting.meetingTime}` : null
    ).catch(() => {});

    return true;
  } catch (error) {
    console.error("Firebase updateLeadStaffFields Error:", error);
    return false;
  }
}

/**
 * Updates a lead's address, city, state, and client contact info in Firebase.
 * Persists changes so all subsequent quotations and CRM views auto-populate this client's profile.
 */
export async function updateLeadAddressAndClientInfo(
  leadId: string,
  createdDate?: string,
  clientInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    clientAddress?: string;
    shippingAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    placeOfSupply?: string;
    gstin?: string;
    companyName?: string;
  },
  campaignName: string = "vintexair"
): Promise<boolean> {
  try {
    if (!leadId) return false;
    const timestamp = new Date().toISOString();
    let targetCreatedDate = createdDate;

    if (!targetCreatedDate) {
      const found = await findExistingLead(leadId, null, campaignName, {
        email: clientInfo?.email,
        phone: clientInfo?.phone,
      });
      if (found) {
        targetCreatedDate = found.createdDate;
      }
    }

    if (!targetCreatedDate) {
      targetCreatedDate = timestamp.slice(0, 10);
    }

    const leadRefPath = `campaigns/${campaignName}/leads/${targetCreatedDate}/${leadId}`;
    const snapshot = await get(ref(db, leadRefPath));

    const updates: Record<string, any> = {};

    if (clientInfo?.fullName) {
      updates[`${leadRefPath}/fullName`] = clientInfo.fullName.trim();
    }
    if (clientInfo?.email) {
      updates[`${leadRefPath}/email`] = clientInfo.email.trim();
    }
    if (clientInfo?.phone) {
      updates[`${leadRefPath}/phone`] = clientInfo.phone.trim();
    }
    if (clientInfo?.address !== undefined) {
      updates[`${leadRefPath}/address`] = clientInfo.address.trim();
      updates[`${leadRefPath}/clientAddress`] = clientInfo.address.trim();
    }
    if (clientInfo?.shippingAddress !== undefined) {
      updates[`${leadRefPath}/shippingAddress`] = clientInfo.shippingAddress.trim();
    }
    if (clientInfo?.city !== undefined) {
      updates[`${leadRefPath}/city`] = clientInfo.city.trim();
    }
    if (clientInfo?.state !== undefined) {
      updates[`${leadRefPath}/state`] = clientInfo.state.trim();
    }
    if (clientInfo?.pincode !== undefined) {
      updates[`${leadRefPath}/pincode`] = clientInfo.pincode.trim();
    }
    if (clientInfo?.placeOfSupply !== undefined) {
      updates[`${leadRefPath}/placeOfSupply`] = clientInfo.placeOfSupply.trim();
    }
    if (clientInfo?.gstin !== undefined) {
      updates[`${leadRefPath}/gstin`] = clientInfo.gstin.trim();
    }
    if (clientInfo?.companyName !== undefined) {
      updates[`${leadRefPath}/companyName`] = clientInfo.companyName.trim();
    }
    updates[`${leadRefPath}/updatedAt`] = timestamp;

    await update(ref(db), updates);
    return true;
  } catch (error) {
    console.error("Firebase updateLeadAddressAndClientInfo Error:", error);
    return false;
  }
}

/**
 * Onboard Client Function:
 * Creates an immutable snapshot record under /onboards/{campaignName}/{date}/{onboardId}
 * and updates master lead with onboarded status & pipeline stage = 'won'.
 */
export async function onboardLeadClient(
  lead: LeadData,
  staffUserEmail?: string,
  campaignName: string = "vintexair"
): Promise<{ success: boolean; onboardId?: string }> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const timestamp = new Date().toISOString();
    const leadId = lead.id || (lead.email ? sanitizeEmailToId(lead.email) : "lead_" + Date.now());
    const createdDate = lead.createdDate || todayStr;
    const onboardId = `ob_${leadId}_${Date.now()}`;
    const newCount = (lead.onboardCount || 0) + 1;

    const onboardRecord: OnboardRecord = {
      id: onboardId,
      leadId: leadId,
      fullName: lead.fullName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      countryCode: lead.countryCode || "+91",
      campaign: campaignName,
      onboardedAt: timestamp,
      onboardedDate: todayStr,
      onboardedBy: staffUserEmail || "Staff",
      dealValue: lead.dealValue || 0,
      survey: lead.survey || {},
      meeting: lead.meeting || {},
      notes: lead.notes || [],
      followUpDate: lead.followUpDate || "",
    };

    const updates: Record<string, any> = {};

    // 1. Store immutable snapshot in dedicated /onboards node
    updates[`onboards/${campaignName}/${todayStr}/${onboardId}`] = onboardRecord;
    updates[`onboards/${campaignName}/all/${onboardId}`] = onboardRecord;

    // 2. Update Master Lead Record with onboard status & move stage to 'won'
    const updatedLeadPayload: LeadData = {
      ...lead,
      onboarded: true,
      onboardedAt: timestamp,
      onboardCount: newCount,
      pipelineStage: "won",
      updatedAt: timestamp,
    };

    updates[`campaigns/${campaignName}/leads/${createdDate}/${leadId}`] = updatedLeadPayload;

    await update(ref(db), updates);

    // Trigger Cloud Tasks Sync for 'won' stage transition
    syncLeadCloudTasks(updatedLeadPayload, lead.pipelineStage || null, null).catch(() => {});

    return { success: true, onboardId };
  } catch (err) {
    console.error("Firebase onboardLeadClient Error:", err);
    return { success: false };
  }
}

/**
 * Fetch all onboard snapshot records from /onboards/{campaignName}/all
 */
export async function getAllOnboardedRecords(campaignName: string = "all"): Promise<OnboardRecord[]> {
  try {
    const results: OnboardRecord[] = [];

    if (campaignName === "all") {
      const campaigns = Object.keys(CAMPAIGNS);
      const snapshots = await Promise.all(
        campaigns.map((cmp) => get(ref(db, `onboards/${cmp}/all`)))
      );

      snapshots.forEach((snap) => {
        if (snap.exists()) {
          const data = snap.val();
          Object.keys(data).forEach((obId) => {
            results.push(data[obId]);
          });
        }
      });
    } else {
      const snap = await get(ref(db, `onboards/${campaignName}/all`));
      if (snap.exists()) {
        const data = snap.val();
        Object.keys(data).forEach((obId) => {
          results.push(data[obId]);
        });
      }
    }

    // Sort newest first by onboardedAt
    return results.sort((a, b) => (b.onboardedAt || "").localeCompare(a.onboardedAt || ""));
  } catch (err) {
    console.error("Firebase getAllOnboardedRecords Error:", err);
    return [];
  }
}

/**
 * Delete a specific onboard snapshot record
 */
export async function deleteOnboardRecord(
  onboardId: string,
  campaignName: string,
  onboardedDate?: string,
  leadId?: string,
  createdDate?: string
): Promise<boolean> {
  try {
    const updates: Record<string, any> = {};

    updates[`onboards/${campaignName}/all/${onboardId}`] = null;
    if (onboardedDate) {
      updates[`onboards/${campaignName}/${onboardedDate}/${onboardId}`] = null;
    }

    if (leadId && createdDate) {
      const allRecords = await getAllOnboardedRecords(campaignName);
      const remainingForLead = allRecords.filter((r) => r.leadId === leadId && r.id !== onboardId);

      if (remainingForLead.length === 0) {
        updates[`campaigns/${campaignName}/leads/${createdDate}/${leadId}/onboarded`] = false;
        updates[`campaigns/${campaignName}/leads/${createdDate}/${leadId}/onboardCount`] = 0;
      } else {
        updates[`campaigns/${campaignName}/leads/${createdDate}/${leadId}/onboardCount`] = remainingForLead.length;
      }
    }

    await update(ref(db), updates);
    return true;
  } catch (err) {
    console.error("Firebase deleteOnboardRecord Error:", err);
    return false;
  }
}

/**
 * Update Deal Value (₹) on an Onboard Record and synchronize with master lead record.
 */
export async function updateOnboardRecordDealValue(
  onboardId: string,
  campaignName: string,
  onboardedDate: string,
  newDealValue: number,
  leadId?: string,
  createdDate?: string
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const updates: Record<string, any> = {};

    updates[`onboards/${campaignName}/all/${onboardId}/dealValue`] = newDealValue;
    updates[`onboards/${campaignName}/all/${onboardId}/updatedAt`] = timestamp;
    if (onboardedDate) {
      updates[`onboards/${campaignName}/${onboardedDate}/${onboardId}/dealValue`] = newDealValue;
      updates[`onboards/${campaignName}/${onboardedDate}/${onboardId}/updatedAt`] = timestamp;
    }

    if (leadId && createdDate) {
      updates[`campaigns/${campaignName}/leads/${createdDate}/${leadId}/dealValue`] = newDealValue;
      updates[`campaigns/${campaignName}/leads/${createdDate}/${leadId}/updatedAt`] = timestamp;
    }

    await update(ref(db), updates);
    return true;
  } catch (err) {
    console.error("Firebase updateOnboardRecordDealValue Error:", err);
    return false;
  }
}

export interface RoleData {
  id: string;
  name: string;
  description: string;
  isDeleted?: boolean;
}

export interface UserData {
  email: string;
  emailId: string;
  roleId: string;
  roleName: string;
  name?: string;
  phone?: string;
  uid?: string;
  updatedAt?: string;
}

export const MASTER_ADMIN_UID = "Z6Q2eQIQQuQf1rgk1hdWWxVUdLX2";

const DEFAULT_ROLES: RoleData[] = [
  { id: "role_admin", name: "Admin", description: "Full system administration & role management access", isDeleted: false },
  { id: "role_onboarding", name: "Onboarding Specialist", description: "Handles client onboarding & contract snapshot creation", isDeleted: false },
  { id: "role_research", name: "Research", description: "Market research & client survey analysis", isDeleted: false },
  { id: "role_editor", name: "Editor", description: "Content & proposal editing staff", isDeleted: false },
  { id: "role_designer", name: "Designer", description: "Creative branding & asset designer", isDeleted: false },
];

/**
 * Fetch all roles from Firebase /roles node. Filters out soft-deleted roles (isDeleted: true).
 */
export async function getRoles(): Promise<RoleData[]> {
  try {
    const rolesSnap = await get(ref(db, "roles"));
    if (!rolesSnap.exists()) {
      const updates: Record<string, any> = {};
      DEFAULT_ROLES.forEach((r) => {
        updates[`roles/${r.id}`] = r;
      });
      await update(ref(db), updates);
      return DEFAULT_ROLES;
    }

    const data = rolesSnap.val();
    const result: RoleData[] = Object.keys(data)
      .map((k) => data[k])
      .filter((r) => !r.isDeleted);

    return result.sort((a, b) => (a.name.toLowerCase() === "admin" ? -1 : 1));
  } catch (err) {
    console.error("Firebase getRoles Error:", err);
    return DEFAULT_ROLES;
  }
}

/**
 * Create a new custom role under /roles node (Prevents creating Admin role)
 */
export async function createRole(
  name: string,
  description: string = ""
): Promise<{ success: boolean; message?: string; role?: RoleData }> {
  try {
    const cleanName = name.trim();
    if (!cleanName) return { success: false, message: "Role name cannot be empty." };

    if (cleanName.toLowerCase() === "admin") {
      return { success: false, message: "Cannot create 'Admin' role. Admin is a system default role." };
    }

    const roleId = "role_" + cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();

    const newRole: RoleData = {
      id: roleId,
      name: cleanName,
      description: description.trim(),
      isDeleted: false,
    };

    await set(ref(db, `roles/${roleId}`), newRole);
    return { success: true, role: newRole };
  } catch (err) {
    console.error("Firebase createRole Error:", err);
    return { success: false, message: "Failed to create role in Firebase." };
  }
}

/**
 * Soft Delete a role from /roles by setting isDeleted: true (Prevents deleting Admin role)
 */
export async function deleteRole(roleId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const roleSnap = await get(ref(db, `roles/${roleId}`));
    if (!roleSnap.exists()) return { success: false, message: "Role not found." };

    const role = roleSnap.val() as RoleData;
    if (role.name.toLowerCase() === "admin" || roleId === "role_admin") {
      return { success: false, message: "System 'Admin' role cannot be deleted." };
    }

    await update(ref(db, `roles/${roleId}`), { isDeleted: true });
    return { success: true };
  } catch (err) {
    console.error("Firebase deleteRole Error:", err);
    return { success: false, message: "Failed to soft delete role." };
  }
}

/**
 * Sync and fetch user profile from Firebase /users node based on Email.
 * For Master Admin, forces Admin role.
 */
export async function syncAndGetUser(uid: string, email: string): Promise<UserData> {
  try {
    const timestamp = new Date().toISOString();
    const cleanEmail = email.trim();
    const emailId = sanitizeEmailToId(cleanEmail);
    const isMasterAdmin = uid === MASTER_ADMIN_UID || cleanEmail.toLowerCase().startsWith("firstoption");

    const userRefPath = `users/${emailId}`;
    const userSnap = await get(ref(db, userRefPath));

    if (!userSnap.exists()) {
      const newUser: UserData = {
        email: cleanEmail,
        emailId,
        roleId: isMasterAdmin ? "role_admin" : "role_onboarding",
        roleName: isMasterAdmin ? "Admin" : "Onboarding Specialist",
        uid,
        updatedAt: timestamp,
      };
      await set(ref(db, userRefPath), newUser);
      return newUser;
    }

    const existingUser = userSnap.val() as UserData;

    if (isMasterAdmin && existingUser.roleId !== "role_admin") {
      const fixedAdmin: UserData = {
        ...existingUser,
        roleId: "role_admin",
        roleName: "Admin",
        uid,
        updatedAt: timestamp,
      };
      await set(ref(db, userRefPath), fixedAdmin);
      return fixedAdmin;
    }

    if (uid && existingUser.uid !== uid) {
      await update(ref(db, userRefPath), { uid, updatedAt: timestamp });
      existingUser.uid = uid;
    }

    return existingUser;
  } catch (err) {
    console.error("Firebase syncAndGetUser Error:", err);
    const cleanEmail = email.trim();
    const isMasterAdmin = uid === MASTER_ADMIN_UID || cleanEmail.toLowerCase().startsWith("firstoption");
    return {
      email: cleanEmail,
      emailId: sanitizeEmailToId(cleanEmail),
      roleId: isMasterAdmin ? "role_admin" : "role_onboarding",
      roleName: isMasterAdmin ? "Admin" : "Onboarding Specialist",
      uid,
    };
  }
}

/**
 * Fetch all registered users from Firebase /users node.
 */
export async function getAllUsers(): Promise<UserData[]> {
  try {
    const usersSnap = await get(ref(db, "users"));
    if (!usersSnap.exists()) return [];

    const data = usersSnap.val();
    const result: UserData[] = Object.keys(data).map((k) => data[k]);
    return result;
  } catch (err) {
    console.error("Firebase getAllUsers Error:", err);
    return [];
  }
}

/**
 * Assign / Update User Role in Firebase /users node by Email.
 * Prevents assigning Admin role to non-Master emails.
 */
export async function setUserRoleByEmail(
  email: string,
  roleId: string,
  roleName: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const cleanEmail = email.trim();
    const emailId = sanitizeEmailToId(cleanEmail);
    const isMaster = cleanEmail.toLowerCase().startsWith("firstoption");

    if (!isMaster && (roleId === "role_admin" || roleName.toLowerCase() === "admin")) {
      return {
        success: false,
        message: "Admin role is strictly reserved for the Master Admin account. You cannot assign Admin role to other staff emails.",
      };
    }

    const timestamp = new Date().toISOString();
    await update(ref(db, `users/${emailId}`), {
      roleId,
      roleName,
      updatedAt: timestamp,
    });

    return { success: true };
  } catch (err) {
    console.error("Firebase setUserRoleByEmail Error:", err);
    return { success: false, message: "Failed to update user role." };
  }
}

/**
 * Register a user entry by Email into Firebase /users node along with staff name, phone number, and UID so Admin can assign their role and system can dispatch WhatsApp notifications.
 */
export async function registerUserByEmail(
  email: string,
  roleId: string = "role_onboarding",
  roleName: string = "Onboarding Specialist",
  name?: string,
  phone?: string,
  uid?: string
): Promise<{ success: boolean; message?: string; user?: UserData }> {
  try {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { success: false, message: "User Email is required." };
    }

    const emailId = sanitizeEmailToId(cleanEmail);
    const isMaster = cleanEmail.toLowerCase().startsWith("firstoption");

    if (!isMaster && (roleId === "role_admin" || roleName.toLowerCase() === "admin")) {
      return { success: false, message: "Cannot assign Admin role to non-Master emails." };
    }

    const timestamp = new Date().toISOString();

    const userEntry: UserData = {
      email: cleanEmail,
      emailId,
      name: name?.trim() || cleanEmail.split("@")[0],
      phone: phone?.trim() || "",
      uid: uid?.trim() || "",
      roleId: isMaster ? "role_admin" : roleId,
      roleName: isMaster ? "Admin" : roleName,
      updatedAt: timestamp,
    };

    await set(ref(db, `users/${emailId}`), userEntry);
    return { success: true, user: userEntry };
  } catch (err) {
    console.error("Firebase registerUserByEmail Error:", err);
    return { success: false, message: "Failed to register user in Firebase." };
  }
}

/**
 * Update existing staff user details (Name, Phone, UID, Role) in Firebase /users node.
 */
export async function updateUserStaffDetails(
  emailId: string,
  data: Partial<UserData>
): Promise<{ success: boolean; message?: string }> {
  try {
    const timestamp = new Date().toISOString();
    await update(ref(db, `users/${emailId}`), {
      ...data,
      updatedAt: timestamp,
    });
    return { success: true };
  } catch (err) {
    console.error("Firebase updateUserStaffDetails Error:", err);
    return { success: false, message: "Failed to update staff user details." };
  }
}

/* ==========================================================================
   WORKFLOW FLOW TEMPLATES & CLIENT FLOW MANAGEMENT
   ========================================================================== */

export interface FlowTaskTemplate {
  id: string;
  roleId: string;
  roleName: string;
  title: string;
  type: "checkbox" | "text" | "both";
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  tasks: FlowTaskTemplate[];
  createdAt: string;
  createdBy: string;
}

export interface ClientFlowTask {
  id: string;
  roleId: string;
  roleName: string;
  title: string;
  type: "checkbox" | "text" | "both";
  isCompleted: boolean;
  textValue: string;
  completedAt?: string;
  completedBy?: string;
}

export interface ClientFlowInstance {
  id: string;
  clientOnboardId: string;
  clientName: string;
  clientEmail: string;
  campaign: string;
  flowTemplateId: string;
  flowName: string;
  status: "in_progress" | "completed";
  assignedAt: string;
  assignedBy: string;
  tasks: ClientFlowTask[];
  roleOrder?: string[];
}

/**
 * Update role sequence order for a Client Flow Instance (Admin Action).
 */
export async function updateClientFlowRoleOrder(
  clientFlowId: string,
  roleOrder: string[]
): Promise<{ success: boolean }> {
  try {
    await update(ref(db, `clientFlows/${clientFlowId}`), {
      roleOrder,
    });
    return { success: true };
  } catch (err) {
    console.error("Firebase updateClientFlowRoleOrder Error:", err);
    return { success: false };
  }
}

/**
 * Fetch all Flow Templates from Firebase /flows node.
 */
export async function getFlowTemplates(): Promise<FlowTemplate[]> {
  try {
    const snap = await get(ref(db, "flows"));
    if (!snap.exists()) return [];

    const data = snap.val();
    return Object.keys(data).map((k) => data[k]);
  } catch (err) {
    console.error("Firebase getFlowTemplates Error:", err);
    return [];
  }
}

/**
 * Create a new Flow Template under /flows node.
 */
export async function createFlowTemplate(
  name: string,
  description: string,
  tasks: FlowTaskTemplate[],
  createdBy: string
): Promise<{ success: boolean; message?: string; flow?: FlowTemplate }> {
  try {
    const cleanName = name.trim();
    if (!cleanName) return { success: false, message: "Flow name is required." };
    if (!tasks || tasks.length === 0) return { success: false, message: "At least one task step is required." };

    const flowId = "flow_" + cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
    const timestamp = new Date().toISOString();

    const newFlow: FlowTemplate = {
      id: flowId,
      name: cleanName,
      description: description.trim(),
      tasks,
      createdAt: timestamp,
      createdBy,
    };

    await set(ref(db, `flows/${flowId}`), newFlow);
    return { success: true, flow: newFlow };
  } catch (err) {
    console.error("Firebase createFlowTemplate Error:", err);
    return { success: false, message: "Failed to create flow template." };
  }
}

/**
 * Update an existing Flow Template under /flows node.
 */
export async function updateFlowTemplate(
  flowId: string,
  name: string,
  description: string,
  tasks: FlowTaskTemplate[],
  updatedBy: string
): Promise<{ success: boolean; message?: string; flow?: FlowTemplate }> {
  try {
    const cleanName = name.trim();
    if (!cleanName) return { success: false, message: "Flow name is required." };
    if (!tasks || tasks.length === 0) return { success: false, message: "At least one task step is required." };

    const flowRef = ref(db, `flows/${flowId}`);
    const snapshot = await get(flowRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};

    const updatedFlow: FlowTemplate = {
      ...existingData,
      id: flowId,
      name: cleanName,
      description: description.trim(),
      tasks,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    await set(flowRef, updatedFlow);
    return { success: true, flow: updatedFlow };
  } catch (err) {
    console.error("Firebase updateFlowTemplate Error:", err);
    return { success: false, message: "Failed to update flow template." };
  }
}

/**
 * Delete a Flow Template from /flows.
 */
export async function deleteFlowTemplate(flowId: string): Promise<{ success: boolean; message?: string }> {
  try {
    await set(ref(db, `flows/${flowId}`), null);
    return { success: true };
  } catch (err) {
    console.error("Firebase deleteFlowTemplate Error:", err);
    return { success: false, message: "Failed to delete flow template." };
  }
}

/**
 * Assign a Flow Template to an Onboarded Client under /clientFlows.
 */
export async function assignFlowToClient(
  clientOnboardId: string,
  clientName: string,
  clientEmail: string,
  campaign: string,
  flowTemplateId: string,
  customFlowName: string,
  assignedBy: string
): Promise<{ success: boolean; message?: string; instance?: ClientFlowInstance }> {
  try {
    const templates = await getFlowTemplates();
    const targetTemplate = templates.find((t) => t.id === flowTemplateId);

    if (!targetTemplate) {
      return { success: false, message: "Selected Flow template does not exist." };
    }

    const instanceId = "cflow_" + Date.now();
    const timestamp = new Date().toISOString();

    const clientTasks: ClientFlowTask[] = targetTemplate.tasks.map((t) => ({
      id: "ctask_" + Math.random().toString(36).substr(2, 9),
      roleId: t.roleId,
      roleName: t.roleName,
      title: t.title,
      type: t.type,
      isCompleted: false,
      textValue: "",
    }));

    const flowInstance: ClientFlowInstance = {
      id: instanceId,
      clientOnboardId,
      clientName,
      clientEmail,
      campaign,
      flowTemplateId,
      flowName: customFlowName.trim() || targetTemplate.name,
      status: "in_progress",
      assignedAt: timestamp,
      assignedBy,
      tasks: clientTasks,
    };

    await set(ref(db, `clientFlows/${instanceId}`), flowInstance);
    return { success: true, instance: flowInstance };
  } catch (err) {
    console.error("Firebase assignFlowToClient Error:", err);
    return { success: false, message: "Failed to assign flow to client." };
  }
}

/**
 * Fetch all assigned Client Flow Instances from /clientFlows.
 */
export async function getAllClientFlows(): Promise<ClientFlowInstance[]> {
  try {
    const snap = await get(ref(db, "clientFlows"));
    if (!snap.exists()) return [];

    const data = snap.val();
    return Object.keys(data).map((k) => data[k]);
  } catch (err) {
    console.error("Firebase getAllClientFlows Error:", err);
    return [];
  }
}

/**
 * Update a task's completion status and text value in a Client Flow Instance.
 * Saves timestamp (completedAt) and user (completedBy) when checked.
 * Resets or updates timestamps on toggle.
 */
export async function updateClientFlowTaskStatus(
  clientFlowId: string,
  taskId: string,
  isCompleted: boolean,
  textValue: string,
  userEmail: string
): Promise<{ success: boolean }> {
  try {
    const snap = await get(ref(db, `clientFlows/${clientFlowId}`));
    if (!snap.exists()) return { success: false };

    const flow = snap.val() as ClientFlowInstance;
    const timestamp = new Date().toISOString();

    const updatedTasks = flow.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          isCompleted,
          textValue,
          completedAt: isCompleted ? timestamp : null,
          completedBy: isCompleted ? userEmail : null,
        };
      }
      return t;
    });

    await update(ref(db, `clientFlows/${clientFlowId}`), {
      tasks: updatedTasks,
    });

    return { success: true };
  } catch (err) {
    console.error("Firebase updateClientFlowTaskStatus Error:", err);
    return { success: false };
  }
}

/**
 * Mark an entire Client Flow Instance as completed (Admin Only Action).
 */
export async function markClientFlowCompleted(clientFlowId: string): Promise<{ success: boolean }> {
  try {
    await update(ref(db, `clientFlows/${clientFlowId}`), {
      status: "completed",
    });
    return { success: true };
  } catch (err) {
    console.error("Firebase markClientFlowCompleted Error:", err);
    return { success: false };
  }
}

/**
 * Delete an assigned Client Flow Instance from /clientFlows.
 */
export async function deleteClientFlowInstance(clientFlowId: string): Promise<{ success: boolean }> {
  try {
    await set(ref(db, `clientFlows/${clientFlowId}`), null);
    return { success: true };
  } catch (err) {
    console.error("Firebase deleteClientFlowInstance Error:", err);
    return { success: false };
  }
}

/* ==========================================================================
   SUPPORT TICKET SYSTEM HELPERS
   ========================================================================== */

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  level: "level1" | "level2" | "level3" | "level4";
  levelLabel: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

/**
 * Raise a new Support Ticket in /support_tickets
 */
export async function createSupportTicket(
  ticket: Omit<SupportTicket, "id" | "ticketNumber" | "createdAt" | "status">
): Promise<{ success: boolean; data?: SupportTicket; error?: string }> {
  try {
    const timestamp = new Date().toISOString();
    const ticketsRef = ref(db, "support_tickets");
    const snapshot = await get(ticketsRef);
    const existingCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    const ticketNumber = `TCK-${1000 + existingCount + 1}`;
    const newTicketRef = push(ticketsRef);
    const ticketId = newTicketRef.key || `tck_${Date.now()}`;

    const newTicket: SupportTicket = {
      ...ticket,
      id: ticketId,
      ticketNumber,
      status: "open",
      createdAt: timestamp,
    };

    await set(ref(db, `support_tickets/${ticketId}`), newTicket);
    return { success: true, data: newTicket };
  } catch (err: any) {
    console.error("createSupportTicket Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all Support Tickets from /support_tickets
 */
export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    const snapshot = await get(ref(db, "support_tickets"));
    if (!snapshot.exists()) return [];
    const val = snapshot.val();
    const tickets = Object.values(val) as SupportTicket[];
    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("getAllSupportTickets Error:", err);
    return [];
  }
}

/**
 * Update Support Ticket Status in /support_tickets
 */
export async function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicket["status"],
  resolvedBy?: string
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const updateData: Record<string, any> = { status, updatedAt: timestamp };
    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = timestamp;
      if (resolvedBy) updateData.resolvedBy = resolvedBy;
    }
    await update(ref(db, `support_tickets/${ticketId}`), updateData);
    return true;
  } catch (err) {
    console.error("updateSupportTicketStatus Error:", err);
    return false;
  }
}

/**
 * Delete a Support Ticket from /support_tickets
 */
export async function deleteSupportTicket(ticketId: string): Promise<boolean> {
  try {
    await set(ref(db, `support_tickets/${ticketId}`), null);
    return true;
  } catch (err) {
    console.error("deleteSupportTicket Error:", err);
    return false;
  }
}

// ==========================================
// VINTEX AIR INVENTORY & STOCK MANAGEMENT
// ==========================================

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  fullDescription: string;
  hsnCode: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockAlert: number;
  purchaseRate: number;
  sellingRate: number;
  gstRate: number;
  taxAmount: number;
  totalSellingPrice: number;
  vendorId?: string;
  vendorName?: string;
  supplierName?: string;
  warehouseLocation?: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  type: "purchase" | "sale" | "adjustment";
  itemId: string;
  itemSku: string;
  itemName: string;
  qty: number;
  previousStock: number;
  newStock: number;
  unitRate: number;
  gstRate: number;
  taxAmount: number;
  totalAmount: number;
  referenceNo: string;
  partyName: string;
  partyContact?: string;
  vendorId?: string;
  leadId?: string;
  quotationId?: string;
  notes?: string;
  createdAt: string;
  performedBy: string;
}

export interface InventorySummary {
  totalItems: number;
  totalStockUnits: number;
  totalStockValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  lastUpdated: string;
}

// ==========================================
// VENDOR MANAGEMENT INTERFACES & METHODS
// ==========================================

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankBranch?: string;
  categoriesSupplied?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// QUOTATION INTERFACES & METHODS
// ==========================================

export interface QuotationItem {
  id: string;
  itemId?: string;
  sku?: string;
  name: string;
  subtext?: string;
  hsnCode: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number;
  taxAmount: number;
  amount: number;
}

export interface QuotationBankDetails {
  accountName: string;
  ifscCode: string;
  accountNo: string;
  bankName: string;
  upiId: string;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  quotationDate: string;
  leadId?: string;
  campaign?: string;
  clientName: string;
  clientAddress?: string;
  clientMobile: string;
  clientEmail?: string;
  placeOfSupply: string;
  shipToName?: string;
  shipToAddress?: string;
  items: QuotationItem[];
  subtotal: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
  totalAmountInWords: string;
  bankDetails: QuotationBankDetails;
  status: "draft" | "sent" | "confirmed" | "cancelled" | "invoiced";
  isStockDeducted?: boolean;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PURCHASE BILL INTERFACES & METHODS
// ==========================================

export interface PurchaseBillItem {
  id: string;
  itemId?: string;
  sku?: string;
  name: string;
  hsnCode: string;
  qty: number;
  unit: string;
  purchaseRate: number;
  gstRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PurchaseBill {
  id: string;
  billNo: string;
  poReference?: string;
  vendorId?: string;
  vendorName: string;
  vendorGstin?: string;
  vendorPhone?: string;
  billDate: string;
  items: PurchaseBillItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  totalAmountInWords: string;
  paymentStatus: "paid" | "partial" | "pending";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const VINTEX_AIR_COMPANY_DETAILS = {
  companyName: "Vintex Air",
  tagline: "Industrial Evaporative Air Coolers & Ventilation Systems",
  address: "opp Salim Sizing ,sardar Nagar Near Iqra Hospital,Malegaon , Nashik, Maharashtra, 423203",
  mobile: "9922245312",
  gstin: "27FGZPS8932R1ZN",
  panNumber: "FGZPS8932R",
  email: "vintexair@gmail.com",
  bankDetails: {
    accountName: "Royal Aircone",
    ifscCode: "UTIB0001240",
    accountNo: "91902002803808042",
    bankName: "Axis Bank, Malegaon",
    upiId: "9922245312@axisbank",
  },
};

/**
 * Standard Vintex Air product category list
 */
export const VINTEX_INVENTORY_CATEGORIES = [
  "Evaporative Air Coolers",
  "Industrial Exhaust Fans",
  "HVLS Fans & Blowers",
  "Ducting & Air Diffusers",
  "Cooling Pads & Media",
  "Motors, Pumps & Electricals",
  "Valves, Sensors & Plumbing",
  "Spares & Accessories",
];

/**
 * Standard units of measurement
 */
export const VINTEX_INVENTORY_UNITS = [
  "PCS",
  "SQF",
  "SETS",
  "UNITS",
  "METERS",
  "NOS",
  "BOX",
  "KG",
];

/**
 * Convert number into Indian currency words format
 * e.g. 132975 -> "One Lakh Thirty Two Thousand Nine Hundred Seventy Five Rupees Only"
 */
export function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (n: number): string => {
    let str = "";
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  const crore = Math.floor(integerPart / 10000000);
  const remainderAfterCrore = integerPart % 10000000;
  const lakh = Math.floor(remainderAfterCrore / 100000);
  const remainderAfterLakh = remainderAfterCrore % 100000;
  const thousand = Math.floor(remainderAfterLakh / 1000);
  const remainderAfterThousand = remainderAfterLakh % 1000;
  const hundred = Math.floor(remainderAfterThousand / 100);
  const rest = remainderAfterThousand % 100;

  let result = "";

  if (crore > 0) {
    result += inWords(crore) + " Crore ";
  }
  if (lakh > 0) {
    result += inWords(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    result += inWords(thousand) + " Thousand ";
  }
  if (hundred > 0) {
    result += inWords(hundred) + " Hundred ";
  }
  if (rest > 0) {
    result += inWords(rest) + " ";
  }

  result = result.trim() + " Rupees";

  if (decimalPart > 0) {
    result += " and " + inWords(decimalPart) + " Paise";
  }

  return result + " Only";
}

/**
 * Calculate stock status based on current quantity vs minimum alert threshold
 */
export function calculateStockStatus(currentStock: number, minStockAlert: number = 2): "in_stock" | "low_stock" | "out_of_stock" {
  if (currentStock <= 0) return "out_of_stock";
  if (currentStock <= minStockAlert) return "low_stock";
  return "in_stock";
}

/**
 * Fetch all inventory items from /inventory_items
 */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const snapshot = await get(ref(db, "inventory_items"));
    if (!snapshot.exists()) {
      return await seedDefaultVintexAirInventory();
    }
    const data = snapshot.val();
    return Object.keys(data).map((key) => ({
      ...data[key],
      id: key,
    }));
  } catch (err) {
    console.error("getInventoryItems Error:", err);
    return [];
  }
}

/**
 * Fetch single inventory item by ID
 */
export async function getInventoryItemById(itemId: string): Promise<InventoryItem | null> {
  try {
    const snapshot = await get(ref(db, `inventory_items/${itemId}`));
    if (!snapshot.exists()) return null;
    return { ...snapshot.val(), id: itemId };
  } catch (err) {
    console.error("getInventoryItemById Error:", err);
    return null;
  }
}

/**
 * Create or Update an Inventory Item
 */
export async function saveInventoryItem(item: Partial<InventoryItem> & { sku: string; name: string }): Promise<InventoryItem> {
  const timestamp = new Date().toISOString();
  const id = item.id || item.sku.replace(/[^a-zA-Z0-9_-]/g, "_").toUpperCase();
  
  const currentStock = Number(item.currentStock || 0);
  const minStockAlert = Number(item.minStockAlert || 2);
  const sellingRate = Number(item.sellingRate || 0);
  const gstRate = Number(item.gstRate || 18);
  const purchaseRate = Number(item.purchaseRate || 0);

  const taxAmount = Math.round((sellingRate * (gstRate / 100)) * 100) / 100;
  const totalSellingPrice = Math.round((sellingRate + taxAmount) * 100) / 100;
  const status = calculateStockStatus(currentStock, minStockAlert);

  const fullItem: InventoryItem = {
    id,
    sku: item.sku.trim().toUpperCase(),
    name: item.name.trim(),
    fullDescription: item.fullDescription || "",
    hsnCode: item.hsnCode || "84796000",
    category: item.category || "Evaporative Air Coolers",
    unit: item.unit || "PCS",
    currentStock,
    minStockAlert,
    purchaseRate,
    sellingRate,
    gstRate,
    taxAmount,
    totalSellingPrice,
    vendorId: item.vendorId || "",
    vendorName: item.vendorName || item.supplierName || "Vintex Air Manufacturing Unit",
    supplierName: item.supplierName || item.vendorName || "Vintex Air Manufacturing Unit",
    warehouseLocation: item.warehouseLocation || "Main Plant - Bay A1",
    status,
    createdAt: item.createdAt || timestamp,
    updatedAt: timestamp,
  };

  await set(ref(db, `inventory_items/${id}`), fullItem);
  await refreshInventorySummary();
  return fullItem;
}

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(itemId: string): Promise<boolean> {
  try {
    await set(ref(db, `inventory_items/${itemId}`), null);
    await refreshInventorySummary();
    return true;
  } catch (err) {
    console.error("deleteInventoryItem Error:", err);
    return false;
  }
}

/**
 * Atomic Stock Transaction Movement (Purchase / Sale / Adjustment)
 */
export async function recordStockTransaction(
  payload: {
    type: "purchase" | "sale" | "adjustment";
    itemId: string;
    itemSku?: string;
    itemName?: string;
    qty: number;
    unitRate?: number;
    gstRate?: number;
    taxAmount?: number;
    totalAmount?: number;
    referenceNo?: string;
    partyName?: string;
    partyContact?: string;
    vendorId?: string;
    leadId?: string;
    quotationId?: string;
    notes?: string;
    performedBy?: string;
  }
): Promise<{ success: boolean; newStock: number; transactionId?: string; error?: string }> {
  try {
    const itemSnapshot = await get(ref(db, `inventory_items/${payload.itemId}`));
    if (!itemSnapshot.exists()) {
      return { success: false, newStock: 0, error: "Item not found in inventory" };
    }

    const currentItem: InventoryItem = itemSnapshot.val();
    const previousStock = currentItem.currentStock || 0;
    const qtyChange = Number(payload.qty);

    let newStock = previousStock;
    if (payload.type === "purchase") {
      newStock = previousStock + Math.abs(qtyChange);
    } else if (payload.type === "sale") {
      if (previousStock < Math.abs(qtyChange)) {
        return { success: false, newStock: previousStock, error: `Insufficient stock on hand (Available: ${previousStock})` };
      }
      newStock = Math.max(0, previousStock - Math.abs(qtyChange));
    } else {
      newStock = Math.max(0, qtyChange);
    }

    const newStatus = calculateStockStatus(newStock, currentItem.minStockAlert);
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.slice(0, 10);
    const txnId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const unitRate = payload.unitRate !== undefined ? payload.unitRate : (payload.type === "purchase" ? currentItem.purchaseRate : currentItem.sellingRate);
    const gstRate = currentItem.gstRate || 18;
    const itemTax = Math.round((unitRate * Math.abs(qtyChange) * (gstRate / 100)) * 100) / 100;
    const totalAmount = Math.round((unitRate * Math.abs(qtyChange) + itemTax) * 100) / 100;

    const txnRecord: InventoryTransaction = {
      id: txnId,
      type: payload.type,
      itemId: currentItem.id,
      itemSku: currentItem.sku,
      itemName: currentItem.name,
      qty: payload.type === "sale" ? -Math.abs(qtyChange) : Math.abs(qtyChange),
      previousStock,
      newStock,
      unitRate,
      gstRate,
      taxAmount: itemTax,
      totalAmount,
      referenceNo: payload.referenceNo || `REF-${Date.now().toString().slice(-6)}`,
      partyName: payload.partyName || (payload.type === "purchase" ? currentItem.supplierName || "Supplier" : "Client"),
      partyContact: payload.partyContact || "",
      vendorId: payload.vendorId || currentItem.vendorId || "",
      leadId: payload.leadId || "",
      quotationId: payload.quotationId || "",
      notes: payload.notes || "",
      createdAt: timestamp,
      performedBy: payload.performedBy || "System Staff",
    };

    const updates: Record<string, any> = {};
    updates[`inventory_items/${currentItem.id}/currentStock`] = newStock;
    updates[`inventory_items/${currentItem.id}/status`] = newStatus;
    updates[`inventory_items/${currentItem.id}/updatedAt`] = timestamp;

    const yearMonth = dateStr.slice(0, 7);
    updates[`inventory_transactions/${yearMonth}/${txnId}`] = txnRecord;
    updates[`inventory_transactions_recent/${txnId}`] = txnRecord;

    await update(ref(db), updates);
    await refreshInventorySummary();

    return { success: true, newStock, transactionId: txnId };
  } catch (err: any) {
    console.error("recordStockTransaction Error:", err);
    return { success: false, newStock: 0, error: err.message || "Failed to record transaction" };
  }
}

/**
 * Fetch Recent Inventory Ledger Transactions
 */
export async function getInventoryTransactions(limitCount: number = 100): Promise<InventoryTransaction[]> {
  try {
    const snapshot = await get(ref(db, "inventory_transactions_recent"));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    const list: InventoryTransaction[] = Object.keys(data).map((k) => ({
      ...data[k],
      id: k,
    }));
    return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, limitCount);
  } catch (err) {
    console.error("getInventoryTransactions Error:", err);
    return [];
  }
}

/**
 * Get cached 400-byte aggregate inventory summary
 */
export async function getInventorySummary(): Promise<InventorySummary> {
  try {
    const snapshot = await get(ref(db, "inventory_summary"));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return await refreshInventorySummary();
  } catch (err) {
    console.error("getInventorySummary Error:", err);
    return {
      totalItems: 0,
      totalStockUnits: 0,
      totalStockValuation: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Recompute and store aggregate inventory summary
 */
export async function refreshInventorySummary(): Promise<InventorySummary> {
  try {
    const snapshot = await get(ref(db, "inventory_items"));
    let totalItems = 0;
    let totalStockUnits = 0;
    let totalStockValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const item: InventoryItem = data[key];
        totalItems++;
        const stock = Number(item.currentStock || 0);
        totalStockUnits += stock;
        totalStockValuation += stock * Number(item.totalSellingPrice || 0);
        if (stock <= 0) {
          outOfStockCount++;
        } else if (stock <= Number(item.minStockAlert || 2)) {
          lowStockCount++;
        }
      });
    }

    const summary: InventorySummary = {
      totalItems,
      totalStockUnits,
      totalStockValuation: Math.round(totalStockValuation),
      lowStockCount,
      outOfStockCount,
      lastUpdated: new Date().toISOString(),
    };

    await set(ref(db, "inventory_summary"), summary);
    return summary;
  } catch (err) {
    console.error("refreshInventorySummary Error:", err);
    return {
      totalItems: 0,
      totalStockUnits: 0,
      totalStockValuation: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// ==========================================
// VENDOR CRUD & LINKING METHODS
// ==========================================

export async function getVendors(): Promise<Vendor[]> {
  try {
    const snapshot = await get(ref(db, "vendors"));
    if (!snapshot.exists()) {
      return await seedDefaultVendors();
    }
    const data = snapshot.val();
    return Object.keys(data).map((k) => ({
      ...data[k],
      id: k,
    }));
  } catch (err) {
    console.error("getVendors Error:", err);
    return [];
  }
}

export async function saveVendor(vendor: Partial<Vendor> & { name: string; phone: string }): Promise<Vendor> {
  const timestamp = new Date().toISOString();
  const id = vendor.id || `VEND_${Date.now()}`;
  const fullVendor: Vendor = {
    id,
    name: vendor.name.trim(),
    contactPerson: vendor.contactPerson || "",
    phone: vendor.phone.trim(),
    email: vendor.email || "",
    gstin: vendor.gstin || "",
    pan: vendor.pan || "",
    address: vendor.address || "",
    city: vendor.city || "",
    state: vendor.state || "Maharashtra",
    pincode: vendor.pincode || "",
    bankName: vendor.bankName || "",
    bankAccountNo: vendor.bankAccountNo || "",
    bankIfsc: vendor.bankIfsc || "",
    bankBranch: vendor.bankBranch || "",
    categoriesSupplied: vendor.categoriesSupplied || [],
    notes: vendor.notes || "",
    createdAt: vendor.createdAt || timestamp,
    updatedAt: timestamp,
  };

  await set(ref(db, `vendors/${id}`), fullVendor);
  return fullVendor;
}

export async function deleteVendor(vendorId: string): Promise<boolean> {
  try {
    await set(ref(db, `vendors/${vendorId}`), null);
    return true;
  } catch (err) {
    console.error("deleteVendor Error:", err);
    return false;
  }
}

export async function seedDefaultVendors(): Promise<Vendor[]> {
  const timestamp = new Date().toISOString();
  const seedVendors: Vendor[] = [
    {
      id: "VEND_VINTEX_MFG",
      name: "Vintex Air Manufacturing Unit",
      contactPerson: "Production Head - Shakir Ansari",
      phone: "9922245312",
      email: "vintexair@gmail.com",
      gstin: "27FGZPS8932R1ZN",
      pan: "FGZPS8932R",
      address: "Opp Salim Sizing, Sardar Nagar Near Iqra Hospital",
      city: "Malegaon",
      state: "Maharashtra",
      pincode: "423203",
      bankName: "Axis Bank, Malegaon",
      bankAccountNo: "91902002803808042",
      bankIfsc: "UTIB0001240",
      bankBranch: "Malegaon Branch",
      categoriesSupplied: ["Evaporative Air Coolers", "Industrial Exhaust Fans"],
      notes: "In-house primary manufacturing facility",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "VEND_JSW_STEEL",
      name: "JSW Jindal Steel & Sheet Co.",
      contactPerson: "Ramesh Sharma",
      phone: "9823011450",
      email: "sales@jindalsheets.com",
      gstin: "27AAACJ1234F1Z8",
      pan: "AAACJ1234F",
      address: "Plot 45, MIDC Industrial Area",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422007",
      bankName: "HDFC Bank",
      bankAccountNo: "50200012345678",
      bankIfsc: "HDFC0001234",
      bankBranch: "Nashik MIDC",
      categoriesSupplied: ["Ducting & Air Diffusers"],
      notes: "GI 24 Gage & 22 Gage heavy sheets supplier",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "VEND_APEX_INSUL",
      name: "Apex Insulation & Media Supplies",
      contactPerson: "Vikram Patel",
      phone: "9422078901",
      email: "apex.insulation@gmail.com",
      gstin: "27AAPCA9876E1Z2",
      pan: "AAPCA9876E",
      address: "12, Shendra MIDC",
      city: "Aurangabad",
      state: "Maharashtra",
      pincode: "431154",
      bankName: "State Bank of India",
      bankAccountNo: "30894561234",
      bankIfsc: "SBIN0004567",
      bankBranch: "Shendra MIDC",
      categoriesSupplied: ["Cooling Pads & Media"],
      notes: "XLPE silver foil insulation & Celdek 5090 cooling pads",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const map: Record<string, Vendor> = {};
  seedVendors.forEach((v) => {
    map[v.id] = v;
  });

  await set(ref(db, "vendors"), map);
  return seedVendors;
}

// ==========================================
// QUOTATION CRUD & STOCK SYNC METHODS
// ==========================================

export async function getQuotations(): Promise<Quotation[]> {
  try {
    const snapshot = await get(ref(db, "quotations"));
    if (!snapshot.exists()) {
      return await seedDefaultQuotations();
    }
    const data = snapshot.val();
    const list: Quotation[] = Object.keys(data).map((k) => ({
      ...data[k],
      id: k,
    }));
    return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  } catch (err) {
    console.error("getQuotations Error:", err);
    return [];
  }
}

export async function getQuotationsByLeadId(leadId: string): Promise<Quotation[]> {
  try {
    const snapshot = await get(ref(db, `quotations_by_lead/${leadId}`));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    const list: Quotation[] = Object.keys(data).map((k) => ({
      ...data[k],
      id: k,
    }));
    return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  } catch (err) {
    console.error("getQuotationsByLeadId Error:", err);
    return [];
  }
}

export async function saveQuotation(
  quotation: Partial<Quotation> & { clientName: string; clientMobile: string; items: QuotationItem[] },
  options?: { shouldDeductStock?: boolean; performedBy?: string }
): Promise<Quotation> {
  const timestamp = new Date().toISOString();
  const id = quotation.id || `QTN_${Date.now()}`;
  
  // Calculate Totals and Tax Breakdown
  let taxableAmount = 0;
  let subtotal = 0;
  let totalTax = 0;

  const items = quotation.items.map((it, idx) => {
    const qty = Number(it.qty || 1);
    const rate = Number(it.rate || 0);
    const gstRate = Number(it.gstRate || 0);
    const lineBase = Math.round(qty * rate * 100) / 100;
    const lineTax = Math.round(lineBase * (gstRate / 100) * 100) / 100;
    const lineTotal = Math.round((lineBase + lineTax) * 100) / 100;

    taxableAmount += lineBase;
    subtotal += lineTotal;
    totalTax += lineTax;

    return {
      ...it,
      id: it.id || `item_${idx + 1}`,
      qty,
      rate,
      gstRate,
      taxAmount: lineTax,
      amount: lineTotal,
    };
  });

  const isMaharashtra = (quotation.placeOfSupply || "Maharashtra").toLowerCase().includes("maharashtra");
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isMaharashtra) {
    cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    sgstAmount = Math.round((totalTax / 2) * 100) / 100;
  } else {
    igstAmount = totalTax;
  }

  const finalTotalAmount = Math.round((taxableAmount + totalTax) * 100) / 100;
  const totalAmountInWords = numberToIndianWords(finalTotalAmount);

  const fullQuotation: Quotation = {
    id,
    quotationNo: quotation.quotationNo || "5",
    quotationDate: quotation.quotationDate || new Date().toLocaleDateString("en-GB"),
    leadId: quotation.leadId || "",
    campaign: quotation.campaign || "vintexair",
    clientName: quotation.clientName.trim(),
    clientAddress: quotation.clientAddress || "Madani Chowk Indira Nagar Aurangabad, Aurangabad, Maharashtra, 431001",
    clientMobile: quotation.clientMobile.trim(),
    clientEmail: quotation.clientEmail || "",
    placeOfSupply: quotation.placeOfSupply || "Maharashtra",
    shipToName: quotation.shipToName || quotation.clientName.trim(),
    shipToAddress: quotation.shipToAddress || quotation.clientAddress || "",
    items,
    subtotal,
    taxableAmount,
    cgstRate: isMaharashtra ? 9 : 0,
    cgstAmount,
    sgstRate: isMaharashtra ? 9 : 0,
    sgstAmount,
    igstRate: !isMaharashtra ? 18 : 0,
    igstAmount,
    totalTax,
    totalAmount: finalTotalAmount,
    totalAmountInWords,
    bankDetails: quotation.bankDetails || VINTEX_AIR_COMPANY_DETAILS.bankDetails,
    status: quotation.status || "draft",
    isStockDeducted: quotation.isStockDeducted || false,
    notes: quotation.notes || "",
    createdBy: quotation.createdBy || options?.performedBy || "Vintex Air Executive",
    createdAt: quotation.createdAt || timestamp,
    updatedAt: timestamp,
  };

  // Perform atomic stock deduction if requested and not already deducted
  if (options?.shouldDeductStock && !fullQuotation.isStockDeducted) {
    for (const lineItem of items) {
      if (lineItem.itemId) {
        await recordStockTransaction({
          type: "sale",
          itemId: lineItem.itemId,
          qty: lineItem.qty,
          unitRate: lineItem.rate,
          referenceNo: `QTN-${fullQuotation.quotationNo}`,
          partyName: fullQuotation.clientName,
          partyContact: fullQuotation.clientMobile,
          leadId: fullQuotation.leadId,
          quotationId: fullQuotation.id,
          notes: `Stock deducted for Quotation #${fullQuotation.quotationNo}`,
          performedBy: options?.performedBy || "Vintex Air Executive",
        });
      }
    }
    fullQuotation.isStockDeducted = true;
  }

  // Multi-path save
  const updates: Record<string, any> = {};
  updates[`quotations/${id}`] = fullQuotation;
  if (fullQuotation.leadId) {
    updates[`quotations_by_lead/${fullQuotation.leadId}/${id}`] = fullQuotation;
  }
  const dateKey = timestamp.slice(0, 10);
  updates[`quotations_daily/${dateKey}/${id}`] = fullQuotation;

  await update(ref(db), updates);

  // Automatically sync/update client address back to lead profile for future quotations
  if (fullQuotation.leadId) {
    updateLeadAddressAndClientInfo(
      fullQuotation.leadId,
      undefined,
      {
        fullName: fullQuotation.clientName,
        phone: fullQuotation.clientMobile,
        email: fullQuotation.clientEmail,
        address: fullQuotation.clientAddress,
        clientAddress: fullQuotation.clientAddress,
        shippingAddress: fullQuotation.shipToAddress,
        placeOfSupply: fullQuotation.placeOfSupply,
      },
      fullQuotation.campaign || "vintexair"
    ).catch((err) => console.error("Error auto-updating lead address on quote save:", err));
  }

  return fullQuotation;
}

export async function deleteQuotation(quotationId: string, leadId?: string, shouldRestoreStock: boolean = true): Promise<boolean> {
  try {
    const snapshot = await get(ref(db, `quotations/${quotationId}`));
    if (snapshot.exists()) {
      const q: Quotation = snapshot.val();
      // Restore stock if it was deducted
      if (shouldRestoreStock && q.isStockDeducted) {
        for (const lineItem of q.items) {
          if (lineItem.itemId) {
            await recordStockTransaction({
              type: "purchase",
              itemId: lineItem.itemId,
              qty: lineItem.qty,
              unitRate: lineItem.rate,
              referenceNo: `RESTORE-QTN-${q.quotationNo}`,
              partyName: q.clientName,
              partyContact: q.clientMobile,
              leadId: q.leadId,
              quotationId: q.id,
              notes: `Stock restored from deleted Quotation #${q.quotationNo}`,
              performedBy: "System Restoration",
            });
          }
        }
      }

      const updates: Record<string, any> = {};
      updates[`quotations/${quotationId}`] = null;
      if (leadId || q.leadId) {
        updates[`quotations_by_lead/${leadId || q.leadId}/${quotationId}`] = null;
      }
      await update(ref(db), updates);
    }
    return true;
  } catch (err) {
    console.error("deleteQuotation Error:", err);
    return false;
  }
}

// ==========================================
// PURCHASE BILLS CRUD METHODS
// ==========================================

export async function getPurchaseBills(): Promise<PurchaseBill[]> {
  try {
    const snapshot = await get(ref(db, "purchase_bills"));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    const list: PurchaseBill[] = Object.keys(data).map((k) => ({
      ...data[k],
      id: k,
    }));
    return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  } catch (err) {
    console.error("getPurchaseBills Error:", err);
    return [];
  }
}

export async function savePurchaseBill(
  bill: Partial<PurchaseBill> & { vendorName: string; items: PurchaseBillItem[] },
  options?: { shouldAddStock?: boolean; performedBy?: string }
): Promise<PurchaseBill> {
  const timestamp = new Date().toISOString();
  const id = bill.id || `PB_${Date.now()}`;
  
  let subtotal = 0;
  let taxAmount = 0;

  const items = bill.items.map((it, idx) => {
    const qty = Number(it.qty || 1);
    const rate = Number(it.purchaseRate || 0);
    const gstRate = Number(it.gstRate || 0);
    const lineBase = Math.round(qty * rate * 100) / 100;
    const lineTax = Math.round(lineBase * (gstRate / 100) * 100) / 100;
    const lineTotal = Math.round((lineBase + lineTax) * 100) / 100;

    subtotal += lineBase;
    taxAmount += lineTax;

    return {
      ...it,
      id: it.id || `pb_item_${idx + 1}`,
      qty,
      purchaseRate: rate,
      gstRate,
      taxAmount: lineTax,
      totalAmount: lineTotal,
    };
  });

  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
  const totalAmountInWords = numberToIndianWords(totalAmount);

  const fullBill: PurchaseBill = {
    id,
    billNo: bill.billNo || `PB-${Date.now().toString().slice(-6)}`,
    poReference: bill.poReference || "",
    vendorId: bill.vendorId || "",
    vendorName: bill.vendorName.trim(),
    vendorGstin: bill.vendorGstin || "",
    vendorPhone: bill.vendorPhone || "",
    billDate: bill.billDate || new Date().toLocaleDateString("en-GB"),
    items,
    subtotal,
    taxAmount,
    totalAmount,
    totalAmountInWords,
    paymentStatus: bill.paymentStatus || "paid",
    notes: bill.notes || "",
    createdAt: bill.createdAt || timestamp,
    updatedAt: timestamp,
  };

  // Add stock if requested
  if (options?.shouldAddStock) {
    for (const it of items) {
      if (it.itemId) {
        await recordStockTransaction({
          type: "purchase",
          itemId: it.itemId,
          qty: it.qty,
          unitRate: it.purchaseRate,
          referenceNo: fullBill.billNo,
          partyName: fullBill.vendorName,
          partyContact: fullBill.vendorPhone,
          vendorId: fullBill.vendorId,
          notes: `Stock inward from Purchase Bill #${fullBill.billNo}`,
          performedBy: options?.performedBy || "Vintex Air Executive",
        });
      }
    }
  }

  await set(ref(db, `purchase_bills/${id}`), fullBill);
  return fullBill;
}

// ==========================================
// SEED RICH DEMO CATALOG & SAMPLE QUOTATION
// ==========================================

export async function seedDefaultVintexAirInventory(): Promise<InventoryItem[]> {
  const timestamp = new Date().toISOString();
  const seedProducts: InventoryItem[] = [
    {
      id: "VA16_U30",
      sku: "VA16-U30",
      name: "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH , TOP DISCHARGE",
      fullDescription: "3 KW 415V, PREMIUM QUALITY MOTOR COPER WINDING , SINGLE SPEED , AXIAL FAN TYPE , 4 SIDE 100 MM THECKNES BEST QUALITY COOLING PADS, SUMMERSIBLE 75W PUMP, AUTO DRAIN & WATER BALL AUTO SYSTEM",
      hsnCode: "84796000",
      category: "Evaporative Air Coolers",
      unit: "PCS",
      currentStock: 8,
      minStockAlert: 2,
      purchaseRate: 50000,
      sellingRate: 65000,
      gstRate: 18,
      taxAmount: 11700,
      totalSellingPrice: 76700,
      vendorId: "VEND_VINTEX_MFG",
      vendorName: "Vintex Air Manufacturing Unit",
      supplierName: "Vintex Air Manufacturing Unit",
      warehouseLocation: "Main Plant - Bay A1",
      status: "in_stock",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "VA01_Z18",
      sku: "VA01-Z18",
      name: "( VA01- Z18 ) EVAPORATIVE AIR COOLER, 22000 CMH , SIDE DISCHARGE",
      fullDescription: "1.5 KW 220V, PREMIUM QUALITY MOTOR COPER WINDING , SINGLE SPEED , AXIAL FAN TYPE , 4 SIDE 100 MM THECKNES BEST QUALITY COOLING PADS, SUMMERSIBLE 45W PUMP, AUTO DRAIN & WATER BALL AUTO SYSTEM",
      hsnCode: "84796000",
      category: "Evaporative Air Coolers",
      unit: "PCS",
      currentStock: 12,
      minStockAlert: 3,
      purchaseRate: 35000,
      sellingRate: 45000,
      gstRate: 18,
      taxAmount: 8100,
      totalSellingPrice: 53100,
      vendorId: "VEND_VINTEX_MFG",
      vendorName: "Vintex Air Manufacturing Unit",
      supplierName: "Vintex Air Manufacturing Unit",
      warehouseLocation: "Main Plant - Bay A2",
      status: "in_stock",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "VA_DUCT_24G",
      sku: "VA-DUCT-24G",
      name: "GI DUCTING 24 GAGE. 60MM , JSW JINDAL SHEET MAKE DUCT HEAVY NUT BOLT LEAKAGE JOINT GASKIT FABRICATION",
      fullDescription: "JSW JINDAL 24 GAUGE GALVANIZED IRON DUCTING WITH NEOPRENE GASKET SEALING AND NUT-BOLT FLANGE ASSEMBLY",
      hsnCode: "72104900",
      category: "Ducting & Air Diffusers",
      unit: "SQF",
      currentStock: 500,
      minStockAlert: 50,
      purchaseRate: 75,
      sellingRate: 101.69,
      gstRate: 18,
      taxAmount: 18.31,
      totalSellingPrice: 120,
      vendorId: "VEND_JSW_STEEL",
      vendorName: "JSW Jindal Steel & Sheet Co.",
      supplierName: "JSW Jindal Steel & Sheet Co.",
      warehouseLocation: "Fabrication Yard - Rack D1",
      status: "in_stock",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "VA_INSUL_9MM",
      sku: "VA-INSUL-9MM",
      name: "INSULATION 9MM SILVER FOILS XLPE OUTSIDE COVERING OF THE DUCT",
      fullDescription: "9MM THICK CROSSLINKED POLYETHYLENE (XLPE) FOAM WITH REINFORCED ALUMINIUM FOIL VAPOUR BARRIER",
      hsnCode: "40081110",
      category: "Cooling Pads & Media",
      unit: "PCS",
      currentStock: 120,
      minStockAlert: 20,
      purchaseRate: 32,
      sellingRate: 46.61,
      gstRate: 18,
      taxAmount: 8.39,
      totalSellingPrice: 55,
      vendorId: "VEND_APEX_INSUL",
      vendorName: "Apex Insulation & Media Supplies",
      supplierName: "Apex Insulation & Media Supplies",
      warehouseLocation: "Storage Rack C2",
      status: "in_stock",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "VA_CANVAS_CONN",
      sku: "VA-CANVAS-CONN",
      name: "CANVAS AIR COOLER CONNECTION: AVOID VIBRATION & NOISE,WITH WATER LONG LIFE PACKOK",
      fullDescription: "HEAVY DUTY FLEXIBLE CANVAS DUCT CONNECTOR FOR COOLER DISCHARGE COLLAR VIBRATION ISOLATION",
      hsnCode: "8479",
      category: "Spares & Accessories",
      unit: "PCS",
      currentStock: 25,
      minStockAlert: 5,
      purchaseRate: 2000,
      sellingRate: 3000,
      gstRate: 0,
      taxAmount: 0,
      totalSellingPrice: 3000,
      vendorId: "VEND_VINTEX_MFG",
      vendorName: "Vintex Air Manufacturing Unit",
      supplierName: "Vintex Air Manufacturing Unit",
      warehouseLocation: "Storage Rack B4",
      status: "in_stock",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const itemsMap: Record<string, InventoryItem> = {};
  seedProducts.forEach((p) => {
    itemsMap[p.id] = p;
  });

  await set(ref(db, "inventory_items"), itemsMap);
  await refreshInventorySummary();
  await seedDefaultVendors();
  await seedDefaultQuotations();

  return seedProducts;
}

export async function seedDefaultQuotations(): Promise<Quotation[]> {
  const timestamp = new Date().toISOString();
  const sampleQuotation: Quotation = {
    id: "QTN_SAMPLE_005",
    quotationNo: "5",
    quotationDate: "28/06/2026",
    leadId: "lead_royal_bakery",
    campaign: "vintexair",
    clientName: "Royal Bakery",
    clientAddress: "Madani Chowk Indira Nagar Aurangabad, Aurangabad, Maharashtra, 431001",
    clientMobile: "9325212498",
    clientEmail: "royalbakery.aurangabad@gmail.com",
    placeOfSupply: "Maharashtra",
    shipToName: "Royal Bakery",
    shipToAddress: "Madani Chowk Indira Nagar Aurangabad, Aurangabad, Maharashtra, 431001",
    items: [
      {
        id: "item_1",
        itemId: "VA16_U30",
        sku: "VA16-U30",
        name: "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH , TOP DISCHARGE, 3 KW 415V, PREMIUM QUALITY MOTOR COPER WINDING , SINGLE SPEED , AXIAL FAN TYPE , 4 SIDE 100 MM THECKNES BEST QUALITY COOLING PADS, SUMMERSIBLE 75W PUMP, AUTO DRAIN & WATER BALL AUTO SYSTEM ,",
        hsnCode: "84796000",
        qty: 1,
        unit: "PCS",
        rate: 65000,
        gstRate: 18,
        taxAmount: 11700,
        amount: 76700,
      },
      {
        id: "item_2",
        itemId: "VA01_Z18",
        sku: "VA01-Z18",
        name: "( VA01- Z18 ) EVAPORATIVE AIR COOLER, 22000 CMH , SIDE DISCHARGE, 1.5 KW 220V, PREMIUM QUALITY MOTOR COPER WINDING , SINGLE SPEED , AXIAL FAN TYPE , 4 SIDE 100 MM THECKNES BEST QUALITY COOLING PADS, SUMMERSIBLE 45W PUMP, AUTO DRAIN & WATER BALL AUTO SYSTEM ,",
        hsnCode: "84796000",
        qty: 1,
        unit: "PCS",
        rate: 45000,
        gstRate: 18,
        taxAmount: 8100,
        amount: 53100,
      },
      {
        id: "item_3",
        itemId: "VA_DUCT_24G",
        sku: "VA-DUCT-24G",
        name: "GI DUCTING 24 GAGE. 60MM , JSW JINDAL SHEET MAKE DUCT HEAVY NUT BOLT LEAKAGE JOINT GASKIT FABRICATION",
        hsnCode: "72104900",
        qty: 1,
        unit: "SQF",
        rate: 101.69,
        gstRate: 18,
        taxAmount: 18.31,
        amount: 120,
      },
      {
        id: "item_4",
        itemId: "VA_INSUL_9MM",
        sku: "VA-INSUL-9MM",
        name: "INSULATION 9MM SILVER FOILS XLPE OUTSIDE COVERING OF THE DUCT",
        subtext: "Insulation",
        hsnCode: "40081110",
        qty: 1,
        unit: "PCS",
        rate: 46.61,
        gstRate: 18,
        taxAmount: 8.39,
        amount: 55,
      },
      {
        id: "item_5",
        itemId: "VA_CANVAS_CONN",
        sku: "VA-CANVAS-CONN",
        name: "CANVAS AIR COOLER CONNECTION: AVOID VIBRATION & NOISE,WITH WATER LONG LIFE PACKOK",
        subtext: "Canvas Fabrication",
        hsnCode: "8479",
        qty: 1,
        unit: "PCS",
        rate: 3000,
        gstRate: 0,
        taxAmount: 0,
        amount: 3000,
      },
    ],
    subtotal: 132975,
    taxableAmount: 113148.31,
    cgstRate: 9,
    cgstAmount: 9913.35,
    sgstRate: 9,
    sgstAmount: 9913.35,
    igstRate: 0,
    igstAmount: 0,
    totalTax: 19826.69,
    totalAmount: 132975,
    totalAmountInWords: "One Lakh Thirty Two Thousand Nine Hundred Seventy Five Rupees Only",
    bankDetails: VINTEX_AIR_COMPANY_DETAILS.bankDetails,
    status: "sent",
    isStockDeducted: false,
    notes: "Supply & installation quotation for commercial bakery production unit",
    createdBy: "Vintex Air Executive",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const map: Record<string, Quotation> = {
    [sampleQuotation.id]: sampleQuotation,
  };

  await set(ref(db, "quotations"), map);
  await set(ref(db, `quotations_by_lead/lead_royal_bakery/${sampleQuotation.id}`), sampleQuotation);

  return [sampleQuotation];
}

/**
 * RESET & SEED COMPLETE VINTEX AIR DATABASE
 * Wipes old test inventory, vendors, quotations, bills and injects realistic high-accuracy records.
 */
export async function resetAndSeedVintexAirDatabase(): Promise<{
  success: boolean;
  vendorsCount: number;
  productsCount: number;
  billsCount: number;
  quotationsCount: number;
  error?: string;
}> {
  try {
    const timestamp = new Date().toISOString();
    const dateToday = timestamp.slice(0, 10);

    // 1. VENDORS DATASET
    const vendorsList: Vendor[] = [
      {
        id: "VENDOR_JINDAL_STEEL",
        name: "Jindal Steel & Sheets Ltd.",
        contactPerson: "Rajesh Sharma (Commercial Sales)",
        phone: "9822334455",
        email: "sales@jindalsteelsheets.com",
        gstin: "27AAACJ1234F1Z5",
        pan: "AAACJ1234F",
        address: "Plot No. 42-45, MIDC Industrial Area, Malegaon",
        city: "Malegaon",
        state: "Maharashtra",
        pincode: "423203",
        bankName: "State Bank of India, Malegaon Branch",
        bankAccountNo: "308912345678",
        bankIfsc: "SBIN0000423",
        notes: "Primary supplier for 24 Gauge & 22 Gauge GI Sheet coils for ducting fabrication",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VENDOR_HAVELLS_MOTORS",
        name: "Havells Industrial Motors & Electricals",
        contactPerson: "Vikram Malhotra (Industrial Division)",
        phone: "9890112233",
        email: "industrial.motors@havells.in",
        gstin: "27AABCH5678K1Z2",
        pan: "AABCH5678K",
        address: "B-12, Chakan Industrial Phase 2, Pune",
        city: "Pune",
        state: "Maharashtra",
        pincode: "410501",
        bankName: "HDFC Bank, Chakan Branch",
        bankAccountNo: "50200034567890",
        bankIfsc: "HDFC0001234",
        notes: "3 KW 415V & 1.5 KW 230V 100% Copper Winding single & dual speed cooler motors",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VENDOR_BHARAT_PUMPS",
        name: "Bharat Pumps & Submersible Systems",
        contactPerson: "Sunil Patil",
        phone: "9765432100",
        email: "bharatpumps.nsk@gmail.com",
        gstin: "27AABCB9012M1Z8",
        pan: "AABCB9012M",
        address: "Ambad MIDC, Near ITI Signal, Nashik",
        city: "Nashik",
        state: "Maharashtra",
        pincode: "422010",
        bankName: "ICICI Bank, Nashik City",
        bankAccountNo: "001205009876",
        bankIfsc: "ICIC0000012",
        notes: "75W & 120W Submersible heavy duty water pumps, automatic drain valves & float balls",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VENDOR_APEX_MEDIA",
        name: "Apex Celdek Cooling Media & Pads",
        contactPerson: "Kishore Patel",
        phone: "9426778899",
        email: "apex.celdek@gmail.com",
        gstin: "24AACCA3456L1Z4",
        pan: "AACCA3456L",
        address: "GIDC Industrial Estate, Vatva, Ahmedabad",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "382445",
        bankName: "Axis Bank, Vatva GIDC",
        bankAccountNo: "918020011223344",
        bankIfsc: "UTIB0000567",
        notes: "100mm Celdek 5090 cross-fluted anti-fungal treated cooling pads & XLPE insulation",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];

    // 2. PRODUCTS / INVENTORY ITEMS DATASET
    const productsList: InventoryItem[] = [
      {
        id: "VA_COOLER_30000_TOP",
        sku: "VA16-U30",
        name: "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH , TOP DISCHARGE, 3 KW 415V, PREMIUM QUALITY MOTOR COPER WINDING , SINGLE SPEED , AXIAL FAN TYPE , 4 SIDE 100 MM THECKNES BEST QUALITY COOLING PADS, SUMMERSIBLE 75W PUMP, AUTO DRAIN & WATER BALL AUTO SYSTEM",
        category: "Evaporative Air Coolers",
        hsnCode: "84796000",
        unit: "PCS",
        currentStock: 12,
        minStockAlert: 2,
        status: "in_stock",
        purchaseRate: 52000,
        sellingRate: 65000,
        gstRate: 18,
        taxAmount: 11700,
        totalSellingPrice: 76700,
        vendorId: "VENDOR_HAVELLS_MOTORS",
        supplierName: "Havells Industrial Motors & Electricals",
        vendorName: "Havells Industrial Motors & Electricals",
        warehouseLocation: "Plant Warehouse - Bay A1",
        fullDescription: "Heavy duty 30,000 CMH top discharge industrial cooler with 100% copper winding 3kW 415V motor.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VA_COOLER_22000_SIDE",
        sku: "VA01-Z18",
        name: "( VA01- Z18 ) EVAPORATIVE AIR COOLER, 22000 CMH , SIDE DISCHARGE, 1.5 KW 230V SINGLE PHASE MOTOR COPPER WINDING , AXIAL FAN TYPE , 4 SIDE 100 MM THICKNESS COOLING PADS, SUBMERSIBLE 75W PUMP",
        category: "Evaporative Air Coolers",
        hsnCode: "84796000",
        unit: "PCS",
        currentStock: 18,
        minStockAlert: 3,
        status: "in_stock",
        purchaseRate: 36000,
        sellingRate: 45000,
        gstRate: 18,
        taxAmount: 8100,
        totalSellingPrice: 53100,
        vendorId: "VENDOR_HAVELLS_MOTORS",
        supplierName: "Havells Industrial Motors & Electricals",
        vendorName: "Havells Industrial Motors & Electricals",
        warehouseLocation: "Plant Warehouse - Bay A2",
        fullDescription: "22,000 CMH side discharge air cooler ideal for commercial bakeries, warehouses and restaurants.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VA_DUCTING_24G",
        sku: "VA-DUCT-24G",
        name: "GI DUCTING 24 GAGE. 60MM , JSW JINDAL SHEET MAKE",
        category: "Ducting & Air Diffusers",
        hsnCode: "72104900",
        unit: "SQF",
        currentStock: 450,
        minStockAlert: 50,
        status: "in_stock",
        purchaseRate: 78.5,
        sellingRate: 101.69,
        gstRate: 18,
        taxAmount: 18.31,
        totalSellingPrice: 120,
        vendorId: "VENDOR_JINDAL_STEEL",
        supplierName: "Jindal Steel & Sheets Ltd.",
        vendorName: "Jindal Steel & Sheets Ltd.",
        warehouseLocation: "Fabrication Yard - Rack B1",
        fullDescription: "Hot dip galvanized iron sheet ducting 24 gauge with 60mm flange and corner brackets.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VA_INSULATION_9MM",
        sku: "VA-INSU-9MM",
        name: "INSULATION 9MM SILVER FOILS XLPE OUTSIDE COVERING OF THE DUCT",
        category: "Ducting & Air Diffusers",
        hsnCode: "40081110",
        unit: "PCS",
        currentStock: 320,
        minStockAlert: 30,
        status: "in_stock",
        purchaseRate: 34.0,
        sellingRate: 46.61,
        gstRate: 18,
        taxAmount: 8.39,
        totalSellingPrice: 55,
        vendorId: "VENDOR_APEX_MEDIA",
        supplierName: "Apex Celdek Cooling Media & Pads",
        vendorName: "Apex Celdek Cooling Media & Pads",
        warehouseLocation: "Fabrication Yard - Rack B2",
        fullDescription: "9mm XLPE closed-cell cross-linked polyethylene foam insulation with reinforced silver aluminium foil.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VA_CANVAS_CONN",
        sku: "VA-CANVAS-CONN",
        name: "CANVAS AIR COOLER CONNECTION: AVOID VIBRATION & NOISE,WITH WATER LONG LIFE PACKOK",
        category: "Spares & Accessories",
        hsnCode: "8479",
        unit: "PCS",
        currentStock: 40,
        minStockAlert: 5,
        status: "in_stock",
        purchaseRate: 2100,
        sellingRate: 3000,
        gstRate: 0,
        taxAmount: 0,
        totalSellingPrice: 3000,
        vendorId: "VENDOR_JINDAL_STEEL",
        supplierName: "Jindal Steel & Sheets Ltd.",
        vendorName: "Jindal Steel & Sheets Ltd.",
        warehouseLocation: "Assembly Room - Bin C1",
        fullDescription: "Heavy duty flexible anti-vibration fire retardant waterproof canvas duct connector collar.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VA_PUMP_75W",
        sku: "VA-PUMP-75W",
        name: "SUBMERSIBLE 75W HEAVY DUTY COOLER WATER PUMP WITH AUTO-SHUTOFF",
        category: "Valves, Sensors & Plumbing",
        hsnCode: "84137010",
        unit: "PCS",
        currentStock: 65,
        minStockAlert: 10,
        status: "in_stock",
        purchaseRate: 1300,
        sellingRate: 1850,
        gstRate: 18,
        taxAmount: 333,
        totalSellingPrice: 2183,
        vendorId: "VENDOR_BHARAT_PUMPS",
        supplierName: "Bharat Pumps & Submersible Systems",
        vendorName: "Bharat Pumps & Submersible Systems",
        warehouseLocation: "Plumbing Stores - Bin D1",
        fullDescription: "75W 230V submersible continuous duty cooler pump with thermal overload protector.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "VA_PAD_100MM",
        sku: "VA-PAD-CELDEK",
        name: "100 MM THICKNESS CELDEK 5090 FLUTE CROSS FLUTED COOLING PAD",
        category: "Cooling Pads & Media",
        hsnCode: "84799090",
        unit: "PCS",
        currentStock: 85,
        minStockAlert: 15,
        status: "in_stock",
        purchaseRate: 980,
        sellingRate: 1450,
        gstRate: 18,
        taxAmount: 261,
        totalSellingPrice: 1711,
        vendorId: "VENDOR_APEX_MEDIA",
        supplierName: "Apex Celdek Cooling Media & Pads",
        vendorName: "Apex Celdek Cooling Media & Pads",
        warehouseLocation: "Cooling Media Stores - Bay E1",
        fullDescription: "High efficiency 5090 cross-fluted cellulose evaporative cooling pad with anti-rot resin.",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];

    // 3. PURCHASE BILLS & INWARD TRANSACTIONS
    const purchaseBillsList: PurchaseBill[] = [
      {
        id: "PB_1001",
        billNo: "PB-2026-001",
        poReference: "PO-HAVELLS-8921",
        vendorId: "VENDOR_HAVELLS_MOTORS",
        vendorName: "Havells Industrial Motors & Electricals",
        vendorGstin: "27AABCH5678K1Z2",
        vendorPhone: "9890112233",
        billDate: dateToday,
        items: [
          {
            id: "pbi_1",
            itemId: "VA_COOLER_30000_TOP",
            sku: "VA16-U30",
            name: "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH",
            hsnCode: "84796000",
            qty: 10,
            unit: "PCS",
            purchaseRate: 52000,
            gstRate: 18,
            taxAmount: 93600,
            totalAmount: 613600,
          },
          {
            id: "pbi_2",
            itemId: "VA_COOLER_22000_SIDE",
            sku: "VA01-Z18",
            name: "( VA01- Z18 ) EVAPORATIVE AIR COOLER, 22000 CMH",
            hsnCode: "84796000",
            qty: 15,
            unit: "PCS",
            purchaseRate: 36000,
            gstRate: 18,
            taxAmount: 97200,
            totalAmount: 637200,
          },
        ],
        subtotal: 1060000,
        taxAmount: 190800,
        totalAmount: 1250800,
        totalAmountInWords: "Twelve Lakh Fifty Thousand Eight Hundred Rupees Only",
        paymentStatus: "paid",
        notes: "Factory batch inward delivery for summer installation orders",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "PB_1002",
        billNo: "PB-2026-002",
        poReference: "PO-JINDAL-9042",
        vendorId: "VENDOR_JINDAL_STEEL",
        vendorName: "Jindal Steel & Sheets Ltd.",
        vendorGstin: "27AAACJ1234F1Z5",
        vendorPhone: "9822334455",
        billDate: dateToday,
        items: [
          {
            id: "pbi_3",
            itemId: "VA_DUCTING_24G",
            sku: "VA-DUCT-24G",
            name: "GI DUCTING 24 GAGE. 60MM , JSW JINDAL SHEET MAKE",
            hsnCode: "72104900",
            qty: 500,
            unit: "SQF",
            purchaseRate: 78.5,
            gstRate: 18,
            taxAmount: 7065,
            totalAmount: 46315,
          },
        ],
        subtotal: 39250,
        taxAmount: 7065,
        totalAmount: 46315,
        totalAmountInWords: "Forty Six Thousand Three Hundred Fifteen Rupees Only",
        paymentStatus: "paid",
        notes: "Raw material for upcoming industrial ducting projects",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];

    // 4. STOCK AUDIT TRANSACTIONS
    const transactionsList: InventoryTransaction[] = [
      {
        id: "TXN_INIT_001",
        type: "purchase",
        itemId: "VA_COOLER_30000_TOP",
        itemSku: "VA16-U30",
        itemName: "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH",
        qty: 10,
        previousStock: 0,
        newStock: 10,
        unitRate: 52000,
        gstRate: 18,
        taxAmount: 93600,
        totalAmount: 613600,
        referenceNo: "PB-2026-001",
        partyName: "Havells Industrial Motors & Electricals",
        vendorId: "VENDOR_HAVELLS_MOTORS",
        notes: "Opening batch procurement from Havells Industrial",
        performedBy: "Vintex Plant Manager",
        createdAt: timestamp,
      },
      {
        id: "TXN_INIT_002",
        type: "purchase",
        itemId: "VA_DUCTING_24G",
        itemSku: "VA-DUCT-24G",
        itemName: "GI DUCTING 24 GAGE. 60MM",
        qty: 500,
        previousStock: 0,
        newStock: 500,
        unitRate: 78.5,
        gstRate: 18,
        taxAmount: 7065,
        totalAmount: 46315,
        referenceNo: "PB-2026-002",
        partyName: "Jindal Steel & Sheets Ltd.",
        vendorId: "VENDOR_JINDAL_STEEL",
        notes: "Inward sheet coil shipment from Jindal MIDC Malegaon",
        performedBy: "Vintex Plant Manager",
        createdAt: timestamp,
      },
    ];

    // 5. OFFICIAL VINTEX AIR QUOTATIONS DATASET (MATCHING USER SCREENSHOT)
    const quotationsList: Quotation[] = [
      {
        id: "QUOTE_005",
        quotationNo: "5",
        quotationDate: "28/06/2026",
        leadId: "lead_royal_bakery",
        campaign: "vintexair",
        clientName: "Royal Bakery",
        clientAddress: "Madani Chowk Indira Nagar Aurangabad, Aurangabad, Maharashtra, 431001",
        clientMobile: "9325212498",
        clientEmail: "royalbakery.aur@gmail.com",
        placeOfSupply: "Maharashtra",
        shipToName: "Royal Bakery",
        shipToAddress: "Madani Chowk Indira Nagar Aurangabad, Aurangabad, Maharashtra, 431001",
        items: [
          {
            id: "q_item_1",
            itemId: "VA_COOLER_30000_TOP",
            sku: "VA16-U30",
            name: "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH , TOP DISCHARGE, 3 KW 415V, PREMIUM QUALITY MOTOR COPER WINDING , SINGLE SPEED , AXIAL FAN TYPE , 4 SIDE 100 MM THECKNES BEST QUALITY COOLING PADS, SUMMERSIBLE 75W PUMP, AUTO DRAIN & WATER BALL AUTO SYSTEM",
            subtext: "Top Discharge 30000 CMH",
            hsnCode: "84796000",
            qty: 1,
            unit: "PCS",
            rate: 65000,
            gstRate: 18,
            taxAmount: 11700,
            amount: 76700,
          },
          {
            id: "q_item_2",
            itemId: "VA_COOLER_22000_SIDE",
            sku: "VA01-Z18",
            name: "( VA01- Z18 ) EVAPORATIVE AIR COOLER, 22000 CMH , SIDE DISCHARGE, 1.5 KW 230V SINGLE PHASE MOTOR COPPER WINDING , AXIAL FAN TYPE , 4 SIDE 100 MM THICKNESS COOLING PADS, SUBMERSIBLE 75W PUMP",
            subtext: "Side Discharge 22000 CMH",
            hsnCode: "84796000",
            qty: 1,
            unit: "PCS",
            rate: 45000,
            gstRate: 18,
            taxAmount: 8100,
            amount: 53100,
          },
          {
            id: "q_item_3",
            itemId: "VA_DUCTING_24G",
            sku: "VA-DUCT-24G",
            name: "GI DUCTING 24 GAGE. 60MM , JSW JINDAL SHEET MAKE",
            subtext: "JSW Jindal Sheet Make",
            hsnCode: "72104900",
            qty: 1,
            unit: "SQF",
            rate: 101.69,
            gstRate: 18,
            taxAmount: 18.31,
            amount: 120,
          },
          {
            id: "q_item_4",
            itemId: "VA_INSULATION_9MM",
            sku: "VA-INSU-9MM",
            name: "INSULATION 9MM SILVER FOILS XLPE OUTSIDE COVERING OF THE DUCT",
            subtext: "XLPE Silver Foil",
            hsnCode: "40081110",
            qty: 1,
            unit: "PCS",
            rate: 46.61,
            gstRate: 18,
            taxAmount: 8.39,
            amount: 55,
          },
          {
            id: "q_item_5",
            itemId: "VA_CANVAS_CONN",
            sku: "VA-CANVAS-CONN",
            name: "CANVAS AIR COOLER CONNECTION: AVOID VIBRATION & NOISE,WITH WATER LONG LIFE PACKOK",
            subtext: "Canvas Anti-Vibration Joint",
            hsnCode: "8479",
            qty: 1,
            unit: "PCS",
            rate: 3000,
            gstRate: 0,
            taxAmount: 0,
            amount: 3000,
          },
        ],
        subtotal: 132975,
        taxableAmount: 113148.31,
        cgstRate: 9,
        cgstAmount: 9913.35,
        sgstRate: 9,
        sgstAmount: 9913.35,
        igstRate: 0,
        igstAmount: 0,
        totalTax: 19826.69,
        totalAmount: 132975,
        totalAmountInWords: "One Lakh Thirty Two Thousand Nine Hundred Seventy Five Rupees Only",
        bankDetails: VINTEX_AIR_COMPANY_DETAILS.bankDetails,
        status: "sent",
        isStockDeducted: false,
        notes: "Supply and commissioning of industrial evaporative cooler system for bakery ovens and packing area",
        createdBy: "Vintex Air Executive",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "QUOTE_006",
        quotationNo: "6",
        quotationDate: "29/06/2026",
        leadId: "lead_panchavati_hotel",
        campaign: "vintexair",
        clientName: "Hotel Panchavati Grand Kitchen",
        clientAddress: "Mumbai Agra Highway, Near Dwarka Circle, Nashik, Maharashtra, 422011",
        clientMobile: "9823145670",
        clientEmail: "panchavati.nashik@gmail.com",
        placeOfSupply: "Maharashtra",
        shipToName: "Hotel Panchavati Grand Kitchen",
        shipToAddress: "Mumbai Agra Highway, Near Dwarka Circle, Nashik, Maharashtra, 422011",
        items: [
          {
            id: "q_item_6",
            itemId: "VA_COOLER_30000_TOP",
            sku: "VA16-U30",
            name: "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH , TOP DISCHARGE, 3 KW 415V",
            subtext: "Commercial Kitchen Ventilation",
            hsnCode: "84796000",
            qty: 2,
            unit: "PCS",
            rate: 65000,
            gstRate: 18,
            taxAmount: 23400,
            amount: 153400,
          },
          {
            id: "q_item_7",
            itemId: "VA_DUCTING_24G",
            sku: "VA-DUCT-24G",
            name: "GI DUCTING 24 GAGE. 60MM , JSW JINDAL SHEET MAKE",
            subtext: "Ducting network",
            hsnCode: "72104900",
            qty: 120,
            unit: "SQF",
            rate: 101.69,
            gstRate: 18,
            taxAmount: 2196.5,
            amount: 14400,
          },
        ],
        subtotal: 167800,
        taxableAmount: 142202.8,
        cgstRate: 9,
        cgstAmount: 12798.25,
        sgstRate: 9,
        sgstAmount: 12798.25,
        igstRate: 0,
        igstAmount: 0,
        totalTax: 25596.5,
        totalAmount: 167800,
        totalAmountInWords: "One Lakh Sixty Seven Thousand Eight Hundred Rupees Only",
        bankDetails: VINTEX_AIR_COMPANY_DETAILS.bankDetails,
        status: "confirmed",
        isStockDeducted: true,
        notes: "Kitchen exhaust and cooling solution with rooftop top discharge unit",
        createdBy: "Vintex Air Executive",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];

    // WRITE TO REALTIME DATABASE IN PARALLEL
    const vendorsMap: Record<string, Vendor> = {};
    vendorsList.forEach((v) => { vendorsMap[v.id] = v; });

    const productsMap: Record<string, InventoryItem> = {};
    productsList.forEach((p) => { productsMap[p.id] = p; });

    const billsMap: Record<string, PurchaseBill> = {};
    purchaseBillsList.forEach((b) => { billsMap[b.id] = b; });

    const txnsMap: Record<string, InventoryTransaction> = {};
    transactionsList.forEach((t) => { txnsMap[t.id] = t; });

    const quotesMap: Record<string, Quotation> = {};
    quotationsList.forEach((q) => { quotesMap[q.id] = q; });

    await Promise.all([
      set(ref(db, "vendors"), vendorsMap),
      set(ref(db, "inventory_items"), productsMap),
      set(ref(db, "purchase_bills"), billsMap),
      set(ref(db, "inventory_transactions"), txnsMap),
      set(ref(db, "quotations"), quotesMap),
      set(ref(db, "quotations_by_lead/lead_royal_bakery"), { [quotationsList[0].id]: quotationsList[0] }),
      set(ref(db, "quotations_by_lead/lead_panchavati_hotel"), { [quotationsList[1].id]: quotationsList[1] }),
    ]);

    return {
      success: true,
      vendorsCount: vendorsList.length,
      productsCount: productsList.length,
      billsCount: purchaseBillsList.length,
      quotationsCount: quotationsList.length,
    };
  } catch (err: any) {
    console.error("resetAndSeedVintexAirDatabase error:", err);
    return {
      success: false,
      vendorsCount: 0,
      productsCount: 0,
      billsCount: 0,
      quotationsCount: 0,
      error: err.message || "Failed to reset and seed database",
    };
  }
}

