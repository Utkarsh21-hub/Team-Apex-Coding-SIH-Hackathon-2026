-- ==============================================================================
-- VerifyMetro - Supabase Database Schema & Sample Data Seed Script
-- Project URL: https://gauabflrburdaybkrkla.supabase.co
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard: https://supabase.com/dashboard/project/gauabflrburdaybkrkla
-- 2. Go to "SQL Editor" in the left sidebar.
-- 3. Click "New query", paste this entire script, and click "Run".
-- ==============================================================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.verification_records CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.instruments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('applicant', 'lmo', 'gatc', 'admin')) NOT NULL DEFAULT 'applicant',
  organization TEXT,
  address TEXT,
  designation TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Instruments Table
CREATE TABLE public.instruments (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  instrument_type TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  capacity TEXT NOT NULL,
  accuracy_class TEXT,
  location TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Applications Table
CREATE TABLE public.applications (
  id TEXT PRIMARY KEY,
  instrument_id TEXT REFERENCES public.instruments(id) ON DELETE CASCADE NOT NULL,
  applicant_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('new', 're-verification')) NOT NULL,
  status TEXT CHECK (status IN ('submitted', 'scheduled', 'in-progress', 'verified', 'rejected', 'expired')) DEFAULT 'submitted',
  assigned_officer_id TEXT REFERENCES public.profiles(id),
  assigned_gatc_id TEXT REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_date TIMESTAMPTZ,
  supporting_document_urls TEXT[] DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  applicant_notes TEXT,
  rejection_reason TEXT
);

-- 4. Certificates Table
CREATE TABLE public.certificates (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  qr_code_data TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'revoked')) DEFAULT 'active',
  issuing_officer_name TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  verification_fee_receipt TEXT,
  seal_identification_tag TEXT,
  pdf_url TEXT
);

-- 5. Verification Records
CREATE TABLE public.verification_records (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  officer_id TEXT REFERENCES public.profiles(id) NOT NULL,
  verification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  observations JSONB NOT NULL DEFAULT '{}'::jsonb,
  result TEXT CHECK (result IN ('pass', 'fail')) NOT NULL,
  remarks TEXT,
  certificate_id TEXT REFERENCES public.certificates(id) ON DELETE SET NULL
);

-- 6. Notifications Table
CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('expiry_alert', 'status_update', 'assignment_alert')) NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  link TEXT
);

-- Enable Row Level Security (RLS) with permissive access for the client anon key
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Write Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Instruments" ON public.instruments FOR SELECT USING (true);
CREATE POLICY "Public Write Instruments" ON public.instruments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Applications" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Public Write Applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Public Write Certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Verification Records" ON public.verification_records FOR SELECT USING (true);
CREATE POLICY "Public Write Verification Records" ON public.verification_records FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public Write Notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- POPULATE SAMPLE DATA
-- ==============================================================================

-- Seed Profiles
INSERT INTO public.profiles (id, name, email, phone, role, organization, address, designation, is_active, created_at)
VALUES
  ('usr-applicant-1', 'Ramesh Patel', 'ramesh.patel@maadurgatrading.in', '+91 98250 11420', 'applicant', 'Maa Durga Trading & Logistics', 'Plot 42, GIDC Phase II, Naroda, Ahmedabad, Gujarat 382330', 'Proprietor & Weighbridge Operator', true, '2025-01-15T09:00:00Z'),
  ('usr-lmo-1', 'S. K. Sharma', 'sk.sharma@legalmetrology.gov.in', '+91 94140 88219', 'lmo', 'Legal Metrology Department, Inspectorate Zone-II', 'Metrology Bhavan, Near Civil Hospital, Ring Road, District Metrology Office', 'Senior Legal Metrology Inspector (Gazetted)', true, '2024-03-10T10:00:00Z'),
  ('usr-gatc-1', 'Dr. Ananya Sen', 'ananya.sen@gatclab.org.in', '+91 98301 44552', 'gatc', 'National Calibration & Legal Metrology Test Centre (GATC #07)', 'NABL Accredited Calibration Facility, Sector V, Salt Lake, Kolkata 700091', 'Head of Calibration Services & Authorized Signatory', true, '2024-06-01T11:00:00Z'),
  ('usr-admin-1', 'Vikramaditya Joshi', 'admin.joshi@legalmetrology.gov.in', '+91 98100 55210', 'admin', 'Office of the Controller of Legal Metrology, State Directorate', 'Directorate of Legal Metrology, Secretariat Complex, Administrative Block B', 'Joint Controller of Legal Metrology / System Administrator', true, '2024-01-01T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed Instruments
INSERT INTO public.instruments (id, owner_id, instrument_type, make, model, serial_number, capacity, accuracy_class, location, registered_at)
VALUES
  ('inst-001', 'usr-applicant-1', 'weighing_scale_non_auto', 'Essae-Teraoka', 'DS-215 Electronic Table-top Scale', 'ESS-2024-88491', '30 kg (Max) / 100 g (Min), e = 5 g', 'Class III (Medium)', 'Main Retail Counter, Maa Durga Depot, Ahmedabad', '2025-02-10T11:30:00Z'),
  ('inst-002', 'usr-applicant-1', 'weighbridge_heavy', 'Avery Weigh-Tronix', 'BridgeMont Pitless Heavy Truck Scale', 'AVT-WB-50T-992', '50 MT (Metric Tonnes), e = 10 kg', 'Class III (Medium)', 'Gate No. 1, Logistics Inward Terminal, Naroda Yard', '2024-09-20T14:15:00Z'),
  ('inst-003', 'usr-applicant-1', 'fuel_dispenser', 'Tokheim / Gilbarco Veeder-Root', 'Encore 500S Multi-Product Dispenser', 'GVR-FD-2023-412', 'Flow Rate: 45 L/min, Dual Nozzle HSD/MS', 'Accuracy Class 0.5 (±0.5% MPE)', 'Highway Fuel Station Bay 03, Ring Road Branch', '2025-08-12T09:45:00Z'),
  ('inst-004', 'usr-applicant-1', 'taximeter', 'Pulsar Digital Systems', 'SpeedoFare TX-9 Electronic Fare Meter', 'PUL-TX-2024-118', 'Pulse constant: 4000 pulses/km, GPS synchronized', 'Class I Electronic Fare Meter', 'Commercial Fleet Vehicle GJ-01-AX-9912', '2025-04-05T16:20:00Z'),
  ('inst-005', 'usr-applicant-1', 'moisture_meter', 'Dickey-John Agri-Tech', 'GAC 2500-UGMA Grain Moisture Analyzer', 'DJ-MM-2025-007', 'Moisture Range: 5% - 45%, Accuracy ±0.1%', 'Grade A Grain Inspector Meter', 'Agricultural Commodities Mandi Inspection Shed', '2025-07-18T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed Applications
INSERT INTO public.applications (id, instrument_id, applicant_id, type, status, assigned_officer_id, assigned_gatc_id, submitted_at, scheduled_date, supporting_document_urls, photo_urls, applicant_notes)
VALUES
  ('app-2025-001', 'inst-001', 'usr-applicant-1', 'new', 'verified', 'usr-lmo-1', NULL, '2025-02-12T10:00:00Z', '2025-02-15T10:30:00Z', ARRAY['https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80'], ARRAY['https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&auto=format&fit=crop&q=80'], 'Initial verification after new installation at retail checkout.'),
  ('app-2025-002', 'inst-002', 'usr-applicant-1', 're-verification', 'verified', 'usr-lmo-1', NULL, '2025-09-22T08:30:00Z', '2025-09-28T14:00:00Z', ARRAY['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'], ARRAY['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'], 'Annual mandatory calibration for 50MT weighbridge.'),
  ('app-2026-003', 'inst-003', 'usr-applicant-1', 're-verification', 'submitted', NULL, NULL, '2026-09-01T09:15:00Z', NULL, ARRAY['https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80'], ARRAY['https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&auto=format&fit=crop&q=80'], 'Due for periodic calibration before festive season high volume.'),
  ('app-2026-004', 'inst-004', 'usr-applicant-1', 'new', 'scheduled', 'usr-lmo-1', NULL, '2026-09-02T11:40:00Z', '2026-09-08T11:00:00Z', ARRAY['https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80'], ARRAY['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80'], 'New taxi fare meter fitted as per RTO guidelines.'),
  ('app-2026-005', 'inst-005', 'usr-applicant-1', 'new', 'in-progress', NULL, 'usr-gatc-1', '2026-08-28T14:20:00Z', '2026-09-06T15:00:00Z', ARRAY['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'], ARRAY['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'], 'Lab precision test required at GATC test bed.')
ON CONFLICT (id) DO NOTHING;

-- Seed Certificates
INSERT INTO public.certificates (id, application_id, certificate_number, qr_code_data, issue_date, expiry_date, status, issuing_officer_name, issuing_authority, verification_fee_receipt, seal_identification_tag)
VALUES
  ('cert-001', 'app-2025-001', 'IND-LM-2025-0482', '/verify/IND-LM-2025-0482', '2025-02-15', '2027-02-14', 'active', 'S. K. Sharma (Inspector LM-II)', 'Legal Metrology Department, Govt. of Gujarat', 'REC-2025-8841 (₹ 250 Paid)', 'SEAL-LM-AHM-98442'),
  ('cert-002', 'app-2025-002', 'IND-LM-2025-1190', '/verify/IND-LM-2025-1190', '2025-09-28', '2026-09-27', 'active', 'S. K. Sharma (Inspector LM-II)', 'Legal Metrology Department, Govt. of Gujarat', 'REC-2025-9921 (₹ 4,000 Paid)', 'LEAD-SEAL-WB-2025-012')
ON CONFLICT (id) DO NOTHING;

-- Seed Verification Records
INSERT INTO public.verification_records (id, application_id, officer_id, verification_date, observations, result, remarks, certificate_id)
VALUES
  ('rec-001', 'app-2025-001', 'usr-lmo-1', '2025-02-15', '{"visualInspectionPassed": true, "sealIntegrityPassed": true, "errorWithinMPE": true, "stampingCompleted": true, "testedLoadPoints": "Tested at 5kg, 10kg, 20kg, and 30kg full span.", "measuredErrorMargin": "±0.002 kg (Well within allowed MPE of ±0.005 kg)"}'::jsonb, 'pass', 'Instrument verified in presence of applicant. Digital seal tag affixed. Stamping completed as per Rule 14.', 'cert-001'),
  ('rec-002', 'app-2025-002', 'usr-lmo-1', '2025-09-28', '{"visualInspectionPassed": true, "sealIntegrityPassed": true, "errorWithinMPE": true, "stampingCompleted": true, "testedLoadPoints": "Load test conducted using 20 MT calibrated cast iron weights + substitution test to 50 MT.", "measuredErrorMargin": "±5 kg on 50,000 kg (Allowed MPE is ±10 kg)"}'::jsonb, 'pass', 'Weighbridge platform condition satisfactory. Load cells calibrated. Lead wire seal locked.', 'cert-002')
ON CONFLICT (id) DO NOTHING;

-- Seed Notifications
INSERT INTO public.notifications (id, user_id, title, message, type, read_at, created_at, link)
VALUES
  ('notif-001', 'usr-applicant-1', 'Certificate Expiry Alert (Action Required)', 'Certificate IND-LM-2025-1190 for Heavy Road Weighbridge (AVT-WB-50T-992) will expire on 27 Sept 2026 (in 22 days). File re-verification immediately to avoid penalties under Section 24 of Legal Metrology Act, 2009.', 'expiry_alert', NULL, '2026-09-01T08:00:00Z', '/certificates'),
  ('notif-002', 'usr-applicant-1', 'Application Scheduled for Inspection', 'Your verification application for SpeedoFare TX-9 Electronic Fare Meter (APP-2026-004) has been scheduled by Inspector S. K. Sharma for 08 Sept 2026 at 11:00 AM.', 'status_update', NULL, '2026-09-03T10:15:00Z', '/applications'),
  ('notif-003', 'usr-lmo-1', 'New Verification Application in Queue', 'New application received: Fuel Dispensing Unit (GVR-FD-2023-412) from Maa Durga Trading. Current pendency: 4 days.', 'assignment_alert', NULL, '2026-09-01T09:16:00Z', '/queue'),
  ('notif-004', 'usr-gatc-1', 'Precision Lab Calibration Assigned', 'Application APP-2026-005 for Grain Moisture Analyzer is awaiting lab verification testing.', 'assignment_alert', NULL, '2026-08-29T12:00:00Z', '/queue')
ON CONFLICT (id) DO NOTHING;
