import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";
import { supabaseAdmin } from "/lib/supabaseAdmin.ts"; // adjust path as needed

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Authenticate user with Supabase using service role
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });

        if (error || !data.user) {
          console.error("Supabase auth error:", error);
          return null;
        }

        // Fetch user role from 'users' table
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Profile lookup error:", profileError);
          return null;
        }

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

export default NextAuth(authOptions);
