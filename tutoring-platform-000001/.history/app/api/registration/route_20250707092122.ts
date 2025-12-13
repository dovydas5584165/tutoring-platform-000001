import NextAuth from "next-auth";
import { authOptions } from "@/auth/options";

// v5 automatically exposes GET & POST for the catch‑all route
export const { GET, POST } = NextAuth(authOptions);
