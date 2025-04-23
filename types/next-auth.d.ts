// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:string;
      address: string;
      role: string;
      status: string;
    } & DefaultSession["user"];
  }

  interface User {
    id:string;
    address: string;
    role: string;
    status: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:string,
    address: string;
    role: string;
    status: string;
  }
}