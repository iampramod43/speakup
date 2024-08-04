import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        orgId: { label: "Org ID", type: "text", placeholder: "Enter your orgId" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" },
      },
      async authorize(credentials) {
        console.log("🚀 ~ file: route.js:38 ~ authorize ~ process.env.NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);

        const { orgId, password } = credentials;
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + 'org/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orgId, password }), // Convert data to JSON string
        });

        // Log the response status and body for debugging
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          console.log("Failed to login:", await response.text());
          return null;
        }

        const user = await response.json(); // Parse the response body
        console.log("Authorized user:", user);

        // Return the user object or null if user data is invalid
        return { oid: user.oid, name: user.name } || null;
      },


    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
          token.id = user._id;
          token.oid = user.oid;
          token.name = user.name;
        }
        return token;
      },
    async session({ session, token }) {
      session.user.oid = token.oid;
      session.user.name = token.name;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
