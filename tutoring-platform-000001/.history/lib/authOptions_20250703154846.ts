 import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";
import { supabaseAdmin } from "./supabaseAdmin";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // 1. Authenticate user with Supabase Auth using service_role client
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });

        if (error || !data.user) return null;

        // 2. Query user role from the database using service_role client
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Profile lookup error", profileError);
          return null;
        }

        // 3. Return user object with role for NextAuth session
        return {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role ?? "user",
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
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

  debug: false,
};
