import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number; // Add the id field to the session type
      email: string;
      name?: string | null;
    };
  }
}
