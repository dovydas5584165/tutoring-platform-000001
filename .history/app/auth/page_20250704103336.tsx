import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Replace this with your actual user lookup & verification logic
        const { email, password } = credentials || {};

        // Example dummy user database
        const users = [
          { id: "1", email: "tutor@example.com", password: "tutorpass", role: "tutor" },
          { id: "2", email: "client@example.com", password: "clientpass", role: "client" },
        ];

        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (!user) {
          return null;
        }

        // Return user object with id and role
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, persist user.id and role into token
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose userId and role to client session
      if (token) {
        session.userId = token.userId;
        session.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/log-in",
  },
});
