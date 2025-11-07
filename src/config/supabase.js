/**
 * Supabase Configuration
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xsycgemadkclphbgvtcn.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeWNnZW1hZGtjbHBoYmd2dGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTI5NzIsImV4cCI6MjA3NDIyODk3Mn0.QXsFKzzeDMWXwywCQQLAW6tIkt3PTseFALM7Kl61vD0';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
