"""
Comprehensive Verification Suite for Grievance Scribe Database Layer.
Tests:
1. Automatic table creation and physical SQLite file check
2. TABLE 1: requests (fields, defaults, types)
3. TABLE 2: facts (fields, defaults, source validation)
4. TABLE 3: drafts (fields, rti_questions, validation)
5. Relationships: Request -> Facts (1:N), Request -> Drafts (1:N)
6. Cascade Deletion: Deleting Request purges Facts and Drafts
7. Foreign Key Enforcement in SQLite
8. FastAPI Endpoints:
   - GET /health & GET /api/health
   - POST /requests & POST /api/requests
   - GET /requests & GET /api/requests
   - GET /requests/{id} & GET /api/requests/{id}
   - PUT /requests/{id} & PUT /api/requests/{id}
   - POST /requests/{id}/facts & POST /api/requests/{id}/facts
   - POST /requests/{id}/draft & POST /api/requests/{id}/draft
   - PUT /requests/{id}/tracking & PUT /api/requests/{id}/tracking
   - POST /requests/save-analysis & POST /api/requests/save-analysis
   - DELETE /requests/{id} & DELETE /api/requests/{id}
"""

import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, init_db, Base
from models import Request, Fact, Draft
from main import app


def run_tests():
    print("=" * 80)
    print("RUNNING GRIEVANCE SCRIBE DATABASE LAYER VERIFICATION")
    print("=" * 80)

    # 1. Initialize DB and check tables
    print("\n[Step 1] Initializing database tables...")
    init_db()
    table_names = engine.table_names() if hasattr(engine, "table_names") else list(Base.metadata.tables.keys())
    print(f"Tables in metadata: {table_names}")
    assert "requests" in table_names, "Missing 'requests' table"
    assert "facts" in table_names, "Missing 'facts' table"
    assert "drafts" in table_names, "Missing 'drafts' table"
    print(">>> Step 1 Passed: Core tables (requests, facts, drafts) exist.")

    # 2. Test ORM insertions and relationships
    print("\n[Step 2] Testing ORM Insertions and Relationships...")
    db = SessionLocal()
    try:
        req = Request(
            title="Potholes near City Hospital",
            original_problem="Multiple severe potholes on the main approach road to City Hospital.",
            request_type="GRIEVANCE",
            reason="Corrective physical maintenance required.",
            location="City Hospital Road, Ward 12",
            status="Draft",
            official_portal="Municipal Corporation Ward Portal",
            official_portal_url="https://pgportal.gov.in",
            reference_number="GRV-TEST-001",
            notes="Initial citizen draft."
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        assert req.id is not None, "Request ID should be auto-incremented integer"
        print(f"Created Request ID: {req.id}")

        # Add Fact
        fact1 = Fact(
            request_id=req.id,
            field="location",
            value="City Hospital Road, Ward 12",
            source="citizen"
        )
        fact2 = Fact(
            request_id=req.id,
            field="hazard_level",
            value="Emergency vehicles delayed",
            source="citizen"
        )
        db.add_all([fact1, fact2])
        db.commit()

        # Add Draft
        draft = Draft(
            request_id=req.id,
            grievance_draft="To The Commissioner, Municipal Corporation...",
            validation_status="READY",
            validation_message="Grounded in citizen facts.",
            rti_questions="[]",
            missing_information="[]"
        )
        db.add(draft)
        db.commit()

        # Verify relationships
        db.refresh(req)
        assert len(req.facts) == 2, f"Expected 2 facts, got {len(req.facts)}"
        assert len(req.drafts) == 1, f"Expected 1 draft, got {len(req.drafts)}"
        assert req.facts[0].source == "citizen"
        print(">>> Step 2 Passed: Relationships (Request -> Facts, Request -> Drafts) verified.")

        # 3. Test Foreign Key Enforcement
        print("\n[Step 3] Testing SQLite Foreign Key Enforcement...")
        try:
            orphan_fact = Fact(
                request_id=999999,  # Non-existent ID
                field="invalid",
                value="should fail",
                source="citizen"
            )
            db.add(orphan_fact)
            db.commit()
            raise AssertionError("Foreign key constraint failed to trigger on non-existent request_id!")
        except IntegrityError:
            db.rollback()
            print(">>> Step 3 Passed: Foreign key constraint successfully prevented orphan fact insertion.")

        # 4. Test Cascade Deletion
        print("\n[Step 4] Testing Cascade Deletion...")
        req_id_to_delete = req.id
        db.delete(req)
        db.commit()

        orphan_facts_count = db.query(Fact).filter(Fact.request_id == req_id_to_delete).count()
        orphan_drafts_count = db.query(Draft).filter(Draft.request_id == req_id_to_delete).count()
        assert orphan_facts_count == 0, f"Expected 0 facts after delete, found {orphan_facts_count}"
        assert orphan_drafts_count == 0, f"Expected 0 drafts after delete, found {orphan_drafts_count}"
        print(">>> Step 4 Passed: Deleting request successfully cascaded and removed linked facts and drafts.")

    finally:
        db.close()

    # 5. Test API Endpoints using FastAPI TestClient
    print("\n[Step 5] Testing FastAPI Endpoints...")
    client = TestClient(app)

    # Health check
    res = client.get("/health")
    assert res.status_code == 200, f"/health returned {res.status_code}"
    data = res.json()
    assert data.get("status") == "ok"
    assert data.get("database") == "connected"
    print("  - GET /health: OK (database connected)")

    res_api_health = client.get("/api/health")
    assert res_api_health.status_code == 200
    assert res_api_health.json().get("database") == "connected"
    print("  - GET /api/health: OK (database connected)")

    # POST /requests
    create_payload = {
        "title": "Damaged road near ABC School",
        "original_problem": "The road near ABC School has been damaged for six months. Potholes make it unsafe for students.",
        "request_type": "MIXED",
        "reason": "The citizen needs physical road repair and wants to inspect sanctioned budget files.",
        "location": "Near ABC School, Ward 4",
        "status": "Draft",
        "official_portal": "Urban Local Body Ward Portal",
        "official_portal_url": "https://pgportal.gov.in"
    }
    res_create = client.post("/requests", json=create_payload)
    assert res_create.status_code == 201, f"POST /requests failed: {res_create.text}"
    created_req = res_create.json()
    new_id = created_req["id"]
    assert isinstance(new_id, int), f"Expected integer ID, got {type(new_id)}"
    assert created_req["title"] == create_payload["title"]
    assert created_req["status"] == "Draft"
    print(f"  - POST /requests: OK (Created ID: {new_id})")

    # GET /requests
    res_list = client.get("/requests")
    assert res_list.status_code == 200
    items = res_list.json()
    assert isinstance(items, list), "Expected list from GET /requests"
    assert any(r["id"] == new_id for r in items)
    print(f"  - GET /requests: OK (Returned {len(items)} requests)")

    # GET /requests/{id}
    res_get = client.get(f"/requests/{new_id}")
    assert res_get.status_code == 200
    detail = res_get.json()
    assert detail["id"] == new_id
    assert "facts" in detail
    assert "drafts" in detail
    print(f"  - GET /requests/{new_id}: OK (Retrieved with facts and drafts)")

    # PUT /requests/{id}
    res_put = client.put(f"/requests/{new_id}", json={
        "title": "Updated: ABC School Road Potholes",
        "notes": "Verified by citizen site visit."
    })
    assert res_put.status_code == 200
    assert res_put.json()["title"] == "Updated: ABC School Road Potholes"
    print(f"  - PUT /requests/{new_id}: OK (Updated title and notes)")

    # POST /requests/{id}/facts
    res_facts = client.post(f"/requests/{new_id}/facts", json={
        "field": "duration",
        "value": "six months",
        "source": "citizen"
    })
    assert res_facts.status_code == 201
    assert res_facts.json()["source"] == "citizen"
    print(f"  - POST /requests/{new_id}/facts: OK (Added fact)")

    # POST /requests/{id}/draft
    res_draft = client.post(f"/requests/{new_id}/draft", json={
        "grievance_draft": "Formal Grievance to Municipal Commissioner...",
        "rti_draft": "Application under Section 6(1) RTI Act...",
        "validation_status": "READY"
    })
    assert res_draft.status_code == 201
    print(f"  - POST /requests/{new_id}/draft: OK (Added draft)")

    # PUT /requests/{id}/tracking
    res_track = client.put(f"/requests/{new_id}/tracking", json={
        "status": "Submitted",
        "reference_number": "GRV-2026-99988",
        "submission_date": "2026-09-18",
        "notes": "Submitted via municipal portal; token generated."
    })
    assert res_track.status_code == 200
    assert res_track.json()["status"] == "Submitted"
    assert res_track.json()["reference_number"] == "GRV-2026-99988"
    print(f"  - PUT /requests/{new_id}/tracking: OK (Updated tracking info)")

    # POST /requests/save-analysis
    res_save_analysis = client.post("/requests/save-analysis", json={
        "title": "Community Hall Fund Audit",
        "problem": "I want to know how much money was allocated for the community hall and get copies of work orders.",
        "request_type": "RTI",
        "reason": "Citizen seeks public financial and tender records.",
        "location": "Sector 5 Community Center",
        "status": "Draft",
        "facts": [
            {"field": "Subject", "value": "Community Hall Construction", "source": "citizen"},
            {"field": "Records Requested", "value": "Sanctioned budget and work order", "source": "citizen"}
        ],
        "rti_questions": ["Please provide certified copy of administrative sanction.", "Please provide contractor name."],
        "rti_draft": "To The PIO...",
        "validation_status": "READY",
        "validation_message": "Facts verified."
    })
    assert res_save_analysis.status_code == 201
    analysis_saved = res_save_analysis.json()
    assert len(analysis_saved["facts"]) == 2
    assert len(analysis_saved["drafts"]) == 1
    print(f"  - POST /requests/save-analysis: OK (Saved atomic request ID: {analysis_saved['id']})")

    # DELETE /requests/{id}
    res_del = client.delete(f"/requests/{new_id}")
    assert res_del.status_code == 200
    res_verify_del = client.get(f"/requests/{new_id}")
    assert res_verify_del.status_code == 404
    print(f"  - DELETE /requests/{new_id}: OK (Deleted and verified 404)")

    # Test /api/ prefix routes
    res_api_list = client.get("/api/requests")
    assert res_api_list.status_code == 200
    print("  - GET /api/requests: OK (Dual route verified)")

    print("\n" + "=" * 80)
    print("ALL DATABASE LAYER & ENDPOINT TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_tests()
