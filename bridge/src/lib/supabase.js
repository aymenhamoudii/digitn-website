const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Bridge needs SERVICE ROLE to bypass RLS and verify users
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };