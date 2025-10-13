import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const departments = [
  {
    name: 'Emergency',
    description: 'Emergency and urgent care services',
    floor_number: 1,
    department_type: 'emergency',
    phone: '+1-555-0100'
  },
  {
    name: 'Intensive Care Unit (ICU)',
    description: 'Critical care and monitoring',
    floor_number: 2,
    department_type: 'icu',
    phone: '+1-555-0200'
  },
  {
    name: 'Maternity',
    description: 'Obstetrics and maternal care',
    floor_number: 3,
    department_type: 'maternity',
    phone: '+1-555-0300'
  },
  {
    name: 'Pediatrics',
    description: 'Children\'s health and care',
    floor_number: 4,
    department_type: 'pediatrics',
    phone: '+1-555-0400'
  },
  {
    name: 'Surgery',
    description: 'Surgical procedures and operations',
    floor_number: 5,
    department_type: 'surgery',
    phone: '+1-555-0500'
  },
  {
    name: 'Radiology',
    description: 'Medical imaging and diagnostics',
    floor_number: 1,
    department_type: 'radiology',
    phone: '+1-555-0600'
  },
  {
    name: 'Laboratory',
    description: 'Medical testing and analysis',
    floor_number: 1,
    department_type: 'laboratory',
    phone: '+1-555-0700'
  },
  {
    name: 'Pharmacy',
    description: 'Medication dispensing and management',
    floor_number: 1,
    department_type: 'pharmacy',
    phone: '+1-555-0800'
  },
  {
    name: 'Mental Health',
    description: 'Psychiatric and psychological services',
    floor_number: 4,
    department_type: 'mental_health',
    phone: '+1-555-0900'
  },
  {
    name: 'Outpatient',
    description: 'General outpatient consultations',
    floor_number: 2,
    department_type: 'outpatient',
    phone: '+1-555-1000'
  },
  {
    name: 'Billing',
    description: 'Financial services and billing',
    floor_number: 1,
    department_type: 'billing',
    phone: '+1-555-1100'
  },
  {
    name: 'Administration',
    description: 'Hospital administration and management',
    floor_number: 5,
    department_type: 'administration',
    phone: '+1-555-1200'
  }
];

async function populateDepartments() {
  console.log('🏥 Starting to populate departments...\n');

  // First, check if departments already exist
  const { data: existingDepts, error: checkError } = await supabase
    .from('departments')
    .select('id, name')
    .limit(1);

  if (checkError) {
    console.error('❌ Error checking departments:', checkError);
    return;
  }

  if (existingDepts && existingDepts.length > 0) {
    console.log('⚠️  Departments already exist. Skipping...');
    console.log('   If you want to re-populate, delete all departments first.\n');
    return;
  }

  // Insert departments
  const { data, error } = await supabase
    .from('departments')
    .insert(departments)
    .select();

  if (error) {
    console.error('❌ Error inserting departments:', error);
    return;
  }

  console.log('✅ Successfully created departments:\n');
  data?.forEach((dept) => {
    console.log(`   • ${dept.name} (Floor ${dept.floor_number})`);
  });

  console.log(`\n🎉 Total: ${data?.length} departments created!`);
}

populateDepartments()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
