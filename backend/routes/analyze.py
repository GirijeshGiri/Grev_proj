import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    CitizenInput,
    AIAnalysisResponse,
    ValidateRequestInput,
    RequestValidation,
    RegenerateRequest,
    ErrorResponse,
)
from services.ai_service import ai_service
from services.validator import ValidatorService
from services.request_service import RequestService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Analysis & AI Engine"])


@router.post(
    "/analyze",
    response_model=AIAnalysisResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Analyze citizen problem and generate structured request"
)
async def analyze_problem(input_data: CitizenInput):
    """
    Executes the full Citizen Request Intelligence Pipeline:
    1. Understand intent
    2. Classify (RTI / GRIEVANCE / MIXED)
    3. Extract grounded facts (Zero fabrication)
    4. Detect missing information
    5. Detect unsupported claims
    6. Validate request readiness
    7. Generate RTI questions
    8. Generate Grievance draft
    9. Generate RTI draft
    10. Recommend verified official government channel
    """
    if not input_data.problem or len(input_data.problem.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail={"error": True, "message": "Problem description must be at least 5 characters.", "code": "INVALID_INPUT"}
        )

    try:
        result = await ai_service.analyze(input_data)
        return result
    except Exception as e:
        logger.exception("Analysis pipeline failure: %s", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": True,
                "message": "An error occurred during AI analysis. Please verify your input and try again.",
                "code": "AI_ANALYSIS_FAILED"
            }
        )


@router.post(
    "/validate",
    response_model=RequestValidation,
    summary="Validate request completeness, fact integrity, and drafting readiness"
)
async def validate_request(input_data: ValidateRequestInput):
    """
    Re-validates an edited citizen request:
    - Checks completeness and specificity
    - Ensures zero unsupported speculation
    - Audits RTI question compliance (avoiding speculative 'Why' queries)
    - Returns draft-quality score (0-100) and check report
    """
    unsupported_issues = ValidatorService.detect_unsupported_claims(input_data.problem)
    validation = ValidatorService.evaluate_request(
        problem=input_data.problem,
        request_type=input_data.request_type,
        location=input_data.location,
        facts=input_data.facts,
        unsupported_issues=unsupported_issues,
        rti_questions=input_data.rti_questions,
        grievance_draft=input_data.grievance_draft,
        rti_draft=input_data.rti_draft,
    )
    return validation


@router.post(
    "/regenerate",
    summary="Regenerate a specific section of the request (e.g. RTI questions or Grievance draft)"
)
async def regenerate_section(
    req: RegenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Regenerates a specific draft section with user refinement instructions,
    strictly preserving existing citizen-grounded facts.
    """
    problem_text = req.problem or ""
    if req.request_id and not problem_text:
        existing = RequestService.get_by_id(db, req.request_id)
        if existing:
            problem_text = existing.problem

    if not problem_text:
        raise HTTPException(
            status_code=400,
            detail={"error": True, "message": "Problem text or valid request_id required for regeneration.", "code": "MISSING_CONTEXT"}
        )

    citizen_input = CitizenInput(
        problem=problem_text,
        additional_details=f"Refinement instruction: {req.instruction}"
    )

    analysis = await ai_service.analyze(citizen_input)

    if req.section == "rti_questions":
        return {
            "section": req.section,
            "instruction": req.instruction,
            "updated_content": analysis.rti_questions
        }
    elif req.section == "grievance_draft":
        return {
            "section": req.section,
            "instruction": req.instruction,
            "updated_content": analysis.grievance_draft
        }
    elif req.section == "rti_draft":
        return {
            "section": req.section,
            "instruction": req.instruction,
            "updated_content": analysis.rti_draft
        }
    elif req.section == "classification":
        return {
            "section": req.section,
            "instruction": req.instruction,
            "updated_content": {
                "request_type": analysis.request_type,
                "reason": analysis.reason,
            }
        }
    else:
        raise HTTPException(
            status_code=400,
            detail={"error": True, "message": f"Unknown section: {req.section}", "code": "INVALID_SECTION"}
        )
