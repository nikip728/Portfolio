import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kpbtfrmeiqeuufuaxotl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwYnRmcm1laXFldXVmdWF4b3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzgyMjIsImV4cCI6MjA4NDg1NDIyMn0.7-ptl5EB2WGQUGsKBg3eHIX5YcGXJeb7LNQYgJrn04Y";
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
