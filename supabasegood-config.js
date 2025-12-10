// ============================================================
// Supabase Configuration
// ============================================================
// This file contains the Supabase connection settings used across all dashboard pages
// CORRECT URL: vvkjydmzmevcfkxivrxi.supabase.co

const SUPABASE_URL = 'https://vvkjydmzmevcfkxivrxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2p5ZG16bWV2Y2ZreGl2cnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNjAzOTQsImV4cCI6MjA0ODkzNjM5NH0.xO0cEQVq7FPJKWcNXlwqHPGPwvBYQF3vGwHXtdyFoSI';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase initialized from config:', SUPABASE_URL);
