// Script to create an admin user
// Run this after applying the database schema

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Environment variables not found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  console.log('👑 Creating Admin User...\n');
  
  const adminEmail = 'admin@bharatintern.com';
  const adminPassword = 'admin123456';
  
  try {
    // Step 1: Create user account
    console.log('1. Creating user account...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: 'Admin User',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      if (authError.message.includes('already registered')) {
        console.log('ℹ️ User already exists, updating role...');
        
        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });
        
        if (signInError) {
          console.log('❌ Cannot sign in:', signInError.message);
          return;
        }
        
        const userId = signInData.user.id;
        
        // Update profile to admin role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId);
        
        if (updateError) {
          console.log('❌ Update error:', updateError.message);
        } else {
          console.log('✅ User role updated to admin');
        }
        
        await supabase.auth.signOut();
        return;
      }
      return;
    }

    if (authData.user) {
      console.log('✅ User created:', authData.user.id);
      
      // Step 2: Update profile to admin role
      console.log('2. Setting admin role...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', is_verified: true })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.log('❌ Profile update error:', updateError.message);
      } else {
        console.log('✅ Admin role set successfully');
      }
      
      console.log('\n🎉 Admin user created successfully!');
      console.log('\n📋 Admin Credentials:');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      console.log('Role: admin');
      console.log('\n⚠️ Please change the password after first login!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Check if database is set up first
async function checkDatabase() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log('❌ Database not set up!');
      console.log('Please run the SQL schema from supabase-schema.sql first.');
      process.exit(1);
    }
    console.log('✅ Database is ready');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  await checkDatabase();
  await createAdminUser();
}

main();
