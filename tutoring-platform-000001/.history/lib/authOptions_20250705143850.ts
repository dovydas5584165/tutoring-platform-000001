import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const email = credentials.email.trim().toLowerCase();

        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ email, password: credentials.password }),
        });

        const data = await response.json();

        if (!response.ok || !data.access_token || !data.user) {
          console.error("Supabase auth error:", data);
          return null;
        }

        const user = data.user;

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: profile?.role ?? "user",
          accessToken: data.access_token,
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
        (token as any).id = user.id;
        (token as any).role = user.role;
        (token as any).accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
        (session as any).accessToken = (token as any).accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/log-in",
  },
};
