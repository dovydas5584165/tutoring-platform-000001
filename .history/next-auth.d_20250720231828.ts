import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    role: string;
    email: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    email: string;
    accessToken?: string;
  }
}
