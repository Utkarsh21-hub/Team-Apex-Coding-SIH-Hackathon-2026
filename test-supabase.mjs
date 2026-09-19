import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gauabflrburdaybkrkla.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdWFiZmxyYnVyZGF5Ymtya2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NzU5MzQsImV4cCI6MjEwNDI1MTkzNH0.Oallzf9RqlcaSJl3hrKCETXctmjaIzqL9PX0Q_PWesU';

const client = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  const { data, error } = await client.from('profiles').select('*').limit(1);
  if (error) {
    console.log('Profiles table query result:', error.message, '| Code:', error.code);
  } else {
    console.log('Successfully connected and queried profiles table! Found records:', data?.length);
  }
}

check();
