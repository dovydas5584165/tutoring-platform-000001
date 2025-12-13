import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;       // REST URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;      // service role key

if (!url || !key) {
  console.error("Missing env vars. Export NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  const email = `test.${Date.now()}@example.com`;
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: "StrongPass123!",
    email_confirm: true,     // matches your current SDK
  });

  if (error) {
    console.error("❌ createUser failed:", error);
  } else {
    console.log("✅ User created:", data.user.id, data.user.email);
    await sb.auth.admin.deleteUser(data.user.id);
    console.log("🗑️  Test user deleted (cleanup)");
  }
  process.exit(0);
})();
