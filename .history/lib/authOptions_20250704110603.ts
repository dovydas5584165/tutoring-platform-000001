import { supabase } from "@/lib/supabaseClient";
import supabaseAdmin from "@/lib/supabaseAdmin";
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

        // Use admin client for server-side auth
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });

        console.log("AUTH:", { error, data });

        if (error || !data.user) return null;

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        console.log("PROFILE:", { profile, profileError });

        return {
          id: data.user.id,
          email: data.user.email,
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
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/log-in",
  },
};
