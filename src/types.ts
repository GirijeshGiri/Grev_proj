export type RequestType = "RTI" | "GRIEVANCE" | "MIXED";

export interface ExtractedFact {
  field: string;
  value: string;
  source: "user_provided";
}

export type ReadinessStatus = "ready" | "needs_information";

export interface RequestValidation {
  status: ReadinessStatus;
  intent_identified: boolean;
  core_issue_identified: boolean;
  facts_extracted: boolean;
  unsupported_facts_detected: boolean;
  details_missing: string[];
  readiness_message: string;
}

export interface OfficialChannel {
  id: string;
  name: string;
  purpose: string;
  jurisdiction: "Central" | "State" | "Local / Municipal" | "To be confirmed";
  url: string;
  tracking_url: string;
  type: "central_grievance" | "state_grievance" | "central_rti" | "state_rti" | "municipal" | "consumer";
  supports: ("submission" | "tracking")[];
  instructions: string;
}

export interface RecommendedChannel {
  type: string;
  reason: string;
  official_portal: OfficialChannel;
  alternate_portals?: OfficialChannel[];
}

export interface AIAnalysisResponse {
  request_type: RequestType;
  reason: string;
  confidence: "high" | "medium" | "low";
  facts: ExtractedFact[];
  missing_information: string[];
  validation: RequestValidation;
  rti_questions: string[];
  grievance_draft: string | null;
  rti_draft: string | null;
  recommended_channel: RecommendedChannel;
  warnings: string[];
}

export interface CitizenInput {
  problem: string;
  location?: string;
  duration?: string;
  previousComplaintNo?: string;
  supportingDetails?: string;
}

export interface CitizenDetails {
  name: string;
  address: string;
  phoneEmail: string;
  date: string;
  place: string;
  authorityName: string;
  authorityAddress: string;
  paymentMethod: string;
}

export type RequestStatus =
  | "Draft"
  | "Submitted"
  | "Under Process"
  | "Action Taken"
  | "Closed"
  | "User Updated"
  | "Other";

export interface SavedRequest {
  id: string;
  title: string;
  request_type: RequestType;
  problem: string;
  location?: string;
  duration?: string;
  previousComplaintNo?: string;
  facts: ExtractedFact[];
  missing_information: string[];
  rti_questions: string[];
  grievance_draft: string | null;
  rti_draft: string | null;
  official_channel: OfficialChannel;
  reference_number?: string;
  submission_date?: string;
  status: RequestStatus;
  last_checked?: string;
  notes?: string;
  next_action_guidance?: string;
  created_at: string;
  updated_at: string;
}

export interface DemoExample {
  id: string;
  title: string;
  badge: RequestType;
  shortDesc: string;
  input: CitizenInput;
}
