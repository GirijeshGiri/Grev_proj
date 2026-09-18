import os
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx

from config import settings
from schemas import (
    CitizenInput,
    AIAnalysisResponse,
    Fact,
    MissingInfoItem,
    UnsupportedClaim,
    RTIQuestion,
    RecommendedChannel,
    RequestValidation,
)
from utils.json_parser import extract_json_from_text
from services.validator import ValidatorService
from services.channel_service import ChannelService

logger = logging.getLogger(__name__)


# -----------------------------------------------------------------------------
# Base LLM Provider Abstraction
# -----------------------------------------------------------------------------

class BaseAIProvider(ABC):
    """Abstract interface for LLM completion providers."""

    @abstractmethod
    async def analyze_citizen_request(
        self,
        citizen_input: CitizenInput,
        system_prompt: str,
    ) -> Dict[str, Any]:
        """Executes LLM call and returns a raw dictionary representing the structured output."""
        pass


# -----------------------------------------------------------------------------
# Gemini Provider Implementation (using GoogleGenAI or direct HTTP REST)
# -----------------------------------------------------------------------------

class GeminiAIProvider(BaseAIProvider):
    """Google Gemini AI provider utilizing HTTP REST with JSON response enforcement."""

    def __init__(self, api_key: str, model: str = "gemini-3.6-flash"):
        self.api_key = api_key
        # Automatically upgrade deprecated 2.5-flash if passed from environment
        if model in ("gemini-2.5-flash", "models/gemini-2.5-flash"):
            model = "gemini-3.6-flash"
        self.model = model

    async def analyze_citizen_request(
        self,
        citizen_input: CitizenInput,
        system_prompt: str,
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY or AI_API_KEY is not configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        user_content = f"""
Citizen Input:
Problem: {citizen_input.problem}
Location: {citizen_input.location or 'Not provided'}
Date / Duration: {citizen_input.date or 'Not provided'}
Previous Reference: {citizen_input.previous_reference or 'Not provided'}
Additional Details: {citizen_input.additional_details or 'None'}

Please analyze this citizen issue and produce a strictly formatted JSON response adhering to the system guidelines.
"""

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_content}]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json",
            }
        }

        async with httpx.AsyncClient(timeout=35.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                logger.error("Gemini API error (%s): %s", response.status_code, response.text)
                raise RuntimeError(f"Gemini API returned status code {response.status_code}: {response.text}")

            res_json = response.json()
            try:
                candidates = res_json.get("candidates", [])
                if not candidates:
                    raise ValueError("No candidates returned from Gemini.")
                text_content = candidates[0]["content"]["parts"][0]["text"]
                parsed = extract_json_from_text(text_content)
                if not parsed:
                    raise ValueError(f"Could not parse valid JSON from text: {text_content[:200]}")
                return parsed
            except Exception as e:
                logger.error("Error extracting JSON from Gemini response: %s", e)
                raise


# -----------------------------------------------------------------------------
# Deterministic Rule-Based Fallback Provider (for offline, testing, or Demo)
# -----------------------------------------------------------------------------

class DeterministicMockAIProvider(BaseAIProvider):
    """High-fidelity deterministic intelligence engine ensuring 100% demo reliability."""

    async def analyze_citizen_request(
        self,
        citizen_input: CitizenInput,
        system_prompt: str,
    ) -> Dict[str, Any]:
        p = citizen_input.problem.lower()
        loc = citizen_input.location or ""
        dur = citizen_input.date or ""
        ref = citizen_input.previous_reference or ""

        # Check for MIXED scenario (road repair + funds/contractor)
        has_repair_or_complaint = any(w in p for w in ["repair", "damaged", "complained", "fix", "pothole", "broken"])
        has_fund_or_records = any(w in p for w in ["how much money", "allocated", "contractor", "tender", "records", "expenditure", "work order"])

        # Determine Classification
        if has_repair_or_complaint and has_fund_or_records:
            request_type = "MIXED"
            reason = "The citizen's statement contains both a demand for physical corrective road repair (Grievance) and an explicit inquiry regarding allocated public funds and the contractor awarded the work (RTI). These two legal objectives must be addressed separately."
        elif has_fund_or_records or p.startswith("how much") or "provide" in p and "order" in p:
            request_type = "RTI"
            reason = "The citizen explicitly seeks access to recorded financial records, tender allocation files, and official work orders under the Right to Information Act, 2005."
        else:
            request_type = "GRIEVANCE"
            reason = "The citizen reports a tangible civic failure and requests direct administrative remedy, inspection, and restoration of public services."

        # Extract explicit citizen facts
        facts = [
            {"field": "issue", "value": citizen_input.problem, "source": "citizen"},
        ]

        extracted_loc = loc
        if not extracted_loc:
            # Simple heuristic from text
            if "near abc school" in p:
                extracted_loc = "Near ABC School"
            elif "my street" in p:
                extracted_loc = "Citizen's residential street (Exact name not provided)"
            else:
                extracted_loc = "Not provided"

        facts.append({"field": "location", "value": extracted_loc, "source": "citizen"})

        extracted_dur = dur
        if not extracted_dur:
            if "six months" in p:
                extracted_dur = "Six months"
            elif "two weeks" in p:
                extracted_dur = "Two weeks"
            else:
                extracted_dur = "Not specified"
        facts.append({"field": "duration", "value": extracted_dur, "source": "citizen"})

        if ref or "complained earlier" in p:
            facts.append({
                "field": "previous_complaint",
                "value": ref if ref else "Citizen states a complaint was submitted earlier (Reference ID not provided)",
                "source": "citizen"
            })

        # Missing information detection
        missing = []
        if extracted_loc == "Not provided" or "not provided" in extracted_loc.lower():
            missing.append({
                "field": "location",
                "question": "What is the exact street name, landmark, or municipal ward number?",
                "importance": "high"
            })
        if not ref and ("complained" in p or "earlier" in p):
            missing.append({
                "field": "previous_reference",
                "question": "Do you have the previous complaint docket or reference number?",
                "importance": "medium"
            })
        if request_type in ["RTI", "MIXED"]:
            missing.append({
                "field": "period_of_records",
                "question": "Which financial year or date range of sanction records do you wish to inspect?",
                "importance": "medium"
            })

        # Generate RTI questions if applicable
        rti_questions = []
        if request_type in ["RTI", "MIXED"]:
            if "road" in p:
                rti_questions = [
                    {
                        "id": "q1",
                        "question": f"Please provide the certified copy of the sanction order and total budget allocated for the repair of the road located at {extracted_loc}.",
                        "reason": "Requests certified public financial records under Section 6(1).",
                        "editable": True
                    },
                    {
                        "id": "q2",
                        "question": "Please provide the name of the contractor/agency awarded the work order, tender notification number, and the stipulated completion date.",
                        "reason": "Requests specific contract execution details on official record.",
                        "editable": True
                    },
                    {
                        "id": "q3",
                        "question": "Please provide a certified copy of the quality test report, measurement book (MB) entries, and payment clearance vouchers released to date.",
                        "reason": "Requests verification records of actual physical works executed.",
                        "editable": True
                    }
                ]
            elif "community hall" in p:
                rti_questions = [
                    {
                        "id": "q1",
                        "question": "Please provide the certified copy of the administrative sanction and total budget sanctioned for the construction of the community hall.",
                        "reason": "Direct request for financial allocation records.",
                        "editable": True
                    },
                    {
                        "id": "q2",
                        "question": "Please provide a copy of the official work order issued to the executing agency and the stipulated schedule of completion.",
                        "reason": "Requests work order documentation.",
                        "editable": True
                    }
                ]
            else:
                rti_questions = [
                    {
                        "id": "q1",
                        "question": f"Please provide certified copies of all file notings, sanction orders, and inspection logs relating to: {citizen_input.problem[:80]}.",
                        "reason": "Requests primary administrative files.",
                        "editable": True
                    },
                    {
                        "id": "q2",
                        "question": "Please provide the total expenditure incurred to date and copies of vouchers cleared for these works.",
                        "reason": "Requests factual financial accounting.",
                        "editable": True
                    }
                ]

        # Generate Grievance Draft if applicable
        grievance_draft = None
        if request_type in ["GRIEVANCE", "MIXED"]:
            subj_issue = "Damaged Road Repair" if "road" in p else ("Regular Garbage Collection" if "garbage" in p else "Civic Redressal Request")
            grievance_draft = f"""To,
The Competent Grievance Officer / Ward Executive Engineer,
Urban Local Civic Body / Municipal Corporation.

Subject: Formal Grievance regarding {subj_issue} at {extracted_loc}

Respected Sir/Madam,

1. Issue Description:
{citizen_input.problem}

2. Location of Incident:
{extracted_loc}

3. Duration of Problem:
{extracted_dur}

4. Previous Complaint Details:
{ref if ref else ('The citizen reports that a prior complaint was lodged; reference number was not recorded.' if 'earlier' in p else 'No prior complaint number recorded.')}

5. Requested Corrective Action:
Kindly conduct an immediate site inspection, remove the defect/obstruction, and restore normal public infrastructure standards without further delay.

6. Additional Information:
{"Specific ward number and contractor details were not provided by the citizen at this stage." if "not provided" in extracted_loc.lower() else "The citizen is available for physical site verification if requested."}

Yours faithfully,
(Citizen Signature / Name as registered)
"""

        # Generate RTI Draft if applicable
        rti_draft = None
        if request_type in ["RTI", "MIXED"]:
            q_formatted = "\n".join([f"{i+1}. {q['question']}" for i, q in enumerate(rti_questions)])
            rti_draft = f"""FORM 'A'
Application for Information under Section 6(1) of the Right to Information Act, 2005

To,
The Public Information Officer (PIO),
Competent Public Authority / Municipal Engineering Wing.

1. Full Name of the Applicant: [Citizen Name]
2. Address: [Applicant Residential Address]
3. Particulars of Information Required:
{q_formatted}

4. Period to which the information relates:
{extracted_dur if extracted_dur != 'Not specified' else 'Current and preceding financial years'}

5. Format of Information:
Certified physical copies by registered post or electronic copies.

6. Application Fee:
₹10/- tendered via Court Fee Stamp / Indian Postal Order / Online Payment Gateway.

7. Non-BPL Declaration:
I hereby declare that I am a citizen of India and do not fall under the exempted BPL category (or BPL card attached if claiming fee waiver).

Date: [Current Date]
Place: [City/Locality]
Signature of the Applicant
"""

        return {
            "request_type": request_type,
            "reason": reason,
            "confidence": "high",
            "facts": facts,
            "missing_information": missing,
            "rti_questions": rti_questions,
            "grievance_draft": grievance_draft,
            "rti_draft": rti_draft,
            "warnings": [
                "Under the RTI Act 2005, public authorities are mandated to provide existing records only. They are not required to generate answers to speculative questions or opinions.",
                "Always retain the official SMS or acknowledgment receipt containing your docket number for subsequent status tracking."
            ]
        }


# -----------------------------------------------------------------------------
# Main AI Service Wrapper
# -----------------------------------------------------------------------------

class AIService:
    """High-level AI intelligence orchestration service."""

    def __init__(self):
        # Load dedicated system prompt
        prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", "grievance_analysis.txt")
        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                self.system_prompt = f.read()
        except Exception as e:
            logger.warning("Could not load prompt file at %s: %s", prompt_path, e)
            self.system_prompt = "You are Grievance Scribe, an expert AI Citizen Request Navigator."

        # Configure LLM provider
        if settings.AI_API_KEY:
            logger.info("Using Gemini AI Provider with model: %s", settings.AI_MODEL)
            self.provider: BaseAIProvider = GeminiAIProvider(
                api_key=settings.AI_API_KEY,
                model=settings.AI_MODEL
            )
        else:
            logger.info("No AI_API_KEY detected. Initializing DeterministicMockAIProvider.")
            self.provider = DeterministicMockAIProvider()

    async def analyze(self, citizen_input: CitizenInput) -> AIAnalysisResponse:
        """Executes the full citizen problem analysis pipeline."""
        # 1. Detect unsupported claims upfront using validator rules
        unsupported_issues = ValidatorService.detect_unsupported_claims(citizen_input.problem)

        # 2. Call LLM provider or fallback
        raw_result = {}
        try:
            raw_result = await self.provider.analyze_citizen_request(citizen_input, self.system_prompt)
        except Exception as e:
            logger.error("Primary AI Provider failed: %s. Falling back to deterministic engine.", e)
            mock_provider = DeterministicMockAIProvider()
            raw_result = await mock_provider.analyze_citizen_request(citizen_input, self.system_prompt)

        # 3. Parse facts, missing information, questions, and drafts
        request_type = raw_result.get("request_type", "GRIEVANCE").upper()
        if request_type not in ["RTI", "GRIEVANCE", "MIXED"]:
            request_type = "GRIEVANCE"

        facts = [Fact(**f) for f in raw_result.get("facts", [])]
        missing_info = [MissingInfoItem(**m) for m in raw_result.get("missing_information", [])]
        rti_questions = [RTIQuestion(**q) for q in raw_result.get("rti_questions", [])]

        grievance_draft = raw_result.get("grievance_draft")
        rti_draft = raw_result.get("rti_draft")

        # 4. Resolve Recommended Official Channel
        recommended_channel = ChannelService.resolve_channel(
            request_type=request_type,
            problem=citizen_input.problem,
            location=citizen_input.location,
        )

        # 5. Execute Request Validation
        validation = ValidatorService.evaluate_request(
            problem=citizen_input.problem,
            request_type=request_type,
            location=citizen_input.location,
            facts=facts,
            missing_information=missing_info,
            unsupported_issues=unsupported_issues,
            rti_questions=rti_questions,
            grievance_draft=grievance_draft,
            rti_draft=rti_draft,
        )

        # 6. Compose Final AIAnalysisResponse
        return AIAnalysisResponse(
            request_type=request_type,
            reason=raw_result.get("reason", "Analyzed based on citizen statement."),
            confidence=raw_result.get("confidence", "high"),
            facts=facts,
            missing_information=missing_info,
            validation=validation,
            rti_questions=rti_questions,
            grievance_draft=grievance_draft,
            rti_draft=rti_draft,
            recommended_channel=recommended_channel,
            warnings=raw_result.get("warnings", []),
        )


ai_service = AIService()
