 import { createClient } from "@supabase/supabase-js";

const url  = process.env.SUPABASE_URL;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing env vars. Export SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  const email = `test.${Date.now()}@example.com`;
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: "StrongPass123!",
    email_confirm: true,        // use email_confirm because of your SDK version
  });

  if (error) {
    console.error("❌ createUser failed:", error);
  } else {
    console.log("✅ User created:", data.user.id, data.user.email);
    // cleanup – delete the test user
    await sb.auth.admin.deleteUser(data.user.id);
    console.log("🗑️  Test user deleted (cleanup)");
  }
  process.exit(0);
})();

export SUPABASE_URL='postgresql://postgres:Benamiaijega123@db.banrxfgbldeuyjiebhgu.supabase.co:5432/postgres?sslmode=require'
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhbnJ4ZmdibGRldXlqaWViaGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk2ODI4MywiZXhwIjoyMDY2NTQ0MjgzfQ.iViGqHhrgipggNzCjGcBX_3h0qeJPsDXNIf7WggWQmI



