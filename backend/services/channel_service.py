from typing import Dict, List, Optional
from schemas import OfficialChannel, RecommendedChannel


# Directory of verified official Indian government portals
OFFICIAL_CHANNELS_DIRECTORY: Dict[str, OfficialChannel] = {
    "cpgrams": OfficialChannel(
        name="CPGRAMS (Central Public Grievance Redress and Monitoring System)",
        type="CENTRAL_GOVERNMENT_GRIEVANCE",
        jurisdiction="Central Government / Ministries & Central PSUs",
        purpose="Official centralized grievance redressal portal across 90+ Union Ministries and Departments.",
        official_url="https://pgportal.gov.in",
        supports_tracking=True,
        department_hint="Department of Administrative Reforms and Public Grievances (DARPG)",
        guidance="Submit online with mobile OTP. You will receive a unique registration number (e.g. MORLY/E/2026/00123) for status tracking.",
    ),
    "rti_online_central": OfficialChannel(
        name="RTI Online Portal (Central Government)",
        type="CENTRAL_RTI",
        jurisdiction="Union Ministries, Departments & Central Public Authorities",
        purpose="Official portal for submitting Section 6(1) RTI applications to Central Government public authorities.",
        official_url="https://rtionline.gov.in",
        supports_tracking=True,
        department_hint="Department of Personnel and Training (DoPT)",
        guidance="Fee is standard ₹10 per application (exempt for BPL card holders). Mandatory response within 30 days under the RTI Act, 2005.",
    ),
    "municipal_ward": OfficialChannel(
        name="Urban Local Body / Municipal Corporation Ward Office",
        type="LOCAL_AUTHORITY",
        jurisdiction="Local Urban / Rural Civic Body (Municipal Corporation / Nagar Palika / Panchayat)",
        purpose="Direct civic redressal for physical infrastructure: roads, streetlights, potholes, drainage, sanitation, water pipelines.",
        official_url="https://services.india.gov.in",
        supports_tracking=True,
        department_hint="City Public Works Department (PWD) / Engineering Wing",
        guidance="File directly via your city's municipal citizen app/portal (e.g. MCD 311, BBMP Sahaaya, Greater Chennai, Swachhata App) or visit the Ward Junior Engineer office with two copies.",
    ),
    "state_cm_helpline": OfficialChannel(
        name="State Chief Minister Grievance Redressal Helpline",
        type="STATE_GOVERNMENT_GRIEVANCE",
        jurisdiction="State Government Departments (Education, Police, State PWD, Health)",
        purpose="Unified State Government helpline for issues under state jurisdiction or unresolved district complaints.",
        official_url="https://services.india.gov.in",
        supports_tracking=True,
        department_hint="State Public Grievance Directorate",
        guidance="Dial your state CM helpline toll-free number (e.g., 1076, 181, or State Jan Sunwai portal). A docket number is issued via SMS.",
    ),
    "state_rti": OfficialChannel(
        name="State Government Public Information Officer (PIO)",
        type="STATE_RTI_INFORMATION",
        jurisdiction="State Government Departments & Local Bodies",
        purpose="Section 6(1) RTI submission to State Public Information Officers.",
        official_url="https://services.india.gov.in",
        supports_tracking=True,
        department_hint="Office of the Assistant / Central Public Information Officer (PIO)",
        guidance="Submit via your state RTI portal (if enabled) or submit in person/registered speed post with ₹10 court fee stamp or postal order to the designated PIO.",
    ),
    "consumer_helpline": OfficialChannel(
        name="National Consumer Helpline (NCH / INGRAM)",
        type="OTHER_OFFICIAL_CHANNEL",
        jurisdiction="National / Consumer Affairs",
        purpose="Grievance portal for commercial disputes, defective products, utility billing errors, and deficient consumer services.",
        official_url="https://consumerhelpline.gov.in",
        supports_tracking=True,
        department_hint="Department of Consumer Affairs",
        guidance="Register via NCH portal or call toll-free 1915 for immediate docket registration.",
    ),
    "unknown_channel": OfficialChannel(
        name="Local Competent Authority / Administrative Review Required",
        type="UNKNOWN",
        jurisdiction="Jurisdiction Not Confidently Identified",
        purpose="Preliminary advisory. Requires citizen verification of the specific responsible civic department.",
        official_url="https://www.india.gov.in",
        supports_tracking=False,
        department_hint="General Administrative Department",
        guidance="Because the specific authority cannot be determined from the provided details, consult your local district collectorate or municipal ward office.",
    ),
}


class ChannelService:
    """Service to recommend and list official government channels."""

    @staticmethod
    def get_all_channels() -> List[OfficialChannel]:
        """Returns list of all configured official government channels."""
        return list(OFFICIAL_CHANNELS_DIRECTORY.values())

    @staticmethod
    def resolve_channel(
        request_type: str,
        problem: str,
        location: Optional[str] = None
    ) -> RecommendedChannel:
        """Determines the most appropriate official government portal based on type, problem keywords, and jurisdiction."""
        text = f"{problem} {location or ''}".lower()
        req_type = request_type.upper()

        # Check for municipal / local civic infrastructure issues
        local_keywords = [
            "road", "pothole", "street", "streetlight", "drain", "drainage",
            "garbage", "waste", "cleaning", "pipeline", "water supply",
            "sewage", "park", "ward", "sanitation", "mosquito", "footpath"
        ]
        is_local = any(kw in text for kw in local_keywords)

        # Check for central government domains
        central_keywords = [
            "railway", "train", "passport", "epfo", "provident fund", "pension",
            "income tax", "gst", "post office", "national highway", "nhai",
            "central bank", "rbi", "bsnl", "aadhaar", "uidai"
        ]
        is_central = any(kw in text for kw in central_keywords)

        # 1. MIXED Request
        if req_type == "MIXED":
            if is_local:
                return RecommendedChannel(
                    type="LOCAL_AUTHORITY",
                    reason="Request contains both a demand for physical infrastructure repair and demand for expenditure/contract records. We recommend lodging the grievance with the Local Municipal Ward Office and filing the RTI inquiry with the Municipal PIO.",
                    official_portal=OFFICIAL_CHANNELS_DIRECTORY["municipal_ward"],
                    alternate_portals=[
                        OFFICIAL_CHANNELS_DIRECTORY["state_rti"],
                        OFFICIAL_CHANNELS_DIRECTORY["state_cm_helpline"],
                    ],
                )
            elif is_central:
                return RecommendedChannel(
                    type="CENTRAL_GOVERNMENT_GRIEVANCE",
                    reason="Issue concerns central government authorities or PSUs. Grievance should go through CPGRAMS, and the RTI application should be lodged on RTI Online Central.",
                    official_portal=OFFICIAL_CHANNELS_DIRECTORY["cpgrams"],
                    alternate_portals=[OFFICIAL_CHANNELS_DIRECTORY["rti_online_central"]],
                )
            else:
                return RecommendedChannel(
                    type="STATE_GOVERNMENT_GRIEVANCE",
                    reason="Dual component request. Corrective action should be routed to the State CM Grievance portal, and records requests submitted to the relevant Departmental PIO.",
                    official_portal=OFFICIAL_CHANNELS_DIRECTORY["state_cm_helpline"],
                    alternate_portals=[OFFICIAL_CHANNELS_DIRECTORY["state_rti"]],
                )

        # 2. RTI Request
        elif req_type == "RTI":
            if is_central:
                return RecommendedChannel(
                    type="CENTRAL_RTI",
                    reason="Information sought pertains to central ministries, PSUs, or union regulatory bodies.",
                    official_portal=OFFICIAL_CHANNELS_DIRECTORY["rti_online_central"],
                    alternate_portals=[OFFICIAL_CHANNELS_DIRECTORY["cpgrams"]],
                )
            else:
                return RecommendedChannel(
                    type="STATE_RTI_INFORMATION",
                    reason="Information sought pertains to state or municipal public authority records, budgets, or file movements under Section 6(1) of the RTI Act, 2005.",
                    official_portal=OFFICIAL_CHANNELS_DIRECTORY["state_rti"],
                    alternate_portals=[OFFICIAL_CHANNELS_DIRECTORY["municipal_ward"]],
                )

        # 3. GRIEVANCE Request
        else:
            if is_local:
                return RecommendedChannel(
                    type="LOCAL_AUTHORITY",
                    reason="The problem is a local civic amenity issue requiring physical inspection, maintenance, or repair by municipal engineers.",
                    official_portal=OFFICIAL_CHANNELS_DIRECTORY["municipal_ward"],
                    alternate_portals=[OFFICIAL_CHANNELS_DIRECTORY["state_cm_helpline"]],
                )
            elif is_central:
                return RecommendedChannel(
                    type="CENTRAL_GOVERNMENT_GRIEVANCE",
                    reason="Grievance involves central government departments or central autonomous agencies.",
                    official_portal=OFFICIAL_CHANNELS_DIRECTORY["cpgrams"],
                    alternate_portals=[OFFICIAL_CHANNELS_DIRECTORY["consumer_helpline"]],
                )
            else:
                return RecommendedChannel(
                    type="STATE_GOVERNMENT_GRIEVANCE",
                    reason="Issue falls under state government administration or public services.",
                    official_portal=OFFICIAL_CHANNELS_DIRECTORY["state_cm_helpline"],
                    alternate_portals=[OFFICIAL_CHANNELS_DIRECTORY["municipal_ward"]],
                )
