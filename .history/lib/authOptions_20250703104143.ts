import { supabase } from "@/lib/supabaseClient";
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
        if (!credentials?.email || !credentials.password) {
          console.log("Missing credentials");
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: credentials.password,
        });

        if (error) {
          console.log("Supabase signIn error:", error.message);
          return null;
        }

        if (!data.user) {
          console.log("User not found in Supabase Auth");
          return null;
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.log("Error fetching user profile:", profileError.message);
        }

        return {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || null,
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
