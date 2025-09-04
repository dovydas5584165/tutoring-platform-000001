import { createClient } from "@supabase/supabase-js";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider      from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";

/* ──────────────────────────────────────────────────────────────
   Use the service_role key here.  It never reaches the browser.
   ────────────────────────────────────────────────────────────── */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // <‑‑ full DB rights
);

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID  ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        /* 1 ─ Authenticate against Supabase Auth */
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });

        if (error || !data.user) return null;

        /* 2 ─ Pull role from our users table (service_role bypasses RLS) */
        const { data: profile } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        return {
          id:    data.user.id,
          email: data.user.email,
          role:  profile?.role ?? "user",
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    /* put custom fields into JWT */
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },

    /* expose them to the client session */
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id:   token.id   as string,
        role: token.role as string,
      };
      return session;
    },
  },

  pages: { signIn: "/auth/log-in" },
};
