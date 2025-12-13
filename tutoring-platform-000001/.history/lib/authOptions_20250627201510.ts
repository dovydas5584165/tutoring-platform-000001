import { supabase } from "@/lib/supabaseClient";
import { compare } from "bcryptjs";
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

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (error) {
          console.log("Supabase error fetching user:", error.message);
          return null;
        }

        if (!user) {
          console.log("User not found:", email);
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          console.log("Invalid password for user:", email);
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
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
