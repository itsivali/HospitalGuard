import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// First names pool
const firstNames = {
  male: ['James', 'Michael', 'Robert', 'David', 'William', 'Richard', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Joshua', 'Andrew', 'Kevin', 'Brian', 'Steven', 'Mark', 'Paul', 'Jason', 'Ryan', 'Nicholas', 'Eric', 'Jonathan', 'Tyler', 'Aaron'],
  female: ['Emily', 'Sarah', 'Jennifer', 'Jessica', 'Elizabeth', 'Michelle', 'Amanda', 'Lisa', 'Angela', 'Melissa', 'Rebecca', 'Rachel', 'Laura', 'Stephanie', 'Nicole', 'Samantha', 'Katherine', 'Christina', 'Hannah', 'Ashley', 'Brittany', 'Lauren', 'Amber', 'Megan', 'Danielle']
};

// Last names pool
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Hall', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins'];

// Department-specific specializations
const departmentSpecializations = {
  'Emergency': ['Emergency Medicine', 'Trauma Surgery', 'Critical Care', 'Toxicology', 'Emergency Pediatrics'],
  'Intensive Care Unit (ICU)': ['Intensivist', 'Critical Care Medicine', 'Pulmonology', 'Cardiology', 'Nephrology'],
  'Maternity': ['Obstetrics', 'Gynecology', 'Maternal-Fetal Medicine', 'Neonatology', 'Perinatology'],
  'Pediatrics': ['Pediatrics', 'Pediatric Cardiology', 'Pediatric Pulmonology', 'Developmental Pediatrics', 'Pediatric Neurology'],
  'Surgery': ['General Surgery', 'Orthopedic Surgery', 'Cardiothoracic Surgery', 'Neurosurgery', 'Vascular Surgery'],
  'Radiology': ['Diagnostic Radiology', 'Interventional Radiology', 'Neuroradiology', 'Musculoskeletal Radiology', 'Pediatric Radiology'],
  'Laboratory': ['Clinical Pathology', 'Hematopathology', 'Microbiology', 'Clinical Chemistry', 'Molecular Pathology'],
  'Pharmacy': ['Clinical Pharmacy', 'Oncology Pharmacy', 'Critical Care Pharmacy', 'Pediatric Pharmacy', 'Infectious Disease Pharmacy'],
  'Mental Health': ['Psychiatry', 'Child & Adolescent Psychiatry', 'Geriatric Psychiatry', 'Addiction Medicine', 'Neuropsychiatry'],
  'Outpatient': ['Family Medicine', 'Internal Medicine', 'General Practice', 'Preventive Medicine', 'Geriatric Medicine'],
  'Billing': ['Healthcare Administration', 'Medical Billing', 'Healthcare Finance', 'Revenue Cycle Management', 'Medical Coding'],
  'Administration': ['Healthcare Management', 'Hospital Administration', 'Quality Assurance', 'Patient Safety', 'Healthcare Policy']
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePhoneNumber(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1-${area}-${exchange}-${number}`;
}

function generateLicenseNumber(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefix = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}${number}`;
}

async function populateDoctors() {
  console.log('👨‍⚕️ Starting to populate doctors...\n');

  // First, fetch all departments
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('id, name')
    .order('name');

  if (deptError || !departments || departments.length === 0) {
    console.error('❌ Error fetching departments:', deptError);
    console.log('⚠️  Please run populate-departments.ts first!\n');
    return;
  }

  console.log(`📋 Found ${departments.length} departments\n`);

  // Check if doctors already exist
  const { data: existingDoctors, error: checkError } = await supabase
    .from('hospital_staff')
    .select('id')
    .eq('staff_type', 'doctor')
    .limit(1);

  if (checkError) {
    console.error('❌ Error checking existing doctors:', checkError);
    return;
  }

  if (existingDoctors && existingDoctors.length > 0) {
    console.log('⚠️  Doctors already exist. Skipping...');
    console.log('   If you want to re-populate, delete all doctors first.\n');
    return;
  }

  const allDoctors: any[] = [];
  const usedEmails = new Set<string>();

  // Generate 5-7 doctors per department
  for (const department of departments) {
    const numDoctors = Math.floor(Math.random() * 3) + 5; // 5-7 doctors
    const specializations = departmentSpecializations[department.name as keyof typeof departmentSpecializations] || ['General Medicine'];

    console.log(`👨‍⚕️ Generating ${numDoctors} doctors for ${department.name}...`);

    for (let i = 0; i < numDoctors; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = getRandomItem(firstNames[gender]);
      const lastName = getRandomItem(lastNames);
      const specialization = getRandomItem(specializations);

      // Generate unique email
      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hospitalguard.com`;
      let counter = 1;
      while (usedEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@hospitalguard.com`;
        counter++;
      }
      usedEmails.add(email);

      const doctor = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: generatePhoneNumber(),
        staff_type: 'doctor',
        specialization: specialization,
        license_number: generateLicenseNumber(),
        department_id: department.id,
        is_active: true
      };

      allDoctors.push(doctor);
    }
  }

  console.log(`\n📊 Total doctors to insert: ${allDoctors.length}\n`);

  // Insert all doctors
  const { data, error } = await supabase
    .from('hospital_staff')
    .insert(allDoctors)
    .select();

  if (error) {
    console.error('❌ Error inserting doctors:', error);
    return;
  }

  console.log('✅ Successfully created doctors!\n');

  // Group by department for summary
  const doctorsByDept: Record<string, number> = {};
  departments.forEach(dept => {
    const count = allDoctors.filter(d => d.department_id === dept.id).length;
    doctorsByDept[dept.name] = count;
  });

  console.log('📊 Summary by Department:');
  Object.entries(doctorsByDept).forEach(([deptName, count]) => {
    console.log(`   • ${deptName}: ${count} doctors`);
  });

  console.log(`\n🎉 Total: ${data?.length} doctors created!`);
}

populateDoctors()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
