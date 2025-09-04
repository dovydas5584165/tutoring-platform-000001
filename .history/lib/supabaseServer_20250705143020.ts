import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const supabaseServer = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (key) => cookies().get(key)?.value,
        set: (key, value, options) => cookies().set({ name: key, value, ...options }),
        remove: (key, options) => cookies().delete({ name: key, ...options }),
      },
    }
  );
