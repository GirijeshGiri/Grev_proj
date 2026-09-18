from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Request(Base):
    """TABLE 1: requests
    Stores the citizen's core issue, categorization, and administrative tracking details.
    """
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String(255), nullable=False)
    original_problem = Column(Text, nullable=False)
    request_type = Column(String(32), nullable=False, index=True)  # Allowed: RTI, GRIEVANCE, MIXED
    reason = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    status = Column(String(64), nullable=False, default="Draft", index=True)  # Draft, Submitted, Under Process, Action Taken, Closed, User Updated, Other
    official_portal = Column(String(255), nullable=True)
    official_portal_url = Column(String(512), nullable=True)
    reference_number = Column(String(128), nullable=True, index=True)
    submission_date = Column(String(64), nullable=True)
    last_checked = Column(String(64), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships (Section 3)
    facts = relationship("Fact", back_populates="request", cascade="all, delete-orphan", lazy="joined")
    drafts = relationship("Draft", back_populates="request", cascade="all, delete-orphan", lazy="joined")

    @property
    def problem(self) -> str:
        """Alias for compatibility."""
        return self.original_problem

    def __repr__(self):
        return f"<Request id={self.id} title='{self.title}' type='{self.request_type}' status='{self.status}'>"


class Fact(Base):
    """TABLE 2: facts
    Stores grounded facts extracted directly from citizen input or official sources.
    Source must be one of: citizen, system, official_source.
    """
    __tablename__ = "facts"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False, index=True)
    field = Column(String(128), nullable=False)
    value = Column(Text, nullable=False)
    source = Column(String(64), default="citizen", nullable=False)  # citizen, system, official_source

    request = relationship("Request", back_populates="facts")

    def __repr__(self):
        return f"<Fact id={self.id} request_id={self.request_id} field='{self.field}' source='{self.source}'>"


class Draft(Base):
    """TABLE 3: drafts
    Stores generated application drafts, RTI questions, validation status and missing info.
    """
    __tablename__ = "drafts"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False, index=True)
    grievance_draft = Column(Text, nullable=True)
    rti_draft = Column(Text, nullable=True)
    rti_questions = Column(Text, nullable=True)  # JSON string or formatted text
    missing_information = Column(Text, nullable=True)  # JSON string or formatted text
    validation_status = Column(String(64), nullable=True)
    validation_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    request = relationship("Request", back_populates="drafts")

    def __repr__(self):
        return f"<Draft id={self.id} request_id={self.request_id} status='{self.validation_status}'>"


# Backward compatibility alias
RequestModel = Request
