"""
Test suite and verification script for Grievance Scribe Backend.
Demonstrates the 3 core scenarios requested in Sections 33, 34, and 35.
Can be executed with:
    python test_cases.py
"""

import asyncio
import json
from schemas import CitizenInput
from services.ai_service import AIService


async def run_all_demo_tests():
    ai = AIService()
    print("=" * 80)
    print("GRIEVANCE SCRIBE BACKEND — CORE DEMO TEST SUITE")
    print("=" * 80)

    # -------------------------------------------------------------------------
    # TEST CASE 1 (Section 33): Road repair + Sanctioned funds (MIXED)
    # -------------------------------------------------------------------------
    print("\n" + "#" * 80)
    print("TEST CASE 1 (Section 33): MIXED SCENARIO")
    print("#" * 80)
    input_1 = CitizenInput(
        problem="The road near ABC School has been damaged for six months. I complained earlier but it has still not been repaired. I also want to know how much money was allocated for this road repair and which contractor received the work.",
        location="Near ABC School",
        date="six months",
    )
    print(f"INPUT: {input_1.problem}\n")

    res_1 = await ai.analyze(input_1)
    print(f"RESULT CLASSIFICATION: {res_1.request_type}")
    print(f"REASON: {res_1.reason}")
    print(f"CONFIDENCE: {res_1.confidence}")
    print(f"FACTS EXTRACTED ({len(res_1.facts)}):")
    for f in res_1.facts:
        print(f"  - [{f.field}]: {f.value} (source: {f.source})")

    print(f"MISSING INFORMATION IDENTIFIED ({len(res_1.missing_information)}):")
    for m in res_1.missing_information:
        print(f"  - [{m.importance.upper()}] {m.field}: {m.question}")

    print(f"VALIDATION STATUS: {res_1.validation.status} (Score: {res_1.validation.score}/100)")
    print(f"RTI QUESTIONS GENERATED ({len(res_1.rti_questions)}):")
    for q in res_1.rti_questions:
        print(f"  - {q.id}: {q.question}")

    print(f"RECOMMENDED CHANNEL: {res_1.recommended_channel.official_portal.name}")
    print(f"PORTAL URL: {res_1.recommended_channel.official_portal.official_url}")
    assert res_1.request_type == "MIXED", f"Expected MIXED, got {res_1.request_type}"
    assert res_1.grievance_draft is not None, "Grievance draft should be present for MIXED"
    assert res_1.rti_draft is not None, "RTI draft should be present for MIXED"
    print("\n>>> TEST CASE 1 PASSED: Successfully split into dual Grievance & RTI channels.")

    # -------------------------------------------------------------------------
    # TEST CASE 2 (Section 34): Garbage Collection (GRIEVANCE)
    # -------------------------------------------------------------------------
    print("\n" + "#" * 80)
    print("TEST CASE 2 (Section 34): PURE GRIEVANCE SCENARIO")
    print("#" * 80)
    input_2 = CitizenInput(
        problem="Garbage has not been collected from my street for two weeks. Please arrange regular garbage collection.",
        date="two weeks",
    )
    print(f"INPUT: {input_2.problem}\n")

    res_2 = await ai.analyze(input_2)
    print(f"RESULT CLASSIFICATION: {res_2.request_type}")
    print(f"REASON: {res_2.reason}")
    print(f"FACTS EXTRACTED ({len(res_2.facts)}):")
    for f in res_2.facts:
        print(f"  - [{f.field}]: {f.value}")

    print(f"VALIDATION STATUS: {res_2.validation.status} (Score: {res_2.validation.score}/100)")
    assert res_2.request_type == "GRIEVANCE", f"Expected GRIEVANCE, got {res_2.request_type}"
    assert res_2.grievance_draft is not None, "Grievance draft should be generated"
    assert len(res_2.rti_questions) == 0, "Pure grievance should NOT generate RTI questions"
    print("\n>>> TEST CASE 2 PASSED: Correctly identified as GRIEVANCE without RTI overhead.")

    # -------------------------------------------------------------------------
    # TEST CASE 3 (Section 35): Community Hall Funds (RTI)
    # -------------------------------------------------------------------------
    print("\n" + "#" * 80)
    print("TEST CASE 3 (Section 35): PURE RTI SCENARIO")
    print("#" * 80)
    input_3 = CitizenInput(
        problem="I want to know how much money was allocated for the construction of the community hall and please provide the relevant work order."
    )
    print(f"INPUT: {input_3.problem}\n")

    res_3 = await ai.analyze(input_3)
    print(f"RESULT CLASSIFICATION: {res_3.request_type}")
    print(f"REASON: {res_3.reason}")
    print(f"RTI QUESTIONS GENERATED ({len(res_3.rti_questions)}):")
    for q in res_3.rti_questions:
        print(f"  - {q.id}: {q.question}")

    assert res_3.request_type == "RTI", f"Expected RTI, got {res_3.request_type}"
    assert len(res_3.rti_questions) > 0, "RTI should generate precise questions"
    assert res_3.grievance_draft is None, "Pure RTI should NOT generate a grievance draft"
    print("\n>>> TEST CASE 3 PASSED: Correctly identified as RTI with precise Section 6(1) questions.")

    print("\n" + "=" * 80)
    print("ALL 3 DEMO TEST CASES COMPLETED & VERIFIED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_all_demo_tests())
