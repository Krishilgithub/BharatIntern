// Simple test to verify Supabase configuration
describe('Supabase Configuration Test', () => {
  beforeEach(() => {
    // Set up environment variables for testing
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://kqijjfivbwudbvkykgyo.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxaWpqZml2Ynd1ZGJ2a3lrZ3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDA5NjAsImV4cCI6MjA3MzQxNjk2MH0.JW3Or03UFI0T0dDkloXHQ3yhpx-V3A7g4tQDi66uFCo';
  });

  test('should have environment variables set', () => {
    // This test will pass if environment variables are properly set
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://kqijjfivbwudbvkykgyo.supabase.co');
  });

  test('should be able to import supabase client', () => {
    // This should not throw an error
    expect(() => {
      require('../src/lib/supabase');
    }).not.toThrow();
  });

  test('should initialize Supabase client with correct URL', () => {
    const { supabase } = require('../src/lib/supabase');
    expect(supabase.supabaseUrl).toBe('https://kqijjfivbwudbvkykgyo.supabase.co');
    expect(supabase.supabaseKey).toBeDefined();
  });
});
