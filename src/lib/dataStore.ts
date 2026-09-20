import {
  UserProfile,
  Instrument,
  Application,
  VerificationRecord,
  Certificate,
  AppNotification,
  INSTRUMENT_VALIDITY_MONTHS,
  EnforcementStatus,
  GisInstrumentMarker,
  PlannedRaidInspectionInput,
} from '../types';
import {
  supabase,
  isSupabaseConfigured,
  checkSupabaseHealth,
  seedSupabaseTables,
  SupabaseHealthStatus,
} from './supabase';
import { calculateDistanceKm, INDIAN_PINCODES } from './gisService';

const STORAGE_KEYS = {
  PROFILES: 'verifymetro_profiles_v1',
  INSTRUMENTS: 'verifymetro_instruments_v1',
  APPLICATIONS: 'verifymetro_applications_v1',
  VERIFICATION_RECORDS: 'verifymetro_records_v1',
  CERTIFICATES: 'verifymetro_certificates_v1',
  NOTIFICATIONS: 'verifymetro_notifications_v1',
  CURRENT_USER_ID: 'verifymetro_current_user_id_v1',
};

// Seed Profiles: 1 of each role + commercial businesses for GIS enforcement
export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'usr-applicant-1',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@maadurgatrading.in',
    phone: '+91 98250 11420',
    role: 'applicant',
    organization: 'Maa Durga Trading & Logistics',
    address: 'Plot 42, GIDC Phase II, Naroda, Ahmedabad, Gujarat 382330',
    designation: 'Proprietor & Weighbridge Operator',
    isActive: true,
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'usr-applicant-2',
    name: 'Harish Bhai Patel',
    email: 'kisanagro@narodagidc.in',
    phone: '+91 98980 44120',
    role: 'applicant',
    organization: 'Kisan Agro Processing Mills & Logistics',
    address: 'Shed 102, Near Railway Siding, GIDC Phase II, Naroda, Ahmedabad, Gujarat 382330',
    designation: 'Managing Partner',
    isActive: true,
    createdAt: '2024-05-10T09:00:00Z',
  },
  {
    id: 'usr-applicant-3',
    name: 'Rajesh Singhal',
    email: 'shreeram.fuel@ringroad.in',
    phone: '+91 97240 66321',
    role: 'applicant',
    organization: 'Shree Ram Petroleum & Highway Fuel Bay',
    address: 'Survey No. 44, Ring Road Highway Crossing, Naroda, Ahmedabad, Gujarat 382330',
    designation: 'Station Manager',
    isActive: true,
    createdAt: '2024-04-12T10:00:00Z',
  },
  {
    id: 'usr-applicant-4',
    name: 'Mohan Lal Gupta',
    email: 'gupta.traders@apmc.in',
    phone: '+91 94260 55110',
    role: 'applicant',
    organization: 'Gujarat Wholesale Spices & Grains Merchant',
    address: 'Shop 14-16, APMC Sub-Yard, Naroda Mandi, Ahmedabad, Gujarat 382330',
    designation: 'Proprietor',
    isActive: true,
    createdAt: '2024-07-20T11:00:00Z',
  },
  {
    id: 'usr-applicant-5',
    name: 'Baldev Singh',
    email: 'azadpur.weighbridge@delhimandi.org',
    phone: '+91 98110 33490',
    role: 'applicant',
    organization: 'Azadpur Mandi Commercial Logistics Terminal',
    address: 'Gate 4, New Subzi Mandi Yard, Azadpur, Delhi 110033',
    designation: 'Terminal Incharge',
    isActive: true,
    createdAt: '2024-02-15T09:00:00Z',
  },
  {
    id: 'usr-applicant-6',
    name: 'Sunil Kumar Aggarwal',
    email: 'rohini.wholesalers@retaildelhi.in',
    phone: '+91 98710 22880',
    role: 'applicant',
    organization: 'Rohini Wholesale Fruit & Grain Mart',
    address: 'Plot 88, Commercial Complex, Sector 7, Rohini, Delhi 110085',
    designation: 'Partner',
    isActive: true,
    createdAt: '2024-08-01T10:00:00Z',
  },
  {
    id: 'usr-applicant-delhi-cp',
    name: 'Rajesh Chawla',
    email: 'chawla.jewellers@connaughtplace.in',
    phone: '+91 98110 44291',
    role: 'applicant',
    organization: 'Chawla Bullion & Gems Jewellers',
    address: 'Shop 18, Block C, Inner Circle, Connaught Place, New Delhi 110001',
    designation: 'Proprietor & Bullion Dealer',
    isActive: true,
    createdAt: '2024-02-15T09:00:00Z',
  },
  {
    id: 'usr-applicant-delhi-cp2',
    name: 'Sardar Manjit Singh',
    email: 'janpath.logistics@delhi.in',
    phone: '+91 98101 77334',
    role: 'applicant',
    organization: 'Janpath Commercial Fuels & Logistics',
    address: 'Fuel Bay 2, Near Tolstoy Marg Crossing, Janpath, Connaught Place, New Delhi 110001',
    designation: 'Managing Partner',
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'usr-lmo-1',
    name: 'S. K. Sharma',
    email: 'sk.sharma@legalmetrology.gov.in',
    phone: '+91 94140 88219',
    role: 'lmo',
    organization: 'Legal Metrology Department, Inspectorate Zone-II',
    address: 'Metrology Bhavan, Near Civil Hospital, Ring Road, District Metrology Office',
    designation: 'Senior Legal Metrology Inspector (Gazetted)',
    isActive: true,
    createdAt: '2024-03-10T10:00:00Z',
  },
  {
    id: 'usr-gatc-1',
    name: 'Dr. Ananya Sen',
    email: 'ananya.sen@gatclab.org.in',
    phone: '+91 98301 44552',
    role: 'gatc',
    organization: 'National Calibration & Legal Metrology Test Centre (GATC #07)',
    address: 'NABL Accredited Calibration Facility, Sector V, Salt Lake, Kolkata 700091',
    designation: 'Head of Calibration Services & Authorized Signatory',
    isActive: true,
    createdAt: '2024-06-01T11:00:00Z',
  },
  {
    id: 'usr-admin-1',
    name: 'Vikramaditya Joshi',
    email: 'admin.joshi@legalmetrology.gov.in',
    phone: '+91 98100 55210',
    role: 'admin',
    organization: 'Office of the Controller of Legal Metrology, State Directorate',
    address: 'Directorate of Legal Metrology, Secretariat Complex, Administrative Block B',
    designation: 'Joint Controller of Legal Metrology / System Administrator',
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z',
  },
];

// Seed Instruments with verified GIS coordinates and pincodes
export const DEMO_INSTRUMENTS: Instrument[] = [
  {
    id: 'inst-001',
    owner_id: 'usr-applicant-1',
    instrument_type: 'weighing_scale_non_auto',
    make: 'Essae-Teraoka',
    model: 'DS-215 Electronic Table-top Scale',
    serial_number: 'ESS-2024-88491',
    capacity: '30 kg (Max) / 100 g (Min), e = 5 g',
    accuracy_class: 'Class III (Medium)',
    location: 'Main Retail Counter, Maa Durga Depot, Naroda, Ahmedabad',
    pincode: '382330',
    latitude: 23.0805,
    longitude: 72.6644,
    registered_at: '2025-02-10T11:30:00Z',
  },
  {
    id: 'inst-002',
    owner_id: 'usr-applicant-1',
    instrument_type: 'weighbridge_heavy',
    make: 'Avery Weigh-Tronix',
    model: 'BridgeMont Pitless Heavy Truck Scale',
    serial_number: 'AVT-WB-50T-992',
    capacity: '50 MT (Metric Tonnes), e = 10 kg',
    accuracy_class: 'Class III (Medium)',
    location: 'Gate No. 1, Logistics Inward Terminal, Naroda Yard, Ahmedabad',
    pincode: '382330',
    latitude: 23.0850,
    longitude: 72.6680,
    registered_at: '2024-09-20T14:15:00Z',
  },
  {
    id: 'inst-003',
    owner_id: 'usr-applicant-1',
    instrument_type: 'fuel_dispenser',
    make: 'Tokheim / Gilbarco Veeder-Root',
    model: 'Encore 500S Multi-Product Dispenser',
    serial_number: 'GVR-FD-2023-412',
    capacity: 'Flow Rate: 45 L/min, Dual Nozzle HSD/MS',
    accuracy_class: 'Accuracy Class 0.5 (±0.5% MPE)',
    location: 'Highway Fuel Station Bay 03, Ring Road Branch, Naroda, Ahmedabad',
    pincode: '382330',
    latitude: 23.0890,
    longitude: 72.6590,
    registered_at: '2025-08-12T09:45:00Z',
  },
  {
    id: 'inst-004',
    owner_id: 'usr-applicant-1',
    instrument_type: 'taximeter',
    make: 'Pulsar Digital Systems',
    model: 'SpeedoFare TX-9 Electronic Fare Meter',
    serial_number: 'PUL-TX-2024-118',
    capacity: 'Pulse constant: 4000 pulses/km, GPS synchronized',
    accuracy_class: 'Class I Electronic Fare Meter',
    location: 'Commercial Fleet Vehicle GJ-01-AX-9912, Naroda, Ahmedabad',
    pincode: '382330',
    latitude: 23.0830,
    longitude: 72.6610,
    registered_at: '2025-04-05T16:20:00Z',
  },
  {
    id: 'inst-005',
    owner_id: 'usr-applicant-1',
    instrument_type: 'moisture_meter',
    make: 'Dickey-John Agri-Tech',
    model: 'GAC 2500-UGMA Grain Moisture Analyzer',
    serial_number: 'DJ-MM-2025-007',
    capacity: 'Moisture Range: 5% - 45%, Accuracy ±0.1%',
    accuracy_class: 'Grade A Grain Inspector Meter',
    location: 'Agricultural Commodities Mandi Inspection Shed, Naroda, Ahmedabad',
    pincode: '382330',
    latitude: 23.0790,
    longitude: 72.6660,
    registered_at: '2025-07-18T10:00:00Z',
  },
  // EXPIRED INSTRUMENTS in Ahmedabad 382330 (Targeted for Enforcement Raids)
  {
    id: 'inst-006',
    owner_id: 'usr-applicant-2',
    instrument_type: 'weighbridge_heavy',
    make: 'Eagle Weighing Systems',
    model: 'Eagle 60MT Heavy Industrial Truck Scale',
    serial_number: 'EAG-WB-60T-108',
    capacity: '60 MT, e = 10 kg',
    accuracy_class: 'Class III (Medium)',
    location: 'Kisan Agro Mill Gate No. 2, GIDC Phase II, Naroda, Ahmedabad',
    pincode: '382330',
    latitude: 23.0760,
    longitude: 72.6710,
    registered_at: '2024-05-15T10:00:00Z',
  },
  {
    id: 'inst-007',
    owner_id: 'usr-applicant-3',
    instrument_type: 'fuel_dispenser',
    make: 'Wayne Fueling Systems',
    model: 'Helix 5000 Commercial 4-Nozzle Dispenser',
    serial_number: 'WYN-FD-2023-881',
    capacity: 'Flow Rate: 45 L/min (HSD/MS)',
    accuracy_class: 'Accuracy Class 0.5 (±0.5% MPE)',
    location: 'Shree Ram Fuel Bay, Ring Road Highway Crossing, Naroda, Ahmedabad',
    pincode: '382330',
    latitude: 23.0930,
    longitude: 72.6620,
    registered_at: '2024-04-15T11:00:00Z',
  },
  {
    id: 'inst-008',
    owner_id: 'usr-applicant-4',
    instrument_type: 'weighing_scale_non_auto',
    make: 'Mettler Toledo',
    model: 'BBA231 Heavy Commercial Bench Scale',
    serial_number: 'MT-BS-150-449',
    capacity: '150 kg (Max) / 500 g (Min), e = 20 g',
    accuracy_class: 'Class III (Medium)',
    location: 'Shop 14, APMC Sub-Yard, Naroda Mandi, Ahmedabad',
    pincode: '382330',
    latitude: 23.0815,
    longitude: 72.6605,
    registered_at: '2024-07-25T14:30:00Z',
  },
  {
    id: 'inst-009',
    owner_id: 'usr-applicant-4',
    instrument_type: 'weighing_scale_non_auto',
    make: 'Essae-Teraoka',
    model: 'PR-85 Price Computing Retail Scale',
    serial_number: 'ESS-PC-2025-331',
    capacity: '15 kg, e = 2 g',
    accuracy_class: 'Class III (Medium)',
    location: 'Amul Dairy & Provisions Counter, Naroda, Ahmedabad',
    pincode: '382330',
    latitude: 23.0780,
    longitude: 72.6695,
    registered_at: '2025-04-01T09:00:00Z',
  },
  // Delhi NCR Instruments (Azadpur Mandi 110033 & Rohini 110085)
  {
    id: 'inst-010',
    owner_id: 'usr-applicant-5',
    instrument_type: 'weighbridge_heavy',
    make: 'Avery India Limited',
    model: 'Pitless Steel Deck 60MT Highway Weighbridge',
    serial_number: 'AVI-WB-60T-774',
    capacity: '60 MT, e = 10 kg',
    accuracy_class: 'Class III (Medium)',
    location: 'Gate No. 4, New Subzi Mandi Logistics Yard, Azadpur, Delhi',
    pincode: '110033',
    latitude: 28.7180,
    longitude: 77.1750,
    registered_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'inst-011',
    owner_id: 'usr-applicant-6',
    instrument_type: 'weighing_scale_non_auto',
    make: 'Phoenix Scales',
    model: 'Commercial Digital Platform Scale 300kg',
    serial_number: 'PHX-PS-300-992',
    capacity: '300 kg, e = 50 g',
    accuracy_class: 'Class III (Medium)',
    location: 'Wholesale Commodity Bay, Sector 7, Rohini, Delhi',
    pincode: '110085',
    latitude: 28.7150,
    longitude: 77.1180,
    registered_at: '2024-08-10T12:00:00Z',
  },
  {
    id: 'inst-012',
    owner_id: 'usr-applicant-6',
    instrument_type: 'weighing_scale_non_auto',
    make: 'Essae-Teraoka',
    model: 'DS-215 Countertop Electronic Scale',
    serial_number: 'ESS-2026-1192',
    capacity: '30 kg, e = 5 g',
    accuracy_class: 'Class III (Medium)',
    location: 'Retail Counter 02, Sector 8, Rohini, Delhi',
    pincode: '110085',
    latitude: 28.7170,
    longitude: 77.1140,
    registered_at: '2026-01-10T10:00:00Z',
  },
  // Non-compliant instruments in Connaught Place, Central Delhi (Pincode 110001 - within 5km radius)
  {
    id: 'inst-cp-001',
    owner_id: 'usr-applicant-delhi-cp',
    instrument_type: 'weighing_scale_non_auto',
    make: 'Mettler Toledo',
    model: 'ME204T Analytical Precision Bullion Balance',
    serial_number: 'MT-CP-2023-8812',
    capacity: '220 g (Max) / 10 mg (Min), e = 1 mg, d = 0.1 mg',
    accuracy_class: 'Class II (High)',
    location: 'Bullion Sales Counter, Block C, Inner Circle, Connaught Place, New Delhi 110001 (Lat: 28.6328, Lng: 77.2195, Pincode: 110001)',
    pincode: '110001',
    latitude: 28.6328,
    longitude: 77.2195,
    registered_at: '2024-02-20T10:00:00Z',
  },
  {
    id: 'inst-cp-002',
    owner_id: 'usr-applicant-delhi-cp2',
    instrument_type: 'fuel_dispenser',
    make: 'Wayne Fueling Systems',
    model: 'Century Commercial Dual High-Speed Dispenser',
    serial_number: 'WYN-DL-CP-4412',
    capacity: 'Flow Rate: 45 L/min (Dual Nozzle HSD/MS)',
    accuracy_class: 'Accuracy Class 0.5 (±0.5% MPE)',
    location: 'Commercial Fuel Bay 2, Janpath Road, Connaught Place, New Delhi 110001 (Lat: 28.6265, Lng: 77.2188, Pincode: 110001)',
    pincode: '110001',
    latitude: 28.6265,
    longitude: 77.2188,
    registered_at: '2024-03-05T11:00:00Z',
  },
];

// Seed Applications
export const DEMO_APPLICATIONS: Application[] = [
  {
    id: 'app-2025-001',
    instrument_id: 'inst-001',
    applicant_id: 'usr-applicant-1',
    type: 'new',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2025-02-12T10:00:00Z',
    scheduled_date: '2025-02-15T10:30:00Z',
    supporting_document_urls: [
      'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80',
    ],
    photo_urls: [
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&auto=format&fit=crop&q=80',
    ],
    applicant_notes: 'Initial verification after new installation at retail checkout.',
  },
  {
    id: 'app-2025-002',
    instrument_id: 'inst-002',
    applicant_id: 'usr-applicant-1',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2025-09-22T08:30:00Z',
    scheduled_date: '2025-09-28T14:00:00Z',
    supporting_document_urls: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    ],
    photo_urls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    ],
    applicant_notes: 'Annual mandatory calibration for 50MT weighbridge.',
  },
  {
    id: 'app-2026-003',
    instrument_id: 'inst-003',
    applicant_id: 'usr-applicant-1',
    type: 're-verification',
    status: 'submitted',
    submitted_at: '2026-09-01T09:15:00Z',
    supporting_document_urls: [
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    ],
    photo_urls: [
      'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&auto=format&fit=crop&q=80',
    ],
    applicant_notes: 'Due for periodic calibration before festive season high volume.',
  },
  {
    id: 'app-2026-004',
    instrument_id: 'inst-004',
    applicant_id: 'usr-applicant-1',
    type: 'new',
    status: 'scheduled',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2026-09-02T11:40:00Z',
    scheduled_date: '2026-09-08T11:00:00Z',
    supporting_document_urls: [
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
    ],
    photo_urls: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
    ],
    applicant_notes: 'New taxi fare meter fitted as per RTO guidelines.',
  },
  {
    id: 'app-2026-005',
    instrument_id: 'inst-005',
    applicant_id: 'usr-applicant-1',
    type: 'new',
    status: 'in-progress',
    assigned_gatc_id: 'usr-gatc-1',
    submitted_at: '2026-08-28T14:20:00Z',
    scheduled_date: '2026-09-06T15:00:00Z',
    supporting_document_urls: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    ],
    photo_urls: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    ],
    applicant_notes: 'Lab precision test required at GATC test bed.',
  },
  // Applications for Expired & Active Seed Instruments
  {
    id: 'app-2025-006',
    instrument_id: 'inst-006',
    applicant_id: 'usr-applicant-2',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2025-08-01T09:00:00Z',
    scheduled_date: '2025-08-08T11:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'Previous annual verification.',
  },
  {
    id: 'app-2024-007',
    instrument_id: 'inst-007',
    applicant_id: 'usr-applicant-3',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2025-06-18T09:00:00Z',
    scheduled_date: '2025-06-25T11:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'Previous annual verification for 4-nozzle fuel pump.',
  },
  {
    id: 'app-2025-008',
    instrument_id: 'inst-008',
    applicant_id: 'usr-applicant-4',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2025-08-28T09:00:00Z',
    scheduled_date: '2025-09-05T11:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'Bench scale verification in wholesale market.',
  },
  {
    id: 'app-2026-009',
    instrument_id: 'inst-009',
    applicant_id: 'usr-applicant-4',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2026-04-05T09:00:00Z',
    scheduled_date: '2026-04-10T11:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'Active retail scale verification.',
  },
  {
    id: 'app-2025-010',
    instrument_id: 'inst-010',
    applicant_id: 'usr-applicant-5',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2025-07-10T09:00:00Z',
    scheduled_date: '2025-07-15T11:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'Mandatory weighbridge verification at Azadpur Mandi.',
  },
  {
    id: 'app-2025-011',
    instrument_id: 'inst-011',
    applicant_id: 'usr-applicant-6',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2025-08-20T09:00:00Z',
    scheduled_date: '2025-08-30T11:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'Wholesale scale verification in Rohini Sector 7.',
  },
  {
    id: 'app-2026-012',
    instrument_id: 'inst-012',
    applicant_id: 'usr-applicant-6',
    type: 'new',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2026-01-15T09:00:00Z',
    scheduled_date: '2026-01-20T11:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'New counter scale in Rohini Sector 8.',
  },
  {
    id: 'app-cp-001',
    instrument_id: 'inst-cp-001',
    applicant_id: 'usr-applicant-delhi-cp',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2024-02-22T10:00:00Z',
    scheduled_date: '2024-02-28T11:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'Annual verification of high-precision bullion balance at Connaught Place showroom.',
  },
  {
    id: 'app-cp-002',
    instrument_id: 'inst-cp-002',
    applicant_id: 'usr-applicant-delhi-cp2',
    type: 're-verification',
    status: 'verified',
    assigned_officer_id: 'usr-lmo-1',
    submitted_at: '2024-03-10T09:00:00Z',
    scheduled_date: '2024-03-15T14:00:00Z',
    supporting_document_urls: [],
    photo_urls: [],
    applicant_notes: 'Periodic commercial dispenser verification.',
  },
];

// Seed Certificates (includes Active, Expiring Soon, and Expired certificates)
export const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-001',
    application_id: 'app-2025-001',
    certificate_number: 'IND-LM-2025-0482',
    qr_code_data: '/verify/IND-LM-2025-0482',
    issue_date: '2025-02-15',
    expiry_date: '2027-02-14',
    status: 'active',
    issuing_officer_name: 'S. K. Sharma (Inspector LM-II)',
    issuing_authority: 'Legal Metrology Department, Govt. of Gujarat',
    verification_fee_receipt: 'REC-2025-8841 (₹ 250 Paid)',
    seal_identification_tag: 'SEAL-LM-AHM-98442',
  },
  {
    id: 'cert-002',
    application_id: 'app-2025-002',
    certificate_number: 'IND-LM-2025-1190',
    qr_code_data: '/verify/IND-LM-2025-1190',
    issue_date: '2025-09-28',
    expiry_date: '2026-09-27',
    status: 'active',
    issuing_officer_name: 'S. K. Sharma (Inspector LM-II)',
    issuing_authority: 'Legal Metrology Department, Govt. of Gujarat',
    verification_fee_receipt: 'REC-2025-9921 (₹ 4,000 Paid)',
    seal_identification_tag: 'LEAD-SEAL-WB-2025-012',
  },
  // EXPIRED CERTIFICATES (Targeted for GIS Enforcement Raids)
  {
    id: 'cert-006',
    application_id: 'app-2025-006',
    certificate_number: 'IND-LM-2025-0109',
    qr_code_data: '/verify/IND-LM-2025-0109',
    issue_date: '2025-08-08',
    expiry_date: '2026-08-07',
    status: 'expired',
    issuing_officer_name: 'S. K. Sharma (Inspector LM-II)',
    issuing_authority: 'Legal Metrology Department, Govt. of Gujarat',
    verification_fee_receipt: 'REC-2025-1029 (₹ 5,000 Paid)',
    seal_identification_tag: 'SEAL-WB-AHM-6612',
  },
  {
    id: 'cert-007',
    application_id: 'app-2024-007',
    certificate_number: 'IND-LM-2024-9128',
    qr_code_data: '/verify/IND-LM-2024-9128',
    issue_date: '2025-06-25',
    expiry_date: '2026-06-24',
    status: 'expired',
    issuing_officer_name: 'S. K. Sharma (Inspector LM-II)',
    issuing_authority: 'Legal Metrology Department, Govt. of Gujarat',
    verification_fee_receipt: 'REC-2024-8890 (₹ 3,500 Paid)',
    seal_identification_tag: 'WIRE-SEAL-FP-2024-44',
  },
  {
    id: 'cert-008',
    application_id: 'app-2025-008',
    certificate_number: 'IND-LM-2025-4412',
    qr_code_data: '/verify/IND-LM-2025-4412',
    issue_date: '2025-09-05',
    expiry_date: '2026-09-04',
    status: 'expired',
    issuing_officer_name: 'S. K. Sharma (Inspector LM-II)',
    issuing_authority: 'Legal Metrology Department, Govt. of Gujarat',
    verification_fee_receipt: 'REC-2025-3312 (₹ 400 Paid)',
    seal_identification_tag: 'LEAD-SEAL-BS-901',
  },
  {
    id: 'cert-009',
    application_id: 'app-2026-009',
    certificate_number: 'IND-LM-2026-3391',
    qr_code_data: '/verify/IND-LM-2026-3391',
    issue_date: '2026-04-10',
    expiry_date: '2027-04-09',
    status: 'active',
    issuing_officer_name: 'S. K. Sharma (Inspector LM-II)',
    issuing_authority: 'Legal Metrology Department, Govt. of Gujarat',
    verification_fee_receipt: 'REC-2026-4411 (₹ 250 Paid)',
    seal_identification_tag: 'SEAL-LM-AHM-1120',
  },
  {
    id: 'cert-010',
    application_id: 'app-2025-010',
    certificate_number: 'IND-LM-2025-7801',
    qr_code_data: '/verify/IND-LM-2025-7801',
    issue_date: '2025-07-15',
    expiry_date: '2026-07-14',
    status: 'expired',
    issuing_officer_name: 'D. K. Malhotra (Inspector LM-Delhi)',
    issuing_authority: 'Weights & Measures Dept, Govt. of NCT of Delhi',
    verification_fee_receipt: 'REC-DEL-2025-771 (₹ 5,000 Paid)',
    seal_identification_tag: 'SEAL-DEL-AZD-401',
  },
  {
    id: 'cert-011',
    application_id: 'app-2025-011',
    certificate_number: 'IND-LM-2025-6619',
    qr_code_data: '/verify/IND-LM-2025-6619',
    issue_date: '2025-08-30',
    expiry_date: '2026-08-29',
    status: 'expired',
    issuing_officer_name: 'D. K. Malhotra (Inspector LM-Delhi)',
    issuing_authority: 'Weights & Measures Dept, Govt. of NCT of Delhi',
    verification_fee_receipt: 'REC-DEL-2025-882 (₹ 600 Paid)',
    seal_identification_tag: 'SEAL-DEL-ROH-229',
  },
  {
    id: 'cert-012',
    application_id: 'app-2026-012',
    certificate_number: 'IND-LM-2026-1188',
    qr_code_data: '/verify/IND-LM-2026-1188',
    issue_date: '2026-01-20',
    expiry_date: '2027-01-19',
    status: 'active',
    issuing_officer_name: 'D. K. Malhotra (Inspector LM-Delhi)',
    issuing_authority: 'Weights & Measures Dept, Govt. of NCT of Delhi',
    verification_fee_receipt: 'REC-DEL-2026-192 (₹ 250 Paid)',
    seal_identification_tag: 'SEAL-DEL-ROH-780',
  },
  // Expired Certificates in Connaught Place 110001 (Targeted for Legal Metrology Enforcement)
  {
    id: 'cert-cp-001',
    application_id: 'app-cp-001',
    certificate_number: 'IND-DL-2024-00918',
    qr_code_data: '/verify/IND-DL-2024-00918',
    issue_date: '2024-02-28',
    expiry_date: '2025-02-27',
    status: 'expired',
    issuing_officer_name: 'Anil Kumar (LMO Central Delhi)',
    issuing_authority: 'Legal Metrology Department, Govt. of NCT of Delhi',
    verification_fee_receipt: 'REC-DL-2024-819 (₹ 500 Paid)',
    seal_identification_tag: 'LEAD-SEAL-DL-CP-918',
  },
  {
    id: 'cert-cp-002',
    application_id: 'app-cp-002',
    certificate_number: 'IND-DL-2024-00441',
    qr_code_data: '/verify/IND-DL-2024-00441',
    issue_date: '2024-03-15',
    expiry_date: '2025-03-14',
    status: 'expired',
    issuing_officer_name: 'Anil Kumar (LMO Central Delhi)',
    issuing_authority: 'Legal Metrology Department, Govt. of NCT of Delhi',
    verification_fee_receipt: 'REC-DL-2024-992 (₹ 2,000 Paid)',
    seal_identification_tag: 'LEAD-SEAL-DL-CP-441',
  },
];

// Seed Verification Records
export const DEMO_VERIFICATION_RECORDS: VerificationRecord[] = [
  {
    id: 'rec-001',
    application_id: 'app-2025-001',
    officer_id: 'usr-lmo-1',
    verification_date: '2025-02-15',
    observations: {
      visualInspectionPassed: true,
      sealIntegrityPassed: true,
      errorWithinMPE: true,
      stampingCompleted: true,
      testedLoadPoints: 'Tested at 5kg, 10kg, 20kg, and 30kg full span.',
      measuredErrorMargin: '±0.002 kg (Well within allowed MPE of ±0.005 kg)',
    },
    result: 'pass',
    remarks: 'Instrument verified in presence of applicant. Digital seal tag affixed. Stamping completed as per Rule 14.',
    certificate_id: 'cert-001',
  },
  {
    id: 'rec-002',
    application_id: 'app-2025-002',
    officer_id: 'usr-lmo-1',
    verification_date: '2025-09-28',
    observations: {
      visualInspectionPassed: true,
      sealIntegrityPassed: true,
      errorWithinMPE: true,
      stampingCompleted: true,
      testedLoadPoints: 'Load test conducted using 20 MT calibrated cast iron weights + substitution test to 50 MT.',
      measuredErrorMargin: '±5 kg on 50,000 kg (Allowed MPE is ±10 kg)',
    },
    result: 'pass',
    remarks: 'Weighbridge platform condition satisfactory. Load cells calibrated. Lead wire seal locked.',
    certificate_id: 'cert-002',
  },
  {
    id: 'rec-cp-001',
    application_id: 'app-cp-001',
    officer_id: 'usr-lmo-1',
    verification_date: '2024-02-28',
    observations: {
      visualInspectionPassed: true,
      sealIntegrityPassed: true,
      errorWithinMPE: true,
      stampingCompleted: true,
      testedLoadPoints: 'Class II standard weights: 10g, 50g, 100g, 200g span.',
      measuredErrorMargin: '±0.2 mg on 200 g (Allowed MPE is ±1 mg)',
    },
    result: 'pass',
    remarks: 'Initial verification certificate issued for bullion scale. Mandatory annual re-verification expired on 27 Feb 2025.',
    certificate_id: 'cert-cp-001',
  },
];

// Seed Notifications
export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    user_id: 'usr-applicant-1',
    title: 'Certificate Expiry Alert (Action Required)',
    message: 'Certificate IND-LM-2025-1190 for Heavy Road Weighbridge (AVT-WB-50T-992) will expire on 27 Sept 2026 (in 22 days). File re-verification immediately to avoid penalties under Section 24 of Legal Metrology Act, 2009.',
    type: 'expiry_alert',
    read_at: null,
    created_at: '2026-09-01T08:00:00Z',
    link: '/certificates',
  },
  {
    id: 'notif-002',
    user_id: 'usr-applicant-1',
    title: 'Application Scheduled for Inspection',
    message: 'Your verification application for SpeedoFare TX-9 Electronic Fare Meter (APP-2026-004) has been scheduled by Inspector S. K. Sharma for 08 Sept 2026 at 11:00 AM.',
    type: 'status_update',
    read_at: null,
    created_at: '2026-09-03T10:15:00Z',
    link: '/applications',
  },
  {
    id: 'notif-003',
    user_id: 'usr-lmo-1',
    title: 'New Verification Application in Queue',
    message: 'New application received: Fuel Dispensing Unit (GVR-FD-2023-412) from Maa Durga Trading. Current pendency: 4 days.',
    type: 'assignment_alert',
    read_at: null,
    created_at: '2026-09-01T09:16:00Z',
    link: '/queue',
  },
  {
    id: 'notif-004',
    user_id: 'usr-gatc-1',
    title: 'Precision Lab Calibration Assigned',
    message: 'Application APP-2026-005 for Grain Moisture Analyzer is awaiting lab verification testing.',
    type: 'assignment_alert',
    read_at: null,
    created_at: '2026-08-29T12:00:00Z',
    link: '/queue',
  },
];

// Helper to safely execute background queries on Postgrest
function fireAndForget(promiseLike: PromiseLike<unknown>) {
  Promise.resolve(promiseLike).catch((err) => {
    console.warn('Supabase sync warning:', err);
  });
}

// In-memory + LocalStorage cache engine with Supabase integration
class DataStore {
  private profiles: UserProfile[] = [];
  private instruments: Instrument[] = [];
  private applications: Application[] = [];
  private verificationRecords: VerificationRecord[] = [];
  private certificates: Certificate[] = [];
  private notifications: AppNotification[] = [];
  private currentUserId: string = 'usr-applicant-1';
  private supabaseStatus: SupabaseHealthStatus = {
    isConfigured: isSupabaseConfigured,
    isConnected: false,
    hasTables: false,
    message: isSupabaseConfigured ? 'Connecting to Supabase...' : 'Supabase credentials not configured',
  };
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
    if (isSupabaseConfigured) {
      this.initSupabaseSync();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('DataStore subscriber error:', e);
      }
    });
  }

  public getSupabaseStatus(): SupabaseHealthStatus {
    return this.supabaseStatus;
  }

  /**
   * Initializes synchronization with Supabase
   */
  public async initSupabaseSync(): Promise<SupabaseHealthStatus> {
    if (!isSupabaseConfigured || !supabase) {
      return this.supabaseStatus;
    }

    try {
      const status = await checkSupabaseHealth();
      this.supabaseStatus = status;

      if (status.hasTables) {
        // Fetch profiles
        const { data: pData } = await supabase.from('profiles').select('*');
        if (pData && pData.length > 0) {
          this.profiles = pData.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            phone: p.phone || '',
            role: p.role,
            organization: p.organization || '',
            address: p.address || '',
            designation: p.designation,
            isActive: p.is_active ?? true,
            createdAt: p.created_at || new Date().toISOString(),
          }));
        }

        // Fetch instruments
        const { data: iData } = await supabase.from('instruments').select('*');
        if (iData && iData.length > 0) {
          const demoMap = new Map(DEMO_INSTRUMENTS.map((d) => [d.id, d]));
          this.instruments = iData.map((i) => {
            const demo = demoMap.get(i.id);
            let lat = i.latitude ?? demo?.latitude;
            let lng = i.longitude ?? demo?.longitude;
            let pincode = i.pincode ?? demo?.pincode;

            if (lat == null || lng == null) {
              const coordMatch = i.location?.match(/Lat:\s*([0-9.]+),\s*Lng:\s*([0-9.]+)/i);
              if (coordMatch) {
                lat = parseFloat(coordMatch[1]);
                lng = parseFloat(coordMatch[2]);
              }
            }

            if (!pincode && i.location) {
              const pinMatch = i.location.match(/\b(\d{6})\b/);
              if (pinMatch) {
                pincode = pinMatch[1];
              }
            }

            if ((lat == null || lng == null) && pincode && INDIAN_PINCODES[pincode]) {
              lat = INDIAN_PINCODES[pincode].lat;
              lng = INDIAN_PINCODES[pincode].lng;
            }

            return {
              id: i.id,
              owner_id: i.owner_id,
              instrument_type: i.instrument_type,
              make: i.make,
              model: i.model,
              serial_number: i.serial_number,
              capacity: i.capacity,
              accuracy_class: i.accuracy_class,
              location: i.location,
              registered_at: i.registered_at,
              latitude: lat,
              longitude: lng,
              pincode: pincode,
            };
          });
        }

        // Fetch applications
        const { data: aData } = await supabase.from('applications').select('*');
        if (aData && aData.length > 0) {
          this.applications = aData.map((a) => ({
            id: a.id,
            instrument_id: a.instrument_id,
            applicant_id: a.applicant_id,
            type: a.type,
            status: a.status,
            assigned_officer_id: a.assigned_officer_id,
            assigned_gatc_id: a.assigned_gatc_id,
            submitted_at: a.submitted_at,
            scheduled_date: a.scheduled_date,
            supporting_document_urls: a.supporting_document_urls || [],
            photo_urls: a.photo_urls || [],
            applicant_notes: a.applicant_notes,
            rejection_reason: a.rejection_reason,
          }));
        }

        // Fetch certificates
        const { data: cData } = await supabase.from('certificates').select('*');
        if (cData && cData.length > 0) {
          this.certificates = cData.map((c) => ({
            id: c.id,
            application_id: c.application_id,
            certificate_number: c.certificate_number,
            qr_code_data: c.qr_code_data,
            issue_date: c.issue_date,
            expiry_date: c.expiry_date,
            status: c.status,
            issuing_officer_name: c.issuing_officer_name,
            issuing_authority: c.issuing_authority,
            verification_fee_receipt: c.verification_fee_receipt,
            seal_identification_tag: c.seal_identification_tag,
            pdf_url: c.pdf_url,
          }));
        }

        // Fetch verification records
        const { data: rData } = await supabase.from('verification_records').select('*');
        if (rData && rData.length > 0) {
          this.verificationRecords = rData.map((r) => ({
            id: r.id,
            application_id: r.application_id,
            officer_id: r.officer_id,
            verification_date: r.verification_date,
            observations: r.observations || {},
            result: r.result,
            remarks: r.remarks || '',
            certificate_id: r.certificate_id,
          }));
        }

        // Fetch notifications
        const { data: nData } = await supabase.from('notifications').select('*');
        if (nData && nData.length > 0) {
          this.notifications = nData.map((n) => ({
            id: n.id,
            user_id: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            read_at: n.read_at,
            created_at: n.created_at,
            link: n.link,
          }));
        }

        this.saveAll();
      }

      this.notify();
      return this.supabaseStatus;
    } catch (err) {
      console.warn('Supabase sync warning:', err);
      this.notify();
      return this.supabaseStatus;
    }
  }

  /**
   * Seeds the Supabase database with the current sample dataset
   */
  public async seedSupabase(): Promise<{ success: boolean; message: string; error?: string }> {
    const res = await seedSupabaseTables({
      profiles: this.profiles,
      instruments: this.instruments,
      applications: this.applications,
      certificates: this.certificates,
      verificationRecords: this.verificationRecords,
      notifications: this.notifications,
    });

    if (res.success) {
      await this.initSupabaseSync();
    }
    return res;
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      let loadedProfiles: UserProfile[] = storedProfiles ? JSON.parse(storedProfiles) : DEMO_PROFILES;
      // Merge in any missing demo profiles
      for (const demoP of DEMO_PROFILES) {
        if (!loadedProfiles.some((p) => p.id === demoP.id)) {
          loadedProfiles.push(demoP);
        }
      }
      this.profiles = loadedProfiles;

      const storedInst = localStorage.getItem(STORAGE_KEYS.INSTRUMENTS);
      let loadedInst: Instrument[] = storedInst ? JSON.parse(storedInst) : DEMO_INSTRUMENTS;
      const demoMap = new Map(DEMO_INSTRUMENTS.map((d) => [d.id, d]));
      loadedInst = loadedInst.map((inst) => {
        const demo = demoMap.get(inst.id);
        if (demo) {
          return {
            ...inst,
            latitude: inst.latitude ?? demo.latitude,
            longitude: inst.longitude ?? demo.longitude,
            pincode: inst.pincode ?? demo.pincode,
          };
        }
        return inst;
      });
      // Merge in any new demo instruments (e.g. expired raid targets)
      for (const demoI of DEMO_INSTRUMENTS) {
        if (!loadedInst.some((i) => i.id === demoI.id)) {
          loadedInst.push(demoI);
        }
      }
      this.instruments = loadedInst;

      const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      let loadedApps: Application[] = storedApps ? JSON.parse(storedApps) : DEMO_APPLICATIONS;
      for (const demoA of DEMO_APPLICATIONS) {
        if (!loadedApps.some((a) => a.id === demoA.id)) {
          loadedApps.push(demoA);
        }
      }
      this.applications = loadedApps;

      const storedRecs = localStorage.getItem(STORAGE_KEYS.VERIFICATION_RECORDS);
      this.verificationRecords = storedRecs ? JSON.parse(storedRecs) : DEMO_VERIFICATION_RECORDS;

      const storedCerts = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      let loadedCerts: Certificate[] = storedCerts ? JSON.parse(storedCerts) : DEMO_CERTIFICATES;
      for (const demoC of DEMO_CERTIFICATES) {
        if (!loadedCerts.some((c) => c.id === demoC.id)) {
          loadedCerts.push(demoC);
        }
      }
      this.certificates = loadedCerts;

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : DEMO_NOTIFICATIONS;

      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      this.currentUserId = storedUser || 'usr-applicant-1';
    } catch {
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.profiles = [...DEMO_PROFILES];
    this.instruments = [...DEMO_INSTRUMENTS];
    this.applications = [...DEMO_APPLICATIONS];
    this.verificationRecords = [...DEMO_VERIFICATION_RECORDS];
    this.certificates = [...DEMO_CERTIFICATES];
    this.notifications = [...DEMO_NOTIFICATIONS];
    this.currentUserId = 'usr-applicant-1';
    this.saveAll();
    this.notify();
  }

  private saveAll() {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
    localStorage.setItem(STORAGE_KEYS.INSTRUMENTS, JSON.stringify(this.instruments));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(this.applications));
    localStorage.setItem(STORAGE_KEYS.VERIFICATION_RECORDS, JSON.stringify(this.verificationRecords));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(this.certificates));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
  }

  // --- Auth & Profile Methods ---
  public getCurrentUser(): UserProfile {
    const user = this.profiles.find((p) => p.id === this.currentUserId);
    if (user) return user;
    return this.profiles[0];
  }

  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  public getProfiles(): UserProfile[] {
    return [...this.profiles];
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public createProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile {
    const newProfile: UserProfile = {
      ...profile,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(
        supabase.from('profiles').insert([{
          id: newProfile.id,
          name: newProfile.name,
          email: newProfile.email,
          phone: newProfile.phone,
          role: newProfile.role,
          organization: newProfile.organization,
          address: newProfile.address,
          designation: newProfile.designation,
          is_active: newProfile.isActive,
          created_at: newProfile.createdAt,
        }])
      );
    }

    return newProfile;
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.profiles[idx] = { ...this.profiles[idx], ...updates };
    this.saveAll();
    this.notify();

    if (supabase) {
      const u = this.profiles[idx];
      fireAndForget(
        supabase.from('profiles').update({
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          organization: u.organization,
          address: u.address,
          designation: u.designation,
          is_active: u.isActive,
        }).eq('id', id)
      );
    }

    return this.profiles[idx];
  }

  public toggleUserStatus(id: string): UserProfile | null {
    const user = this.profiles.find((p) => p.id === id);
    if (!user) return null;
    user.isActive = !user.isActive;
    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(supabase.from('profiles').update({ is_active: user.isActive }).eq('id', id));
    }

    return user;
  }

  // --- Instruments ---
  public getInstruments(ownerId?: string): Instrument[] {
    if (ownerId) {
      return this.instruments.filter((i) => i.owner_id === ownerId);
    }
    return [...this.instruments];
  }

  public getInstrumentById(id: string): Instrument | undefined {
    return this.instruments.find((i) => i.id === id);
  }

  public addInstrument(instrument: Omit<Instrument, 'id' | 'registered_at'>): Instrument {
    const newInst: Instrument = {
      ...instrument,
      id: `inst-${Date.now()}`,
      registered_at: new Date().toISOString(),
    };
    this.instruments.unshift(newInst);
    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(
        supabase.from('instruments').insert([{
          id: newInst.id,
          owner_id: newInst.owner_id,
          instrument_type: newInst.instrument_type,
          make: newInst.make,
          model: newInst.model,
          serial_number: newInst.serial_number,
          capacity: newInst.capacity,
          accuracy_class: newInst.accuracy_class,
          location: newInst.location,
          registered_at: newInst.registered_at,
          latitude: newInst.latitude ?? null,
          longitude: newInst.longitude ?? null,
          pincode: newInst.pincode ?? null,
        }])
      );
    }

    return newInst;
  }

  // --- Applications ---
  public getApplications(filter?: { applicantId?: string; officerId?: string; gatcId?: string }): Application[] {
    let list = [...this.applications];
    if (filter?.applicantId) {
      list = list.filter((a) => a.applicant_id === filter.applicantId);
    }
    if (filter?.officerId) {
      list = list.filter((a) => a.assigned_officer_id === filter.officerId || !a.assigned_officer_id);
    }
    if (filter?.gatcId) {
      list = list.filter((a) => a.assigned_gatc_id === filter.gatcId || !a.assigned_gatc_id);
    }
    return list;
  }

  public getApplicationById(id: string): Application | undefined {
    return this.applications.find((a) => a.id === id);
  }

  public createApplication(app: Omit<Application, 'id' | 'submitted_at' | 'status'>): Application {
    const newApp: Application = {
      ...app,
      id: `app-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };
    this.applications.unshift(newApp);

    // Notify Officers / GATC
    const applicant = this.getProfileById(app.applicant_id);
    const inst = this.getInstrumentById(app.instrument_id);
    this.addNotification({
      user_id: 'usr-lmo-1',
      title: 'New Verification Application',
      message: `New ${app.type} verification filed by ${applicant?.organization || 'Applicant'} for ${inst?.make} (${inst?.serial_number}).`,
      type: 'assignment_alert',
      link: '/queue',
    });

    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(
        supabase.from('applications').insert([{
          id: newApp.id,
          instrument_id: newApp.instrument_id,
          applicant_id: newApp.applicant_id,
          type: newApp.type,
          status: newApp.status,
          assigned_officer_id: newApp.assigned_officer_id || null,
          assigned_gatc_id: newApp.assigned_gatc_id || null,
          submitted_at: newApp.submitted_at,
          scheduled_date: newApp.scheduled_date || null,
          supporting_document_urls: newApp.supporting_document_urls || [],
          photo_urls: newApp.photo_urls || [],
          applicant_notes: newApp.applicant_notes || null,
        }])
      );
    }

    return newApp;
  }

  public updateApplication(id: string, updates: Partial<Application>): Application | null {
    const idx = this.applications.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.applications[idx] = { ...this.applications[idx], ...updates };
    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(supabase.from('applications').update(updates).eq('id', id));
    }

    return this.applications[idx];
  }

  // --- Verification Workflow ---
  public scheduleApplication(appId: string, officerId: string, scheduledDate: string): Application | null {
    const app = this.updateApplication(appId, {
      assigned_officer_id: officerId,
      scheduled_date: scheduledDate,
      status: 'scheduled',
    });

    if (app) {
      this.addNotification({
        user_id: app.applicant_id,
        title: 'Inspection Scheduled',
        message: `Your verification inspection has been scheduled for ${new Date(scheduledDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}.`,
        type: 'status_update',
        link: '/applications',
      });
    }

    return app;
  }

  public recordVerification(data: {
    application_id: string;
    officer_id: string;
    observations: VerificationRecord['observations'];
    result: 'pass' | 'fail';
    remarks: string;
  }): { record: VerificationRecord; certificate?: Certificate } {
    const app = this.getApplicationById(data.application_id);
    if (!app) throw new Error('Application not found');

    const officer = this.getProfileById(data.officer_id);
    const instrument = this.getInstrumentById(app.instrument_id);

    let certificate: Certificate | undefined = undefined;

    if (data.result === 'pass') {
      // Calculate validity based on instrument type
      const validityMonths = instrument
        ? INSTRUMENT_VALIDITY_MONTHS[instrument.instrument_type] || 12
        : 12;

      const issueDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

      const certNumber = `IND-LM-${issueDate.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      certificate = {
        id: `cert-${Date.now()}`,
        application_id: app.id,
        certificate_number: certNumber,
        qr_code_data: `/verify/${certNumber}`,
        issue_date: issueDate.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
        status: 'active',
        issuing_officer_name: officer ? `${officer.name} (${officer.designation || 'LMO'})` : 'Legal Metrology Officer',
        issuing_authority: officer?.organization || 'Legal Metrology Department, Govt. of India',
        verification_fee_receipt: `REC-${issueDate.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)} (Paid)`,
        seal_identification_tag: `SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      this.certificates.unshift(certificate);

      // Update application
      this.updateApplication(app.id, {
        status: 'verified',
      });

      // Notify applicant
      this.addNotification({
        user_id: app.applicant_id,
        title: 'Verification Passed & Certificate Issued',
        message: `Congratulations! Instrument ${instrument?.make || ''} passed verification. Digital Certificate ${certNumber} has been issued and is valid until ${certificate.expiry_date}.`,
        type: 'status_update',
        link: `/certificates`,
      });

      if (supabase) {
        fireAndForget(
          supabase.from('certificates').insert([{
            id: certificate.id,
            application_id: certificate.application_id,
            certificate_number: certificate.certificate_number,
            qr_code_data: certificate.qr_code_data,
            issue_date: certificate.issue_date,
            expiry_date: certificate.expiry_date,
            status: certificate.status,
            issuing_officer_name: certificate.issuing_officer_name,
            issuing_authority: certificate.issuing_authority,
            verification_fee_receipt: certificate.verification_fee_receipt,
            seal_identification_tag: certificate.seal_identification_tag,
          }])
        );
      }
    } else {
      // Mark as rejected
      this.updateApplication(app.id, {
        status: 'rejected',
        rejection_reason: data.remarks,
      });

      this.addNotification({
        user_id: app.applicant_id,
        title: 'Verification Notice: Standards Not Met',
        message: `Verification for ${instrument?.make || 'instrument'} resulted in rejection: ${data.remarks}. Instrument cannot be legally used until recalibrated and re-stamped.`,
        type: 'status_update',
        link: '/applications',
      });
    }

    const record: VerificationRecord = {
      id: `rec-${Date.now()}`,
      application_id: data.application_id,
      officer_id: data.officer_id,
      verification_date: new Date().toISOString().split('T')[0],
      observations: data.observations,
      result: data.result,
      remarks: data.remarks,
      certificate_id: certificate?.id,
    };

    this.verificationRecords.unshift(record);
    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(
        supabase.from('verification_records').insert([{
          id: record.id,
          application_id: record.application_id,
          officer_id: record.officer_id,
          verification_date: record.verification_date,
          observations: record.observations,
          result: record.result,
          remarks: record.remarks,
          certificate_id: record.certificate_id || null,
        }])
      );
    }

    return { record, certificate };
  }

  public getVerificationRecords(applicationId?: string): VerificationRecord[] {
    if (applicationId) {
      return this.verificationRecords.filter((r) => r.application_id === applicationId);
    }
    return [...this.verificationRecords];
  }

  // --- Certificates ---
  public getCertificates(): Certificate[] {
    return [...this.certificates];
  }

  public getCertificatesForUser(userId: string): Certificate[] {
    const userApps = this.applications.filter((a) => a.applicant_id === userId).map((a) => a.id);
    return this.certificates.filter((c) => userApps.includes(c.application_id));
  }

  public getCertificateByNumber(certNumber: string): {
    certificate: Certificate;
    application: Application;
    instrument: Instrument;
    applicant: UserProfile;
    record?: VerificationRecord;
  } | null {
    const cert = this.certificates.find(
      (c) => c.certificate_number.toUpperCase() === certNumber.trim().toUpperCase()
    );
    if (!cert) return null;

    const app = this.getApplicationById(cert.application_id);
    if (!app) return null;

    const instrument = this.getInstrumentById(app.instrument_id);
    if (!instrument) return null;

    const applicant = this.getProfileById(app.applicant_id);
    if (!applicant) return null;

    const record = this.verificationRecords.find((r) => r.certificate_id === cert.id || r.application_id === app.id);

    return {
      certificate: cert,
      application: app,
      instrument,
      applicant,
      record,
    };
  }

  // --- Notifications ---
  public getNotifications(userId: string): AppNotification[] {
    return this.notifications.filter((n) => n.user_id === userId);
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'read_at'>): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    this.notifications.unshift(newNotif);
    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(
        supabase.from('notifications').insert([{
          id: newNotif.id,
          user_id: newNotif.user_id,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          read_at: newNotif.read_at,
          created_at: newNotif.created_at,
          link: newNotif.link || null,
        }])
      );
    }

    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) {
      n.read_at = new Date().toISOString();
      this.saveAll();
      this.notify();

      if (supabase) {
        fireAndForget(supabase.from('notifications').update({ read_at: n.read_at }).eq('id', id));
      }
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.user_id === userId && !n.read_at) {
        n.read_at = new Date().toISOString();
      }
    });
    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId));
    }
  }

  // --- Expiry check helper (30 days threshold) ---
  public getExpiringCertificates(userId?: string): Array<{
    certificate: Certificate;
    instrument?: Instrument;
    daysRemaining: number;
  }> {
    const today = new Date();
    const certs = userId ? this.getCertificatesForUser(userId) : this.getCertificates();

    return certs
      .map((c) => {
        const exp = new Date(c.expiry_date);
        const diffTime = exp.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const app = this.getApplicationById(c.application_id);
        const inst = app ? this.getInstrumentById(app.instrument_id) : undefined;
        return { certificate: c, instrument: inst, daysRemaining };
      })
      .filter((item) => item.daysRemaining > 0 && item.daysRemaining <= 30);
  }

  // --- Search Utility ---
  public searchGlobal(query: string, currentRole: string, currentUserId: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { applications: [], certificates: [], instruments: [] };

    // Filter instruments
    let instruments = this.instruments;
    if (currentRole === 'applicant') {
      instruments = instruments.filter((i) => i.owner_id === currentUserId);
    }
    const matchedInstruments = instruments.filter(
      (i) =>
        i.make.toLowerCase().includes(q) ||
        i.model.toLowerCase().includes(q) ||
        i.serial_number.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );

    // Filter certificates
    let certificates = this.certificates;
    if (currentRole === 'applicant') {
      const myAppIds = this.applications.filter((a) => a.applicant_id === currentUserId).map((a) => a.id);
      certificates = certificates.filter((c) => myAppIds.includes(c.application_id));
    }
    const matchedCertificates = certificates.filter(
      (c) =>
        c.certificate_number.toLowerCase().includes(q) ||
        c.issuing_officer_name.toLowerCase().includes(q) ||
        c.seal_identification_tag?.toLowerCase().includes(q)
    );

    // Filter applications
    let applications = this.applications;
    if (currentRole === 'applicant') {
      applications = applications.filter((a) => a.applicant_id === currentUserId);
    }
    const matchedApplications = applications.filter((a) => {
      const inst = this.getInstrumentById(a.instrument_id);
      const applicant = this.getProfileById(a.applicant_id);
      return (
        a.id.toLowerCase().includes(q) ||
        inst?.make.toLowerCase().includes(q) ||
        inst?.serial_number.toLowerCase().includes(q) ||
        applicant?.organization.toLowerCase().includes(q) ||
        applicant?.name.toLowerCase().includes(q)
      );
    });

    return {
      applications: matchedApplications,
      certificates: matchedCertificates,
      instruments: matchedInstruments,
    };
  }

  // --- GIS Enforcement & Spatial Methods ---

  /**
   * Evaluates the authoritative Legal Metrology status of an instrument
   * based on its applications and certificates.
   */
  public getInstrumentStatus(instrumentId: string): {
    status: EnforcementStatus;
    certificate?: Certificate;
    latestApplication?: Application;
    daysUntilExpiry?: number;
  } {
    const inst = this.getInstrumentById(instrumentId);
    if (!inst) {
      return { status: 'EXPIRED' };
    }

    // Find all applications for this instrument sorted newest first
    const apps = this.applications
      .filter((a) => a.instrument_id === instrumentId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

    const latestApp = apps[0];

    // Check if there is an active/pending workflow in progress
    if (
      latestApp &&
      (latestApp.status === 'submitted' ||
        latestApp.status === 'scheduled' ||
        latestApp.status === 'in-progress')
    ) {
      return {
        status: 'UNDER_VERIFICATION',
        latestApplication: latestApp,
      };
    }

    // Find latest certificate for this instrument
    const appIds = apps.map((a) => a.id);
    const certs = this.certificates
      .filter((c) => appIds.includes(c.application_id))
      .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());

    const latestCert = certs[0];

    if (!latestCert) {
      return {
        status: 'EXPIRED',
        latestApplication: latestApp,
      };
    }

    const today = new Date();
    const expiryDate = new Date(latestCert.expiry_date);
    const diffMs = expiryDate.getTime() - today.getTime();
    const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0 || latestCert.status === 'expired') {
      return {
        status: 'EXPIRED',
        certificate: latestCert,
        latestApplication: latestApp,
        daysUntilExpiry,
      };
    }

    if (daysUntilExpiry <= 30) {
      return {
        status: 'EXPIRING_SOON',
        certificate: latestCert,
        latestApplication: latestApp,
        daysUntilExpiry,
      };
    }

    return {
      status: 'ACTIVE',
      certificate: latestCert,
      latestApplication: latestApp,
      daysUntilExpiry,
    };
  }

  /**
   * Retrieves instruments formatted as GIS markers with authoritative status, coordinates,
   * business establishment info, and optional radius filtering.
   */
  public getGisEnforcementInstruments(filters?: {
    pincode?: string;
    radiusKm?: number;
    centerLat?: number;
    centerLng?: number;
    status?: string;
    instrumentType?: string;
  }): GisInstrumentMarker[] {
    const markers: GisInstrumentMarker[] = [];

    for (const inst of this.instruments) {
      let lat = inst.latitude;
      let lng = inst.longitude;
      let pincode = inst.pincode;

      if (lat == null || lng == null) {
        const coordMatch = inst.location?.match(/Lat:\s*([0-9.]+),\s*Lng:\s*([0-9.]+)/i);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        }
      }

      if (!pincode && inst.location) {
        const pinMatch = inst.location.match(/\b(\d{6})\b/);
        if (pinMatch) {
          pincode = pinMatch[1];
        }
      }

      if ((lat == null || lng == null) && pincode && INDIAN_PINCODES[pincode]) {
        lat = INDIAN_PINCODES[pincode].lat;
        lng = INDIAN_PINCODES[pincode].lng;
      }

      if (lat == null || lng == null) {
        continue;
      }

      if (
        filters?.instrumentType &&
        filters.instrumentType !== 'all' &&
        inst.instrument_type !== filters.instrumentType
      ) {
        continue;
      }

      const statusInfo = this.getInstrumentStatus(inst.id);

      if (filters?.status && filters.status !== 'all' && statusInfo.status !== filters.status) {
        continue;
      }

      const owner = this.getProfileById(inst.owner_id);
      const business = {
        name: owner?.name || 'Commercial Owner',
        organization: owner?.organization || 'Registered Establishment',
        address: inst.location || owner?.address || 'Trading Location',
        phone: owner?.phone,
        email: owner?.email,
      };

      let distanceKm: number | undefined;
      if (filters?.centerLat != null && filters?.centerLng != null) {
        distanceKm = calculateDistanceKm(
          filters.centerLat,
          filters.centerLng,
          lat,
          lng
        );

        if (filters.radiusKm != null && distanceKm > filters.radiusKm) {
          continue;
        }
      }

      markers.push({
        instrument: { ...inst, latitude: lat, longitude: lng, pincode },
        business,
        latestApplication: statusInfo.latestApplication,
        certificate: statusInfo.certificate,
        status: statusInfo.status,
        daysUntilExpiry: statusInfo.daysUntilExpiry,
        distanceKm,
        coordinates: {
          lat,
          lng,
        },
      });
    }

    // Sort: EXPIRED first (highest enforcement priority), then EXPIRING_SOON, then by distance
    const statusWeight: Record<EnforcementStatus, number> = {
      EXPIRED: 1,
      EXPIRING_SOON: 2,
      UNDER_VERIFICATION: 3,
      ACTIVE: 4,
    };

    return markers.sort((a, b) => {
      const weightDiff = statusWeight[a.status] - statusWeight[b.status];
      if (weightDiff !== 0) return weightDiff;
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });
  }

  /**
   * Schedules a targeted enforcement inspection or surprise raid for an expired instrument.
   * Integrates seamlessly with the existing application verification queue.
   */
  public planEnforcementInspection(input: PlannedRaidInspectionInput): Application {
    const inst = this.getInstrumentById(input.instrumentId);
    if (!inst) {
      throw new Error(`Instrument ${input.instrumentId} not found`);
    }

    const officer = this.getProfileById(input.officerId);
    const existingOpenApp = this.applications.find(
      (a) =>
        a.instrument_id === input.instrumentId &&
        (a.status === 'submitted' || a.status === 'scheduled')
    );

    let targetApp: Application;

    const notesSummary = `[ENFORCEMENT RAID] ${
      input.inspectionType === 'raid'
        ? 'SURPRISE ENFORCEMENT RAID (SECTION 30)'
        : 'STATUTORY RE-VERIFICATION INSPECTION (SECTION 24)'
    } | Priority: ${input.priority.toUpperCase()} | Officer: ${
      officer?.name || 'Authorized Inspector'
    }${input.teamMembers ? ` | Squad: ${input.teamMembers}` : ''} | Remarks: ${
      input.notes || 'Targeted raid for operating with expired verification certificate.'
    }`;

    if (existingOpenApp) {
      existingOpenApp.status = 'scheduled';
      existingOpenApp.assigned_officer_id = input.officerId;
      existingOpenApp.scheduled_date = input.scheduledDate;
      existingOpenApp.applicant_notes = notesSummary;
      targetApp = existingOpenApp;
    } else {
      targetApp = {
        id: `app-${Date.now()}`,
        instrument_id: input.instrumentId,
        applicant_id: inst.owner_id,
        type: 're-verification',
        status: 'scheduled',
        assigned_officer_id: input.officerId,
        submitted_at: new Date().toISOString(),
        scheduled_date: input.scheduledDate,
        supporting_document_urls: [],
        photo_urls: [],
        applicant_notes: notesSummary,
      };
      this.applications.unshift(targetApp);
    }

    // High-priority statutory notice dispatched to applicant / owner
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: inst.owner_id,
      title:
        input.inspectionType === 'raid'
          ? '🚨 STATUTORY NOTICE: Surprise Enforcement Inspection'
          : 'Enforcement Re-Verification Scheduled',
      message: `Enforcement inspection scheduled for ${inst.make} (${inst.serial_number}) on ${new Date(
        input.scheduledDate
      ).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}. Keep instrument and maintenance log available.`,
      type: 'action_required',
      read_at: null,
      created_at: new Date().toISOString(),
      link: '/applications',
    });

    // Confirmation task in Officer's queue
    this.notifications.unshift({
      id: `notif-off-${Date.now()}`,
      user_id: input.officerId,
      title: 'Enforcement Raid Scheduled',
      message: `Raid inspection registered for ${inst.make} at ${inst.location}. Assigned to your Verification Queue.`,
      type: 'status_update',
      read_at: null,
      created_at: new Date().toISOString(),
      link: '/queue',
    });

    this.saveAll();
    this.notify();

    if (supabase) {
      fireAndForget(
        supabase.from('applications').upsert([
          {
            id: targetApp.id,
            instrument_id: targetApp.instrument_id,
            applicant_id: targetApp.applicant_id,
            type: targetApp.type,
            status: targetApp.status,
            assigned_officer_id: targetApp.assigned_officer_id,
            submitted_at: targetApp.submitted_at,
            scheduled_date: targetApp.scheduled_date,
            applicant_notes: targetApp.applicant_notes,
          },
        ])
      );
    }

    return targetApp;
  }
}

export const dataStore = new DataStore();
