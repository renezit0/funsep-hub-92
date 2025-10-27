import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://akjwxhidgbrrtfzqucln.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrand4aGlkZ2JycnRmenF1Y2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODM0MTIsImV4cCI6MjA3Mjg1OTQxMn0.7bfCxFiWLaxGfe8A1ZSbHxV_hiSP8eYZCCX5GX7qxvw";

// Create a client that includes the admin session token in headers
export function getAdminClient() {
  const sessionStr = localStorage.getItem('admin_session');
  let adminToken = '';
  let sigla = '';
  
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      adminToken = session.token;
      sigla = session.sigla;
    } catch (e) {
      console.error('Error parsing admin session:', e);
    }
  }

  const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-admin-token': adminToken,
        'x-admin-sigla': sigla,
      }
    }
  });

  return client;
}
