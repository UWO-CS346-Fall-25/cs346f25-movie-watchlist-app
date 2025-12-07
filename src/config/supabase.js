/**
 * Supabase Configuration
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xsycgemadkclphbgvtcn.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeWNnZW1hZGtjbHBoYmd2dGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTI5NzIsImV4cCI6MjA3NDIyODk3Mn0.QXsFKzzeDMWXwywCQQLAW6tIkt3PTseFALM7Kl61vD0';

// Service role key for admin operations (like deleting users)
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeWNnZW1hZGtjbHBoYmd2dGNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY1Mjk3MiwiZXhwIjoyMDc0MjI4OTcyfQ.019xtBHc2Ar5cTZdZ2Kamo4soRFIDWvsRuDcUOCS2_s';

// Regular client for user operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for admin operations (like deleting users)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
module.exports.admin = supabaseAdmin;
