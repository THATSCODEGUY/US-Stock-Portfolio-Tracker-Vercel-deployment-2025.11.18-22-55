import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdcitoyjzxzxukllvmsn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkY2l0b3lqenh6eHVrbGx2bXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjcxMTYsImV4cCI6MjA3ODkwMzExNn0.m8KITIx4RVLF9UWVCcHGfYYV7MT21muXEZ-rztEWpDA';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anonymous key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
