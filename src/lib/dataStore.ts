import {
  UserProfile,
  Instrument,
  Application,
  VerificationRecord,
  Certificate,
  AppNotification,
  INSTRUMENT_VALIDITY_MONTHS,
} from '../types';

const STORAGE_KEYS = {
  PROFILES: 'verifymetro_profiles_v1',
  INSTRUMENTS: 'verifymetro_instruments_v1',
  APPLICATIONS: 'verifymetro_applications_v1',
  VERIFICATION_RECORDS: 'verifymetro_records_v1',
  CERTIFICATES: 'verifymetro_certificates_v1',
  NOTIFICATIONS: 'verifymetro_notifications_v1',
  CURRENT_USER_ID: 'verifymetro_current_user_id_v1',
};

// Seed Profiles: 1 of each role
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

// Seed Instruments for Ramesh Patel
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
    location: 'Main Retail Counter, Maa Durga Depot, Ahmedabad',
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
    location: 'Gate No. 1, Logistics Inward Terminal, Naroda Yard',
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
    location: 'Highway Fuel Station Bay 03, Ring Road Branch',
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
    location: 'Commercial Fleet Vehicle GJ-01-AX-9912',
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
    location: 'Agricultural Commodities Mandi Inspection Shed',
    registered_at: '2025-07-18T10:00:00Z',
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
    submitted_at: '2026-09-01T09:15:00Z', // 4 days ago
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
];

// Seed Certificates
export const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-001',
    application_id: 'app-2025-001',
    certificate_number: 'IND-LM-2025-0482',
    qr_code_data: '/verify/IND-LM-2025-0482',
    issue_date: '2025-02-15',
    expiry_date: '2027-02-14', // Valid active
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
    expiry_date: '2026-09-27', // Expiring in ~22 days from Sept 5, 2026!
    status: 'active',
    issuing_officer_name: 'S. K. Sharma (Inspector LM-II)',
    issuing_authority: 'Legal Metrology Department, Govt. of Gujarat',
    verification_fee_receipt: 'REC-2025-9921 (₹ 4,000 Paid)',
    seal_identification_tag: 'LEAD-SEAL-WB-2025-012',
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

// In-memory + LocalStorage cache engine
class DataStore {
  private profiles: UserProfile[] = [];
  private instruments: Instrument[] = [];
  private applications: Application[] = [];
  private verificationRecords: VerificationRecord[] = [];
  private certificates: Certificate[] = [];
  private notifications: AppNotification[] = [];
  private currentUserId: string = 'usr-applicant-1';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      this.profiles = storedProfiles ? JSON.parse(storedProfiles) : DEMO_PROFILES;

      const storedInst = localStorage.getItem(STORAGE_KEYS.INSTRUMENTS);
      this.instruments = storedInst ? JSON.parse(storedInst) : DEMO_INSTRUMENTS;

      const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      this.applications = storedApps ? JSON.parse(storedApps) : DEMO_APPLICATIONS;

      const storedRecs = localStorage.getItem(STORAGE_KEYS.VERIFICATION_RECORDS);
      this.verificationRecords = storedRecs ? JSON.parse(storedRecs) : DEMO_VERIFICATION_RECORDS;

      const storedCerts = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      this.certificates = storedCerts ? JSON.parse(storedCerts) : DEMO_CERTIFICATES;

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
    return newProfile;
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.profiles[idx] = { ...this.profiles[idx], ...updates };
    this.saveAll();
    return this.profiles[idx];
  }

  public toggleUserStatus(id: string): UserProfile | null {
    const user = this.profiles.find((p) => p.id === id);
    if (!user) return null;
    user.isActive = !user.isActive;
    this.saveAll();
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
    return newApp;
  }

  public updateApplication(id: string, updates: Partial<Application>): Application | null {
    const idx = this.applications.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.applications[idx] = { ...this.applications[idx], ...updates };
    this.saveAll();
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
    // Find all applications belonging to this applicant
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
    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) {
      n.read_at = new Date().toISOString();
      this.saveAll();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.user_id === userId && !n.read_at) {
        n.read_at = new Date().toISOString();
      }
    });
    this.saveAll();
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
}

export const dataStore = new DataStore();
