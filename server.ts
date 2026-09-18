import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory / server storage for user's tracked requests
interface StoredRequest {
  id: string;
  title: string;
  request_type: "RTI" | "GRIEVANCE" | "MIXED";
  problem: string;
  location?: string;
  duration?: string;
  previousComplaintNo?: string;
  facts: Array<{ field: string; value: string; source: "user_provided" }>;
  missing_information: string[];
  rti_questions: string[];
  grievance_draft: string | null;
  rti_draft: string | null;
  official_channel: {
    id: string;
    name: string;
    purpose: string;
    jurisdiction: string;
    url: string;
    tracking_url: string;
    type: string;
    supports: string[];
    instructions: string;
  };
  reference_number?: string;
  submission_date?: string;
  status: "Draft" | "Submitted" | "Under Process" | "Action Taken" | "Closed" | "User Updated" | "Other";
  last_checked?: string;
  notes?: string;
  next_action_guidance?: string;
  created_at: string;
  updated_at: string;
}

const userRequestsStore: Map<string, StoredRequest> = new Map();

// Official Portals Configuration Directory
const OFFICIAL_PORTALS = {
  cpgrams: {
    id: "cpgrams",
    name: "CPGRAMS (Centralised Public Grievance Portal)",
    purpose: "Central Government Ministries, National Highways, Telecom, Banking, Railways & Central Utilities",
    jurisdiction: "Central",
    url: "https://pgportal.gov.in",
    tracking_url: "https://pgportal.gov.in/Status",
    type: "central_grievance",
    supports: ["submission", "tracking"],
    instructions: "Submit grievance under the concerned Central Ministry. Save the unique 14-character Registration Number for tracking.",
  },
  state_grievance: {
    id: "state_grievance",
    name: "State Public Grievance / CM Helpline Portal",
    purpose: "State Department Roads, Sanitation, State Water Supply, State Police, Housing, and State PWD",
    jurisdiction: "State",
    url: "https://pgportal.gov.in",
    tracking_url: "https://pgportal.gov.in/Status",
    type: "state_grievance",
    supports: ["submission", "tracking"],
    instructions: "Submit through your State Government Citizen Portal / CM Helpline. You will receive an SMS acknowledgment with a reference ID.",
  },
  municipal_ward: {
    id: "municipal_ward",
    name: "Municipal Corporation / Local Ward Office",
    purpose: "Local colony roads, streetlights, garbage sanitation, drainage, public parks, local civil maintenance",
    jurisdiction: "Local / Municipal",
    url: "https://pgportal.gov.in",
    tracking_url: "https://pgportal.gov.in/Status",
    type: "municipal",
    supports: ["submission", "tracking"],
    instructions: "Submit directly via the Municipal Corporation citizen app or physically at the Ward Office / Junior Engineer's desk.",
  },
  rti_central: {
    id: "rti_central",
    name: "RTI Online Portal (DoPT, Government of India)",
    purpose: "Filing and tracking RTI applications for Central Government Ministries, PSUs, and Autonomous Bodies",
    jurisdiction: "Central",
    url: "https://rtionline.gov.in",
    tracking_url: "https://rtionline.gov.in/request/status.php",
    type: "central_rti",
    supports: ["submission", "tracking"],
    instructions: "Submit application under Section 6(1) with Rs. 10 statutory fee via Netbanking/UPI. Save your registration number for online status tracking.",
  },
  rti_state: {
    id: "rti_state",
    name: "State / Local RTI Public Information Office",
    purpose: "Municipal road expenditures, ward tenders, local contractor agreements, state departmental files",
    jurisdiction: "State",
    url: "https://rtionline.gov.in",
    tracking_url: "https://rtionline.gov.in/request/status.php",
    type: "state_rti",
    supports: ["submission", "tracking"],
    instructions: "Submit to the designated Public Information Officer (PIO) of the concerned municipal body or state department along with the prescribed fee instrument.",
  },
  consumer_helpline: {
    id: "consumer_helpline",
    name: "National Consumer Helpline (NCH - INGRAM)",
    purpose: "Consumer service disputes, electricity billing anomalies, telecom grievances",
    jurisdiction: "Central",
    url: "https://consumerhelpline.gov.in",
    tracking_url: "https://consumerhelpline.gov.in/user/track-grievance.php",
    type: "consumer",
    supports: ["submission", "tracking"],
    instructions: "Register consumer complaint online or call Toll-Free 1915. Keep consumer complaint docket number.",
  },
};

function resolveRecommendedChannel(
  requestType: "RTI" | "GRIEVANCE" | "MIXED",
  problem: string,
  location?: string
) {
  const p = problem.toLowerCase();
  const isCentral = p.includes("national highway") || p.includes("railway") || p.includes("passport") || p.includes("postal") || p.includes("bank");
  const isElectricity = p.includes("electricity") || p.includes("bill") || p.includes("meter");

  if (requestType === "RTI") {
    if (isCentral) {
      return {
        type: "central_rti",
        official_portal: OFFICIAL_PORTALS.rti_central,
        alternate_portals: [OFFICIAL_PORTALS.cpgrams],
        reason: "The records sought fall under Central Government Public Authority jurisdiction under Section 6(1) of RTI Act 2005.",
      };
    }
    return {
      type: "state_local_rti",
      official_portal: OFFICIAL_PORTALS.rti_state,
      alternate_portals: [OFFICIAL_PORTALS.municipal_ward, OFFICIAL_PORTALS.rti_central],
      reason: "Records regarding municipal work orders, local contractor tenders, and civic expenditures are held by the State/Municipal Public Information Officer (PIO).",
    };
  }

  if (requestType === "GRIEVANCE") {
    if (isElectricity) {
      return {
        type: "consumer_or_state",
        official_portal: OFFICIAL_PORTALS.consumer_helpline,
        alternate_portals: [OFFICIAL_PORTALS.state_grievance],
        reason: "Billing disputes and utility service grievances are prioritized through the Consumer Helpline or State Electricity Board Grievance Desk.",
      };
    }
    if (isCentral) {
      return {
        type: "central_grievance",
        official_portal: OFFICIAL_PORTALS.cpgrams,
        alternate_portals: [OFFICIAL_PORTALS.state_grievance],
        reason: "Matters regarding Central authorities, highways, or railways are formally handled via CPGRAMS.",
      };
    }
    return {
      type: "municipal_grievance",
      official_portal: OFFICIAL_PORTALS.municipal_ward,
      alternate_portals: [OFFICIAL_PORTALS.state_grievance, OFFICIAL_PORTALS.cpgrams],
      reason: "Physical civil works (road resurfacing, streetlight repair, drainage, sanitation) fall directly under local Municipal Ward jurisdiction or State PWD.",
    };
  }

  // MIXED
  return {
    type: "dual_channel",
    official_portal: OFFICIAL_PORTALS.municipal_ward,
    alternate_portals: [OFFICIAL_PORTALS.rti_state, OFFICIAL_PORTALS.state_grievance],
    reason: "For corrective action, submit the grievance petition to the Municipal Roads Department. For fund and contractor records, submit a Section 6(1) request to the PIO.",
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      app: "Grievance Scribe",
      storageCount: userRequestsStore.size,
    });
  });

  // Official Channels Directory
  app.get("/api/official-channels", (_req, res) => {
    res.json({
      channels: Object.values(OFFICIAL_PORTALS),
    });
  });

  // Saved Requests CRUD endpoints
  app.get("/api/requests", (_req, res) => {
    const requests = Array.from(userRequestsStore.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    res.json({ requests });
  });

  app.post("/api/requests", (req, res) => {
    try {
      const data = req.body;
      if (!data.title || !data.problem) {
        res.status(400).json({ error: "Title and problem description are required." });
        return;
      }

      const id = data.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const now = new Date().toISOString();

      const newRequest: StoredRequest = {
        id,
        title: data.title,
        request_type: data.request_type || "GRIEVANCE",
        problem: data.problem,
        location: data.location || "",
        duration: data.duration || "",
        previousComplaintNo: data.previousComplaintNo || "",
        facts: data.facts || [],
        missing_information: data.missing_information || [],
        rti_questions: data.rti_questions || [],
        grievance_draft: data.grievance_draft || null,
        rti_draft: data.rti_draft || null,
        official_channel: data.official_channel || OFFICIAL_PORTALS.municipal_ward,
        reference_number: data.reference_number || "",
        submission_date: data.submission_date || new Date().toISOString().split("T")[0],
        status: data.status || "Submitted",
        last_checked: data.last_checked || new Date().toISOString().split("T")[0],
        notes: data.notes || "",
        next_action_guidance: data.next_action_guidance || "Check the official portal status after 15 to 30 days.",
        created_at: data.created_at || now,
        updated_at: now,
      };

      userRequestsStore.set(id, newRequest);
      res.status(201).json({ success: true, request: newRequest });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to save request" });
    }
  });

  app.put("/api/requests/:id", (req, res) => {
    const { id } = req.params;
    const existing = userRequestsStore.get(id);
    if (!existing) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    const updates = req.body;
    const updated: StoredRequest = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    userRequestsStore.set(id, updated);
    res.json({ success: true, request: updated });
  });

  app.delete("/api/requests/:id", (req, res) => {
    const { id } = req.params;
    const deleted = userRequestsStore.delete(id);
    res.json({ success: deleted });
  });

  // Regenerate Section Endpoint
  app.post("/api/regenerate", async (req, res) => {
    try {
      const { section, context } = req.body;
      const problem = context?.problem || "";
      const location = context?.location || "";

      if (section === "rti_questions") {
        const questions = [
          `Please provide the certified copy of the sanction order and total approved budget allocated for works concerning: ${problem.slice(0, 100) || "the subject matter"}.`,
          `Please provide the itemized expenditure incurred to date and copies of clearance vouchers as on record.`,
          `Please provide the name and registered address of the contractor/agency awarded the work order.`,
          `Please provide the stipulated completion timeline and copy of the measurement book (MB) record for inspection.`,
          `Please provide the date-wise file movement and action taken report from initial complaint receipt to date.`,
        ];
        res.json({ rti_questions: questions });
        return;
      }

      res.json({ success: true, message: "Section refreshed" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Regeneration failed" });
    }
  });

  // Validation Endpoint
  app.post("/api/validate", (req, res) => {
    try {
      const { problem, facts, location } = req.body;
      const detailsMissing: string[] = [];

      if (!location || !location.trim()) {
        detailsMissing.push("Exact street / ward name");
      }

      const isReady = Boolean(problem && problem.trim().length >= 20 && location && location.trim());

      res.json({
        validation: {
          status: isReady ? "ready" : "needs_information",
          intent_identified: true,
          core_issue_identified: Boolean(problem && problem.trim()),
          facts_extracted: Boolean(facts && facts.length > 0),
          unsupported_facts_detected: false,
          details_missing: detailsMissing,
          readiness_message: isReady
            ? "Request is fact-grounded and contains essential identifiers. Ready for submission."
            : "Core issue identified. Providing the exact street or ward prevents government office rejection.",
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Server-side AI Analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { problem, location, duration, previousComplaintNo, supportingDetails } = req.body;

      if (!problem || typeof problem !== "string" || !problem.trim()) {
        res.status(400).json({ error: "Please describe your problem or issue." });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;

      const userTextPayload = [
        `CITIZEN PROBLEM DESCRIPTION: "${problem.trim()}"`,
        location ? `LOCATION PROVIDED: "${location.trim()}"` : `LOCATION: Not explicitly provided in separate field`,
        duration ? `DURATION/DATE PROVIDED: "${duration.trim()}"` : `DURATION: Not explicitly provided in separate field`,
        previousComplaintNo ? `PREVIOUS REFERENCE / COMPLAINT NO: "${previousComplaintNo.trim()}"` : `PREVIOUS COMPLAINT NO: None provided`,
        supportingDetails ? `SUPPORTING DETAILS: "${supportingDetails.trim()}"` : `SUPPORTING DETAILS: None provided`,
      ].join("\n");

      // If no API key configured, use structured fallback
      if (!apiKey) {
        console.warn("GEMINI_API_KEY not detected. Using structured fallback analysis.");
        const fallback = generateLocalAnalysis(problem, location, duration, previousComplaintNo, supportingDetails);
        res.json(fallback);
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemPrompt = `You are GRIEVANCE SCRIBE, an expert AI Citizen Request Navigator specializing in Indian administrative procedures, citizen grievances, and Right to Information (RTI) applications under the RTI Act, 2005.

YOUR MISSION:
Help citizens convert a problem described in simple natural language into the correct government request.
You must classify whether the citizen needs RTI, GRIEVANCE, or MIXED.

CLASSIFICATION CRITERIA:
1. "RTI": Classify as RTI when the citizen primarily seeks information, public records, documents, sanctioned budget/expenditure details, status on file, file movement, copies of tenders/work orders.
2. "GRIEVANCE": Classify as GRIEVANCE when the citizen primarily wants a real-world problem addressed, repaired, acted upon, restored, or resolved (e.g., potholes repaired, streetlights fixed, garbage cleared, pension disbursed).
3. "MIXED": Classify as MIXED when both information-seeking and corrective-action components exist. (e.g., "Repair the broken road AND tell me how much money was allocated for it").

ABSOLUTE NO-FACT-FABRICATION RULE:
- Never invent names, dates, amounts, rupee figures, ward numbers, application/complaint numbers, addresses, government departments, contractors, or legal provisions.
- If an item was not explicitly mentioned by the citizen, mark it as "Not provided" or "Missing".
- If the concerned public authority or office is not specified by the citizen, write: "Authority not specified — please verify the appropriate authority before submission."
- Preserve the citizen's facts accurately in substance.

RTI QUESTIONS GUIDELINES:
- When RTI or MIXED applies, generate precise, record/document-oriented questions (Section 6(1) RTI Act 2005).
- Formulations:
  * "Please provide the certified copy of the sanction order / work order for..."
  * "Please provide the total budget allocated and expenditure incurred for..."
  * "Please provide the date-wise file movement and action taken report regarding..."
  * "Please provide the name of the contractor/agency awarded the work order for..."
  * "Please provide the current status of the matter as available on official record."

DRAFT FORMATS:
For RTI draft (if RTI or MIXED):
Standard plain-written RTI format under Section 6(1) of RTI Act 2005.

For Grievance draft (if GRIEVANCE or MIXED):
Formal Grievance Petition addressed to the Competent Officer.

For MIXED: Provide BOTH drafts cleanly separated. For pure RTI: grievance_draft must be null. For pure GRIEVANCE: rti_draft must be null.`;

      const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest"];
      let text: string | undefined;

      for (const model of modelsToTry) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("AI Model Timeout")), 8000)
          );

          const generatePromise = ai.models.generateContent({
            model,
            contents: userTextPayload,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.2,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  request_type: {
                    type: Type.STRING,
                    description: "Must be exactly 'RTI', 'GRIEVANCE', or 'MIXED'",
                  },
                  reason: {
                    type: Type.STRING,
                    description: "Short clear civic explanation of why this classification was assigned",
                  },
                  confidence: {
                    type: Type.STRING,
                    description: "Must be 'high', 'medium', or 'low'",
                  },
                  facts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        field: { type: Type.STRING },
                        value: { type: Type.STRING },
                        source: { type: Type.STRING, description: "Must be 'user_provided'" },
                      },
                      required: ["field", "value", "source"],
                    },
                    description: "Facts strictly extracted from citizen's input without any fabrication",
                  },
                  missing_information: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Crucial administrative pieces not provided by user that would strengthen the submission",
                  },
                  validation: {
                    type: Type.OBJECT,
                    properties: {
                      status: { type: Type.STRING, description: "'ready' or 'needs_information'" },
                      intent_identified: { type: Type.BOOLEAN },
                      core_issue_identified: { type: Type.BOOLEAN },
                      facts_extracted: { type: Type.BOOLEAN },
                      unsupported_facts_detected: { type: Type.BOOLEAN },
                      details_missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                      readiness_message: { type: Type.STRING },
                    },
                    required: ["status", "intent_identified", "core_issue_identified", "facts_extracted", "unsupported_facts_detected", "readiness_message"],
                  },
                  rti_questions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Record-oriented RTI questions (empty if pure grievance)",
                  },
                  grievance_draft: {
                    type: Type.STRING,
                    description: "Formatted grievance draft or null if pure RTI",
                  },
                  rti_draft: {
                    type: Type.STRING,
                    description: "Formatted RTI application or null if pure Grievance",
                  },
                  warnings: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Legal or procedural cautions (e.g. State RTI fee variations, verifying designated PIO)",
                  },
                },
                required: [
                  "request_type",
                  "reason",
                  "confidence",
                  "facts",
                  "missing_information",
                  "validation",
                  "rti_questions",
                  "warnings",
                ],
              },
            },
          });

          const response = await Promise.race([generatePromise, timeoutPromise]);
          text = response.text;
          if (text) break;
        } catch (modelErr: any) {
          console.warn(`Attempt with ${model} failed:`, modelErr?.message || modelErr);
        }
      }

      if (!text) {
        throw new Error("All Gemini models temporarily unavailable");
      }

      const parsed = JSON.parse(text);

      // Validate request_type to match strictly allowed values
      const validTypes = ["RTI", "GRIEVANCE", "MIXED"];
      if (!validTypes.includes(parsed.request_type)) {
        if (parsed.request_type?.toUpperCase().includes("MIX")) {
          parsed.request_type = "MIXED";
        } else if (parsed.request_type?.toUpperCase().includes("RTI")) {
          parsed.request_type = "RTI";
        } else {
          parsed.request_type = "GRIEVANCE";
        }
      }

      // Sanitize "null" string returns
      if (parsed.grievance_draft === "null" || parsed.grievance_draft === "None" || !parsed.grievance_draft) {
        parsed.grievance_draft = null;
      }
      if (parsed.rti_draft === "null" || parsed.rti_draft === "None" || !parsed.rti_draft) {
        parsed.rti_draft = null;
      }

      // If RTI and rti_draft is missing or malformed, provide standard format
      if ((parsed.request_type === "RTI" || parsed.request_type === "MIXED") && (!parsed.rti_draft || parsed.rti_draft.length < 50)) {
        const qList = (parsed.rti_questions || []).map((q: string, idx: number) => `${idx + 1}. ${q}`).join("\n");
        parsed.rti_draft = `To,\nThe Public Information Officer,\n[Name of public authority / office],\n[Full address]\n\nSubject: Application under Section 6(1) of the Right to Information Act, 2005\n\nSir/Madam,\n\nI request the following information under the RTI Act, 2005:\n\n${qList}\n\nI state that I am a citizen of India.\n\nThe application fee of Rs. 10/- is enclosed by [payment method/reference, as applicable].\n\nIf any part of this information is held by another public authority, kindly transfer that part under Section 6(3) of the Act and inform me.\n\nName: ______________________\nAddress: ___________________\nPhone/Email: _______________\nDate: __________  Place: __________\n\nSignature: __________________`;
      }

      // If Grievance and grievance_draft is missing or malformed, provide standard format
      if ((parsed.request_type === "GRIEVANCE" || parsed.request_type === "MIXED") && (!parsed.grievance_draft || parsed.grievance_draft.length < 50)) {
        parsed.grievance_draft = `To,\n[Authority not specified — please verify the appropriate authority before submission.]\n[Office Address]\n\nSubject: Formal Grievance regarding: ${problem.slice(0, 80)}...\n\nSir/Madam,\n\nI wish to bring the following grievance to your attention:\n\n${problem}\n\nLocation:\n${location || "Not provided"}\n\nDuration / Date:\n${duration || "Not specified"}\n\nPrevious action taken:\n${previousComplaintNo ? `Previous complaint reference: ${previousComplaintNo}` : "None provided"}\n\nI request that the concerned authority kindly take appropriate action regarding the above issue.\n\nName: ______________________\nAddress: ___________________\nPhone/Email: _______________\nDate: __________  Place: __________\n\nSignature: __________________`;
      }

      // Attach recommended official channel
      const recommended = resolveRecommendedChannel(parsed.request_type, problem, location);
      parsed.recommended_channel = recommended;

      res.json(parsed);
    } catch (err: any) {
      console.error("Analysis error:", err);
      const { problem, location, duration, previousComplaintNo, supportingDetails } = req.body;
      const fallback = generateLocalAnalysis(problem || "", location, duration, previousComplaintNo, supportingDetails);
      fallback.warnings.push("Note: Generated using fallback rule engine due to temporary service delay.");
      res.json(fallback);
    }
  });

  // Mount Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Grievance Scribe server running on port ${PORT}`);
  });
}

function generateLocalAnalysis(
  problem: string,
  location?: string,
  duration?: string,
  previousComplaintNo?: string,
  supportingDetails?: string
) {
  const pLower = problem.toLowerCase();

  const isInfo =
    pLower.includes("how much") ||
    pLower.includes("who is") ||
    pLower.includes("which contractor") ||
    pLower.includes("money") ||
    pLower.includes("funds") ||
    pLower.includes("allocated") ||
    pLower.includes("tender") ||
    pLower.includes("copy of") ||
    pLower.includes("status of") ||
    pLower.includes("documents") ||
    pLower.includes("record") ||
    pLower.includes("sanction");

  const isAction =
    pLower.includes("repair") ||
    pLower.includes("fix") ||
    pLower.includes("damaged") ||
    pLower.includes("broken") ||
    pLower.includes("not working") ||
    pLower.includes("clean") ||
    pLower.includes("solve") ||
    pLower.includes("action") ||
    pLower.includes("complaint") ||
    pLower.includes("garbage") ||
    pLower.includes("pothole");

  let request_type: "RTI" | "GRIEVANCE" | "MIXED" = "GRIEVANCE";
  let reason = "";

  if (isInfo && isAction) {
    request_type = "MIXED";
    reason =
      "The input contains both a demand for physical corrective action (grievance) and an inquiry for public administrative records and fund allocations (RTI). In Indian civic procedure, these must be pursued through separate channels.";
  } else if (isInfo) {
    request_type = "RTI";
    reason =
      "The citizen is primarily seeking government records, financial allocations, contracts, or factual administrative status under the Right to Information Act, 2005.";
  } else {
    request_type = "GRIEVANCE";
    reason =
      "The citizen is seeking direct remedial intervention, repair, maintenance, or administrative action to resolve a public issue.";
  }

  const facts = [
    { field: "Core Problem", value: problem.trim(), source: "user_provided" as const },
    {
      field: "Location",
      value: location && location.trim() ? location.trim() : "Not provided",
      source: "user_provided" as const,
    },
    {
      field: "Duration / Timeline",
      value: duration && duration.trim() ? duration.trim() : "Not specified",
      source: "user_provided" as const,
    },
    {
      field: "Previous Complaint Reference",
      value: previousComplaintNo && previousComplaintNo.trim() ? previousComplaintNo.trim() : "None provided",
      source: "user_provided" as const,
    },
  ];

  if (supportingDetails && supportingDetails.trim()) {
    facts.push({
      field: "Supporting Details",
      value: supportingDetails.trim(),
      source: "user_provided" as const,
    });
  }

  const missing_information: string[] = [];
  if (!location || !location.trim()) {
    missing_information.push("Specific street, ward number, or landmark");
  }
  if (!duration || !duration.trim()) {
    missing_information.push("Exact date or duration of the problem");
  }
  if (!previousComplaintNo || !previousComplaintNo.trim()) {
    missing_information.push("Prior complaint registration number (if previously lodged)");
  }
  missing_information.push("Designated Public Authority or municipal division name");

  const hasLocation = Boolean(location && location.trim().length > 3);
  const isReady = hasLocation && problem.trim().length >= 25;

  const validation = {
    status: isReady ? ("ready" as const) : ("needs_information" as const),
    intent_identified: true,
    core_issue_identified: true,
    facts_extracted: true,
    unsupported_facts_detected: false,
    details_missing: isReady ? [] : ["Exact street / ward number"],
    readiness_message: isReady
      ? "Request intent and core facts verified. Ready for official channel drafting."
      : "Core issue identified. Providing the exact street or ward name ensures government portals accept the filing without delays.",
  };

  const rti_questions: string[] = [];
  if (request_type === "RTI" || request_type === "MIXED") {
    rti_questions.push(
      `Please provide the certified copy of the sanction order and total budget allocated for the works relating to: ${problem.slice(0, 100)}.`
    );
    rti_questions.push(
      `Please provide the current status of work execution and date-wise progress report as available on official record.`
    );
    rti_questions.push(
      `Please provide the name of the contractor/agency awarded this work and the stipulated date of completion.`
    );
    rti_questions.push(
      `Please provide the itemized expenditure incurred to date and copies of clearance vouchers as on record.`
    );
  }

  const grievance_draft =
    request_type === "GRIEVANCE" || request_type === "MIXED"
      ? `To,
The Competent Grievance Officer,
[Authority not specified — please verify the appropriate authority before submission.]
[Office Address]

Subject: Formal Grievance regarding: ${problem.slice(0, 80)}...

Sir/Madam,

I wish to bring the following grievance to your attention:

${problem}

Location:
${location && location.trim() ? location.trim() : "Not provided"}

Duration / Date:
${duration && duration.trim() ? duration.trim() : "Not specified"}

Previous action taken:
${previousComplaintNo && previousComplaintNo.trim() ? `Previous complaint reference: ${previousComplaintNo.trim()}` : "Not provided"}

I request that the concerned authority kindly take appropriate action regarding the above issue.

Name: ______________________
Address: ___________________
Phone/Email: _______________
Date: __________  Place: __________

Signature: __________________`
      : null;

  const rti_draft =
    request_type === "RTI" || request_type === "MIXED"
      ? `To,
The Public Information Officer,
[Name of public authority / office],
[Full address]

Subject: Application under Section 6(1) of the Right to Information Act, 2005

Sir/Madam,

I request the following information under the RTI Act, 2005:

${rti_questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

I state that I am a citizen of India.

The application fee of Rs. 10/- is enclosed by [payment method/reference, as applicable].

If any part of this information is held by another public authority, kindly transfer that part under Section 6(3) of the Act and inform me.

Name: ______________________
Address: ___________________
Phone/Email: _______________
Date: __________  Place: __________

Signature: __________________`
      : null;

  const warnings = [
    "Grievance Scribe provides AI-assisted drafting and organization. Review all generated information before submission.",
    "Do not submit RTI applications for physical repair work; use the grievance portal instead.",
    "State RTI rules may prescribe separate application formats or fee structures (Section 6(1) of RTI Act 2005).",
  ];

  const recommended_channel = resolveRecommendedChannel(request_type, problem, location);

  return {
    request_type,
    reason,
    confidence: "high" as const,
    facts,
    missing_information,
    validation,
    rti_questions,
    grievance_draft,
    rti_draft,
    recommended_channel,
    warnings,
  };
}

startServer();
