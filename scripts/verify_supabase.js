const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log(JSON.stringify({ error: '.env file not found' }, null, 2));
  process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath, 'utf-8'));
const supabaseUrl = envConfig.SUPABASE_URL || envConfig.VITE_SUPABASE_URL || '';
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_KEY || envConfig.VITE_SUPABASE_ANON_KEY || '';
const bucket = envConfig.SUPABASE_STORAGE_BUCKET || 'cms-media';

async function verify() {
  console.log('=== SUPABASE VERIFICATION AUDIT ===\n');
  
  const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('your-project') || !supabaseUrl.startsWith('http');
  const isPlaceholderKey = !supabaseKey || supabaseKey.includes('your-supabase');

  console.log('1. Configuration Check:');
  console.log('   - SUPABASE_URL:', supabaseUrl ? (isPlaceholderUrl ? `${supabaseUrl} (PLACEHOLDER DETECTED)` : `${supabaseUrl.substring(0, 35)}... [VALID FORMAT]`) : 'MISSING');
  console.log('   - SUPABASE_KEY:', supabaseKey ? (isPlaceholderKey ? 'PLACEHOLDER DETECTED' : `Configured (Length: ${supabaseKey.length} chars)`) : 'MISSING');
  console.log('   - STORAGE_BUCKET:', bucket);

  if (isPlaceholderUrl || isPlaceholderKey) {
    console.log('\n❌ RESULT: Supabase is NOT connected. Placeholder credentials detected in .env.');
    return;
  }

  console.log('\n2. Network & Health Ping:');
  try {
    const healthRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    console.log(`   - REST API Response Code: ${healthRes.status} (${healthRes.statusText})`);

    if (!healthRes.ok) {
      const body = await healthRes.text();
      console.log('   - Error Response:', body);
      console.log('\n❌ RESULT: Connection failed. Invalid credentials or Supabase project is paused/unreachable.');
      return;
    }
  } catch (err) {
    console.log('   - Network Error:', err.message);
    console.log('\n❌ RESULT: Unable to reach Supabase URL.');
    return;
  }

  console.log('\n3. Database Tables Verification:');
  const tables = ['site_settings', 'projects', 'reviews', 'messages', 'saved_quotes', 'estimator_settings', 'audit_logs', 'admin_auth', 'cms_versions'];
  
  for (const tbl of tables) {
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tbl}?select=count`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Range-Unit': 'items',
          'Range': '0-0'
        }
      });
      if (res.ok) {
        console.log(`   ✓ Table '${tbl}' exists and is accessible.`);
      } else {
        const txt = await res.text();
        console.log(`   ✗ Table '${tbl}' query failed (${res.status}): ${txt}`);
      }
    } catch (err) {
      console.log(`   ✗ Table '${tbl}' check error:`, err.message);
    }
  }

  console.log('\n4. Storage Bucket Check:');
  try {
    const bucketRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/storage/v1/bucket/${bucket}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (bucketRes.ok) {
      console.log(`   ✓ Storage bucket '${bucket}' exists.`);
    } else {
      console.log(`   ✗ Storage bucket '${bucket}' not found or inaccessible (${bucketRes.status}).`);
    }
  } catch (err) {
    console.log('   ✗ Storage bucket check error:', err.message);
  }

  console.log('\n=== AUDIT COMPLETED ===');
}

verify();
