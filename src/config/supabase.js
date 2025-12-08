/**
 * Supabase Configuration
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Service role key for admin operations (like deleting users)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

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
