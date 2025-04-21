// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthFile } from "@/lib/github";
import { verifyMessage } from "viem";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Ethereum Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text", placeholder: "0x..." },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.address || !credentials?.signature) {
            return null;
          }

          const registertext = await AuthFile("data/register.json");
          if (!registertext) {
            console.error("Failed to load register.json");
            return null;
          }

          let registerData;
          try {
            registerData = JSON.parse(registertext);
          } catch (error) {
            console.error("Invalid JSON format in register.json:", error);
            return null;
          }

          const user = registerData[credentials.address];
          if (!user) {
            return null;
          }

          const message = "login LxDao";
          const isValidSignature = verifyMessage({
            address: credentials.address as `0x${string}`,
            message,
            signature: credentials.signature as `0x${string}`,
          });

          if (!isValidSignature) {
            return null;
          }

          if (user.approvalStatus === "approved") {
            return {
              id: credentials.address,
              address: credentials.address,
              status: "approved",
            };
          }

          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user && "address" in user && "status" in user) {
        token.address = user.address as string;
        token.status = user.status as string;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        const user = session.user as unknown as { address: string; status: string };
        user.address = token.address as string;
        user.status = token.status as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
