from typing import List, Optional, Any, Dict, Literal, Union
from datetime import datetime
import json
from pydantic import BaseModel, Field, model_validator


# -----------------------------------------------------------------------------
# Input Schemas
# -----------------------------------------------------------------------------

class CitizenInput(BaseModel):
    """Input provided by the citizen describing their problem."""
    problem: str = Field(..., min_length=5, description="Citizen's problem described in plain natural language.")
    location: Optional[str] = Field(None, description="Physical location, street, ward, or landmark.")
    date: Optional[str] = Field(None, description="Date or duration of the issue.")
    previous_reference: Optional[str] = Field(None, description="Previous complaint number or reference ID.")
    additional_details: Optional[str] = Field(None, description="Any additional context provided by citizen.")


# -----------------------------------------------------------------------------
# Core Fact & Information Extraction Schemas
# -----------------------------------------------------------------------------

class Fact(BaseModel):
    """A strictly grounded fact extracted from citizen input. Never invented."""
    field: str = Field(..., description="Fact key, e.g. location, duration, previous_complaint, etc.")
    value: str = Field(..., description="Fact value extracted from user statements.")
    source: str = Field("citizen", description="Origin of the fact: citizen, system, official_source.")

    @model_validator(mode="before")
    @classmethod
    def resolve_fact(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "value" not in values and "val" in values:
                values["value"] = values["val"]
            if "source" not in values or not values["source"]:
                values["source"] = "citizen"
        return values


class MissingInfoItem(BaseModel):
    """Identified missing information that would materially improve request efficacy."""
    field: str = Field(..., description="The name of the missing detail.")
    question: str = Field(..., description="A polite, direct question to ask the citizen.")
    importance: Literal["high", "medium", "low"] = Field("medium", description="Priority level of the missing detail.")

    @model_validator(mode="before")
    @classmethod
    def resolve_question(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if not values.get("question"):
                values["question"] = (
                    values.get("description")
                    or values.get("prompt")
                    or values.get("details")
                    or f"Please provide details regarding {values.get('field', 'this item')}."
                )
        return values


class UnsupportedClaim(BaseModel):
    """Claim or assumption detected in input that is not established by factual evidence."""
    claim: str = Field(..., description="The unsupported assertion detected in citizen text.")
    reason: str = Field(..., description="Neutral explanation of why this conclusion is not established as fact.")


# -----------------------------------------------------------------------------
# Validation Schemas
# -----------------------------------------------------------------------------

class ValidationCheck(BaseModel):
    name: str
    status: Literal["PASS", "WARNING", "FAIL"]
    details: Optional[str] = None


class RequestValidation(BaseModel):
    """Validation report regarding request completeness, quality, and readiness."""
    status: Literal["READY", "NEEDS_INFORMATION", "REVIEW_REQUIRED"]
    score: int = Field(..., ge=0, le=100, description="Draft-quality score indicator (not government acceptance).")
    checks: List[ValidationCheck] = Field(default_factory=list)
    unsupported_facts_detected: bool = False
    issues: List[UnsupportedClaim] = Field(default_factory=list)
    readiness_message: Optional[str] = None


# -----------------------------------------------------------------------------
# RTI & Grievance Output Schemas
# -----------------------------------------------------------------------------

class RTIQuestion(BaseModel):
    """A precise, factual question framed under Section 6(1) of the RTI Act."""
    id: str
    question: str
    reason: str
    editable: bool = True

    @model_validator(mode="before")
    @classmethod
    def resolve_rti_q(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if not values.get("question"):
                values["question"] = values.get("query") or values.get("text") or values.get("q") or ""
            if "id" not in values or not values["id"]:
                q_num = values.get("question_number") or values.get("number")
                if q_num is not None:
                    values["id"] = f"q{q_num}"
                else:
                    values["id"] = f"q_{abs(hash(str(values.get('question', '')))) % 10000}"
            if "reason" not in values or not values["reason"]:
                values["reason"] = "Required under Section 6(1) of RTI Act, 2005"
        return values


class OfficialChannel(BaseModel):
    """Directory information for official government submission portal."""
    name: str
    type: str
    jurisdiction: str
    purpose: str
    official_url: str
    supports_tracking: bool
    department_hint: Optional[str] = None
    guidance: Optional[str] = None


class RecommendedChannel(BaseModel):
    type: str
    reason: str
    official_portal: OfficialChannel
    alternate_portals: List[OfficialChannel] = Field(default_factory=list)


class AIAnalysisResponse(BaseModel):
    """The master structured response returned by the AI intelligence engine."""
    request_type: Literal["RTI", "GRIEVANCE", "MIXED"]
    reason: str
    confidence: Literal["low", "medium", "high"] = "high"
    facts: List[Fact] = Field(default_factory=list)
    missing_information: List[MissingInfoItem] = Field(default_factory=list)
    validation: RequestValidation
    rti_questions: List[RTIQuestion] = Field(default_factory=list)
    grievance_draft: Optional[str] = None
    rti_draft: Optional[str] = None
    recommended_channel: RecommendedChannel
    warnings: List[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def resolve_drafts(cls, values: Any) -> Any:
        if isinstance(values, dict):
            for draft_key in ("grievance_draft", "rti_draft"):
                val = values.get(draft_key)
                if isinstance(val, dict):
                    parts = []
                    if "subject" in val:
                        parts.append(f"Subject: {val['subject']}")
                    if "recipient" in val:
                        parts.append(f"To: {val['recipient']}")
                    if "salutation" in val:
                        parts.append(val["salutation"])
                    if "body" in val:
                        parts.append(str(val["body"]))
                    elif "content" in val:
                        parts.append(str(val["content"]))
                    else:
                        parts.append("\n".join(f"{k.capitalize()}: {v}" for k, v in val.items()))
                    values[draft_key] = "\n\n".join(parts)
                elif val is not None and not isinstance(val, str):
                    values[draft_key] = str(val)
        return values


# -----------------------------------------------------------------------------
# Database Layer Schemas (Section 4)
# -----------------------------------------------------------------------------

class CreateFact(BaseModel):
    """Schema for creating a fact entry linked to a request."""
    request_id: Optional[int] = None
    field: str
    value: str
    source: str = "citizen"  # "citizen", "system", "official_source"


class FactResponse(BaseModel):
    """Schema for returning a fact entry."""
    id: int
    request_id: int
    field: str
    value: str
    source: str

    class Config:
        from_attributes = True


class CreateDraft(BaseModel):
    """Schema for creating or updating a draft entry."""
    request_id: Optional[int] = None
    grievance_draft: Optional[str] = None
    rti_draft: Optional[str] = None
    rti_questions: Optional[Union[str, List[Any], Dict[str, Any]]] = None
    missing_information: Optional[Union[str, List[Any], Dict[str, Any]]] = None
    validation_status: Optional[str] = None
    validation_message: Optional[str] = None


class DraftResponse(BaseModel):
    """Schema for returning a draft entry."""
    id: int
    request_id: int
    grievance_draft: Optional[str] = None
    rti_draft: Optional[str] = None
    rti_questions: Optional[str] = None
    missing_information: Optional[str] = None
    validation_status: Optional[str] = None
    validation_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CreateRequest(BaseModel):
    """Schema for creating a new citizen request (TABLE 1)."""
    title: str
    original_problem: Optional[str] = None
    problem: Optional[str] = None  # fallback / convenience alias
    request_type: Literal["RTI", "GRIEVANCE", "MIXED"]
    reason: Optional[str] = None
    location: Optional[str] = None
    status: str = "Draft"
    official_portal: Optional[str] = None
    official_portal_url: Optional[str] = None
    reference_number: Optional[str] = None
    submission_date: Optional[str] = None
    last_checked: Optional[str] = None
    notes: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_problem(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if not values.get("original_problem") and values.get("problem"):
                values["original_problem"] = values["problem"]
            elif not values.get("problem") and values.get("original_problem"):
                values["problem"] = values["original_problem"]
            if not values.get("original_problem"):
                raise ValueError("original_problem is required.")
        return values


class UpdateRequest(BaseModel):
    """Schema for editing request details."""
    title: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    official_portal: Optional[str] = None
    official_portal_url: Optional[str] = None
    reference_number: Optional[str] = None
    submission_date: Optional[str] = None
    last_checked: Optional[str] = None
    notes: Optional[str] = None


class TrackingUpdateRequest(BaseModel):
    """Schema for updating administrative tracking details specifically."""
    status: Optional[str] = None
    reference_number: Optional[str] = None
    submission_date: Optional[str] = None
    last_checked: Optional[str] = None
    notes: Optional[str] = None


class RequestResponse(BaseModel):
    """Base response schema for a request."""
    id: int
    title: str
    original_problem: str
    request_type: str
    reason: Optional[str] = None
    location: Optional[str] = None
    status: str
    official_portal: Optional[str] = None
    official_portal_url: Optional[str] = None
    reference_number: Optional[str] = None
    submission_date: Optional[str] = None
    last_checked: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RequestDetailResponse(BaseModel):
    """Complete response schema including linked facts and drafts."""
    id: int
    title: str
    original_problem: str
    request_type: str
    reason: Optional[str] = None
    location: Optional[str] = None
    status: str
    official_portal: Optional[str] = None
    official_portal_url: Optional[str] = None
    reference_number: Optional[str] = None
    submission_date: Optional[str] = None
    last_checked: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    facts: List[FactResponse] = []
    drafts: List[DraftResponse] = []

    class Config:
        from_attributes = True


class RequestListResponse(BaseModel):
    """List response schema."""
    count: int
    requests: List[RequestDetailResponse]


class SaveAnalysisRequest(BaseModel):
    """Schema for saving complete structured AI analysis output in an atomic operation."""
    title: Optional[str] = None
    original_problem: Optional[str] = None
    problem: Optional[str] = None
    request_type: Literal["RTI", "GRIEVANCE", "MIXED"]
    reason: Optional[str] = None
    location: Optional[str] = None
    status: str = "Draft"
    official_portal: Optional[str] = None
    official_portal_url: Optional[str] = None
    reference_number: Optional[str] = None
    submission_date: Optional[str] = None
    last_checked: Optional[str] = None
    notes: Optional[str] = None
    facts: Optional[List[Dict[str, Any]]] = None
    missing_information: Optional[Union[str, List[Any], Dict[str, Any]]] = None
    rti_questions: Optional[Union[str, List[Any], Dict[str, Any]]] = None
    grievance_draft: Optional[str] = None
    rti_draft: Optional[str] = None
    validation_status: Optional[str] = None
    validation_message: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_problem_analysis(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if not values.get("original_problem") and values.get("problem"):
                values["original_problem"] = values["problem"]
            if not values.get("original_problem"):
                raise ValueError("original_problem or problem description is required.")
        return values


# Compatibility Aliases
RequestCreate = CreateRequest
RequestUpdate = UpdateRequest
FactCreate = CreateFact
DraftCreate = CreateDraft


# -----------------------------------------------------------------------------
# Secondary Operations Schemas
# -----------------------------------------------------------------------------

class RegenerateRequest(BaseModel):
    request_id: Optional[str] = None
    section: Literal["classification", "rti_questions", "grievance_draft", "rti_draft"]
    instruction: str
    problem: Optional[str] = None
    current_draft: Optional[str] = None


class ValidateRequestInput(BaseModel):
    problem: str
    request_type: Literal["RTI", "GRIEVANCE", "MIXED"]
    location: Optional[str] = None
    facts: Optional[List[Fact]] = None
    grievance_draft: Optional[str] = None
    rti_draft: Optional[str] = None
    rti_questions: Optional[List[RTIQuestion]] = None


class ChannelsResponse(BaseModel):
    count: int
    channels: List[OfficialChannel]


class ErrorResponse(BaseModel):
    error: bool = True
    message: str
    code: str
    details: Optional[Any] = None
