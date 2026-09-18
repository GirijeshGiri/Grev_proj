import json
from datetime import datetime
from typing import List, Optional, Any, Dict
from sqlalchemy.orm import Session
from models import Request, Fact, Draft
from schemas import (
    CreateRequest,
    UpdateRequest,
    TrackingUpdateRequest,
    CreateFact,
    CreateDraft,
    SaveAnalysisRequest,
)


class RequestService:
    """Service to handle persistence of citizen requests, facts, and drafts."""

    @staticmethod
    def create(db: Session, request_data: CreateRequest) -> Request:
        """Create a new request in the database."""
        db_request = Request(
            title=request_data.title,
            original_problem=request_data.original_problem or request_data.problem or "",
            request_type=request_data.request_type,
            reason=request_data.reason,
            location=request_data.location,
            status=request_data.status or "Draft",
            official_portal=request_data.official_portal,
            official_portal_url=request_data.official_portal_url,
            reference_number=request_data.reference_number,
            submission_date=request_data.submission_date or datetime.utcnow().strftime("%Y-%m-%d"),
            last_checked=request_data.last_checked or datetime.utcnow().strftime("%Y-%m-%d"),
            notes=request_data.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(db_request)
        db.commit()
        db.refresh(db_request)
        return db_request

    @staticmethod
    def get_all(
        db: Session,
        request_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Request]:
        """Return all saved requests, newest requests first."""
        query = db.query(Request)
        if request_type:
            query = query.filter(Request.request_type == request_type.upper())
        if status:
            query = query.filter(Request.status.ilike(status))
        return query.order_by(Request.created_at.desc(), Request.id.desc()).all()

    @staticmethod
    def get_by_id(db: Session, request_id: int) -> Optional[Request]:
        """Retrieve a saved request by ID, including its linked facts and drafts."""
        return db.query(Request).filter(Request.id == request_id).first()

    @staticmethod
    def update(db: Session, request_id: int, update_data: UpdateRequest) -> Optional[Request]:
        """Update fields of an existing request."""
        db_request = db.query(Request).filter(Request.id == request_id).first()
        if not db_request:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None and hasattr(db_request, key):
                setattr(db_request, key, value)

        db_request.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_request)
        return db_request

    @staticmethod
    def update_tracking(db: Session, request_id: int, tracking_data: TrackingUpdateRequest) -> Optional[Request]:
        """Update administrative tracking fields specifically."""
        db_request = db.query(Request).filter(Request.id == request_id).first()
        if not db_request:
            return None

        tracking_dict = tracking_data.model_dump(exclude_unset=True)
        for key, value in tracking_dict.items():
            if value is not None and hasattr(db_request, key):
                setattr(db_request, key, value)

        db_request.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_request)
        return db_request

    @staticmethod
    def delete(db: Session, request_id: int) -> bool:
        """Delete a request and its associated facts and drafts."""
        db_request = db.query(Request).filter(Request.id == request_id).first()
        if not db_request:
            return False

        db.delete(db_request)
        db.commit()
        return True

    @staticmethod
    def add_fact(db: Session, request_id: int, fact_data: CreateFact) -> Fact:
        """Add a single fact record linked to a request."""
        # Ensure source is clearly citizen, system, or official_source
        source = fact_data.source if fact_data.source in ["citizen", "system", "official_source"] else "citizen"

        db_fact = Fact(
            request_id=request_id,
            field=fact_data.field,
            value=fact_data.value,
            source=source,
        )
        db.add(db_fact)
        db.commit()
        db.refresh(db_fact)
        return db_fact

    @staticmethod
    def add_draft(db: Session, request_id: int, draft_data: CreateDraft) -> Draft:
        """Add or update a draft record linked to a request."""
        # Serialize list/dict if needed
        rti_q = draft_data.rti_questions
        if isinstance(rti_q, (list, dict)):
            rti_q = json.dumps(rti_q)

        missing_info = draft_data.missing_information
        if isinstance(missing_info, (list, dict)):
            missing_info = json.dumps(missing_info)

        db_draft = Draft(
            request_id=request_id,
            grievance_draft=draft_data.grievance_draft,
            rti_draft=draft_data.rti_draft,
            rti_questions=rti_q,
            missing_information=missing_info,
            validation_status=draft_data.validation_status,
            validation_message=draft_data.validation_message,
            created_at=datetime.utcnow(),
        )
        db.add(db_draft)
        db.commit()
        db.refresh(db_draft)
        return db_draft

    @staticmethod
    def save_analysis(db: Session, analysis_data: SaveAnalysisRequest) -> Request:
        """Save complete structured AI analysis into requests, facts, and drafts tables atomically."""
        prob = analysis_data.original_problem or analysis_data.problem or ""
        title = analysis_data.title or (prob[:60] + "..." if len(prob) > 60 else prob) or "Citizen Request"

        # 1. Create Request
        db_request = Request(
            title=title,
            original_problem=prob,
            request_type=analysis_data.request_type,
            reason=analysis_data.reason,
            location=analysis_data.location,
            status=analysis_data.status or "Draft",
            official_portal=analysis_data.official_portal,
            official_portal_url=analysis_data.official_portal_url,
            reference_number=analysis_data.reference_number,
            submission_date=analysis_data.submission_date or datetime.utcnow().strftime("%Y-%m-%d"),
            last_checked=analysis_data.last_checked or datetime.utcnow().strftime("%Y-%m-%d"),
            notes=analysis_data.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(db_request)
        db.flush()  # obtain generated db_request.id

        # 2. Add Facts (never fabricate as "citizen")
        if analysis_data.facts:
            for f in analysis_data.facts:
                if isinstance(f, dict):
                    f_field = f.get("field", "Detail")
                    f_value = str(f.get("value", ""))
                    f_source = f.get("source", "citizen")
                    if f_source not in ["citizen", "system", "official_source"]:
                        f_source = "citizen"
                    db_fact = Fact(
                        request_id=db_request.id,
                        field=f_field,
                        value=f_value,
                        source=f_source,
                    )
                    db.add(db_fact)

        # 3. Add Draft
        rti_q = analysis_data.rti_questions
        if isinstance(rti_q, (list, dict)):
            rti_q = json.dumps(rti_q)

        missing_info = analysis_data.missing_information
        if isinstance(missing_info, (list, dict)):
            missing_info = json.dumps(missing_info)

        db_draft = Draft(
            request_id=db_request.id,
            grievance_draft=analysis_data.grievance_draft,
            rti_draft=analysis_data.rti_draft,
            rti_questions=rti_q,
            missing_information=missing_info,
            validation_status=analysis_data.validation_status,
            validation_message=analysis_data.validation_message,
            created_at=datetime.utcnow(),
        )
        db.add(db_draft)

        db.commit()
        db.refresh(db_request)
        return db_request
