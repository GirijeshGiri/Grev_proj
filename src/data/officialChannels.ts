import { OfficialChannel } from '../types';

export const OFFICIAL_PORTALS: Record<string, OfficialChannel> = {
  cpgrams: {
    id: 'cpgrams',
    name: 'CPGRAMS (Centralised Public Grievance Portal)',
    purpose: 'Central Government Departments, Ministries, Telecom, National Highways, and National Public Utilities',
    jurisdiction: 'Central',
    url: 'https://pgportal.gov.in',
    tracking_url: 'https://pgportal.gov.in/Status',
    type: 'central_grievance',
    supports: ['submission', 'tracking'],
    instructions: 'Register an account or login using mobile OTP. Select Central Ministry / Department and upload your grievance text with reference details.',
  },
  state_grievance: {
    id: 'state_grievance',
    name: 'State Public Grievance / CM Helpline Portal',
    purpose: 'State Government Civic Bodies, Municipal Roads, Water Supply, Local Police, State PWD',
    jurisdiction: 'State',
    url: 'https://pgportal.gov.in',
    tracking_url: 'https://pgportal.gov.in/Status',
    type: 'state_grievance',
    supports: ['submission', 'tracking'],
    instructions: 'Submit via your State CM Helpline or Municipal Grievance portal (e.g. e-NagarPalika / State Public Grievance Portal). Keep your auto-generated Grievance Registration Number for tracking.',
  },
  municipal_ward: {
    id: 'municipal_ward',
    name: 'Municipal Corporation / Ward Civic Office',
    purpose: 'Local neighborhood roads, streetlights, garbage sanitation, drainage, local ward maintenance',
    jurisdiction: 'Local / Municipal',
    url: 'https://pgportal.gov.in',
    tracking_url: 'https://pgportal.gov.in/Status',
    type: 'municipal',
    supports: ['submission', 'tracking'],
    instructions: 'Submit physically or via municipal online grievance app to the Junior Engineer / Ward Officer / Municipal Commissioner.',
  },
  rti_central: {
    id: 'rti_central',
    name: 'RTI Online Portal (DoPT, Government of India)',
    purpose: 'Filing statutory RTI requests under Section 6(1) for Central Government Ministries and PSUs',
    jurisdiction: 'Central',
    url: 'https://rtionline.gov.in',
    tracking_url: 'https://rtionline.gov.in/request/status.php',
    type: 'central_rti',
    supports: ['submission', 'tracking'],
    instructions: 'Submit under Section 6(1) with Rs. 10 statutory fee via Netbanking/Debit Card/UPI. Keep the 14-character RTI registration number.',
  },
  rti_state: {
    id: 'rti_state',
    name: 'State / Local RTI Public Information Office',
    purpose: 'Municipal corporation funds, local road repair tenders, state departmental files and work orders',
    jurisdiction: 'State',
    url: 'https://rtionline.gov.in',
    tracking_url: 'https://rtionline.gov.in/request/status.php',
    type: 'state_rti',
    supports: ['submission', 'tracking'],
    instructions: 'Submit to the Public Information Officer (PIO) of the concerned municipal body or state department along with the prescribed application fee (Court Fee Stamp / IPO / Online State RTI portal).',
  },
  consumer_helpline: {
    id: 'consumer_helpline',
    name: 'National Consumer Helpline (NCH - INGRAM)',
    purpose: 'Disputed electricity bills, private & public service utility grievances, consumer disputes',
    jurisdiction: 'Central',
    url: 'https://consumerhelpline.gov.in',
    tracking_url: 'https://consumerhelpline.gov.in/user/track-grievance.php',
    type: 'consumer',
    supports: ['submission', 'tracking'],
    instructions: 'Register consumer complaint online or call Toll-Free 1915. Upload copy of bills and prior communications.',
  },
};

export const getRecommendedChannelForRequest = (
  requestType: 'RTI' | 'GRIEVANCE' | 'MIXED',
  problem: string,
  location?: string
): { official_portal: OfficialChannel; alternate_portals: OfficialChannel[]; reason: string; type: string } => {
  const p = problem.toLowerCase();
  const loc = (location || '').toLowerCase();

  const isCentral = p.includes('national highway') || p.includes('railway') || p.includes('passport') || p.includes('postal') || p.includes('central bank') || p.includes('nhai');
  const isElectricity = p.includes('electricity') || p.includes('bill') || p.includes('power cut') || p.includes('meter');

  if (requestType === 'RTI') {
    if (isCentral) {
      return {
        type: 'central_rti',
        official_portal: OFFICIAL_PORTALS.rti_central,
        alternate_portals: [OFFICIAL_PORTALS.cpgrams],
        reason: 'The information requested pertains to a Central Government public authority under Section 6(1) of RTI Act 2005.',
      };
    }
    return {
      type: 'state_local_rti',
      official_portal: OFFICIAL_PORTALS.rti_state,
      alternate_portals: [OFFICIAL_PORTALS.municipal_ward, OFFICIAL_PORTALS.rti_central],
      reason: 'Information regarding municipal work orders, local contractor tenders, and civic expenditures is held by the State/Municipal Public Information Officer (PIO).',
    };
  }

  if (requestType === 'GRIEVANCE') {
    if (isElectricity) {
      return {
        type: 'consumer_or_state',
        official_portal: OFFICIAL_PORTALS.consumer_helpline,
        alternate_portals: [OFFICIAL_PORTALS.state_grievance],
        reason: 'Service tariff and billing grievances can be escalated directly to the National Consumer Helpline (NCH) or State Electricity Distribution Grievance Cell.',
      };
    }
    if (isCentral) {
      return {
        type: 'central_grievance',
        official_portal: OFFICIAL_PORTALS.cpgrams,
        alternate_portals: [OFFICIAL_PORTALS.state_grievance],
        reason: 'Matters regarding Central authorities, highways, or central agencies are formally addressed through CPGRAMS.',
      };
    }
    return {
      type: 'municipal_grievance',
      official_portal: OFFICIAL_PORTALS.municipal_ward,
      alternate_portals: [OFFICIAL_PORTALS.state_grievance, OFFICIAL_PORTALS.cpgrams],
      reason: 'Physical repairs (roads, streetlights, drainage, sanitation) fall directly under local Municipal Ward Jurisdiction or State PWD.',
    };
  }

  // MIXED
  return {
    type: 'dual_channel',
    official_portal: OFFICIAL_PORTALS.municipal_ward,
    alternate_portals: [OFFICIAL_PORTALS.rti_state, OFFICIAL_PORTALS.state_grievance],
    reason: 'For corrective action, submit to the Municipal Grievance Desk. For fund and contractor records, submit a Section 6(1) request to the PIO.',
  };
};
