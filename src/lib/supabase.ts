import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfneabxwemhkgfbbdqaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbmVhYnh3ZW1oa2dmYmJkcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4Njc2MzUsImV4cCI6MjA1MjQ0MzYzNX0.XdgNkX40IOUSgLUOqj-z8_oXUJk50G_8wD1bc6jdPv0';

export const supabase = createClient(supabaseUrl, supabaseKey);