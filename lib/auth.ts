import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcrypt";
import prisma from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const hashedPassword = await hash(credentials?.password, 10);

        const existingUser = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (existingUser) {
          const PasswordValidation = await compare(
            credentials.password,
            existingUser.password
          );
          if (PasswordValidation) {
            return {
              id: existingUser.id,
              email: existingUser.email,
            };
          }
          return null;
        }
        const newUser = await prisma.user.create({
          data: {
            email: credentials.email,
            password: hashedPassword,
          },
        });
        if (newUser) {
          return {
            id: newUser.id,
            email: newUser.email,
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Include user ID in the session object
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id as number,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
};
