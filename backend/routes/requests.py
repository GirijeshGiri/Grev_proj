from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    CreateRequest,
    UpdateRequest,
    TrackingUpdateRequest,
    CreateFact,
    FactResponse,
    CreateDraft,
    DraftResponse,
    RequestResponse,
    RequestDetailResponse,
    SaveAnalysisRequest,
    ErrorResponse,
)
from services.request_service import RequestService

router = APIRouter(tags=["Requests & Persistence"])


@router.post(
    "",
    response_model=RequestDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new citizen request"
)
async def create_request(
    request_data: CreateRequest,
    db: Session = Depends(get_db)
):
    """Creates a new citizen request in the database (TABLE 1: requests)."""
    try:
        created = RequestService.create(db, request_data)
        return created
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": True, "message": f"Failed to create request: {str(e)}", "code": "DB_CREATE_ERROR"}
        )


@router.get(
    "",
    response_model=List[RequestDetailResponse],
    summary="Return all saved requests, newest first"
)
async def list_requests(
    type: Optional[str] = Query(None, description="Filter by request type: RTI, GRIEVANCE, or MIXED"),
    status: Optional[str] = Query(None, description="Filter by status: Draft, Submitted, Under Process, etc."),
    db: Session = Depends(get_db)
):
    """Returns all saved requests ordered newest first, with optional type or status filtering."""
    items = RequestService.get_all(db, request_type=type, status=status)
    return items


@router.post(
    "/save-analysis",
    response_model=RequestDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save structured AI output into requests, facts, and drafts tables"
)
async def save_analysis(
    analysis_data: SaveAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Saves structured AI analysis atomically into requests, facts, and drafts tables."""
    try:
        saved = RequestService.save_analysis(db, analysis_data)
        return saved
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": True, "message": f"Failed to save analysis: {str(e)}", "code": "DB_SAVE_ANALYSIS_ERROR"}
        )


@router.get(
    "/{id}",
    response_model=RequestDetailResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Return request, facts, and drafts in a single response"
)
async def get_request(
    id: int,
    db: Session = Depends(get_db)
):
    """Retrieves full details of a saved request including linked facts and drafts."""
    item = RequestService.get_by_id(db, id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": f"Request with ID '{id}' not found.", "code": "NOT_FOUND"}
        )
    return item


@router.put(
    "/{id}",
    response_model=RequestDetailResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Update request details"
)
async def update_request(
    id: int,
    update_data: UpdateRequest,
    db: Session = Depends(get_db)
):
    """Allows editing title, location, status, official_portal, official_portal_url, reference_number, submission_date, last_checked, notes."""
    updated = RequestService.update(db, id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": f"Request with ID '{id}' not found.", "code": "NOT_FOUND"}
        )
    return updated


@router.delete(
    "/{id}",
    summary="Delete request and its associated facts/drafts"
)
async def delete_request(
    id: int,
    db: Session = Depends(get_db)
):
    """Deletes the request and cascades to delete all associated facts and drafts."""
    success = RequestService.delete(db, id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": f"Request with ID '{id}' not found.", "code": "NOT_FOUND"}
        )
    return {"status": "success", "message": f"Request {id} and associated facts and drafts deleted."}


@router.post(
    "/{id}/facts",
    response_model=Union[FactResponse, List[FactResponse]],
    status_code=status.HTTP_201_CREATED,
    responses={404: {"model": ErrorResponse}},
    summary="Save facts extracted from citizen request"
)
async def add_facts(
    id: int,
    fact_input: Union[CreateFact, List[CreateFact]],
    db: Session = Depends(get_db)
):
    """Saves one or more facts extracted from the citizen's request (TABLE 2: facts)."""
    parent = RequestService.get_by_id(db, id)
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": f"Request with ID '{id}' not found.", "code": "NOT_FOUND"}
        )

    if isinstance(fact_input, list):
        created_facts = [RequestService.add_fact(db, id, f) for f in fact_input]
        return created_facts
    else:
        created_fact = RequestService.add_fact(db, id, fact_input)
        return created_fact


@router.post(
    "/{id}/draft",
    response_model=DraftResponse,
    status_code=status.HTTP_201_CREATED,
    responses={404: {"model": ErrorResponse}},
    summary="Save or update generated grievance/RTI draft"
)
async def add_draft(
    id: int,
    draft_data: CreateDraft,
    db: Session = Depends(get_db)
):
    """Saves a draft record linked to the request (TABLE 3: drafts)."""
    parent = RequestService.get_by_id(db, id)
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": f"Request with ID '{id}' not found.", "code": "NOT_FOUND"}
        )

    created_draft = RequestService.add_draft(db, id, draft_data)
    return created_draft


@router.put(
    "/{id}/tracking",
    response_model=RequestDetailResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Update tracking details: status, reference_number, submission_date, last_checked, notes"
)
async def update_tracking(
    id: int,
    tracking_data: TrackingUpdateRequest,
    db: Session = Depends(get_db)
):
    """Updates administrative tracking fields: status, reference_number, submission_date, last_checked, notes."""
    updated = RequestService.update_tracking(db, id, tracking_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": f"Request with ID '{id}' not found.", "code": "NOT_FOUND"}
        )
    return updated
