import { createClient } from '@supabase/supabase-js';
import type {
  UserProfile,
  Instrument,
  Application,
  VerificationRecord,
  Certificate,
  AppNotification,
} from '../types';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
export const supabaseUrl =
  metaEnv.VITE_SUPABASE_URL || 'https://gauabflrburdaybkrkla.supabase.co';
export const supabaseAnonKey =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdWFiZmxyYnVyZGF5Ymtya2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NzU5MzQsImV4cCI6MjEwNDI1MTkzNH0.Oallzf9RqlcaSJl3hrKCETXctmjaIzqL9PX0Q_PWesU';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseHealthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  hasTables: boolean;
  message: string;
  error?: string;
  counts?: {
    profiles: number;
    instruments: number;
    applications: number;
    certificates: number;
    records: number;
    notifications: number;
  };
}

/**
 * Checks if Supabase is reachable and if the required tables exist in public schema
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  if (!supabase) {
    return {
      isConfigured: false,
      isConnected: false,
      hasTables: false,
      message: 'Supabase credentials not configured.',
    };
  }

  try {
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .limit(1);

    if (profileErr) {
      if (profileErr.code === 'PGRST205' || profileErr.message.includes('schema cache')) {
        return {
          isConfigured: true,
          isConnected: true,
          hasTables: false,
          message: 'Connected to Supabase project, but PostgreSQL tables are not created yet.',
          error: profileErr.message,
        };
      }
      return {
        isConfigured: true,
        isConnected: false,
        hasTables: false,
        message: 'Could not connect to Supabase.',
        error: profileErr.message,
      };
    }

    // Fetch counts from other tables if profiles table exists
    const [instRes, appRes, certRes] = await Promise.allSettled([
      supabase.from('instruments').select('id', { count: 'exact', head: true }),
      supabase.from('applications').select('id', { count: 'exact', head: true }),
      supabase.from('certificates').select('id', { count: 'exact', head: true }),
    ]);

    const instCount = instRes.status === 'fulfilled' ? instRes.value.count || 0 : 0;
    const appCount = appRes.status === 'fulfilled' ? appRes.value.count || 0 : 0;
    const certCount = certRes.status === 'fulfilled' ? certRes.value.count || 0 : 0;
    const profileCount = profiles?.length ?? 0;

    return {
      isConfigured: true,
      isConnected: true,
      hasTables: true,
      message: 'Connected and synchronized with Supabase PostgreSQL database.',
      counts: {
        profiles: profileCount,
        instruments: instCount,
        applications: appCount,
        certificates: certCount,
        records: 0,
        notifications: 0,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isConfigured: true,
      isConnected: false,
      hasTables: false,
      message: 'Failed to connect to Supabase endpoint.',
      error: message,
    };
  }
}

/**
 * Seeds Supabase tables with sample data via the client API
 */
export async function seedSupabaseTables(sampleData: {
  profiles: UserProfile[];
  instruments: Instrument[];
  applications: Application[];
  certificates: Certificate[];
  verificationRecords: VerificationRecord[];
  notifications: AppNotification[];
}): Promise<{ success: boolean; message: string; error?: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase client is not initialized.' };
  }

  try {
    // 1. Profiles
    const dbProfiles = sampleData.profiles.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      role: p.role,
      organization: p.organization,
      address: p.address,
      designation: p.designation,
      is_active: p.isActive,
      created_at: p.createdAt,
    }));
    const { error: pErr } = await supabase.from('profiles').upsert(dbProfiles, { onConflict: 'id' });
    if (pErr) throw new Error(`Profiles seed failed: ${pErr.message}`);

    // 2. Instruments
    const dbInstruments = sampleData.instruments.map((i) => ({
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
    }));
    const { error: iErr } = await supabase.from('instruments').upsert(dbInstruments, { onConflict: 'id' });
    if (iErr) throw new Error(`Instruments seed failed: ${iErr.message}`);

    // 3. Applications
    const dbApplications = sampleData.applications.map((a) => ({
      id: a.id,
      instrument_id: a.instrument_id,
      applicant_id: a.applicant_id,
      type: a.type,
      status: a.status,
      assigned_officer_id: a.assigned_officer_id || null,
      assigned_gatc_id: a.assigned_gatc_id || null,
      submitted_at: a.submitted_at,
      scheduled_date: a.scheduled_date || null,
      supporting_document_urls: a.supporting_document_urls || [],
      photo_urls: a.photo_urls || [],
      applicant_notes: a.applicant_notes || null,
      rejection_reason: a.rejection_reason || null,
    }));
    const { error: aErr } = await supabase.from('applications').upsert(dbApplications, { onConflict: 'id' });
    if (aErr) throw new Error(`Applications seed failed: ${aErr.message}`);

    // 4. Certificates
    const dbCertificates = sampleData.certificates.map((c) => ({
      id: c.id,
      application_id: c.application_id,
      certificate_number: c.certificate_number,
      qr_code_data: c.qr_code_data,
      issue_date: c.issue_date,
      expiry_date: c.expiry_date,
      status: c.status,
      issuing_officer_name: c.issuing_officer_name,
      issuing_authority: c.issuing_authority,
      verification_fee_receipt: c.verification_fee_receipt || null,
      seal_identification_tag: c.seal_identification_tag || null,
      pdf_url: c.pdf_url || null,
    }));
    const { error: cErr } = await supabase.from('certificates').upsert(dbCertificates, { onConflict: 'id' });
    if (cErr) throw new Error(`Certificates seed failed: ${cErr.message}`);

    // 5. Verification Records
    const dbRecords = sampleData.verificationRecords.map((r) => ({
      id: r.id,
      application_id: r.application_id,
      officer_id: r.officer_id,
      verification_date: r.verification_date,
      observations: r.observations,
      result: r.result,
      remarks: r.remarks,
      certificate_id: r.certificate_id || null,
    }));
    const { error: rErr } = await supabase.from('verification_records').upsert(dbRecords, { onConflict: 'id' });
    if (rErr) throw new Error(`Records seed failed: ${rErr.message}`);

    // 6. Notifications
    const dbNotifs = sampleData.notifications.map((n) => ({
      id: n.id,
      user_id: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      read_at: n.read_at,
      created_at: n.created_at,
      link: n.link || null,
    }));
    const { error: nErr } = await supabase.from('notifications').upsert(dbNotifs, { onConflict: 'id' });
    if (nErr) throw new Error(`Notifications seed failed: ${nErr.message}`);

    return {
      success: true,
      message: 'Successfully populated all tables in Supabase with sample data!',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: 'Failed to populate Supabase tables.', error: msg };
  }
}
