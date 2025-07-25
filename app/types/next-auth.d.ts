
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isDemo: boolean;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    isDemo: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isDemo: boolean;
  }
}
