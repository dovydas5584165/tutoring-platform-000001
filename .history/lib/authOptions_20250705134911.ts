// lib/authOptions.ts

import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";

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

        // Sign in with service role Supabase admin client
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password: credentials.password,
        });

        if (error || !data?.user) {
          console.error("Auth error:", error);
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
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/log-in",
  },
};
