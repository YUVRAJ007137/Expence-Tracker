import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jbpwrgjnzgjmhghimqjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicHdyZ2puemdqbWhnaGltcWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTA3MDAsImV4cCI6MjA4OTU2NjcwMH0.zL_AkueP5wz0slIbd4lppOgqE-zZBgNSw7T_SiErw5U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
