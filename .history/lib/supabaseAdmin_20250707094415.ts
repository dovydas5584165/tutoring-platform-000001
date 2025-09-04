import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL missing!");
}

if (!supabaseServiceRoleKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY missing!");
} else {
  const maskedKey =
    supabaseServiceRoleKey.length > 8
      ? `${supabaseServiceRoleKey.slice(0, 4)}...${supabaseServiceRoleKey.slice(-4)}`
      : "Key too short to mask";
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY loaded: ${maskedKey}`);
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
