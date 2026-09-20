export type UserRole = 'applicant' | 'lmo' | 'gatc' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organization: string; // Business or Dept name
  address: string;
  designation?: string; // e.g. "Senior Inspector", "Lead Calibration Engineer"
  isActive: boolean;
  createdAt: string;
}

export type InstrumentType =
  | 'weighing_scale_non_auto' // Non-automatic weighing instrument (counter scales, platform scales)
  | 'weighbridge_heavy'       // Heavy industrial road / rail weighbridge
  | 'fuel_dispenser'          // Petrol / Diesel / CNG dispensing unit
  | 'taximeter'               // Digital fare meters for autos / taxis
  | 'moisture_meter'          // Grain / agricultural moisture meter
  | 'storage_tank_flowmeter'  // Volumetric flow meters & bulk storage tanks
  | 'automatic_gravimetric';  // Automatic gravimetric filling instruments

export interface Instrument {
  id: string;
  owner_id: string;
  instrument_type: InstrumentType;
  make: string;
  model: string;
  serial_number: string;
  capacity: string;           // e.g. "30 kg (e=5g)", "50 MT", "60 L/min"
  location: string;           // Physical installation address / GPS reference
  accuracy_class?: string;    // Class I (Special), Class II (High), Class III (Medium), Class IV (Ordinary)
  registered_at: string;
  latitude?: number;          // Geo coordinate latitude
  longitude?: number;         // Geo coordinate longitude
  pincode?: string;           // Indian 6-digit postal code
}

export type ApplicationType = 'new' | 're-verification';

export type ApplicationStatus =
  | 'submitted'
  | 'scheduled'
  | 'in-progress'
  | 'verified'
  | 'rejected'
  | 'expired';

export interface Application {
  id: string;
  instrument_id: string;
  applicant_id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  assigned_officer_id?: string;
  assigned_gatc_id?: string;
  submitted_at: string;
  scheduled_date?: string;
  supporting_document_urls: string[];
  photo_urls: string[];
  applicant_notes?: string;
  rejection_reason?: string;
}

export interface VerificationRecord {
  id: string;
  application_id: string;
  officer_id: string;
  verification_date: string;
  observations: {
    visualInspectionPassed: boolean;
    sealIntegrityPassed: boolean;
    errorWithinMPE: boolean; // Maximum Permissible Error as per Legal Metrology Rules
    stampingCompleted: boolean;
    testedLoadPoints?: string;
    measuredErrorMargin?: string;
  };
  result: 'pass' | 'fail';
  remarks: string;
  certificate_id?: string;
}

export type CertificateStatus = 'active' | 'expired' | 'revoked';

export interface Certificate {
  id: string;
  application_id: string;
  certificate_number: string; // e.g. "IND-LM-2026-9842"
  qr_code_data: string;       // URL or payload
  issue_date: string;
  expiry_date: string;
  status: CertificateStatus;
  pdf_url?: string;
  issuing_officer_name: string;
  issuing_authority: string;  // e.g. "Office of Controller of Legal Metrology, State Directorate" or "GATC Lab #04"
  verification_fee_receipt?: string;
  seal_identification_tag?: string;
}

export type NotificationType =
  | 'expiry_alert'
  | 'status_update'
  | 'assignment_alert'
  | 'action_required';

export interface AppNotification {
  id: string;
  user_id: string;
  message: string;
  title: string;
  type: NotificationType;
  read_at: string | null;
  created_at: string;
  link?: string;
}

// Validity period lookup in months based on Indian Legal Metrology Rules (Schedule VII)
export const INSTRUMENT_VALIDITY_MONTHS: Record<InstrumentType, number> = {
  weighing_scale_non_auto: 12, // 1 year for commercial retail weights
  weighbridge_heavy: 12,       // 1 year
  fuel_dispenser: 12,          // 1 year
  taximeter: 24,               // 2 years (or 1 year depending on state rule)
  moisture_meter: 12,          // 1 year
  storage_tank_flowmeter: 24,  // 2 years for bulk volumetric
  automatic_gravimetric: 12,   // 1 year
};

export const INSTRUMENT_TYPE_LABELS: Record<InstrumentType, string> = {
  weighing_scale_non_auto: 'Electronic Weighing Scale (Commercial)',
  weighbridge_heavy: 'Heavy Road/Rail Weighbridge',
  fuel_dispenser: 'Fuel Dispensing Unit (Petrol/Diesel/CNG)',
  taximeter: 'Digital Auto/Taxi Fare Meter',
  moisture_meter: 'Digital Grain Moisture Meter',
  storage_tank_flowmeter: 'Bulk Flow Meter & Storage Tank',
  automatic_gravimetric: 'Automatic Gravimetric Filling Instrument',
};

// --- GIS & Enforcement Raid Types ---
export type EnforcementStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNDER_VERIFICATION';

export interface GisInstrumentMarker {
  instrument: Instrument;
  business: {
    name: string;
    organization: string;
    address: string;
    phone?: string;
    email?: string;
  };
  latestApplication?: Application;
  certificate?: Certificate;
  status: EnforcementStatus;
  daysUntilExpiry?: number;
  distanceKm?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PlannedRaidInspectionInput {
  instrumentId: string;
  officerId: string;
  scheduledDate: string;
  inspectionType: 'raid' | 'statutory_reverification';
  priority: 'urgent' | 'high' | 'routine';
  notes?: string;
  teamMembers?: string;
}

