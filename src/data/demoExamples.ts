import { DemoExample, AIAnalysisResponse } from '../types';
import { OFFICIAL_PORTALS } from './officialChannels';

export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'final-demo-mixed',
    title: 'Featured Demo: Damaged Road & Fund Inquiry',
    badge: 'MIXED',
    shortDesc: 'Road damaged for 6 months + inquiry on sanctioned funds and contractor work order.',
    input: {
      problem: 'The road near ABC School has been damaged for six months. I complained earlier but it has still not been repaired. I also want to know how much money was allocated for this road repair and which contractor received the work.',
      location: 'Near ABC School',
      duration: 'six months',
      previousComplaintNo: '',
      supportingDetails: 'Large potholes posing hazard to school buses and pedestrians.',
    },
  },
  {
    id: 'grievance-streetlights',
    title: 'Grievance Demo: Broken Streetlights Near School',
    badge: 'GRIEVANCE',
    shortDesc: 'Demanding immediate physical repair of hazardous dark streetlights.',
    input: {
      problem: 'The streetlights near ABC School have not been working for two weeks. I already complained once but nobody has fixed them.',
      location: 'Near ABC School, 4th Main Road',
      duration: 'two weeks',
      previousComplaintNo: '',
      supportingDetails: 'Affects evening safety of female students and elderly residents.',
    },
  },
  {
    id: 'rti-road-funds',
    title: 'RTI Demo: Budget & Contractor Record Query',
    badge: 'RTI',
    shortDesc: 'Seeking official government financial allocations, tenders, and file movement.',
    input: {
      problem: 'I want to know how much money was allocated for repairing the road in Ward 14 during the last 6 months and which contractor was awarded the work order.',
      location: 'Ward 14, South Zone',
      duration: 'last 6 months',
      previousComplaintNo: '',
      supportingDetails: 'Require certified work order copy and progress completion report under Section 6(1).',
    },
  },
];

export const MOCK_ANALYSES: Record<string, AIAnalysisResponse> = {
  'final-demo-mixed': {
    request_type: 'MIXED',
    reason: 'The citizen is asking for both physical corrective action (repairing the damaged road) and verifiable administrative/financial information (sanctioned budget and contractor identity). In official procedure, grievance cells do not process statutory information disclosures, and RTI Public Information Officers do not perform civil works.',
    confidence: 'high',
    facts: [
      { field: 'Core Issue', value: 'Road has been severely damaged causing hazards near school', source: 'user_provided' },
      { field: 'Location', value: 'Near ABC School', source: 'user_provided' },
      { field: 'Duration', value: 'Six months', source: 'user_provided' },
      { field: 'Previous Action Taken', value: 'Citizen stated they complained earlier but issue remains unaddressed', source: 'user_provided' },
      { field: 'Requested Action', value: 'Physical repair and resurfacing of the road', source: 'user_provided' },
      { field: 'Information Sought', value: 'Funds allocated for road repair and name of contractor awarded work', source: 'user_provided' },
    ],
    missing_information: [
      'Exact road / street name or municipal ward number',
      'Previous complaint registration or reference number',
    ],
    validation: {
      status: 'needs_information',
      intent_identified: true,
      core_issue_identified: true,
      facts_extracted: true,
      unsupported_facts_detected: false,
      details_missing: ['Exact street / ward name', 'Prior complaint reference number'],
      readiness_message: 'Request intent and core facts verified. Providing the exact street name and previous complaint reference will prevent administrative rejection.',
    },
    rti_questions: [
      'Please provide the total budget amount sanctioned and allocated for the repair/resurfacing of the road near ABC School, as available on official record.',
      'Please provide the total expenditure incurred to date on this specific road stretch.',
      'Please provide a certified copy of the work order and tender document awarded to the contractor for this work.',
      'Please provide the name and registered address of the contractor or agency awarded the work.',
      'Please provide the stipulated completion date as per the contract agreement and reasons on record for delay, if any.',
    ],
    grievance_draft: `To,
The Municipal Commissioner / Executive Engineer (Roads),
[Authority not specified — please verify the appropriate authority before submission.]
[Office Address]

Subject: Formal Grievance regarding: Immediate repair of severely damaged road near ABC School

Sir/Madam,

I wish to bring the following urgent civic grievance to your attention:

The road near ABC School has been heavily damaged for approximately six months. Potholes and uneven surfaces pose severe hazards to school students, daily pedestrians, and vehicular traffic. Despite lodging an earlier complaint, no physical inspection or repair has taken place.

Location:
Near ABC School

Duration / Date:
Six months

Previous action taken:
Complainant lodged an earlier complaint; no action observed on site.

Requested Corrective Action:
I request the competent authority to conduct an immediate site inspection and carry out prompt bitumen / asphalt resurfacing and pothole filling to eliminate safety risks.

Name: ______________________
Address: ___________________
Phone/Email: _______________
Date: __________  Place: __________

Signature: __________________`,
    rti_draft: `To,
The Public Information Officer (PIO),
[Name of public authority / office],
[Full address]

Subject: Application under Section 6(1) of the Right to Information Act, 2005

Sir/Madam,

I request the following information on official record under Section 6(1) of the RTI Act, 2005 regarding road works near ABC School:

1. Please provide the total budget amount sanctioned and allocated for the repair/resurfacing of the road near ABC School, as available on official record.
2. Please provide the total expenditure incurred to date on this road stretch.
3. Please provide a certified copy of the work order and tender sanction order issued to the contractor for this work.
4. Please provide the name and registered address of the contractor/agency awarded the work order.
5. Please provide the stipulated date of completion as per agreement and date-wise progress reports on record.

I state that I am a citizen of India.

The statutory application fee of Rs. 10/- is enclosed by [payment method/reference, as applicable].

If any part of the requested information is held by another public authority, kindly transfer that portion under Section 6(3) of the RTI Act, 2005 and notify the applicant.

Name: ______________________
Address: ___________________
Phone/Email: _______________
Date: __________  Place: __________

Signature: __________________`,
    recommended_channel: {
      type: 'dual_channel',
      reason: 'Because this request contains dual intents, submit the grievance petition to the Municipal Roads Department, and the RTI queries to the Public Information Officer (PIO) under Section 6(1).',
      official_portal: OFFICIAL_PORTALS.municipal_ward,
      alternate_portals: [OFFICIAL_PORTALS.rti_state, OFFICIAL_PORTALS.state_grievance],
    },
    warnings: [
      'Grievance Scribe provides AI-assisted drafting and organization. Review all generated information before submission.',
      'Do not submit RTI applications requesting physical civil repairs; PIOs have no legal jurisdiction to order road work.',
      'State RTI rules may prescribe specific payment instruments (Court Fee Stamp, Indian Postal Order, or State Online Portal).',
    ],
  },
  'grievance-streetlights': {
    request_type: 'GRIEVANCE',
    reason: 'The citizen is seeking direct remedial intervention, repair, maintenance, or administrative action to resolve non-functional public streetlights.',
    confidence: 'high',
    facts: [
      { field: 'Issue', value: 'Streetlights not functioning, causing safety concerns', source: 'user_provided' },
      { field: 'Location', value: 'Near ABC School, 4th Main Road', source: 'user_provided' },
      { field: 'Duration', value: 'Two weeks', source: 'user_provided' },
      { field: 'Previous Action Taken', value: 'Already complained once but nobody fixed them', source: 'user_provided' },
      { field: 'Category', value: 'Public municipal lighting and pedestrian safety', source: 'user_provided' },
      { field: 'Requested Action', value: 'Repair and replace faulty streetlight fixtures and wiring', source: 'user_provided' },
    ],
    missing_information: [
      'Street pole numbers or exact landmark coordinates',
      'Previous complaint registration or token number',
    ],
    validation: {
      status: 'ready',
      intent_identified: true,
      core_issue_identified: true,
      facts_extracted: true,
      unsupported_facts_detected: false,
      details_missing: ['Pole numbers'],
      readiness_message: 'Request is well structured with clear location, duration, and actionable demand. Ready to draft and submit to municipal authority.',
    },
    rti_questions: [],
    grievance_draft: `To,
The Junior Engineer (Electrical) / Municipal Ward Officer,
[Authority not specified — please verify the appropriate authority before submission.]
[Office Address]

Subject: Urgent Grievance: Repair of non-functional streetlights near ABC School

Sir/Madam,

I wish to bring the following civic issue to your attention:

The streetlights along the road near ABC School, 4th Main Road have been completely out of order for the past two weeks. The darkness creates significant safety hazards for school children, evening commuters, and senior citizens. An earlier complaint was lodged, but the lamps remain unrepaired.

Location:
Near ABC School, 4th Main Road

Duration / Date:
Two weeks

Previous action taken:
Prior complaint lodged by citizen; pending rectification.

Requested Action:
I urge the electrical maintenance team to inspect the junction boxes and replace the burned-out lamps promptly.

Name: ______________________
Address: ___________________\nPhone/Email: _______________\nDate: __________  Place: __________\n\nSignature: __________________`,
    rti_draft: null,
    recommended_channel: {
      type: 'municipal_grievance',
      reason: 'Streetlight maintenance is handled directly by the Local Municipal Corporation / Electricity Division.',
      official_portal: OFFICIAL_PORTALS.municipal_ward,
      alternate_portals: [OFFICIAL_PORTALS.state_grievance],
    },
    warnings: [
      'Grievance Scribe provides AI-assisted drafting and organization. Review all generated information before submission.',
      'Public grievance redressal is free of statutory fees on official municipal portals.',
    ],
  },
  'rti-road-funds': {
    request_type: 'RTI',
    reason: 'The citizen is exclusively requesting official public records, financial allocations, tender information, and contractor identity under Section 6(1) of the RTI Act, 2005.',
    confidence: 'high',
    facts: [
      { field: 'Information Sought', value: 'Sanctioned funds and contractor details for road repair', source: 'user_provided' },
      { field: 'Location', value: 'Ward 14, South Zone', source: 'user_provided' },
      { field: 'Period', value: 'Last 6 months', source: 'user_provided' },
      { field: 'Category', value: 'Public finance and tender execution records', source: 'user_provided' },
    ],
    missing_information: [
      'Specific street or road stretch name within Ward 14',
      'Name of the designated public authority (e.g., City Municipal Corporation)',
    ],
    validation: {
      status: 'ready',
      intent_identified: true,
      core_issue_identified: true,
      facts_extracted: true,
      unsupported_facts_detected: false,
      details_missing: ['Exact street name'],
      readiness_message: 'Request fulfills all Section 6(1) information criteria. Ready for draft.',
    },
    rti_questions: [
      'Please provide the total financial budget sanctioned and allocated for road repair works in Ward 14 during the last six months as per official records.',
      'Please provide the certified copy of the work order(s) issued for road repair works in Ward 14 during this period.',
      'Please provide the name, registered address, and proprietor details of the contractor or agency awarded the contract.',
      'Please provide the itemized expenditure incurred and payment vouchers released to date.',
      'Please provide the stipulated completion timeline and penalty clauses specified in the work order.',
    ],
    grievance_draft: null,
    rti_draft: `To,
The Public Information Officer (PIO),
[Name of public authority / office],
[Full address]

Subject: Application under Section 6(1) of the Right to Information Act, 2005

Sir/Madam,

I request the following information under Section 6(1) of the RTI Act, 2005 concerning road repair works executed in Ward 14:

1. Please provide the total financial budget sanctioned and allocated for road repair works in Ward 14 during the last six months as per official records.
2. Please provide the certified copy of the work order(s) issued for road repair works in Ward 14 during this period.
3. Please provide the name, registered address, and proprietor details of the contractor or agency awarded the contract.
4. Please provide the itemized expenditure incurred and payment vouchers released to date.
5. Please provide the stipulated completion timeline and penalty clauses specified in the work order.

I state that I am a citizen of India.

The statutory fee of Rs. 10/- is enclosed herewith by [payment method/reference, as applicable].

If any part of this information is held by another public authority, kindly transfer that portion under Section 6(3) of the RTI Act, 2005 and notify the undersigned.

Name: ______________________
Address: ___________________
Phone/Email: _______________
Date: __________  Place: __________

Signature: __________________`,
    recommended_channel: {
      type: 'state_local_rti',
      reason: 'This information is maintained by the Municipal Corporation / State PWD Public Information Officer.',
      official_portal: OFFICIAL_PORTALS.rti_state,
      alternate_portals: [OFFICIAL_PORTALS.rti_central],
    },
    warnings: [
      'Grievance Scribe provides AI-assisted drafting and organization. Review all generated information before submission.',
      'Address the application to the designated Public Information Officer (PIO) and enclose the statutory Rs. 10/- fee.',
    ],
  },
};
