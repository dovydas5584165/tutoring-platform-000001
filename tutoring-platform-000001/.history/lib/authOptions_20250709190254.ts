import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client for user auth
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with elevated privileges (service role key)
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

        // Use Supabase SDK for password sign-in
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password: credentials.password,
        });

        if (error || !data.session || !data.user) {
          console.error("Supabase sign-in error:", error);
          return null;
        }

        // Fetch user's role securely
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profile?.role) {
          console.error("Error fetching user role:", profileError);
          return null;
        }

        // Return user object to NextAuth
        return {
          id: data.user.id,
          email: data.user.email!,
          role: profile.role,
          accessToken: data.session.access_token,
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
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/log-in",
  },
};
