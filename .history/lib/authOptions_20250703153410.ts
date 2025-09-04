import { createClient } from "@supabase/supabase-js";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";

// ─── Secure Admin Client (Service Role) ───
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: AuthOptions = {
  debug: true, // enable server-side debug output

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("MISSING_CREDENTIALS");
        }

        // ─── Step 1: Supabase Auth ───
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

        console.log("🔐 Supabase signInWithPassword →", { data, error });

        if (error || !data.user) {
          throw new Error("INVALID_LOGIN");
        }

        // ─── Step 2: Fetch Role from `users` ───
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("❌ Profile lookup error", profileError);
          throw new Error("PROFILE_LOOKUP_FAILED");
        }

        const role = profile?.role ?? "user";

        return {
          id: data.user.id,
          email: data.user.email,
          role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
      };
      return session;
    },
  },

  pages: {
    signIn: "/auth/log-in",
  },
};
