/**
 * Test Account Setup Script for HospitalGuard
 *
 * This script creates test accounts for all roles in the system.
 * Run with: node setup-test-accounts.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testAccounts = [
  {
    email: 'patient@test.com',
    password: 'test123',
    fullName: 'John Patient',
    phone: '+1 (555) 001-0001',
    role: 'patient',
    dashboard: '/patient-dashboard'
  },
  {
    email: 'doctor@test.com',
    password: 'test123',
    fullName: 'Dr. Sarah Johnson',
    phone: '+1 (555) 002-0002',
    role: 'doctor',
    dashboard: '/doctor-dashboard'
  },
  {
    email: 'nurse@test.com',
    password: 'test123',
    fullName: 'Emily Nurse',
    phone: '+1 (555) 003-0003',
    role: 'nurse',
    dashboard: '/nurse-dashboard'
  },
  {
    email: 'pharmacist@test.com',
    password: 'test123',
    fullName: 'Michael Pharmacist',
    phone: '+1 (555) 004-0004',
    role: 'pharmacist',
    dashboard: '/pharmacist-dashboard'
  },
  {
    email: 'billing@test.com',
    password: 'test123',
    fullName: 'Lisa Billing',
    phone: '+1 (555) 005-0005',
    role: 'billing',
    dashboard: '/billing-dashboard'
  },
  {
    email: 'labtech@test.com',
    password: 'test123',
    fullName: 'David Lab',
    phone: '+1 (555) 006-0006',
    role: 'lab_tech',
    dashboard: '/dashboard'
  },
  {
    email: 'radiologist@test.com',
    password: 'test123',
    fullName: 'Dr. Anna Radiologist',
    phone: '+1 (555) 007-0007',
    role: 'radiologist',
    dashboard: '/dashboard'
  },
  {
    email: 'receptionist@test.com',
    password: 'test123',
    fullName: 'Jessica Reception',
    phone: '+1 (555) 008-0008',
    role: 'receptionist',
    dashboard: '/dashboard'
  },
  {
    email: 'admin@test.com',
    password: 'test123',
    fullName: 'Administrator',
    phone: '+1 (555) 009-0009',
    role: 'admin',
    dashboard: '/dashboard'
  }
];

async function createTestAccount(account) {
  try {
    console.log(`\n📝 Creating account: ${account.email} (${account.role})`);

    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: {
          full_name: account.fullName,
          phone: account.phone,
          role: account.role,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log(`⚠️  Account already exists: ${account.email}`);

        // Try to get the user and insert role if missing
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        if (!getUserError && user) {
          await insertUserRole(user.id, account.role);
        }
        return;
      }
      throw signUpError;
    }

    if (!signUpData.user) {
      console.log(`⚠️  No user data returned for ${account.email}`);
      return;
    }

    console.log(`✅ Account created: ${account.email}`);

    // Insert role into user_roles table
    await insertUserRole(signUpData.user.id, account.role);

    console.log(`✅ Role assigned: ${account.role}`);
    console.log(`🎯 Dashboard URL: ${account.dashboard}`);

  } catch (error) {
    console.error(`❌ Error creating ${account.email}:`, error.message);
  }
}

async function insertUserRole(userId, role) {
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: role,
    });

  if (error && !error.message.includes('duplicate')) {
    console.error(`❌ Error assigning role:`, error.message);
  }
}

async function main() {
  console.log('🏥 HospitalGuard Test Account Setup');
  console.log('=====================================\n');
  console.log('Creating test accounts for all roles...\n');

  for (const account of testAccounts) {
    await createTestAccount(account);
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=====================================');
  console.log('✅ Test account setup complete!\n');
  console.log('📋 Account Summary:');
  console.log('-----------------------------------');

  testAccounts.forEach(account => {
    console.log(`\n${account.role.toUpperCase()}`);
    console.log(`  Email: ${account.email}`);
    console.log(`  Password: ${account.password}`);
    console.log(`  Dashboard: ${account.dashboard}`);
  });

  console.log('\n\n🚀 You can now login with any of these accounts!');
  console.log('Visit: http://localhost:8081/\n');
}

main().catch(console.error);
