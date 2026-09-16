import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Schema definition for Postgres / Supabase
 * You can execute this in the Supabase SQL Editor:
 * 
 * ```sql
 * -- 1. Profiles Table
 * create table public.profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   name text not null,
 *   email text unique not null,
 *   phone text,
 *   role text check (role in ('applicant', 'lmo', 'gatc', 'admin')) not null default 'applicant',
 *   organization text,
 *   address text,
 *   designation text,
 *   is_active boolean default true,
 *   created_at timestamptz default now()
 * );
 * 
 * -- 2. Instruments Table
 * create table public.instruments (
 *   id uuid primary key default gen_random_uuid(),
 *   owner_id uuid references public.profiles(id) on delete cascade not null,
 *   instrument_type text not null,
 *   make text not null,
 *   model text not null,
 *   serial_number text not null,
 *   capacity text not null,
 *   accuracy_class text,
 *   location text not null,
 *   registered_at timestamptz default now()
 * );
 * 
 * -- 3. Applications Table
 * create table public.applications (
 *   id text primary key,
 *   instrument_id uuid references public.instruments(id) on delete cascade not null,
 *   applicant_id uuid references public.profiles(id) on delete cascade not null,
 *   type text check (type in ('new', 're-verification')) not null,
 *   status text check (status in ('submitted', 'scheduled', 'in-progress', 'verified', 'rejected', 'expired')) default 'submitted',
 *   assigned_officer_id uuid references public.profiles(id),
 *   assigned_gatc_id uuid references public.profiles(id),
 *   submitted_at timestamptz default now(),
 *   scheduled_date timestamptz,
 *   supporting_document_urls text[] default '{}',
 *   photo_urls text[] default '{}',
 *   applicant_notes text,
 *   rejection_reason text
 * );
 * 
 * -- 4. Verification Records
 * create table public.verification_records (
 *   id uuid primary key default gen_random_uuid(),
 *   application_id text references public.applications(id) on delete cascade not null,
 *   officer_id uuid references public.profiles(id) not null,
 *   verification_date date not null default current_date,
 *   observations jsonb not null default '{}'::jsonb,
 *   result text check (result in ('pass', 'fail')) not null,
 *   remarks text
 * );
 * 
 * -- 5. Certificates Table
 * create table public.certificates (
 *   id uuid primary key default gen_random_uuid(),
 *   application_id text references public.applications(id) on delete cascade not null,
 *   certificate_number text unique not null,
 *   qr_code_data text not null,
 *   issue_date date not null default current_date,
 *   expiry_date date not null,
 *   status text check (status in ('active', 'expired', 'revoked')) default 'active',
 *   issuing_officer_name text not null,
 *   issuing_authority text not null,
 *   pdf_url text
 * );
 * 
 * -- 6. Notifications Table
 * create table public.notifications (
 *   id uuid primary key default gen_random_uuid(),
 *   user_id uuid references public.profiles(id) on delete cascade not null,
 *   title text not null,
 *   message text not null,
 *   type text check (type in ('expiry_alert', 'status_update', 'assignment_alert')) not null,
 *   read_at timestamptz,
 *   created_at timestamptz default now(),
 *   link text
 * );
 * 
 * -- RLS Policies
 * alter table public.profiles enable row level security;
 * alter table public.instruments enable row level security;
 * alter table public.applications enable row level security;
 * alter table public.certificates enable row level security;
 * ```
 */
