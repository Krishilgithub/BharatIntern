import { supabase, getUserProfile, createUserProfile, updateUserProfile } from '../src/lib/supabase';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Supabase Configuration', () => {
  test('should initialize Supabase client with correct configuration', () => {
    expect(supabase).toBeDefined();
    expect(supabase.supabaseUrl).toBe('https://test.supabase.co');
    expect(supabase.supabaseKey).toBe('test-anon-key');
  });

  test('should throw error when environment variables are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => {
      require('../src/lib/supabase');
    }).toThrow('Missing Supabase environment variables');
  });

  test('should have auth configuration', () => {
    expect(supabase.auth).toBeDefined();
    expect(supabase.auth.autoRefreshToken).toBe(true);
    expect(supabase.auth.persistSession).toBe(true);
    expect(supabase.auth.detectSessionInUrl).toBe(true);
  });
});

describe('Supabase Helper Functions', () => {
  beforeEach(() => {
    // Mock Supabase client methods
    supabase.from = jest.fn().mockReturnThis();
    supabase.select = jest.fn().mockReturnThis();
    supabase.insert = jest.fn().mockReturnThis();
    supabase.update = jest.fn().mockReturnThis();
    supabase.eq = jest.fn().mockReturnThis();
    supabase.single = jest.fn();
  });

  test('getUserProfile should fetch user profile', async () => {
    const mockProfile = { id: '1', role: 'candidate', name: 'Test User' };
    supabase.single.mockResolvedValue({ data: mockProfile, error: null });

    const result = await getUserProfile('1');

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.select).toHaveBeenCalledWith('*');
    expect(supabase.eq).toHaveBeenCalledWith('id', '1');
    expect(supabase.single).toHaveBeenCalled();
    expect(result).toEqual(mockProfile);
  });

  test('getUserProfile should handle errors', async () => {
    const mockError = new Error('Profile not found');
    supabase.single.mockResolvedValue({ data: null, error: mockError });

    const result = await getUserProfile('1');

    expect(result).toBeNull();
  });

  test('createUserProfile should create new profile', async () => {
    const mockProfile = { id: '1', role: 'candidate', name: 'Test User' };
    const profileData = { role: 'candidate', name: 'Test User', email: 'test@example.com' };
    
    supabase.single.mockResolvedValue({ data: mockProfile, error: null });

    const result = await createUserProfile('1', profileData);

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.insert).toHaveBeenCalledWith([expect.objectContaining({
      id: '1',
      ...profileData,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })]);
    expect(result).toEqual(mockProfile);
  });

  test('updateUserProfile should update existing profile', async () => {
    const mockProfile = { id: '1', role: 'company', name: 'Updated User' };
    const profileData = { role: 'company', name: 'Updated User' };
    
    supabase.single.mockResolvedValue({ data: mockProfile, error: null });

    const result = await updateUserProfile('1', profileData);

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.update).toHaveBeenCalledWith({
      ...profileData,
      updated_at: expect.any(String),
    });
    expect(supabase.eq).toHaveBeenCalledWith('id', '1');
    expect(result).toEqual(mockProfile);
  });
});
